'use client';

import { motion } from 'framer-motion';

interface ChartProps {
  type: 'line' | 'bar' | 'pie' | 'area';
  data: any[];
  title?: string;
  height?: number;
  colors?: string[];
}

const Chart: React.FC<ChartProps> = ({
  type,
  data,
  title,
  height = 300,
  colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
}) => {
  const defaultColors = colors;

  const renderLineChart = () => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d.value / maxValue) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={defaultColors[0]}
          strokeWidth="2"
        />
        
        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (d.value / maxValue) * 100;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill={defaultColors[0]}
            />
          );
        })}
      </svg>
    );
  };

  const renderBarChart = () => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = 80 / data.length;

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Bars */}
        {data.map((d, i) => {
          const height = (d.value / maxValue) * 80;
          const x = 10 + (i * barWidth);
          const y = 90 - height;
          
          return (
            <rect
              key={i}
              x={x}
              y={y}
              width={barWidth * 0.8}
              height={height}
              fill={defaultColors[i % defaultColors.length]}
            />
          );
        })}
      </svg>
    );
  };

  const renderPieChart = () => {
    if (!data || data.length === 0) return null;

    const total = data.reduce((sum, d) => sum + d.value, 0);
    let currentAngle = 0;

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {data.map((d, i) => {
          const percentage = (d.value / total) * 100;
          const angle = (percentage / 100) * 360;
          const endAngle = currentAngle + angle;
          
          const x1 = 50 + 40 * Math.cos((currentAngle * Math.PI) / 180);
          const y1 = 50 + 40 * Math.sin((currentAngle * Math.PI) / 180);
          const x2 = 50 + 40 * Math.cos((endAngle * Math.PI) / 180);
          const y2 = 50 + 40 * Math.sin((endAngle * Math.PI) / 180);
          
          const largeArc = angle > 180 ? 1 : 0;
          
          const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 40 40 0 ${largeArc} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          currentAngle = endAngle;
          
          return (
            <path
              key={i}
              d={pathData}
              fill={defaultColors[i % defaultColors.length]}
              stroke="white"
              strokeWidth="1"
            />
          );
        })}
      </svg>
    );
  };

  const renderAreaChart = () => {
    if (!data || data.length === 0) return null;

    const maxValue = Math.max(...data.map(d => d.value));
    const points = data.map((d, i) => {
      const x = (i / (data.length - 1)) * 100;
      const y = 100 - (d.value / maxValue) * 100;
      return `${x},${y}`;
    }).join(' ');

    return (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map((y) => (
          <line
            key={y}
            x1="0"
            y1={y}
            x2="100"
            y2={y}
            stroke="#e5e7eb"
            strokeWidth="0.5"
          />
        ))}
        
        {/* Area */}
        <defs>
          <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={defaultColors[0]} stopOpacity="0.6" />
            <stop offset="100%" stopColor={defaultColors[0]} stopOpacity="0.1" />
          </linearGradient>
        </defs>
        
        <path
          d={`M 0,100 L ${points} L 100,100 Z`}
          fill="url(#areaGradient)"
        />
        
        {/* Line */}
        <polyline
          points={points}
          fill="none"
          stroke={defaultColors[0]}
          strokeWidth="2"
        />
        
        {/* Data points */}
        {data.map((d, i) => {
          const x = (i / (data.length - 1)) * 100;
          const y = 100 - (d.value / maxValue) * 100;
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill={defaultColors[0]}
            />
          );
        })}
      </svg>
    );
  };

  const renderChart = () => {
    switch (type) {
      case 'line':
        return renderLineChart();
      case 'bar':
        return renderBarChart();
      case 'pie':
        return renderPieChart();
      case 'area':
        return renderAreaChart();
      default:
        return <div className="flex items-center justify-center h-full text-gray-500">Unsupported chart type</div>;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl p-6 shadow-sm border border-gray-200"
    >
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
      
      {/* Legend */}
      {data && data.length > 0 && type !== 'pie' && (
        <div className="mt-4 flex flex-wrap gap-4">
          {data.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: defaultColors[i % defaultColors.length] }}
              ></div>
              <span className="text-sm text-gray-600">{d.label || `Item ${i + 1}`}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Chart;
