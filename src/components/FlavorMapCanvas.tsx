'use client';

import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';

interface FlavorMapCanvasProps {
  data: any;
  onCuisineSelect: (cuisine: any) => void;
  selectedCuisine: any;
}

const FlavorMapCanvas: React.FC<FlavorMapCanvasProps> = ({
  data,
  onCuisineSelect,
  selectedCuisine
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCuisine, setHoveredCuisine] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const updateDimensions = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !data?.cuisines) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= dimensions.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, dimensions.height);
      ctx.stroke();
    }
    for (let i = 0; i <= dimensions.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(dimensions.width, i);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(dimensions.width / 2, 0);
    ctx.lineTo(dimensions.width / 2, dimensions.height);
    ctx.moveTo(0, dimensions.height / 2);
    ctx.lineTo(dimensions.width, dimensions.height / 2);
    ctx.stroke();

    // Draw cuisines
    data.cuisines.forEach((cuisine: any, index: number) => {
      const x = (cuisine.x + 1) * (dimensions.width / 2);
      const y = (cuisine.y + 1) * (dimensions.height / 2);
      
      // Set color based on selection
      if (selectedCuisine?.name === cuisine.name) {
        ctx.fillStyle = '#3b82f6';
      } else if (hoveredCuisine?.name === cuisine.name) {
        ctx.fillStyle = '#60a5fa';
      } else {
        ctx.fillStyle = '#93c5fd';
      }

      // Draw circle
      ctx.beginPath();
      ctx.arc(x, y, 12, 0, 2 * Math.PI);
      ctx.fill();
      
      // Draw border
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = '#1f2937';
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cuisine.name, x, y - 20);
    });

  }, [data, dimensions, selectedCuisine, hoveredCuisine]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !data?.cuisines) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Convert to normalized coordinates
    const normalizedX = (x / dimensions.width) * 2 - 1;
    const normalizedY = (y / dimensions.height) * 2 - 1;

    // Find clicked cuisine
    const clickedCuisine = data.cuisines.find((cuisine: any) => {
      const cuisineX = (cuisine.x + 1) * (dimensions.width / 2);
      const cuisineY = (cuisine.y + 1) * (dimensions.height / 2);
      const distance = Math.sqrt(Math.pow(x - cuisineX, 2) + Math.pow(y - cuisineY, 2));
      return distance <= 12;
    });

    if (clickedCuisine) {
      onCuisineSelect(clickedCuisine);
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !data?.cuisines) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Find hovered cuisine
    const hoveredCuisineFound = data.cuisines.find((cuisine: any) => {
      const cuisineX = (cuisine.x + 1) * (dimensions.width / 2);
      const cuisineY = (cuisine.y + 1) * (dimensions.height / 2);
      const distance = Math.sqrt(Math.pow(x - cuisineX, 2) + Math.pow(y - cuisineY, 2));
      return distance <= 12;
    });

    setHoveredCuisine(hoveredCuisineFound || null);
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="border border-gray-200 rounded-lg cursor-pointer"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredCuisine(null)}
      />
      
      {/* Axis Labels */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xs text-gray-600">
        Flavor Complexity →
      </div>
      <div className="absolute top-1/2 left-2 transform -translate-y-1/2 -rotate-90 text-xs text-gray-600">
        Cultural Authenticity →
      </div>

      {/* Legend */}
      <div className="absolute top-2 right-2 bg-white bg-opacity-90 rounded-lg p-2 text-xs">
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-blue-300 rounded-full"></div>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2 mb-1">
          <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
          <span>Hovered</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
};

export default FlavorMapCanvas;
