"use client";

import * as React from "react";
import { motion } from "framer-motion";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onChange, disabled = false, className = "" }: SwitchProps) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full shadow-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden flex-shrink-0 border border-transparent ${className}`}
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={{
        background: checked
          ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #a855f7 100%)" // Purple/Indigo gradient (ON)
          : "linear-gradient(135deg, #1e293b 0%, #334155 50%, #475569 100%)", // Dark slate gradient (OFF)
        boxShadow: checked
          ? "0 0 20px rgba(139, 92, 246, 0.5), inset 0 2px 4px rgba(255,255,255,0.1)"
          : "0 2px 8px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.05)",
      }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.3
      }}
    >
      {/* Effet de glow animé (ON) */}
      {checked && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle at 50% 50%, rgba(139, 92, 246, 0.4) 0%, transparent 70%)",
          }}
          animate={{
            opacity: [0.4, 0.6, 0.4],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}

      {/* Particules lumineuses (ON) */}
      {checked && (
        <>
          <motion.div
            className="absolute top-1 left-2 w-1 h-1 rounded-full bg-cyan-300"
            animate={{
              opacity: [0.3, 1, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0,
            }}
          />
          <motion.div
            className="absolute top-2 left-4 w-0.5 h-0.5 rounded-full bg-purple-200"
            animate={{
              opacity: [0.4, 0.9, 0.4],
              scale: [1, 1.3, 1],
            }}
            transition={{
              duration: 1.8,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3,
            }}
          />
          <motion.div
            className="absolute top-1 left-5 w-0.5 h-0.5 rounded-full bg-indigo-200"
            animate={{
              opacity: [0.3, 0.8, 0.3],
              scale: [1, 1.4, 1],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.6,
            }}
          />
        </>
      )}

      {/* Lignes de lumière (OFF) */}
      {!checked && (
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: "linear-gradient(90deg, transparent 0%, rgba(148, 163, 184, 0.2) 50%, transparent 100%)",
          }}
          animate={{
            x: ['-100%', '100%'],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      )}

      {/* Boule principale avec effet néon */}
      <motion.span
        className="absolute h-5 w-5 rounded-full z-20 flex items-center justify-center"
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
        {/* Cercle intérieur avec gradient */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: checked
              ? "radial-gradient(circle at 30% 30%, #e0e7ff 0%, #c7d2fe 50%, #a5b4fc 100%)" // Purple/Indigo (ON)
              : "radial-gradient(circle at 30% 30%, #f1f5f9 0%, #e2e8f0 50%, #cbd5e1 100%)", // Slate (OFF)
            boxShadow: checked
              ? "0 0 12px rgba(139, 92, 246, 0.8), inset 0 1px 2px rgba(255,255,255,0.3)"
              : "0 2px 4px rgba(0,0,0,0.2), inset 0 1px 2px rgba(255,255,255,0.5)",
          }}
          animate={{
            rotate: checked ? [0, 360] : 0,
          }}
          transition={{
            duration: checked ? 3 : 0,
            repeat: checked ? Infinity : 0,
            ease: "linear",
          }}
        />
        
        {/* Point lumineux central */}
        <motion.div
          className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full"
          style={{
            background: checked
              ? "radial-gradient(circle, rgba(255,255,255,0.9) 0%, rgba(139, 92, 246, 0.5) 100%)"
              : "radial-gradient(circle, rgba(255,255,255,0.8) 0%, rgba(148, 163, 184, 0.3) 100%)",
          }}
          animate={{
            opacity: checked ? [0.8, 1, 0.8] : [0.6, 0.9, 0.6],
            scale: checked ? [1, 1.2, 1] : [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.span>

      {/* Effet de bordure lumineuse (ON) */}
      {checked && (
        <motion.div
          className="absolute inset-0 rounded-full border-2 border-purple-400/50"
          animate={{
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </motion.button>
  );
}
