import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import {
  GoogleGenerativeAI,
  GoogleGenerativeAIError,
} from "@google/generative-ai";

const app = express();

const allowedOrigins = [
  'http://localhost:5173',  // Local frontend
  'https://logic-ledger.vercel.app',  // Deployed frontend
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" })); 

app.get("/", (req, res) => {
  res.json({ message: "Server is running" });
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post("/analyze", async (req, res) => {
  try {
    const { image } = req.body;
    console.log("Received image data length:", image.length);

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

    // const prompt = `Analyze the mathematical expression, equation, or graphical problem in the given image and solve it.
    // Follow these rules:
    
    // 1. Use the PEMDAS rule for solving mathematical expressions: Parentheses, Exponents, Multiplication and Division (left to right), Addition and Subtraction (left to right).
    
    // 2. For simple mathematical expressions (e.g., 2 + 2, 3 * 4):
    //    Return: 
       
    //    {
    //      "type": "simple_expression",
    //      "steps": [
    //        {"step": 1, "description": "Given expression", "expression": "2 + 2"},
    //        {"step": 2, "description": "Calculate sum", "expression": "4"}
    //      ],
    //      "result": {"expression": "2 + 2", "value": 4},
    //      "user_friendly_output": "The expression 2 + 2 evaluates to 4."
    //    }
       
    
    // 3. For equations with variables (e.g., x^2 + 2x + 1 = 0):
    //    Solve and return:
       
    //    {
    //      "type": "equation",
    //      "steps": [
    //        {"step": 1, "description": "Given equation", "expression": "x^2 + 2x + 1 = 0"},
    //        {"step": 2, "description": "Apply quadratic formula", "expression": "x = (-b ± √(b^2 - 4ac)) / (2a)"},
    //        {"step": 3, "description": "Substitute values", "expression": "x = (-2 ± √(4 - 4(1)(1))) / (2(1))"},
    //        {"step": 4, "description": "Simplify", "expression": "x = -1 ± √0 / 2"},
    //        {"step": 5, "description": "Final result", "expression": "x = -1"}
    //      ],
    //      "result": [
    //        {"variable": "x", "value": -1}
    //      ],
    //      "user_friendly_output": "The solution to the equation x^2 + 2x + 1 = 0 is x = -1."
    //    }
       
    
    // 4. For variable assignments (e.g., x = 4, y = 5):
    //    Return:
       
    //    {
    //      "type": "assignment",
    //      "assignments": [
    //        {"variable": "x", "value": 4},
    //        {"variable": "y", "value": 5}
    //      ],
    //      "user_friendly_output": "The variables have been assigned as follows: x = 4 and y = 5."
    //    }
       
    
    // 5. For graphical math problems (e.g., geometric shapes, graphs):
    //    Analyze the problem, paying attention to colors and details.
    //    Return:
       
    //    {
    //      "type": "graphical",
    //      "description": "A right-angled triangle with sides 3, 4, and 5 units",
    //      "analysis": [
    //        {"step": 1, "description": "Identify shape", "detail": "Right-angled triangle"},
    //        {"step": 2, "description": "Measure sides", "detail": "Sides are 3, 4, and 5 units"}
    //      ],
    //      "result": {
    //        "shape": "Right-angled triangle",
    //        "properties": {
    //          "side_a": 3,
    //          "side_b": 4,
    //          "hypotenuse": 5,
    //          "area": 6,
    //          "perimeter": 12
    //        }
    //      },
    //      "user_friendly_output": "The image shows a right-angled triangle with sides of 3, 4, and 5 units. Its area is 6 square units and its perimeter is 12 units."
    //    }
       
    
    // 6. For abstract concepts or drawings:
    //    Return:
       
    //    {
    //      "type": "abstract",
    //      "description": "A spiral-like shape with increasing circles",
    //      "interpretation": "The drawing represents the concept of growth or expansion",
    //      "possible_applications": [
    //        "Illustrating exponential growth",
    //        "Visualizing the Fibonacci sequence",
    //        "Representing the golden ratio in nature"
    //      ],
    //      "user_friendly_output": "The image shows a spiral-like shape with increasing circles, which likely represents the concept of growth or expansion. This could be used to illustrate ideas like exponential growth, the Fibonacci sequence, or the golden ratio in nature."
    //    }
       
    
    // 7. For complex mathematical proofs or theorems:
    //    Return:
       
    //    {
    //      "type": "proof",
    //      "theorem": "Pythagorean Theorem",
    //      "statement": "In a right-angled triangle, the square of the hypotenuse is equal to the sum of squares of the other two sides",
    //      "steps": [
    //        {"step": 1, "description": "Consider a right-angled triangle ABC with right angle at C"},
    //        {"step": 2, "description": "Draw squares on each side of the triangle"},
    //        {"step": 3, "description": "The areas of these squares are a², b², and c², where c is the hypotenuse"},
    //        {"step": 4, "description": "Prove that a² + b² = c²"}
    //      ],
    //      "conclusion": "Thus, the Pythagorean Theorem is proved",
    //      "user_friendly_output": "The image presents a proof of the Pythagorean Theorem, which states that in a right-angled triangle, the square of the hypotenuse is equal to the sum of squares of the other two sides (a² + b² = c²)."
    //    }
       
    
    // 8. For statistical problems or data analysis:
    //    Return:
    //    {
    //      "type": "statistics",
    //      "data_description": "A set of exam scores for a class of 30 students",
    //      "analysis": [
    //        {"measure": "Mean", "value": 75.5},
    //        {"measure": "Median", "value": 78},
    //        {"measure": "Mode", "value": 80},
    //        {"measure": "Standard Deviation", "value": 8.2}
    //      ],
    //      "interpretation": "The class performance is slightly right-skewed with a central tendency around 75-80",
    //      "user_friendly_output": "The image shows exam scores for a class of 30 students. The average score is 75.5, with a median of 78 and a mode of 80. The standard deviation is 8.2. Overall, the class performance is slightly above average and consistent."
    //    }
       
    
    // Important:
    // - Return only one type of result based on the image content.
    // - Use proper JSON formatting with quoted keys and values.
    // - Do not use backticks or markdown in your response.
    // - For any special characters in strings, use proper JSON escaping (e.g., "\\n" for newline).
    // - Provide step-by-step solutions where applicable to show the problem-solving process.
    // - If the problem involves multiple steps or concepts, break it down into logical parts.
    // - When dealing with graphical problems, describe relevant visual elements (colors, shapes, relative positions) that influence the solution.
    // - For abstract or conceptual problems, provide possible interpretations and real-world applications.
    // - Always include a "user_friendly_output" field with a clear, concise explanation that can be directly displayed to the user.
    
    // Analyze the image and provide the solution in the specified format, ensuring clarity and completeness in your explanation. The "user_friendly_output" should be a coherent paragraph summarizing the problem and its solution in plain language.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: image, mimeType: "image/png" } },
    ]);
    const response = await result.response;
    const text = response.text();

    // Parse the text response and format it as needed
     // Remove Markdown formatting (triple backticks) if present
     const cleanText = text.replace(/```json\n|\n```/g, '');
    let formattedResult;
    try {
      formattedResult = JSON.parse(cleanText);
    } catch (parseError) {
      formattedResult = [{ expr: "Unable to parse result", result: text }];
    }

    res.json({ result: formattedResult });
  } catch (error: unknown) {
    console.error("Error processing image:", error);

    if (error instanceof GoogleGenerativeAIError) {
      console.error("Gemini API Error:", error.message);
      res.status(500).json({
        error: "Error processing image with Gemini API",
        details: error.message,
      });
    } else if (error instanceof Error) {
      res
        .status(500)
        .json({ error: "Error processing image", details: error.message });
    } else {
      res.status(500).json({ error: "An unknown error occurred" });
    }
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
