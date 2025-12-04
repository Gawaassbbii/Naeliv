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
      className={`relative inline-flex h-6 w-11 items-center rounded-full focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
      whileTap={disabled ? {} : { scale: 0.95 }}
      animate={{
        backgroundColor: checked ? '#9333ea' : '#e2e8f0', // purple-600 : slate-200
      }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      style={{ backgroundColor: checked ? '#9333ea' : '#e2e8f0' }}
    >
      <motion.span
        className="absolute h-5 w-5 rounded-full bg-white shadow-sm"
        style={{
          left: '2px',
          top: '2px',
          border: '1px solid',
          borderColor: checked ? '#9333ea' : '#cbd5e1',
        }}
        animate={{ 
          x: checked ? 20 : 2, // translate-x-5 (20px) en ON, translate-x-0.5 (2px) en OFF
          borderColor: checked ? '#9333ea' : '#cbd5e1',
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          mass: 0.5
        }}
      />
    </motion.button>
  );
}
