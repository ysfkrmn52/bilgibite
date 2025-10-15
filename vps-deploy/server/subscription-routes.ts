// Subscription API Routes
import type { Express, Request, Response } from "express";
import { z } from "zod";
import { SubscriptionService } from "./subscription-service";
import { IyzicoService } from "./iyzico-service";

// Validation schemas
const createSubscriptionSchema = z.object({
  planId: z.string(),
  paymentData: z.object({
    cardHolderName: z.string().min(1),
    cardNumber: z.string().regex(/^\d{16}$/),
    expireMonth: z.string().regex(/^(0[1-9]|1[0-2])$/),
    expireYear: z.string().regex(/^20\d{2}$/),
    cvc: z.string().regex(/^\d{3,4}$/),
    identityNumber: z.string().regex(/^\d{11}$/),
    phone: z.string().min(10),
    address: z.object({
      contactName: z.string().min(1),
      city: z.string().min(1),
      country: z.string().default('Türkiye'),
      address: z.string().min(5),
      zipCode: z.string().min(5)
    })
  })
});

const checkUsageSchema = z.object({
  feature: z.string()
});

const incrementUsageSchema = z.object({
  feature: z.string()
});

export function registerSubscriptionRoutes(app: Express): void {
  
  // Get all subscription plans
  app.get("/api/subscription/plans", async (req: Request, res: Response) => {
    try {
      const plans = await SubscriptionService.getPlans();
      res.json({
        success: true,
        plans
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Abonelik planları alınırken hata oluştu',
        details: error.message
      });
    }
  });

  // Get user's current subscription
  app.get("/api/subscription/users/:userId/current", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const subscription = await SubscriptionService.getUserSubscription(userId);
      
      res.json({
        success: true,
        subscription
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Abonelik bilgileri alınırken hata oluştu',
        details: error.message
      });
    }
  });

  // Create new subscription
  app.post("/api/subscription/users/:userId/subscribe", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const validatedData = createSubscriptionSchema.parse(req.body);

      // Validate Turkish identity number
      if (!IyzicoService.validateTCKN(validatedData.paymentData.identityNumber)) {
        return res.status(400).json({
          success: false,
          error: 'Geçersiz TC kimlik numarası'
        });
      }

      // Format Turkish phone number
      validatedData.paymentData.phone = IyzicoService.formatTurkishPhone(validatedData.paymentData.phone);

      const result = await SubscriptionService.createSubscription(
        userId, 
        validatedData.planId, 
        validatedData.paymentData
      );

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      res.json({
        success: true,
        message: 'Abonelik başarıyla oluşturuldu',
        subscription: result.subscription
      });

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Geçersiz veri',
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Abonelik oluşturulurken hata oluştu',
        details: error.message
      });
    }
  });

  // Cancel subscription
  app.post("/api/subscription/users/:userId/cancel", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const result = await SubscriptionService.cancelSubscription(userId);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          error: result.error
        });
      }

      res.json({
        success: true,
        message: 'Abonelik başarıyla iptal edildi'
      });

    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Abonelik iptal edilirken hata oluştu',
        details: error.message
      });
    }
  });

  // Check feature access
  app.get("/api/subscription/users/:userId/features/:feature", async (req: Request, res: Response) => {
    try {
      const { userId, feature } = req.params;
      const hasAccess = await SubscriptionService.hasFeatureAccess(userId, feature);

      res.json({
        success: true,
        hasAccess,
        feature
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Özellik erişimi kontrol edilirken hata oluştu',
        details: error.message
      });
    }
  });

  // Check usage limits
  app.get("/api/subscription/users/:userId/usage/:feature", async (req: Request, res: Response) => {
    try {
      const { userId, feature } = req.params;
      const usageInfo = await SubscriptionService.checkUsageLimit(userId, feature);

      res.json({
        success: true,
        ...usageInfo
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Kullanım limiti kontrol edilirken hata oluştu',
        details: error.message
      });
    }
  });

  // Increment usage
  app.post("/api/subscription/users/:userId/usage/increment", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const { feature } = incrementUsageSchema.parse(req.body);

      await SubscriptionService.incrementUsage(userId, feature);

      res.json({
        success: true,
        message: 'Kullanım sayacı güncellendi'
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          success: false,
          error: 'Geçersiz veri',
          details: error.errors
        });
      }

      res.status(500).json({
        success: false,
        error: 'Kullanım sayacı güncellenirken hata oluştu',
        details: error.message
      });
    }
  });

  // Get payment history
  app.get("/api/subscription/users/:userId/payments", async (req: Request, res: Response) => {
    try {
      const { userId } = req.params;
      const payments = await SubscriptionService.getPaymentHistory(userId);

      res.json({
        success: true,
        payments
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Ödeme geçmişi alınırken hata oluştu',
        details: error.message
      });
    }
  });

  // İyzico webhook endpoint
  app.post("/api/subscription/webhook/iyzico", async (req: Request, res: Response) => {
    try {
      // Verify webhook signature (in production)
      // const signature = req.headers['x-iyzico-signature'];
      
      await SubscriptionService.handleWebhook(req.body);

      res.status(200).json({ success: true });
    } catch (error: any) {
      console.error('Webhook error:', error);
      res.status(500).json({ success: false });
    }
  });

  // Admin: Get subscription analytics
  app.get("/api/admin/subscription/analytics", async (req: Request, res: Response) => {
    try {
      // In production, add admin authentication middleware
      const analytics = await SubscriptionService.getSubscriptionAnalytics();

      res.json({
        success: true,
        analytics
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Analiz verileri alınırken hata oluştu',
        details: error.message
      });
    }
  });

  // Test payment endpoint for development
  app.post("/api/subscription/test-payment", async (req: Request, res: Response) => {
    if (process.env.NODE_ENV === 'production') {
      return res.status(404).json({ success: false, error: 'Not found' });
    }

    res.json({
      success: true,
      message: 'Test ödeme başarılı',
      testCards: {
        success: '5528790000000008',
        failure: '5528790000000016',
        threeds: '5528790000000024'
      }
    });
  });

  // Pricing page data
  app.get("/api/subscription/pricing", async (req: Request, res: Response) => {
    try {
      const plans = await SubscriptionService.getPlans();
      
      // Add Turkish market specific pricing information
      const pricingData = {
        plans,
        features: {
          free: [
            'Günde 5 quiz hakkı',
            'Temel performans takibi', 
            'Reklamlarla deneyim'
          ],
          premium: [
            'Sınırsız quiz erişimi',
            'AI kişisel öğretmen',
            'Gelişmiş analiz raporları',
            'Reklamsız deneyim',
            'Detaylı açıklamalar',
            'Özel çalışma planları'
          ],
          family: [
            '6 kullanıcıya kadar',
            'Tüm premium özellikler',
            'Aile yönetim paneli',
            'Çoklu cihaz desteği'
          ]
        },
        testimonials: [
          {
            name: 'Ahmet Yılmaz',
            exam: 'YKS 2024',
            score: '478 puan',
            message: 'BilgiBite sayesinde hedef üniversiteme yerleştim!'
          },
          {
            name: 'Fatma Özkan',
            exam: 'KPSS 2024', 
            score: '87.5 puan',
            message: 'AI öğretmen özelliği çok etkili, zayıf yönlerimi hemen fark etti.'
          }
        ],
        paymentMethods: [
          'Tüm Türk bankalarının kredi kartları',
          '2, 3, 6, 9, 12 taksit imkanı',
          'Güvenli ödeme altyapısı',
          'Otomatik fatura kesimi'
        ],
        guarantees: [
          '7 gün ücretsiz deneme',
          'İstediğin zaman iptal et',
          'Para iade garantisi',
          '7/24 Türkçe destek'
        ]
      };

      res.json({
        success: true,
        pricing: pricingData
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: 'Fiyatlandırma bilgileri alınırken hata oluştu',
        details: error.message
      });
    }
  });
}