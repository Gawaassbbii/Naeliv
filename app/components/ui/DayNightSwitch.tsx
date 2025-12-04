"use client";

import { motion } from "framer-motion";

interface DayNightSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function DayNightSwitch({ checked, onChange }: DayNightSwitchProps) {
  return (
    <motion.div
      className="relative w-11 h-6 rounded-full cursor-pointer flex items-center px-1 overflow-hidden shadow-sm"
      animate={{
        backgroundColor: checked ? "#4ade80" : "#d1d5db",
      }}
      onClick={() => onChange(!checked)}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.3
      }}
      style={{ backgroundColor: checked ? "#4ade80" : "#d1d5db" }}
    >
      {/* Ondulations liquides en arrière-plan */}
      <motion.div
        className="absolute inset-0"
        style={{
          background: checked 
            ? 'radial-gradient(circle at 30% 50%, rgba(255,255,255,0.2) 0%, transparent 50%)'
            : 'radial-gradient(circle at 70% 50%, rgba(255,255,255,0.15) 0%, transparent 50%)',
        }}
        animate={{
          scale: checked ? [1, 1.2, 1] : [1, 0.8, 1],
          opacity: checked ? [0.3, 0.5, 0.3] : [0.2, 0.3, 0.2],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Petits ronds qui bougent dans la pillule (derrière la boule principale) */}
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full bg-white/40 z-5"
        style={{ left: '8px', top: '50%', transform: 'translateY(-50%)' }}
        animate={{
          x: checked ? [8, 24, 8] : [8, 4, 8],
          opacity: checked ? [0.4, 0.6, 0.4] : [0.3, 0.5, 0.3],
          scale: checked ? [1, 1.2, 1] : [1, 0.8, 1],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute w-1 h-1 rounded-full bg-white/30 z-5"
        style={{ left: '12px', top: '30%' }}
        animate={{
          x: checked ? [12, 28, 12] : [12, 6, 12],
          opacity: checked ? [0.3, 0.5, 0.3] : [0.2, 0.4, 0.2],
          scale: checked ? [1, 1.3, 1] : [1, 0.7, 1],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.2
        }}
      />
      <motion.div
        className="absolute w-1 h-1 rounded-full bg-white/35 z-5"
        style={{ left: '10px', top: '70%' }}
        animate={{
          x: checked ? [10, 26, 10] : [10, 5, 10],
          opacity: checked ? [0.35, 0.55, 0.35] : [0.25, 0.45, 0.25],
          scale: checked ? [1, 1.25, 1] : [1, 0.75, 1],
        }}
        transition={{
          duration: 1.6,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.4
        }}
      />

      {/* Effet de vague liquide (en arrière-plan) */}
      <motion.div
        className="absolute inset-0 rounded-full z-0"
        style={{
          background: checked
            ? 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.08) 50%, transparent 100%)'
            : 'linear-gradient(90deg, transparent 0%, rgba(0,0,0,0.03) 50%, transparent 100%)',
        }}
        animate={{
          x: checked ? ['-100%', '100%'] : ['100%', '-100%'],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Boule principale blanche qui se déplace - TOUJOURS VISIBLE */}
      <motion.span
        className="absolute h-5 w-5 rounded-full bg-white shadow-lg z-20"
        style={{
          left: '2px',
          top: '2px',
        }}
        animate={{ 
          x: checked ? 20 : 2,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          mass: 0.5
        }}
      >
        {/* Reflet subtil sur la boule */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.8) 0%, transparent 60%)',
          }}
          animate={{
            opacity: checked ? [0.7, 0.9, 0.7] : [0.6, 0.8, 0.6],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.span>
    </motion.div>
  );
}