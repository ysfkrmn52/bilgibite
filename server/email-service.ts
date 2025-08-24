// Email Notification Service for BilgiBite
// Bu servis subscription changes, payment notifications, ve diğer önemli bildirimler için kullanılır

interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

interface EmailRecipient {
  email: string;
  name?: string;
  variables?: Record<string, any>;
}

interface SendEmailOptions {
  to: EmailRecipient[];
  template: string;
  variables?: Record<string, any>;
  priority?: 'high' | 'normal' | 'low';
}

class EmailService {
  private templates: Map<string, EmailTemplate> = new Map();
  private emailQueue: any[] = [];
  private isProcessing = false;

  constructor() {
    this.initializeTemplates();
    this.startQueueProcessor();
  }

  private initializeTemplates() {
    // Subscription başarılı aktivasyon
    this.templates.set('subscription-activated', {
      subject: '🎉 BilgiBite {{planName}} aboneliğiniz aktif!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
            <h1>Hoş geldiniz!</h1>
            <p style="font-size: 18px;">{{planName}} aboneliğiniz başarıyla aktif edildi</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2>Merhaba {{userName}},</h2>
            <p>{{planName}} paketiniz başarıyla aktif edildi. Artık tüm premium özelliklerimizden yararlanabilirsiniz!</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3>Paket Detayları:</h3>
              <ul>
                <li><strong>Plan:</strong> {{planName}}</li>
                <li><strong>Aylık Ücret:</strong> {{monthlyPrice}} TL</li>
                <li><strong>Sonraki Ödeme:</strong> {{nextPaymentDate}}</li>
                <li><strong>Özellikler:</strong> {{features}}</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{appUrl}}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Uygulamayı Kullanmaya Başla
              </a>
            </div>
            
            <p>Sorularınız için destek@bilgibite.com adresinden bize ulaşabilirsiniz.</p>
            <p>İyi çalışmalar!</p>
            <p><strong>BilgiBite Ekibi</strong></p>
          </div>
        </div>
      `,
      textContent: `
        Merhaba {{userName}},
        
        {{planName}} paketiniz başarıyla aktif edildi!
        
        Plan: {{planName}}
        Aylık Ücret: {{monthlyPrice}} TL
        Sonraki Ödeme: {{nextPaymentDate}}
        
        Uygulamayı kullanmaya başlamak için: {{appUrl}}
        
        Sorularınız için: destek@bilgibite.com
        
        BilgiBite Ekibi
      `
    });

    // Ödeme başarısız
    this.templates.set('payment-failed', {
      subject: '⚠️ BilgiBite abonelik ödemesi başarısız',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc3545; padding: 30px; text-align: center; color: white;">
            <h1>Ödeme Başarısız</h1>
            <p style="font-size: 18px;">Abonelik ödemenizi alamadık</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2>Merhaba {{userName}},</h2>
            <p>{{planName}} aboneliğinizin ödemesini alamadık. Aboneliğinizin kesilmemesi için ödeme yönteminizi güncelleyin.</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #dc3545;">
              <h3>Ödeme Detayları:</h3>
              <ul>
                <li><strong>Miktar:</strong> {{amount}} TL</li>
                <li><strong>Kart Son 4 Hanesi:</strong> ****{{lastFourDigits}}</li>
                <li><strong>Hata:</strong> {{errorMessage}}</li>
                <li><strong>Tekrar Deneme:</strong> {{retryDate}}</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{paymentUrl}}" style="background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Ödeme Yöntemini Güncelle
              </a>
            </div>
            
            <p><strong>Önemli:</strong> 7 gün içinde ödeme alamazsak aboneliğiniz askıya alınacaktır.</p>
            <p>Destek için: destek@bilgibite.com</p>
          </div>
        </div>
      `,
      textContent: `
        Merhaba {{userName}},
        
        {{planName}} aboneliğinizin ödemesini alamadık.
        
        Miktar: {{amount}} TL
        Hata: {{errorMessage}}
        
        Ödeme yöntemini güncellemek için: {{paymentUrl}}
        
        7 gün içinde ödeme alamazsak aboneliğiniz askıya alınacaktır.
        
        Destek: destek@bilgibite.com
        BilgiBite Ekibi
      `
    });

