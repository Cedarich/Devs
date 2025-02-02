import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div style={{
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      zIndex: 999,
      perspective: '1000px'
    }}>
      <motion.div
        style={{
          position: 'relative',
          width: '120px',
          height: '120px'
        }}
        animate={{ 
          rotate: 360,
          scale: [1, 1.2, 1]
        }}
        transition={{ 
          duration: 4,
          repeat: Infinity,
          ease: "linear"
        }}
      >
        {/* Central Orb */}
        <motion.div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            background: 'radial-gradient(circle, #40a9ff, #ff3864)',
            borderRadius: '50%',
            filter: 'blur(20px)'
          }}
          animate={{
            rotateX: [0, 180, 360],
            rotateY: [0, 180, 360],
            scale: [1, 1.4, 1]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Particle Field */}
        {[...Array(24)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: '8px',
              height: '8px',
              background: `hsl(${i * 15}, 100%, 60%)`,
              borderRadius: '50%',
              filter: 'blur(2px)'
            }}
            initial={{
              x: '50%',
              y: '50%'
            }}
            animate={{
              x: [
                '50%', 
                `${50 + Math.sin((i * 15) * Math.PI/180) * 100}%`,
                '50%'
              ],
              y: [
                '50%', 
                `${50 + Math.cos((i * 15) * Math.PI/180) * 100}%`,
                '50%'
              ],
              scale: [0.5, 1.5, 0.5]
            }}
            transition={{
              duration: 2 + i * 0.2,
              repeat: Infinity,
              delay: i * 0.1,
              ease: "easeInOut"
            }}
          />
        ))}

        {/* Hex Grid */}
        <div style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          background: `
            repeating-linear-gradient(
              60deg,
              transparent,
              transparent 15px,
              rgba(90,200,250,0.2) 15px,
              rgba(90,200,250,0.2) 30px
            )
          `,
          clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)'
        }}>
          <motion.div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(45deg, #ff3864, #40a9ff)',
              mixBlendMode: 'screen',
              opacity: 0.3
            }}
            animate={{
              rotate: 360,
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        </div>
      </motion.div>

      {/* Floating Particles */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={`particle-${i}`}
          style={{
            position: 'absolute',
            width: `${Math.random() * 10 + 5}px`,
            height: `${Math.random() * 10 + 5}px`,
            background: `hsl(${Math.random() * 360}, 100%, 60%)`,
            borderRadius: '50%',
            filter: 'blur(3px)'
          }}
          initial={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            scale: 0
          }}
          animate={{
            scale: [0, 1, 0],
            x: `${Math.random() * 200 - 100}%`,
            y: `${Math.random() * 200 - 100}%`
          }}
          transition={{
            duration: Math.random() * 4 + 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeInOut"
          }}
        />
      ))}

      {/* Glow Effect */}
      <style>
        {`
          @keyframes hyper-glow {
            0% { filter: drop-shadow(0 0 10px #40a9ff); }
            33% { filter: drop-shadow(0 0 20px #ff3864); }
            66% { filter: drop-shadow(0 0 15px #ffec3d); }
            100% { filter: drop-shadow(0 0 10px #40a9ff); }
          }
          div:first-child {
            animation: hyper-glow 3s infinite;
          }
        `}
      </style>
    </div>
  );
};

export default Loader;
