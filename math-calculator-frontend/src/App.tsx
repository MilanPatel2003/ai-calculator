import React, { useEffect, useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';


// Add this new import for the logo
import logo from '/logo.png';

const API_URL = 'https://ai-calculator-ecru.vercel.app'; // Remove the trailing slash


const COLORS = [
  '#000000', '#FFFFFF', '#FF3B30', '#FF2D55', 
  '#AF52DE', '#5856D6', '#007AFF', '#34C759', 
  '#FFCC00', '#FF9500', '#8E8E93'
];

const TOOLS = ['pen', 'eraser'] as const;
type Tool = typeof TOOLS[number];

// Add these icon components
const PenIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
    <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
    <path d="M2 2l7.586 7.586"></path>
    <circle cx="11" cy="11" r="2"></circle>
  </svg>
);

const EraserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 20H7L3 16C2.5 15.5 2.5 14.5 3 14L13 4L20 11L11 20"></path>
    <path d="M6 11L13 18"></path>
  </svg>
);

const LightModeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="5"></circle>
    <line x1="12" y1="1" x2="12" y2="3"></line>
    <line x1="12" y1="21" x2="12" y2="23"></line>
    <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
    <line x1="1" y1="12" x2="3" y2="12"></line>
    <line x1="21" y1="12" x2="23" y2="12"></line>
    <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
  </svg>
);

const DarkModeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
  </svg>
);

const resizeImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
  return new Promise((resolve) => {
    let img = new Image()
    img.src = base64Str
    img.onload = () => {
      let canvas = document.createElement('canvas')
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width
          width = maxWidth
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height
          height = maxHeight
        }
      }
      canvas.width = width
      canvas.height = height
      let ctx = canvas.getContext('2d')
      ctx?.drawImage(img, 0, 0, width, height)
      resolve(canvas.toDataURL())
    }
  })
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [color, setColor] = useState<string>(COLORS[0]);
  const [tool, setTool] = useState<Tool>('pen');
  const [lineWidth, setLineWidth] = useState<number>(2);
  const [result, setResult] = useState<string | { user_friendly_output: string }>('');
  const [darkMode, setDarkMode] = useState<boolean>(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    const resizeCanvas = () => {
      if (canvas) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - (window.innerWidth < 640 ? 168 : 112);
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Prevent default touch behavior
    document.body.style.overscrollBehavior = 'none';
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      document.body.style.overscrollBehavior = 'auto';
    };
  }, [darkMode]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      ctx?.beginPath();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        ctx.strokeStyle = tool === 'eraser' ? (darkMode ? 'black' : 'white') : color;
        ctx.lineWidth = lineWidth;
        ctx.lineCap = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(x, y);
      }
    }
  };

  const resetCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.fillStyle = darkMode ? 'black' : 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    setResult('');
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    resetCanvas();
  };

  const calculateResult = async () => {
    const canvas = canvasRef.current;
    if (canvas) {
      try {
        let imageData = canvas.toDataURL('image/png');
        imageData = await resizeImage(imageData);
        const base64Data = imageData.split(',')[1];
        
        const response = await axios.post(`${API_URL}/analyze`, { image: base64Data });        
        if (typeof response.data.result === 'string') {
          setResult(response.data.result);
        } else {
          setResult(response.data.result);
        }
      } catch (error) {
        console.error('Error analyzing image:', error);
        if (error instanceof AxiosError) {
          setResult(`Error analyzing image: ${error.response?.data?.error || error.message}`);
        } else if (error instanceof Error) {
          setResult(`Error analyzing image: ${error.message}`);
        } else {
          setResult('An unknown error occurred');
        }
      }
    }
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    startDrawing(touch as unknown as React.MouseEvent<HTMLCanvasElement>);
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const touch = e.touches[0];
    draw(touch as unknown as React.MouseEvent<HTMLCanvasElement>);
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    stopDrawing();
  };

  return (
    <div className={`h-screen w-screen overflow-hidden ${darkMode ? 'bg-black text-white' : 'bg-white text-black'} flex flex-col`}>
      <header className={`${darkMode ? 'bg-gray-900' : 'bg-gray-100'} text-white`}>
        <div className="relative overflow-hidden whitespace-nowrap py-3 bg-opacity-90 backdrop-blur-sm">
          <div className="animate-marquee inline-block">
            <div className="inline-flex items-center space-x-4 text-sm font-semibold tracking-wide">
              <img src={logo} alt="LogicLedger Logo" className="w-6 h-6" />
              <span className={`${darkMode ? 'text-blue-300' : 'text-blue-600'}`}>LOGICLEDGER</span>
              <span className="w-8 h-0.5 bg-gradient-to-r from-blue-500 to-teal-400"></span>
              <span className="animate-gradient bg-gradient-text bg-clip-text text-transparent bg-200% bg-left">
                🧮 UNLEASH YOUR MATH POTENTIAL • 📐 DRAW EQUATIONS, GRAPHS, OR GEOMETRY • 
                🔢 TRY ALGEBRA, CALCULUS, OR STATISTICS • 📊 SKETCH FRACTIONS, MATRICES, OR FUNCTIONS • 
                🖊️ WRITE • ✏️ DRAW • 🧽 ERASE • 🔄 RESET • 🌓 TOGGLE MODES • 🚀 CALCULATE •
                👨‍💻 CURIOUS ABOUT THE CREATOR? <a href="https://milanpatel.vercel.app" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-400">EXPLORE DEVELOPER'S PORTFOLIO - CLICK HERE</a>
              </span>
            </div>
          </div>
        </div>
      </header>
      <div className={`${darkMode ? 'bg-gray-800' : 'bg-gray-200'} shadow-md p-2 sm:p-4 flex flex-wrap justify-between items-center gap-2`}>
        <div className="flex space-x-2">
          {TOOLS.map((t) => (
            <button
              key={t}
              className={`p-2 rounded ${
                tool === t 
                  ? 'bg-blue-500 text-white' 
                  : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-300 text-gray-700'} hover:bg-gray-400`
              }`}
              onClick={() => setTool(t)}
              title={t.charAt(0).toUpperCase() + t.slice(1)}
            >
              {t === 'pen' ? <PenIcon /> : <EraserIcon />}
            </button>
          ))}
        </div>
        <div className="flex flex-wrap space-x-1 sm:space-x-2">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full ${
                c === '#FFFFFF' ? 'border border-gray-300' : ''
              } ${color === c ? 'ring-2 ring-blue-500' : ''}`}
              style={{ backgroundColor: c }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="range"
            min="1"
            max="20"
            value={lineWidth}
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-24 sm:w-32"
          />
          <span className="text-sm sm:text-base">{lineWidth}px</span>
        </div>
        <div className="flex space-x-2">
          <button className="bg-red-500 text-white px-2 py-1 sm:px-4 sm:py-2 rounded text-sm sm:text-base" onClick={resetCanvas}>Reset</button>
          <button className="bg-green-500 text-white px-2 py-1 sm:px-4 sm:py-2 rounded text-sm sm:text-base" onClick={calculateResult}>Calculate</button>
          <button className="p-2 rounded" onClick={toggleDarkMode}>
            {darkMode ? <LightModeIcon /> : <DarkModeIcon />}
          </button>
        </div>
      </div>
      <div className="relative flex-grow">
        <canvas
          ref={canvasRef}
          className="absolute top-0 left-0 w-full h-full touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        />
        {result && (
          <div className={`absolute top-2 right-2 sm:top-4 sm:right-4 ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-black'} p-2 sm:p-4 rounded shadow-md max-w-xs sm:max-w-md`}>
            <h2 className="text-lg sm:text-xl font-bold mb-1 sm:mb-2">Result:</h2>
            <p className="text-base sm:text-lg">
              {typeof result === 'string' ? result : result.user_friendly_output}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
