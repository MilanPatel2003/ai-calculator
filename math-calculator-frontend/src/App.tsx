import { useEffect, useRef, useState } from 'react';
import axios, { AxiosError } from 'axios';
import { Button, ColorSwatch, Group, MantineProvider } from '@mantine/core';

// Constants
const SWATCHES = ['#FFFFFF', '#FF0000', '#FF69B4', '#800080', '#8B4513', '#1E90FF', '#20B2AA', '#32CD32', '#ADFF2F', '#FFD700', '#FFA500'];
const API_URL = 'http://localhost:3000'; // Update this to match your backend URL

const resizeImage = (base64Str: string, maxWidth = 1024, maxHeight = 1024): Promise<string> => {
  return new Promise((resolve) => {
    let img = new Image()
    img.src = base64Str
    img.onload = () => {
      let canvas = document.createElement('canvas')
      const MAX_WIDTH = maxWidth
      const MAX_HEIGHT = maxHeight
      let width = img.width
      let height = img.height

      if (width > height) {
        if (width > MAX_WIDTH) {
          height *= MAX_WIDTH / width
          width = MAX_WIDTH
        }
      } else {
        if (height > MAX_HEIGHT) {
          width *= MAX_HEIGHT / height
          height = MAX_HEIGHT
        }
      }
      canvas.width = width
      canvas.height = height
      let ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(img, 0, 0, width, height)
        resolve(canvas.toDataURL())
      } else {
        resolve(base64Str) // Fallback to original if context is null
      }
    }
  })
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#FFFFFF');
  const [result, setResult] = useState<string>('');

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight - 60; // Subtracting toolbar height
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.lineCap = 'round';
        ctx.lineWidth = 2;
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
      if (ctx) {
        ctx.beginPath();
      }
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
        ctx.strokeStyle = color;
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
        ctx.fillStyle = 'black';
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
        const base64Data = imageData.split(',')[1]; // Remove the data URL prefix
        
        console.log('Image data length:', base64Data.length);
        
        const response = await axios.post(`${API_URL}/analyze`, {
          image: base64Data
        });
        
        if (typeof response.data.result === 'string') {
          setResult(response.data.result);
        } else {
          setResult(JSON.stringify(response.data.result));
        }
      } catch (error: unknown) {
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
    <MantineProvider>
      <div className="bg-black min-h-screen">
        <div className='fixed top-0 left-0 right-0 z-10 bg-gray-800 p-2 flex justify-between items-center'>
          <Button color="red" onClick={resetCanvas}>Reset</Button>
          <Group>
            {SWATCHES.map((swatch) => (
              <ColorSwatch 
                key={swatch} 
                color={swatch} 
                onClick={() => setColor(swatch)}
                style={{ cursor: 'pointer', border: color === swatch ? '2px solid white' : 'none' }}
              />
            ))}
          </Group>
          <Button color="green" onClick={calculateResult}>Calculate</Button>
        </div>
        <canvas
          ref={canvasRef}
          className='absolute top-14 left-0 w-full h-[calc(100vh-3.5rem)]'
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseOut={stopDrawing}
        />
        {result && (
          <div className="absolute top-20 left-4 bg-gray-800 p-2 rounded text-white">
            {result}
          </div>
        )}
      </div>
    </MantineProvider>
  );
}
