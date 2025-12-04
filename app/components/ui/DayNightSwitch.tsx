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
        backgroundColor: checked ? "#22c55e" : "#e5e7eb", // Vert (ON) vs Gris clair (OFF)
      }}
      onClick={() => onChange(!checked)}
      transition={{ 
        type: "spring",
        stiffness: 500,
        damping: 30,
        duration: 0.3
      }}
      style={{ backgroundColor: checked ? "#22c55e" : "#e5e7eb" }}
    >
      {/* Boule blanche qui se déplace */}
      <motion.span
        className="absolute h-5 w-5 rounded-full bg-white shadow-lg"
        style={{
          left: '2px',
          top: '2px',
        }}
        animate={{ 
          x: checked ? 20 : 2, // 20px en ON, 2px en OFF
        }}
        transition={{ 
          type: "spring", 
          stiffness: 500, 
          damping: 30,
          mass: 0.5
        }}
      />
    </motion.div>
  );
}