    // AI Credit satın alma başarılı
    this.templates.set('ai-credit-purchased', {
      subject: '⚡ AI Kredi paketiniz hazır!',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #ffd700 0%, #ffb347 100%); padding: 30px; text-align: center; color: #333;">
            <h1>AI Kredi Satın Alındı!</h1>
            <p style="font-size: 18px;">{{creditAmount}} AI kredi hesabınıza eklendi</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2>Merhaba {{userName}},</h2>
            <p>{{creditAmount}} AI kredi paketiniz başarıyla satın alındı ve hesabınıza eklendi!</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3>AI Kredit Detayları:</h3>
              <ul>
                <li><strong>Satın Alınan:</strong> {{creditAmount}} kredi</li>
                <li><strong>Ödenen Tutar:</strong> {{paidAmount}} TL</li>
                <li><strong>Toplam Bakiye:</strong> {{totalBalance}} kredi</li>
                <li><strong>Geçerlilik:</strong> {{expiryDate}}</li>
              </ul>
            </div>
            
            <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; margin: 20px 0;">
              <h4>AI Kredileri Nerede Kullanabilirsiniz:</h4>
              <ul>
                <li>🤖 Kişisel AI öğretmen sohbeti</li>
                <li>📚 Akıllı soru üretimi</li>
                <li>📊 Zayıf alanlar analizi</li>
                <li>📖 Özel çalışma planı oluşturma</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{aiEducationUrl}}" style="background: #4CAF50; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                AI Öğretmeninizi Kullanın
              </a>
            </div>
            
            <p>İyi çalışmalar!</p>
            <p><strong>BilgiBite Ekibi</strong></p>
          </div>
        </div>
      `,
      textContent: `
        Merhaba {{userName}},
        
        {{creditAmount}} AI kredi başarıyla satın alındı!
        
        Satın Alınan: {{creditAmount}} kredi
        Ödenen: {{paidAmount}} TL
        Toplam Bakiye: {{totalBalance}} kredi
        
        AI öğretmeni kullanmak için: {{aiEducationUrl}}
        
        BilgiBite Ekibi
      `
    });

    // Abonelik iptal
    this.templates.set('subscription-cancelled', {
      subject: '👋 BilgiBite aboneliğiniz iptal edildi',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #6c757d; padding: 30px; text-align: center; color: white;">
            <h1>Abonelik İptal Edildi</h1>
            <p style="font-size: 18px;">{{planName}} aboneliğiniz sona erdi</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2>Merhaba {{userName}},</h2>
            <p>{{planName}} aboneliğiniz {{cancellationDate}} tarihinde iptal edilmiştir.</p>
            
            <div style="background: white; padding: 20px; border-radius: 10px; margin: 20px 0;">
              <h3>Abonelik Detayları:</h3>
              <ul>
                <li><strong>İptal Edilen Plan:</strong> {{planName}}</li>
                <li><strong>Son Ödeme:</strong> {{lastPaymentDate}}</li>
                <li><strong>İptal Nedeni:</strong> {{cancellationReason}}</li>
                <li><strong>Geri Ödenecek Tutar:</strong> {{refundAmount}} TL</li>
              </ul>
            </div>
            
            <p>Ücretsiz planımızla çalışmalarınıza devam edebilirsiniz. İstediğiniz zaman tekrar premium üyelik satın alabilirsiniz.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="{{reactivateUrl}}" style="background: #007bff; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block;">
                Aboneliği Yeniden Başlat
              </a>
            </div>
            
            <p>Geri bildirimleriniz bizim için değerli: destek@bilgibite.com</p>
            <p><strong>BilgiBite Ekibi</strong></p>
          </div>
        </div>
      `,
      textContent: `
        Merhaba {{userName}},
        
        {{planName}} aboneliğiniz iptal edildi.
        
        İptal Tarihi: {{cancellationDate}}
        Son Ödeme: {{lastPaymentDate}}
        Geri Ödenecek: {{refundAmount}} TL
        
        Ücretsiz planla devam edebilir, istediğiniz zaman yeniden başlatabilirsiniz.
        
        Yeniden başlatmak için: {{reactivateUrl}}
        
        BilgiBite Ekibi
      `
    });
  }

  // Email gönderme (queue'ya ekleme)
  async sendEmail(options: SendEmailOptions): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const template = this.templates.get(options.template);
      if (!template) {
        throw new Error(`Template '${options.template}' not found`);
      }

      // Queue'ya ekle
      const emailJob = {
        id: `email_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`,
        to: options.to,
        template: options.template,
        variables: options.variables || {},
        priority: options.priority || 'normal',
        timestamp: new Date(),
        attempts: 0,
        maxAttempts: 3,
        status: 'pending'
      };

      this.emailQueue.push(emailJob);
      
      // Önceliğe göre sırala
      this.emailQueue.sort((a, b) => {
        const priorityOrder = { high: 3, normal: 2, low: 1 };
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      });

      return { success: true, messageId: emailJob.id };

    } catch (error) {
      console.error('Email queue error:', error);
      return { success: false, error: error.message };
    }
  }

  // Template içindeki değişkenleri değiştir
  private processTemplate(template: EmailTemplate, variables: Record<string, any>): EmailTemplate {
    let processedHtml = template.htmlContent;
    let processedText = template.textContent;
    let processedSubject = template.subject;

    // Değişkenleri değiştir
    Object.entries(variables).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      processedHtml = processedHtml.replace(regex, String(value));
      processedText = processedText.replace(regex, String(value));
      processedSubject = processedSubject.replace(regex, String(value));
    });

    return {
      subject: processedSubject,
      htmlContent: processedHtml,
      textContent: processedText
    };
  }

  // Email queue processor
  private async startQueueProcessor() {
    setInterval(async () => {
      if (this.isProcessing || this.emailQueue.length === 0) {
        return;
      }

      this.isProcessing = true;

      try {
        const emailJob = this.emailQueue.shift();
        if (!emailJob) return;

        await this.processEmailJob(emailJob);
      } catch (error) {
        console.error('Email queue processing error:', error);
      } finally {
        this.isProcessing = false;
      }
    }, 5000); // Her 5 saniyede bir kontrol et
  }

  // Single email job process
  private async processEmailJob(emailJob: any): Promise<void> {
    try {
      const template = this.templates.get(emailJob.template);
      if (!template) {
        throw new Error(`Template '${emailJob.template}' not found`);
      }

      // Her recipient için email gönder
      for (const recipient of emailJob.to) {
        const mergedVariables = { ...emailJob.variables, ...recipient.variables };
        const processedTemplate = this.processTemplate(template, mergedVariables);

        // Gerçek email gönderimi (production'da SMTP veya email service kullanılacak)
        await this.sendActualEmail({
          to: recipient.email,
          name: recipient.name,
          subject: processedTemplate.subject,
          html: processedTemplate.htmlContent,
          text: processedTemplate.textContent
        });
      }

      emailJob.status = 'sent';
      console.log(`Email sent successfully: ${emailJob.id}`);

    } catch (error) {
      emailJob.attempts++;
      emailJob.status = 'failed';

      if (emailJob.attempts < emailJob.maxAttempts) {
        // Yeniden dene
        emailJob.status = 'pending';
        this.emailQueue.push(emailJob);
        console.log(`Email retry ${emailJob.attempts}/${emailJob.maxAttempts}: ${emailJob.id}`);
      } else {
        console.error(`Email failed after ${emailJob.attempts} attempts: ${emailJob.id}`, error);
      }
    }
  }

  // Gerçek email gönderimi (production'da SMTP veya email service)
  private async sendActualEmail(email: {
    to: string;
    name?: string;
    subject: string;
    html: string;
    text: string;
  }): Promise<void> {
    // Development'da console'a log
    if (process.env.NODE_ENV === 'development') {
      console.log('\n=== EMAIL SENT ===');
      console.log(`To: ${email.to} (${email.name || 'Unknown'})`);
      console.log(`Subject: ${email.subject}`);
      console.log(`Content: ${email.text.substring(0, 200)}...`);
      console.log('==================\n');
      return;
    }

    // Production'da gerçek email servisi kullan
    // Örnek: SendGrid, Mailgun, SES, Resend vs.
    
    // Simülasyon için kısa delay
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Queue durumu ve statistics
  getQueueStats() {
    const pending = this.emailQueue.filter(job => job.status === 'pending').length;
    const failed = this.emailQueue.filter(job => job.status === 'failed').length;
    const high = this.emailQueue.filter(job => job.priority === 'high').length;

    return {
      totalQueued: this.emailQueue.length,
      pending,
      failed,
      highPriority: high,
      isProcessing: this.isProcessing,
      availableTemplates: Array.from(this.templates.keys())
    };
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Helper functions for specific email types
export const notificationHelpers = {
  // Subscription activated notification
  subscriptionActivated: (userEmail: string, userName: string, planDetails: any) => {
    return emailService.sendEmail({
      to: [{ email: userEmail, name: userName }],
      template: 'subscription-activated',
      variables: {
        userName,
        planName: planDetails.name,
        monthlyPrice: planDetails.price,
        nextPaymentDate: planDetails.nextPaymentDate,
        features: planDetails.features.join(', '),
        appUrl: process.env.CLIENT_URL || 'https://bilgibite.com'
      },
      priority: 'high'
    });
  },

  // Payment failed notification
  paymentFailed: (userEmail: string, userName: string, paymentDetails: any) => {
    return emailService.sendEmail({
      to: [{ email: userEmail, name: userName }],
      template: 'payment-failed',
      variables: {
        userName,
        planName: paymentDetails.planName,
        amount: paymentDetails.amount,
        lastFourDigits: paymentDetails.lastFourDigits,
        errorMessage: paymentDetails.errorMessage,
        retryDate: paymentDetails.retryDate,
        paymentUrl: `${process.env.CLIENT_URL}/subscription`
      },
      priority: 'high'
    });
  },

  // AI Credit purchased notification
  aiCreditPurchased: (userEmail: string, userName: string, creditDetails: any) => {
    return emailService.sendEmail({
      to: [{ email: userEmail, name: userName }],
      template: 'ai-credit-purchased',
      variables: {
        userName,
        creditAmount: creditDetails.creditAmount,
        paidAmount: creditDetails.paidAmount,
        totalBalance: creditDetails.totalBalance,
        expiryDate: creditDetails.expiryDate,
        aiEducationUrl: `${process.env.CLIENT_URL}/ai-education`
      },
      priority: 'normal'
    });
  },

  // Subscription cancelled notification
  subscriptionCancelled: (userEmail: string, userName: string, cancellationDetails: any) => {
    return emailService.sendEmail({
      to: [{ email: userEmail, name: userName }],
      template: 'subscription-cancelled',
      variables: {
        userName,
        planName: cancellationDetails.planName,
        cancellationDate: cancellationDetails.cancellationDate,
        lastPaymentDate: cancellationDetails.lastPaymentDate,
        cancellationReason: cancellationDetails.reason || 'Kullanıcı talebi',
        refundAmount: cancellationDetails.refundAmount || 0,
        reactivateUrl: `${process.env.CLIENT_URL}/subscription`
      },
      priority: 'normal'
    });
  }
};