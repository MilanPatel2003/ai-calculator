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

const frontendUrl =
  process.env.FRONTEND_URL || "https://ai-calculator-frontend-plum.vercel.app";
app.use(
  cors({
    origin: frontendUrl,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);
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

    // const prompt = `Analyze the mathematical expression, equation, or graphical problem in the given image and solve it.
    // Follow these rules:
    // 1. Use the PEMDAS rule for solving mathematical expressions: Parentheses, Exponents, Multiplication and Division (left to right), Addition and Subtraction (left to right).
    // 2. For simple mathematical expressions (e.g., 2 + 2, 3 * 4):
    //    Return: [{"expr": "given expression", "result": "calculated answer"}]
    // 3. For equations with variables (e.g., x^2 + 2x + 1 = 0):
    //    Solve and return: [{"expr": "x", "result": "value", "assign": true}, {"expr": "y", "result": "value", "assign": true}]
    //    Include as many entries as there are variables.
    // 4. For variable assignments (e.g., x = 4, y = 5):
    //    Return: [{"expr": "variable", "result": "value", "assign": true}]
    // 5. For graphical math problems (e.g., geometric shapes, graphs):
    //    Analyze the problem, paying attention to colors and details.
    //    Return: [{"expr": "problem description", "result": "calculated answer"}]
    // 6. For abstract concepts or drawings:
    //    Return: [{"expr": "explanation of the drawing", "result": "identified abstract concept"}]

    // Important:
    // - Return only one type of result based on the image content.
    // - Use proper JSON formatting with quoted keys and values.
    // - Do not use backticks or markdown in your response.
    // - For any special characters, use double backslashes (e.g., \\\\n instead of \\n).

    // Analyze the image and provide the solution in the specified format.`;

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

    
    const prompt = `You have been given an image with some mathematical expressions, equations, or graphical problems, and you need to solve them.

    Note: Use the PEMDAS rule for solving mathematical expressions. PEMDAS stands for the Priority Order: Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right). Parentheses have the highest priority, followed by Exponents, then Multiplication and Division, and lastly Addition and Subtraction.
    
    For example:
    Q. 2 + 3 * 4
    (3 * 4) => 12, 2 + 12 = 14.
    Q. 2 + 3 + 5 * 4 - 8 / 2
    5 * 4 => 20, 8 / 2 => 4, 2 + 3 => 5, 5 + 20 => 25, 25 - 4 => 21.
    
    YOU CAN HAVE FIVE TYPES OF EQUATIONS/EXPRESSIONS IN THIS IMAGE, AND ONLY ONE CASE SHALL APPLY EVERY TIME:
    
    Following are the cases:
    
    1. Simple mathematical expressions like 2 + 2, 3 * 4, 5 / 6, 7 - 8, etc.: In this case, solve and return the answer in the format of an ARRAY OF ONE OBJECT [{expr: given expression, result: calculated answer}].
    
    2. Set of Equations like x^2 + 2x + 1 = 0, 3y + 4x = 0, 5x^2 + 6y + 7 = 12, etc.: In this case, solve for the given variable, and the format should be an ARRAY OF OBJECTS, with object 1 as {expr: "x", result: 2, assign: true} and object 2 as {expr: "y", result: 5, assign: true}. This example assumes x was calculated as 2, and y as 5. Include as many objects as there are variables.
    
    3. Assigning values to variables like x = 4, y = 5, z = 6, etc.: In this case, assign values to variables and return another key in the object called {assign: true}, keeping the variable as 'expr' and the value as 'result' in the original object. RETURN AS AN ARRAY OF OBJECTS.
    
    4. Analyzing Graphical Math problems, which are word problems represented in drawing form, such as cars colliding, trigonometric problems, problems on the Pythagorean theorem, adding runs from a cricket wagon wheel, etc. These will have a drawing representing some scenario and accompanying information with the image. PAY CLOSE ATTENTION TO DIFFERENT COLORS FOR THESE PROBLEMS. You need to return the answer in the format of an ARRAY OF ONE OBJECT [{expr: given expression, result: calculated answer}].
    
    5. Detecting Abstract Concepts that a drawing might show, such as love, hate, jealousy, patriotism, or a historic reference to war, invention, discovery, quote, etc. USE THE SAME FORMAT AS OTHERS TO RETURN THE ANSWER, where 'expr' will be the explanation of the drawing, and 'result' will be the abstract concept.
    
    Analyze the equation or expression in this image and return the answer according to the given rules:
    
    Make sure to use extra backslashes for escape characters like \\f -> \\\\f, \\n -> \\\\n, etc.
    
    DO NOT USE BACKTICKS OR MARKDOWN FORMATTING.
    
    RETURN THE RESULT AS A VALID JAVASCRIPT OBJECT OR ARRAY OF OBJECTS, READY TO BE USED DIRECTLY IN THE FRONTEND.`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: image, mimeType: "image/png" } },
    ]);
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
