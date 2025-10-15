import { Router, Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { storage } from './storage';
import { insertPdfMaterialSchema, insertPdfFolderSchema, insertPdfTopicSchema } from '@shared/schema';

const router = Router();

// PDF dosyalarını kaydetmek için multer konfigürasyonu
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/pdfs';
    // Klasör yoksa oluştur
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Dosya adını güvenli hale getir ve tarih ekle
    const timestamp = Date.now();
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_');
    cb(null, `${timestamp}_${safeName}`);
  }
});

const upload = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Sadece PDF dosyaları yüklenebilir'));
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// PDF Materyalleri Endpoint'leri

// Tüm PDF materyallerini getir (filtreleme ile)
router.get('/pdf-materials', async (req: Request, res: Response) => {
  try {
    const { category, subject, search } = req.query;
    
    const filters = {
      category: category as string,
      subject: subject as string,
      search: search as string
    };

    const materials = await storage.getPdfMaterials(filters);
    res.json(materials);
  } catch (error) {
    console.error('PDF materials fetch error:', error);
    res.status(500).json({ error: 'PDF materyalleri alınamadı' });
  }
});

// Tek PDF materyali getir
router.get('/pdf-materials/:id', async (req: Request, res: Response) => {
  try {
    const material = await storage.getPdfMaterial(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'PDF materyali bulunamadı' });
    }
    res.json(material);
  } catch (error) {
    console.error('PDF material fetch error:', error);
    res.status(500).json({ error: 'PDF materyali alınamadı' });
  }
});

// PDF yükle
router.post('/upload-pdf', upload.single('file'), async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'PDF dosyası gerekli' });
    }

    const {
      title,
      description = '',
      category,
      subject,
      difficulty = 'medium',
      tags = '',
      uploadedBy
    } = req.body;

    // Validation
    if (!title || !category || !subject) {
      // Yüklenen dosyayı sil
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Başlık, kategori ve ders alanları zorunlu' });
    }

    const tagsArray = tags ? tags.split(',').map((tag: string) => tag.trim()) : [];

    const materialData = {
      title,
      description,
      category,
      subject,
      difficulty,
      fileName: req.file.originalname,
      filePath: req.file.path,
      fileSize: req.file.size,
      uploadedBy: uploadedBy || 'admin',
      tags: tagsArray,
      isActive: true,
      downloadCount: 0,
      viewCount: 0
    };

    // Validate with schema
    const validatedData = insertPdfMaterialSchema.parse(materialData);
    const material = await storage.createPdfMaterial(validatedData);

    res.status(201).json({
      success: true,
      message: 'PDF başarıyla yüklendi',
      material
    });
  } catch (error) {
    // Hata durumunda yüklenen dosyayı temizle
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }
    
    console.error('PDF upload error:', error);
    res.status(500).json({ error: 'PDF yüklenirken hata oluştu' });
  }
});

// PDF görüntüle
router.get('/pdf-materials/:id/view', async (req: Request, res: Response) => {
  try {
    const material = await storage.getPdfMaterial(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'PDF materyali bulunamadı' });
    }

    // Dosya var mı kontrol et
    if (!fs.existsSync(material.filePath)) {
      return res.status(404).json({ error: 'PDF dosyası bulunamadı' });
    }

    // Görüntüleme sayısını artır (asenkron)
    storage.incrementPdfView(material.id).catch(err => 
      console.error('View count increment error:', err)
    );

    // PDF dosyasını tarayıcıda göster
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${material.fileName}"`);
    
    const fileStream = fs.createReadStream(material.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('PDF view error:', error);
    res.status(500).json({ error: 'PDF görüntülenirken hata oluştu' });
  }
});

// PDF indir
router.get('/pdf-materials/:id/download', async (req: Request, res: Response) => {
  try {
    const material = await storage.getPdfMaterial(req.params.id);
    if (!material) {
      return res.status(404).json({ error: 'PDF materyali bulunamadı' });
    }

    if (!fs.existsSync(material.filePath)) {
      return res.status(404).json({ error: 'PDF dosyası bulunamadı' });
    }

    // İndirme sayısını artır (asenkron)
    storage.incrementPdfDownload(material.id).catch(err => 
      console.error('Download count increment error:', err)
    );

    // PDF dosyasını indir
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${material.fileName}"`);
    
    const fileStream = fs.createReadStream(material.filePath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('PDF download error:', error);
    res.status(500).json({ error: 'PDF indirilirken hata oluştu' });
  }
});

// Görüntüleme sayısını artır
router.post('/pdf-materials/:id/increment-view', async (req: Request, res: Response) => {
  try {
    await storage.incrementPdfView(req.params.id);
    res.json({ success: true });
  } catch (error) {
    console.error('View count increment error:', error);
    res.status(500).json({ error: 'Görüntüleme sayısı güncellenemedi' });
  }
});

// PDF materyali güncelle
router.put('/pdf-materials/:id', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const material = await storage.updatePdfMaterial(req.params.id, updates);
    
    if (!material) {
      return res.status(404).json({ error: 'PDF materyali bulunamadı' });
    }
    
    res.json(material);
  } catch (error) {
    console.error('PDF material update error:', error);
    res.status(500).json({ error: 'PDF materyali güncellenemedi' });
  }
});

