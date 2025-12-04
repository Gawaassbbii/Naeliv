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
      className={`relative inline-flex h-6 w-11 items-center rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={{
        backgroundColor: checked ? '#000000' : '#e5e7eb', // noir : gray-200 (gris plus clair)
      }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      style={{ backgroundColor: checked ? '#000000' : '#e5e7eb' }}
    >
      <motion.span
        className="absolute h-5 w-5 rounded-full bg-white shadow-md"
        style={{
          left: '2px',
          top: '2px',
        }}
        animate={{ 
          x: checked ? 20 : 2, // 20px en ON, 2px en OFF
        }}
        transition={{ 
          type: "spring", 
          stiffness: 400, 
          damping: 25,
          mass: 0.6
        }}
      />
    </motion.button>
  );
}
