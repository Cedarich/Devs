import React, { useEffect } from 'react';
import { motion } from 'framer-motion';

const NatureBackground = () => {
  useEffect(() => {
    const handleScroll = () => {
      const yPos = window.scrollY * 0.3;
      document.documentElement.style.setProperty('--parallax-offset', `${yPos}px`);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="nature-background">
      {/* Water Stream */}
      <motion.div 
        className="water-stream"
        animate={{
          backgroundPosition: ['0% 50%', '100% 50%'],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "linear"
        }}
      />
      
      {/* Trees Layer 1 (closest) */}
      <div className="trees-layer layer-1">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="tree" style={{ left: `${i * 12}%` }} />
        ))}
      </div>

      {/* Trees Layer 2 (middle distance) */}
      <div className="trees-layer layer-2">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="tree" style={{ left: `${i * 8}%` }} />
        ))}
      </div>

      {/* Trees Layer 3 (far distance) */}
      <div className="trees-layer layer-3">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="tree" style={{ left: `${i * 6}%` }} />
        ))}
      </div>

      {/* Floating leaves */}
      {[...Array(6)].map((_, i) => (
        <motion.div
          key={i}
          className="leaf"
          initial={{ y: -100, x: Math.random() * 100 }}
          animate={{
            y: window.innerHeight + 100,
            x: Math.random() * 100,
            rotate: [0, 360],
          }}
          transition={{
            duration: Math.random() * 10 + 10,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}

      <div className="birds-container" style={{
        position: 'absolute',
        top: '10%',
        left: 0,
        width: '100%',
        height: '80%',
        zIndex: 2,
        pointerEvents: 'none'
      }}>
        {[...Array(15)].map((_, i) => (
          <motion.div
            key={`bird-${i}`}
            className="bird"
            initial={{ 
              x: -200,
              y: Math.random() * window.innerHeight/2,
              opacity: 1
            }}
            animate={{
              x: window.innerWidth + 200,
              y: Math.random() * window.innerHeight/2,
              transition: {
                duration: Math.random() * 8 + 10,
                repeat: Infinity,
                ease: "linear"
              }
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default NatureBackground; 