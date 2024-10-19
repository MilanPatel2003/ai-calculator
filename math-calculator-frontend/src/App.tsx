import React, { useEffect, useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';

const API_URL = 'http://localhost:3000'; // Update this to match your backend URL

const COLORS = [
  'rgb(0, 0, 0)', 'rgb(255, 255, 255)', 'rgb(255, 59, 48)', 'rgb(255, 45, 85)', 
  'rgb(175, 82, 222)', 'rgb(88, 86, 214)', 'rgb(0, 122, 255)', 'rgb(52, 199, 89)', 
  'rgb(255, 204, 0)', 'rgb(255, 149, 0)', 'rgb(142, 142, 147)'
];

const TOOLS = ['pen', 'eraser', 'lasso'] as const;
type Tool = typeof TOOLS[number];


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
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 100; // Subtracting toolbar height
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  }, []);

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

        ctx.strokeStyle = tool === 'eraser' ? 'white' : color;
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
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
    setResult('');
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
          setResult(JSON.stringify(response.data.result));
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

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="fixed top-0 left-0 right-0 z-10 bg-white shadow-md p-2 flex justify-between items-center">
        <div className="flex space-x-2">
          {TOOLS.map((t) => (
            <button
              key={t}
              className={`p-2 rounded ${tool === t ? 'bg-gray-200' : ''}`}
              onClick={() => setTool(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>
        <div className="flex space-x-2">
          {COLORS.map((c) => (
            <button
              key={c}
              className={`w-6 h-6 rounded-full ${c === 'rgb(255, 255, 255)' ? 'border border-gray-300' : ''}`}
              style={{ backgroundColor: c, border: color === c ? '2px solid black' : 'none' }}
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
            className="w-32"
          />
          <span>{lineWidth}px</span>
        </div>
        <div className="flex space-x-2">
          <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={resetCanvas}>Reset</button>
          <button className="bg-green-500 text-white px-4 py-2 rounded" onClick={calculateResult}>Calculate</button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        className="absolute top-16 left-0 w-full h-[calc(100vh-4rem)]"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
      {result && (
        <div className="absolute top-20 left-4 bg-white p-2 rounded shadow-md">
        
          {result}
        </div>
      )}
    </div>
  );
}
