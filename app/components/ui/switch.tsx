"use client";

import * as React from "react";
import { motion } from "framer-motion";
import { Sun, Moon, Cloud, Star } from "lucide-react";

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
      className={`relative inline-flex h-6 w-11 items-center rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 overflow-hidden flex-shrink-0 ${className}`}
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={{
        backgroundColor: checked
          ? "#1e1b4b" // Nuit (bleu foncé)
          : "#fbbf24", // Jour (jaune/orange)
      }}
      style={{
        backgroundColor: checked ? "#1e1b4b" : "#fbbf24",
      }}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.3
      }}
    >
      {/* Étoiles (Mode Nuit) - Petites */}
      {checked && (
        <>
          <div className="absolute top-1 left-2 w-0.5 h-0.5 rounded-full bg-yellow-200 z-10" />
          <div className="absolute top-2 left-4 w-0.5 h-0.5 rounded-full bg-yellow-100 z-10" />
          <div className="absolute top-1 left-5 w-0.5 h-0.5 rounded-full bg-yellow-100 z-10" />
        </>
      )}

      {/* Nuages (Mode Jour) - Petits */}
      {!checked && (
        <>
          <div className="absolute top-1 right-3 w-2 h-1.5 bg-white/60 rounded-full z-10" />
          <div className="absolute top-2 right-5 w-1.5 h-1 bg-white/50 rounded-full z-10" />
        </>
      )}

      {/* Soleil/Lune qui se déplace */}
      <motion.span
        className="absolute h-5 w-5 rounded-full flex items-center justify-center shadow-lg z-20"
        style={{
          left: '2px',
          top: '2px',
        }}
        animate={{ 
          x: checked ? 20 : 2,
          backgroundColor: checked ? "#e0e7ff" : "#fef9c3", // Lune claire / Soleil clair
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          mass: 0.5
        }}
      >
        {checked ? (
          <Moon className="w-3 h-3 text-indigo-900" strokeWidth={2} fill="currentColor" />
        ) : (
          <Sun className="w-3 h-3 text-orange-600" strokeWidth={2} fill="currentColor" />
        )}
      </motion.span>
    </motion.button>
  );
}
