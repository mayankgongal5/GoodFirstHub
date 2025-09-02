import React from 'react';
import { motion } from 'framer-motion';

const FloatingShapes = () => {
  const shapes = [
    { size: 'w-64 h-64', position: 'top-20 left-10', delay: 0, gradient: 'from-[#f02e65]/10 to-[#ff6b9d]/10' },
    { size: 'w-48 h-48', position: 'top-40 right-20', delay: 2, gradient: 'from-[#2de0c0]/10 to-[#00d4aa]/10' },
    { size: 'w-32 h-32', position: 'bottom-40 left-1/4', delay: 1, gradient: 'from-[#ff6b9d]/10 to-[#f02e65]/10' },
    { size: 'w-56 h-56', position: 'bottom-20 right-10', delay: 3, gradient: 'from-[#2de0c0]/10 to-[#f02e65]/10' },
    { size: 'w-40 h-40', position: 'top-1/2 left-1/2', delay: 1.5, gradient: 'from-[#f02e65]/10 to-[#2de0c0]/10' },
  ];

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className={`absolute ${shape.size} ${shape.position} rounded-full bg-gradient-to-r ${shape.gradient}`}
          style={{
            filter: 'blur(40px)',
          }}
          animate={{
            x: [0, 30, -30, 0],
            y: [0, -30, 30, 0],
            scale: [1, 1.1, 0.9, 1],
          }}
          transition={{
            duration: 8,
            delay: shape.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

export default FloatingShapes;
