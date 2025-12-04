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
        backgroundColor: checked ? "#4ade80" : "#d1d5db", // Vert doux (ON) vs Gris moyen (OFF)
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
      {/* Boule avec couleur nuancée */}
      <motion.span
        className="absolute h-5 w-5 rounded-full shadow-md"
        style={{
          left: '2px',
          top: '2px',
          backgroundColor: '#f9fafb', // Gris très clair au lieu de blanc pur
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