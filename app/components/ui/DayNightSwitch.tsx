"use client";

import { motion } from "framer-motion";
import { cn } from "./utils";

interface DayNightSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function DayNightSwitch({ checked, onChange }: DayNightSwitchProps) {
  return (
    <motion.div
      className={cn(
        "relative w-11 h-6 rounded-full cursor-pointer flex items-center px-1 overflow-hidden",
        "ring-1 ring-black/5 dark:ring-white/10",
        "transition-all duration-300 ease-out",
        checked 
          ? "shadow-[0_2px_8px_rgba(34,197,94,0.3),inset_0_1px_0_rgba(255,255,255,0.2)]" 
          : "shadow-[0_2px_4px_rgba(0,0,0,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]"
      )}
      animate={{
        background: checked
          ? "linear-gradient(135deg, #22c55e 0%, #16a34a 50%, #15803d 100%)"
          : "linear-gradient(135deg, #e5e7eb 0%, #d1d5db 50%, #9ca3af 100%)",
      }}
      onClick={() => onChange(!checked)}
      whileTap={{ scale: 0.97 }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.3
      }}
    >
      {/* Gradient overlay pour effet de profondeur */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: checked
            ? "radial-gradient(circle at 30% 30%, rgba(255,255,255,0.25) 0%, transparent 70%)"
            : "radial-gradient(circle at 70% 30%, rgba(255,255,255,0.2) 0%, transparent 70%)",
        }}
        animate={{
          scale: checked ? [1, 1.3, 1] : [1, 0.9, 1],
          opacity: checked ? [0.4, 0.6, 0.4] : [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />

      {/* Bulles liquides animées avec blur */}
      <motion.div
        className="absolute w-2 h-2 rounded-full bg-white/50 backdrop-blur-sm"
        style={{ left: '8px', top: '50%', transform: 'translateY(-50%)' }}
        animate={{
          x: checked ? [8, 24, 8] : [8, 4, 8],
          y: checked ? ['-50%', '-60%', '-50%'] : ['-50%', '-40%', '-50%'],
          opacity: checked ? [0.5, 0.7, 0.5] : [0.3, 0.5, 0.3],
          scale: checked ? [1, 1.3, 1] : [1, 0.8, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full bg-white/40 backdrop-blur-sm"
        style={{ left: '12px', top: '30%' }}
        animate={{
          x: checked ? [12, 28, 12] : [12, 6, 12],
          opacity: checked ? [0.4, 0.6, 0.4] : [0.25, 0.45, 0.25],
          scale: checked ? [1, 1.4, 1] : [1, 0.7, 1],
        }}
        transition={{
          duration: 2.2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.3
        }}
      />
      <motion.div
        className="absolute w-1.5 h-1.5 rounded-full bg-white/45 backdrop-blur-sm"
        style={{ left: '10px', top: '70%' }}
        animate={{
          x: checked ? [10, 26, 10] : [10, 5, 10],
          opacity: checked ? [0.45, 0.65, 0.45] : [0.3, 0.5, 0.3],
          scale: checked ? [1, 1.35, 1] : [1, 0.75, 1],
        }}
        transition={{
          duration: 1.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 0.6
        }}
      />

      {/* Vague liquide avec effet de brillance */}
      <motion.div
        className="absolute inset-0 rounded-full z-0"
        style={{
          background: checked
            ? "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.15) 30%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.15) 70%, transparent 100%)"
            : "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.1) 30%, rgba(255,255,255,0.15) 50%, rgba(255,255,255,0.1) 70%, transparent 100%)",
        }}
        animate={{
          x: checked ? ['-100%', '100%'] : ['100%', '-100%'],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "linear"
        }}
      />

      {/* Boule principale avec effets premium */}
      <motion.span
        className={cn(
          "absolute h-5 w-5 rounded-full z-20",
          "bg-gradient-to-br from-white via-white to-gray-50",
          "shadow-[0_2px_8px_rgba(0,0,0,0.15),0_0_0_1px_rgba(0,0,0,0.05),inset_0_1px_0_rgba(255,255,255,0.9)]",
          "backdrop-blur-sm"
        )}
        style={{
          left: '2px',
          top: '2px',
        }}
        animate={{ 
          x: checked ? 20 : 2,
        }}
        transition={{ 
          type: "spring", 
          stiffness: 600, 
          damping: 35,
          mass: 0.4
        }}
      >
        {/* Reflet premium avec gradient */}
        <motion.div
          className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
          style={{
            background: "radial-gradient(circle at 35% 35%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 30%, transparent 70%)",
          }}
          animate={{
            opacity: checked ? [0.8, 1, 0.8] : [0.7, 0.9, 0.7],
            scale: checked ? [1, 1.05, 1] : [1, 0.95, 1],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        
        {/* Point lumineux */}
        <motion.div
          className="absolute top-1 left-1 w-1.5 h-1.5 rounded-full bg-white/90 blur-[1px]"
          animate={{
            opacity: checked ? [0.9, 1, 0.9] : [0.7, 0.9, 0.7],
            scale: checked ? [1, 1.2, 1] : [1, 0.9, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.span>

      {/* Effet de glow autour du toggle quand activé */}
      {checked && (
        <motion.div
          className="absolute -inset-1 rounded-full bg-green-400/20 blur-md -z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      )}
    </motion.div>
  );
}