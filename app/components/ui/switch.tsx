"use client";

import { motion } from "framer-motion";

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export function Switch({ checked, onChange, disabled = false, className = "" }: SwitchProps) {
  // CORRECTION ICI : Ajout de "as const" pour calmer TypeScript
  const transitionConfig = {
    type: "spring",
    stiffness: 700,
    damping: 30
  } as const;

  return (
    <motion.button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent focus:outline-none focus-visible:ring-2 focus-visible:ring-white/75 ${className}`}
      
      // Animation de la couleur de fond
      animate={{
        backgroundColor: checked ? "#000000" : "#e5e7eb",
      }}
      transition={transitionConfig}
    >
      <span className="sr-only">Use setting</span>
      
      {/* LA BOULE */}
      <motion.span
        className="pointer-events-none inline-block h-6 w-6 rounded-full bg-white shadow-lg ring-0"
        animate={{
            x: checked ? 20 : 0
        }}
        transition={transitionConfig}
      />
    </motion.button>
  );
}