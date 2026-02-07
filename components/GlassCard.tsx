
import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  padding?: string;
  interactive?: boolean;
  onClick?: (e: React.MouseEvent) => void;
  style?: React.CSSProperties;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  padding = 'p-6',
  interactive = false,
  onClick,
  style
}) => {
  return (
    <div
      onClick={onClick}
      style={style}

      className={`
        relative overflow-hidden
        bg-white/30
        backdrop-blur-[40px] 
        border border-white/20
        shadow-[0_4px_24px_-1px_rgba(0,0,0,0.05)] 
        rounded-[2.5rem]
        text-slate-800
        transition-all duration-500 ease-out
        ${padding}
        ${interactive ? 'hover:bg-white/45 hover:scale-[1.01] hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] cursor-pointer active:scale-[0.98] active:brightness-95' : ''}
        ${className}
      `}
    >
      {/* Subtle Inner Glow - "Rins" de luz */}
      <div className="absolute inset-0 rounded-[2.5rem] border border-white/30 pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent pointer-events-none" />

      {children}
    </div>
  );
};
