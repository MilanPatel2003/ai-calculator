# LogicLedger: Math Notes Made Easy

LogicLedger is an innovative web application that combines the power of drawing and artificial intelligence to solve mathematical problems. Users can draw equations, graphs, or geometric shapes on a digital canvas, and the application will analyze the input to provide solutions and explanations.

## Table of Contents

1. [Features](#features)
2. [Tech Stack](#tech-stack)
3. [Project Structure](#project-structure)
4. [Setup and Installation](#setup-and-installation)
5. [Usage](#usage)
6. [API Endpoints](#api-endpoints)
7. [Contributing](#contributing)
8. [License](#license)

## Features

- Interactive drawing canvas for inputting mathematical problems
- Real-time analysis of drawn equations and shapes
- Support for various mathematical concepts (algebra, calculus, geometry, etc.)
- Dark mode toggle for comfortable viewing
- Responsive design for desktop and mobile devices
- Draggable result display with LaTeX rendering

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- Axios for API requests

### Backend
- Node.js
- Express.js
- TypeScript
- Google Generative AI (Gemini API) for image analysis

## Project Structure

The project is divided into two main parts: the frontend and the backend.

### Frontend Structure
math-calculator-frontend/
├── public/
├── src/
│ ├── components/
│ ├── screens/
│ │ └── Home.tsx
│ ├── constants/
│ │ └── index.ts
│ ├── App.tsx
│ ├── main.tsx
│ └── index.css
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md


### Backend Structure
math-calculator-backend/
├── src/
│ ├── config/
│ │ └── constants.ts
│ └── app.ts
├── package.json
├── tsconfig.json
└── vercel.json


## Setup and Installation

1. Clone the repository:
   ```
   git clone https://github.com/your-username/logicledger.git
   cd logicledger
   ```

2. Set up the frontend:
   ```
   cd math-calculator-frontend
   npm install
   ```

3. Set up the backend:
   ```
   cd ../math-calculator-backend
   npm install
   ```

4. Create a `.env` file in the backend directory with the following content:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   FRONTEND_URL=http://localhost:5173
   ```

5. Start the development servers:
   - For the frontend (in the `math-calculator-frontend` directory):
     ```
     npm run dev
     ```
   - For the backend (in the `math-calculator-backend` directory):
     ```
     npm run dev
     ```

## Usage

1. Open your browser and navigate to `http://localhost:5173` (or the port specified by Vite).
2. Use the drawing canvas to input mathematical problems, equations, or shapes.
3. Select a color from the color palette for drawing.
4. Click the "Calculate" button to analyze the drawn input.
5. View the results displayed in LaTeX format, which can be dragged around the screen.
6. Use the "Reset" button to clear the canvas and start over.
7. Toggle between light and dark modes for comfortable viewing.

## API Endpoints

The backend provides the following API endpoint:

- `POST /analyze`: Analyzes the drawn image and returns the mathematical solution.
  - Request body: `{ image: string }` (base64 encoded image data)
  - Response: `{ result: string }` (LaTeX formatted solution)

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.