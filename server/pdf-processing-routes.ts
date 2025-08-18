import express from 'express';
import { pdfContentProcessor } from './pdf-content-processor.js';
import { db } from './db.js';
import { pdfTopics } from '../shared/schema.js';
import { eq } from 'drizzle-orm';

const router = express.Router();

// Process PDF content and extract topics
router.post('/process/:pdfId', async (req, res) => {
  try {
    const { pdfId } = req.params;
    
    if (!pdfId) {
      return res.status(400).json({
        success: false,
        message: 'PDF ID is required'
      });
    }

    console.log(`[PDF_PROCESSING] Starting processing for PDF: ${pdfId}`);
    
    const result = await pdfContentProcessor.processPDFContent(pdfId);
    
    if (result.success) {
      console.log(`[PDF_PROCESSING] Successfully processed PDF: ${pdfId}, Topics: ${result.topicsCount}`);
      res.status(200).json({
        success: true,
        message: result.message,
        topicsCount: result.topicsCount
      });
    } else {
      console.error(`[PDF_PROCESSING] Failed to process PDF: ${pdfId}, Error: ${result.message}`);
      res.status(400).json({
        success: false,
        message: result.message
      });
    }
    
  } catch (error) {
    console.error('[PDF_PROCESSING] Unexpected error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during PDF processing'
    });
  }
});

// Get topics for a specific PDF
router.get('/topics/:pdfId', async (req, res) => {
  try {
    const { pdfId } = req.params;
    
    const topics = await db.select().from(pdfTopics).where(eq(pdfTopics.pdfId, pdfId));
    
    res.json({
      success: true,
      topics: topics
    });
    
  } catch (error) {
    console.error('[PDF_PROCESSING] Error fetching topics:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching topics'
    });
  }
});

// Delete all topics for a PDF (useful for reprocessing)
router.delete('/topics/:pdfId', async (req, res) => {
  try {
    const { pdfId } = req.params;
    
    await db.delete(pdfTopics).where(eq(pdfTopics.pdfId, pdfId));
    
    res.json({
      success: true,
      message: 'Topics deleted successfully'
    });
    
  } catch (error) {
    console.error('[PDF_PROCESSING] Error deleting topics:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting topics'
    });
  }
});

export default router;