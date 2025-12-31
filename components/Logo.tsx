
import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

const Logo: React.FC<LogoProps> = ({ className = "", size = 48 }) => {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* 背景深色圆 */}
      <circle cx="50" cy="50" r="48" fill="#1A1A1A" stroke="#F59E0B" strokeWidth="2"/>
      
      {/* 绿色连接线 (拓扑结构) */}
      <line x1="50" y1="50" x2="50" y2="20" stroke="#22C55E" strokeWidth="4"/>
      <line x1="50" y1="50" x2="80" y2="35" stroke="#22C55E" strokeWidth="4"/>
      <line x1="50" y1="50" x2="80" y2="65" stroke="#22C55E" strokeWidth="4"/>
      <line x1="50" y1="50" x2="50" y2="80" stroke="#22C55E" strokeWidth="4"/>
      <line x1="50" y1="50" x2="20" y2="65" stroke="#22C55E" strokeWidth="4"/>
      <line x1="50" y1="50" x2="20" y2="35" stroke="#22C55E" strokeWidth="4"/>
      <line x1="80" y1="35" x2="50" y2="20" stroke="#22C55E" strokeWidth="4"/>
      
      {/* 外部橙色节点 */}
      <circle cx="50" cy="20" r="6" fill="#F59E0B"/>
      <circle cx="80" cy="35" r="6" fill="#F59E0B"/>
      <circle cx="80" cy="65" r="6" fill="#F59E0B"/>
      <circle cx="50" cy="80" r="6" fill="#F59E0B"/>
      <circle cx="20" cy="65" r="6" fill="#F59E0B"/>
      <circle cx="20" cy="35" r="6" fill="#F59E0B"/>
      
      {/* 中心红色节点 */}
      <circle cx="50" cy="50" r="8" fill="#EF4444"/>
    </svg>
  );
};

export default Logo;
