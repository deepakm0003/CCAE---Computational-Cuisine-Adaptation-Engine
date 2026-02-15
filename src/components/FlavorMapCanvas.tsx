'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

interface FlavorMapCanvasProps {
  data: any;
  onCuisineSelect: (cuisine: any) => void;
  selectedCuisine: any;
}

// Cuisine color palette for visual distinction
const cuisineColors: Record<string, string> = {
  italian: '#22c55e',
  indian: '#f97316',
  chinese: '#ef4444',
  japanese: '#ec4899',
  mexican: '#eab308',
  french: '#3b82f6',
  thai: '#14b8a6',
  korean: '#a855f7',
  greek: '#06b6d4',
  american: '#6366f1',
  vietnamese: '#84cc16',
  spanish: '#f43f5e',
  default: '#64748b'
};

const FlavorMapCanvas: React.FC<FlavorMapCanvasProps> = ({
  data,
  onCuisineSelect,
  selectedCuisine
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredCuisine, setHoveredCuisine] = useState<any>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 500 });

  const getCuisineColor = (name: string) => {
    const lowerName = name.toLowerCase();
    return cuisineColors[lowerName] || cuisineColors.default;
  };

  // Memoize draw function to avoid dependency issues
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current || !data?.cuisines) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { width, height } = dimensions;

    // Create gradient background
    const gradient = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.max(width, height)/2);
    gradient.addColorStop(0, '#f8fafc');
    gradient.addColorStop(1, '#e2e8f0');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Draw subtle grid
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let i = 0; i <= height; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(width, i);
      ctx.stroke();
    }

    // Draw center axes with labels
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(width / 2, 20);
    ctx.lineTo(width / 2, height - 20);
    ctx.moveTo(20, height / 2);
    ctx.lineTo(width - 20, height / 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw cuisines
    data.cuisines.forEach((cuisine: any, index: number) => {
      // Use grid positioning for cuisines based on index
      const cols = Math.ceil(Math.sqrt(data.cuisines.length));
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      // Calculate positions with better spacing
      const padding = 80;
      const availableWidth = width - 2 * padding;
      const availableHeight = height - 2 * padding;
      const spacingX = availableWidth / Math.max(cols - 1, 1);
      const spacingY = availableHeight / Math.max(Math.ceil(data.cuisines.length / cols) - 1, 1);
      
      // Use provided coordinates if valid, otherwise use grid position
      let x, y;
      if (cuisine.x !== undefined && cuisine.y !== undefined && 
          Math.abs(cuisine.x) > 0.001 && Math.abs(cuisine.y) > 0.001) {
        // Normalize embedding coordinates to canvas space
        const normalizedX = (cuisine.x + 1) / 2; // Assume embeddings are in [-1, 1]
        const normalizedY = (cuisine.y + 1) / 2;
        x = padding + normalizedX * availableWidth;
        y = padding + normalizedY * availableHeight;
      } else {
        // Grid layout fallback
        x = padding + col * spacingX;
        y = padding + row * spacingY;
      }
      
      // Clamp to canvas bounds
      const clampedX = Math.max(60, Math.min(width - 60, x));
      const clampedY = Math.max(50, Math.min(height - 50, y));

      // Calculate size based on recipe/ingredient count
      const baseSize = 18;
      const sizeMultiplier = Math.min(2, Math.sqrt((cuisine.details?.recipe_count || 1) / 5));
      const circleSize = baseSize + sizeMultiplier * 8;

      // Get color
      const baseColor = getCuisineColor(cuisine.name);
      
      // Draw glow effect for selected/hovered
      if (selectedCuisine?.name === cuisine.name || hoveredCuisine?.name === cuisine.name) {
        ctx.shadowColor = baseColor;
        ctx.shadowBlur = 20;
      }

      // Draw outer ring
      ctx.beginPath();
      ctx.arc(clampedX, clampedY, circleSize + 3, 0, 2 * Math.PI);
      ctx.fillStyle = selectedCuisine?.name === cuisine.name ? '#1e40af' : 
                      hoveredCuisine?.name === cuisine.name ? '#3b82f6' : '#e2e8f0';
      ctx.fill();

      // Draw main circle with gradient
      const circleGradient = ctx.createRadialGradient(
        clampedX - circleSize/3, clampedY - circleSize/3, 0,
        clampedX, clampedY, circleSize
      );
      circleGradient.addColorStop(0, lightenColor(baseColor, 30));
      circleGradient.addColorStop(1, baseColor);
      
      ctx.beginPath();
      ctx.arc(clampedX, clampedY, circleSize, 0, 2 * Math.PI);
      ctx.fillStyle = circleGradient;
      ctx.fill();

      // Reset shadow
      ctx.shadowBlur = 0;

      // Draw label background
      ctx.font = 'bold 11px Inter, system-ui, sans-serif';
      const textWidth = ctx.measureText(cuisine.name).width;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
      ctx.beginPath();
      ctx.roundRect(clampedX - textWidth/2 - 6, clampedY - circleSize - 26, textWidth + 12, 18, 4);
      ctx.fill();
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Draw label
      ctx.fillStyle = '#1e293b';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(cuisine.name.charAt(0).toUpperCase() + cuisine.name.slice(1), clampedX, clampedY - circleSize - 17);

      // Draw recipe count badge
      const recipeCount = cuisine.details?.recipe_count || 0;
      if (recipeCount > 0) {
        ctx.font = 'bold 9px Inter, system-ui, sans-serif';
        ctx.fillStyle = '#fff';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(String(recipeCount), clampedX, clampedY);
      }
    });
  }, [data, dimensions, selectedCuisine, hoveredCuisine]);

  // Helper function to lighten a color
  const lightenColor = (color: string, percent: number) => {
    const num = parseInt(color.replace('#', ''), 16);
    const amt = Math.round(2.55 * percent);
    const R = Math.min(255, (num >> 16) + amt);
    const G = Math.min(255, ((num >> 8) & 0x00FF) + amt);
    const B = Math.min(255, (num & 0x0000FF) + amt);
    return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
  };

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

    // Find clicked cuisine
    const clickedCuisine = findCuisineAtPoint(clickX, clickY);
    if (clickedCuisine) {
      onCuisineSelect(clickedCuisine);
    }
  };

  const findCuisineAtPoint = (pointX: number, pointY: number) => {
    if (!data?.cuisines) return null;

    const { width, height } = dimensions;
    const cols = Math.ceil(Math.sqrt(data.cuisines.length));
    const padding = 80;
    const availableWidth = width - 2 * padding;
    const availableHeight = height - 2 * padding;
    const spacingX = availableWidth / Math.max(cols - 1, 1);
    const spacingY = availableHeight / Math.max(Math.ceil(data.cuisines.length / cols) - 1, 1);

    return data.cuisines.find((cuisine: any, index: number) => {
      const row = Math.floor(index / cols);
      const col = index % cols;
      
      let x, y;
      if (cuisine.x !== undefined && cuisine.y !== undefined && 
          Math.abs(cuisine.x) > 0.001 && Math.abs(cuisine.y) > 0.001) {
        const normalizedX = (cuisine.x + 1) / 2;
        const normalizedY = (cuisine.y + 1) / 2;
        x = padding + normalizedX * availableWidth;
        y = padding + normalizedY * availableHeight;
      } else {
        x = padding + col * spacingX;
        y = padding + row * spacingY;
      }
      
      const clampedX = Math.max(60, Math.min(width - 60, x));
      const clampedY = Math.max(50, Math.min(height - 50, y));
      
      const baseSize = 18;
      const sizeMultiplier = Math.min(2, Math.sqrt((cuisine.details?.recipe_count || 1) / 5));
      const circleSize = baseSize + sizeMultiplier * 8;
      
      const distance = Math.sqrt(Math.pow(pointX - clampedX, 2) + Math.pow(pointY - clampedY, 2));
      return distance <= circleSize + 5;
    });
  };

  const handleCanvasMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || !data?.cuisines) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    const hoveredCuisineFound = findCuisineAtPoint(mouseX, mouseY);
    setHoveredCuisine(hoveredCuisineFound || null);
    
    // Update cursor style
    if (canvasRef.current) {
      canvasRef.current.style.cursor = hoveredCuisineFound ? 'pointer' : 'default';
    }
  };

  return (
    <div ref={containerRef} className="relative w-full h-full min-h-[500px]">
      <canvas
        ref={canvasRef}
        width={dimensions.width}
        height={dimensions.height}
        className="rounded-xl shadow-inner"
        onClick={handleCanvasClick}
        onMouseMove={handleCanvasMouseMove}
        onMouseLeave={() => setHoveredCuisine(null)}
      />
      
      {/* Axis Labels */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs text-gray-600 font-medium shadow-sm">
        Flavor Complexity →
      </div>
      <div className="absolute top-1/2 left-4 transform -translate-y-1/2 -rotate-90 px-3 py-1 bg-white/80 backdrop-blur-sm rounded-full text-xs text-gray-600 font-medium shadow-sm">
        Authenticity →
      </div>

      {/* Legend */}
      <div className="absolute top-4 right-4 bg-white/95 backdrop-blur-sm rounded-xl p-3 text-xs shadow-lg border border-gray-100">
        <div className="text-gray-700 font-semibold mb-2">Cuisines</div>
        <div className="space-y-1.5">
          {data?.cuisines?.slice(0, 6).map((c: any) => (
            <div key={c.name} className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: getCuisineColor(c.name) }}
              />
              <span className="capitalize text-gray-600">{c.name}</span>
              <span className="text-gray-400 text-[10px]">({c.details?.recipe_count || 0})</span>
            </div>
          ))}
          {data?.cuisines?.length > 6 && (
            <div className="text-gray-400 text-[10px]">+{data.cuisines.length - 6} more</div>
          )}
        </div>
      </div>

      {/* Hover tooltip */}
      {hoveredCuisine && (
        <div className="absolute bottom-4 right-4 bg-white rounded-xl p-3 shadow-lg border border-gray-100 text-sm">
          <div className="font-semibold text-gray-900 capitalize">{hoveredCuisine.name}</div>
          <div className="text-gray-500 text-xs mt-1">
            {hoveredCuisine.details?.recipe_count || 0} recipes • {hoveredCuisine.details?.ingredient_count || 0} ingredients
          </div>
          <div className="text-blue-600 text-xs mt-1">Click to view details</div>
        </div>
      )}
    </div>
  );
};

export default FlavorMapCanvas;
