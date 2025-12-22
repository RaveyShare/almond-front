import React from 'react';
import { motion } from 'framer-motion';

interface GeometricBackgroundProps {
  className?: string;
  animated?: boolean;
}

export const GeometricBackground: React.FC<GeometricBackgroundProps> = ({ 
  className = '', 
  animated = true 
}) => {
  return (
    <div className={`fixed inset-0 z-0 ${className}`}>
      {/* 主要几何形状 */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-gradient-to-br from-cyan-400/30 to-violet-500/30 blur-3xl"
        animate={animated ? {
          x: [0, 30, 0],
          y: [0, -20, 0],
          scale: [1, 1.1, 1],
        } : {}}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      <motion.div
        className="absolute top-1/2 right-1/4 w-80 h-80 rounded-full bg-gradient-to-br from-violet-500/25 to-green-500/25 blur-3xl"
        animate={animated ? {
          x: [0, -25, 0],
          y: [0, 15, 0],
          scale: [1, 1.15, 1],
        } : {}}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      <motion.div
        className="absolute bottom-1/4 left-1/3 w-72 h-72 rounded-full bg-gradient-to-br from-green-500/20 to-cyan-400/20 blur-3xl"
        animate={animated ? {
          x: [0, 20, 0],
          y: [0, -30, 0],
          scale: [1, 1.2, 1],
        } : {}}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2
        }}
      />

      {/* 小装饰形状 */}
      <motion.div
        className="absolute top-1/6 right-1/6 w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400/15 to-transparent blur-2xl"
        animate={animated ? {
          rotate: [0, 360],
          scale: [0.8, 1.2, 0.8],
        } : {}}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      <motion.div
        className="absolute bottom-1/5 right-1/5 w-40 h-40 rounded-full bg-gradient-to-br from-violet-500/15 to-transparent blur-2xl"
        animate={animated ? {
          rotate: [360, 0],
          scale: [1.2, 0.8, 1.2],
        } : {}}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "linear",
          delay: 3
        }}
      />

      {/* 网格背景 */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30" />
      
      {/* 渐变覆盖层 */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/40" />
    </div>
  );
};

export default GeometricBackground;