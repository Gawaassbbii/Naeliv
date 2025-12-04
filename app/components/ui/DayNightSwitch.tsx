"use client";

import { Sun, Moon, Cloud, Star } from "lucide-react";
import { motion } from "framer-motion";

interface DayNightSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
}

export default function DayNightSwitch({ checked, onChange }: DayNightSwitchProps) {
  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-8 w-16 items-center rounded-full shadow-md focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 flex-shrink-0 overflow-hidden"
      whileTap={{ scale: 0.95 }}
      animate={{
        background: checked
          ? "linear-gradient(135deg, #1e3a8a 0%, #312e81 50%, #1e1b4b 100%)" // Nuit
          : "linear-gradient(135deg, #fbbf24 0%, #f59e0b 50%, #f97316 100%)", // Jour
      }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.3
      }}
    >
      {/* Étoiles (Mode Nuit) */}
      {checked && (
        <>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
            className="absolute top-1.5 left-4"
          >
            <Star className="w-2 h-2 text-yellow-200 fill-yellow-200" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15, duration: 0.2 }}
            className="absolute top-3 left-6"
          >
            <Star className="w-1.5 h-1.5 text-yellow-100 fill-yellow-100" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.2 }}
            className="absolute top-1 left-8"
          >
            <Star className="w-1 h-1 text-yellow-100 fill-yellow-100" />
          </motion.div>
        </>
      )}

      {/* Nuages (Mode Jour) */}
      {!checked && (
        <>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 0.7, x: 0 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="absolute top-1 right-6"
          >
            <Cloud className="w-3.5 h-3.5 text-white fill-white/60" />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 0.5, x: 0 }}
            transition={{ delay: 0.15, duration: 0.3 }}
            className="absolute top-3 right-10"
          >
            <Cloud className="w-2.5 h-2.5 text-white fill-white/50" />
          </motion.div>
        </>
      )}

      {/* Soleil/Lune qui se déplace */}
      <motion.div
        className="absolute h-7 w-7 rounded-full flex items-center justify-center shadow-lg"
        style={{
          left: '2px',
          top: '50%',
          transform: 'translateY(-50%)',
        }}
        animate={{ 
          x: checked ? 28 : 2, // 64px (w-16) - 28px (w-7) - 2px (left) - 6px (padding) = 28px
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          mass: 0.5
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: checked
              ? "radial-gradient(circle at 30% 30%, #e0e7ff 0%, #c7d2fe 40%, #a5b4fc 100%)" // Lune
              : "radial-gradient(circle at 30% 30%, #fef9c3 0%, #fef08a 40%, #fde047 100%)", // Soleil
          }}
          animate={{
            rotate: checked ? 0 : 360,
          }}
          transition={{
            duration: 0.6,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="relative z-10"
          animate={{
            opacity: checked ? [0.8, 1, 0.8] : [0.9, 1, 0.9],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          {checked ? (
            <Moon className="w-5 h-5 text-indigo-900 drop-shadow-sm" strokeWidth={1.5} />
          ) : (
            <Sun className="w-5 h-5 text-orange-600 drop-shadow-sm" strokeWidth={1.5} />
          )}
        </motion.div>
      </motion.div>
    </motion.button>
  );
}