'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

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
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCuisine, setHoveredCuisine] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  // Memoize draw function to avoid dependency issues
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !data?.cuisines) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Draw grid
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let i = 0; i <= width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i <= height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#6b7280';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(width / 2, 0);
    ctx.lineTo(width / 2, height);
    ctx.moveTo(0, height / 2);
    ctx.lineTo(width, height / 2);
    ctx.stroke();

    // Draw cuisines
    data.cuisines.forEach((cuisine: any) => {
      // Normalize coordinates to canvas space
      const normalizedX = typeof cuisine.x === 'number' ? cuisine.x : 0;
      const normalizedY = typeof cuisine.y === 'number' ? cuisine.y : 0;
      
      // Scale to canvas (assuming x,y are in range 0-1 or small values)
      const x = (normalizedX * 5 + 0.5) * width;
      const y = (normalizedY * 5 + 0.5) * height;
      
      // Clamp to canvas bounds with padding
      const clampedX = Math.max(50, Math.min(width - 50, x));
      const clampedY = Math.max(30, Math.min(height - 30, y));

      // Set color based on selection
      if (selectedCuisine?.name === cuisine.name) {
        ctx.fillStyle = '#3b82f6';
      } else if (hoveredCuisine?.name === cuisine.name) {
        ctx.fillStyle = '#60a5fa';
      } else {
        ctx.fillStyle = cuisine.color || '#93c5fd';
      }

      // Draw circle
      ctx.beginPath();
      ctx.arc(clampedX, clampedY, cuisine.size || 15, 0, 2 * Math.PI);
      ctx.fill();

      // Draw border
      ctx.strokeStyle = '#1e40af';
      ctx.lineWidth = 2;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = '#1f2937';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(cuisine.name, clampedX, clampedY - 22);
    });
  }, [data, dimensions, selectedCuisine, hoveredCuisine]);

  // Handle dimension updates
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        if (rect.width > 0) {
          setDimensions({ 
            width: rect.width, 
            height: Math.max(rect.height, 500) 
          });
        }
      }
    };

    // Initial update with delay
    const timer = setTimeout(updateDimensions, 100);
    
    // ResizeObserver for responsive updates
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(updateDimensions);
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateDimensions);
    
    return () => {
      clearTimeout(timer);
      if (resizeObserver) resizeObserver.disconnect();
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  // Draw canvas when data or dimensions change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !data?.cuisines) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    // Find clicked cuisine using same coordinate calculation as drawing
    const clickedCuisine = data.cuisines.find((cuisine: any) => {
      const normalizedX = typeof cuisine.x === 'number' ? cuisine.x : 0;
      const normalizedY = typeof cuisine.y === 'number' ? cuisine.y : 0;
      const x = (normalizedX * 5 + 0.5) * dimensions.width;
      const y = (normalizedY * 5 + 0.5) * dimensions.height;
      const clampedX = Math.max(50, Math.min(dimensions.width - 50, x));
      const clampedY = Math.max(30, Math.min(dimensions.height - 30, y));
      const distance = Math.sqrt(Math.pow(clickX - clampedX, 2) + Math.pow(clickY - clampedY, 2));
      return distance <= (cuisine.size || 15);
    });

    if (clickedCuisine) {
      onCuisineSelect(clickedCuisine);
    }
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !data?.cuisines) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // Find hovered cuisine using same coordinate calculation as drawing
    const hoveredCuisineFound = data.cuisines.find((cuisine: any) => {
      const normalizedX = typeof cuisine.x === 'number' ? cuisine.x : 0;
      const normalizedY = typeof cuisine.y === 'number' ? cuisine.y : 0;
      const x = (normalizedX * 5 + 0.5) * dimensions.width;
      const y = (normalizedY * 5 + 0.5) * dimensions.height;
      const clampedX = Math.max(50, Math.min(dimensions.width - 50, x));
      const clampedY = Math.max(30, Math.min(dimensions.height - 30, y));
      const distance = Math.sqrt(Math.pow(mouseX - clampedX, 2) + Math.pow(mouseY - clampedY, 2));
      return distance <= (cuisine.size || 15);
    });

    setHoveredCuisine(hoveredCuisineFound || null);
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px]">
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
