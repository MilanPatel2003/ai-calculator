import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import calculatorRouter from './routes/calculator';
import { PORT } from './config/constants';
import { GoogleGenerativeAI, GoogleGenerativeAIError } from '@google/generative-ai';

const app = express();

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

app.use('/calculate', calculatorRouter);

app.get('/', (req, res) => {
  res.json({ message: "Server is running" });
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

app.post('/analyze', async (req, res) => {
  try {
    const { image } = req.body;
    console.log('Received image data length:', image.length);

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analyze the mathematical expression, equation, or graphical problem in the given image and solve it.
    Follow these rules:
    1. Use the PEMDAS rule for solving mathematical expressions: Parentheses, Exponents, Multiplication and Division (left to right), Addition and Subtraction (left to right).
    2. For simple mathematical expressions (e.g., 2 + 2, 3 * 4):
       Return: [{"expr": "given expression", "result": "calculated answer"}]
    3. For equations with variables (e.g., x^2 + 2x + 1 = 0):
       Solve and return: [{"expr": "x", "result": "value", "assign": true}, {"expr": "y", "result": "value", "assign": true}]
       Include as many entries as there are variables.
    4. For variable assignments (e.g., x = 4, y = 5):
       Return: [{"expr": "variable", "result": "value", "assign": true}]
    5. For graphical math problems (e.g., geometric shapes, graphs):
       Analyze the problem, paying attention to colors and details.
       Return: [{"expr": "problem description", "result": "calculated answer"}]
    6. For abstract concepts or drawings:
       Return: [{"expr": "explanation of the drawing", "result": "identified abstract concept"}]
    
    Important:
    - Return only one type of result based on the image content.
    - Use proper JSON formatting with quoted keys and values.
    - Do not use backticks or markdown in your response.
    - For any special characters, use double backslashes (e.g., \\\\n instead of \\n).
    
    Analyze the image and provide the solution in the specified format.`;

    const result = await model.generateContent([prompt, { inlineData: { data: image, mimeType: "image/png" } }]);
    const response = await result.response;
    const text = response.text();
    
    // Parse the text response and format it as needed
    let formattedResult;
    try {
      formattedResult = JSON.parse(text);
    } catch (parseError) {
      formattedResult = [{ expr: "Unable to parse result", result: text }];
    }

    res.json({ result: formattedResult });
  } catch (error: unknown) {
    console.error('Error processing image:', error);
    
    if (error instanceof GoogleGenerativeAIError) {
      console.error('Gemini API Error:', error.message);
      res.status(500).json({ error: 'Error processing image with Gemini API', details: error.message });
    } else if (error instanceof Error) {
      res.status(500).json({ error: 'Error processing image', details: error.message });
    } else {
      res.status(500).json({ error: 'An unknown error occurred' });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