// PDF materyali sil
router.delete('/pdf-materials/:id', async (req: Request, res: Response) => {
  try {
    const success = await storage.deletePdfMaterial(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'PDF materyali bulunamadı' });
    }
    
    res.json({ success: true, message: 'PDF materyali silindi' });
  } catch (error) {
    console.error('PDF material delete error:', error);
    res.status(500).json({ error: 'PDF materyali silinemedi' });
  }
});

// PDF Klasörleri Endpoint'leri

// Tüm klasörleri getir
router.get('/pdf-folders', async (req: Request, res: Response) => {
  try {
    const folders = await storage.getPdfFolders();
    res.json(folders);
  } catch (error) {
    console.error('PDF folders fetch error:', error);
    res.status(500).json({ error: 'PDF klasörleri alınamadı' });
  }
});

// Klasör oluştur
router.post('/pdf-folders', async (req: Request, res: Response) => {
  try {
    const folderData = insertPdfFolderSchema.parse(req.body);
    const folder = await storage.createPdfFolder(folderData);
    
    res.status(201).json({
      success: true,
      message: 'Klasör oluşturuldu',
      folder
    });
  } catch (error) {
    console.error('PDF folder creation error:', error);
    res.status(500).json({ error: 'Klasör oluşturulamadı' });
  }
});

// Klasör güncelle
router.put('/pdf-folders/:id', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const folder = await storage.updatePdfFolder(req.params.id, updates);
    
    if (!folder) {
      return res.status(404).json({ error: 'Klasör bulunamadı' });
    }
    
    res.json(folder);
  } catch (error) {
    console.error('PDF folder update error:', error);
    res.status(500).json({ error: 'Klasör güncellenemedi' });
  }
});

// Klasör sil
router.delete('/pdf-folders/:id', async (req: Request, res: Response) => {
  try {
    const success = await storage.deletePdfFolder(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Klasör bulunamadı' });
    }
    
    res.json({ success: true, message: 'Klasör silindi' });
  } catch (error) {
    console.error('PDF folder delete error:', error);
    res.status(500).json({ error: 'Klasör silinemedi' });
  }
});

// PDF Konuları Endpoint'leri

// PDF'in konularını getir
router.get('/pdf-materials/:pdfId/topics', async (req: Request, res: Response) => {
  try {
    const topics = await storage.getPdfTopics(req.params.pdfId);
    res.json(topics);
  } catch (error) {
    console.error('PDF topics fetch error:', error);
    res.status(500).json({ error: 'PDF konuları alınamadı' });
  }
});

// PDF konusu oluştur
router.post('/pdf-materials/:pdfId/topics', async (req: Request, res: Response) => {
  try {
    const topicData = {
      ...req.body,
      pdfId: req.params.pdfId
    };
    
    const validatedData = insertPdfTopicSchema.parse(topicData);
    const topic = await storage.createPdfTopic(validatedData);
    
    res.status(201).json({
      success: true,
      message: 'Konu oluşturuldu',
      topic
    });
  } catch (error) {
    console.error('PDF topic creation error:', error);
    res.status(500).json({ error: 'Konu oluşturulamadı' });
  }
});

// PDF konusu güncelle
router.put('/pdf-topics/:id', async (req: Request, res: Response) => {
  try {
    const updates = req.body;
    const topic = await storage.updatePdfTopic(req.params.id, updates);
    
    if (!topic) {
      return res.status(404).json({ error: 'Konu bulunamadı' });
    }
    
    res.json(topic);
  } catch (error) {
    console.error('PDF topic update error:', error);
    res.status(500).json({ error: 'Konu güncellenemedi' });
  }
});

// PDF konusu sil
router.delete('/pdf-topics/:id', async (req: Request, res: Response) => {
  try {
    const success = await storage.deletePdfTopic(req.params.id);
    
    if (!success) {
      return res.status(404).json({ error: 'Konu bulunamadı' });
    }
    
    res.json({ success: true, message: 'Konu silindi' });
  } catch (error) {
    console.error('PDF topic delete error:', error);
    res.status(500).json({ error: 'Konu silinemedi' });
  }
});

export default router;