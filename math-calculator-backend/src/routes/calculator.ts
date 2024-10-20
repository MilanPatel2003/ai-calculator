import express from 'express';
import { ImageData } from '../types';
import { analyzeImage } from '../utils/imageAnalyzer';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    console.log('Received request body:', JSON.stringify(req.body, null, 2));
    const data: ImageData = req.body;
    const responses = await analyzeImage(data);
    console.log('Response in route:', responses);
    res.json({ message: "Image processed", data: responses, status: "success" });
  } catch (error: unknown) {
    console.error('Error processing image:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ 
      message: "Error processing image", 
      error: errorMessage, 
      status: "error" 
    });
  }
});

export default router;
