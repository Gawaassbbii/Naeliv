"use client";

import { Toaster as Sonner, ToasterProps } from "sonner";
import { useTheme } from "@/app/contexts/ThemeContext";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();
  
  // Map our theme to sonner's theme format
  const sonnerTheme = theme === "dark" ? "dark" : "light";

  return (
    <Sonner
      theme={sonnerTheme as ToasterProps["theme"]}
      className="toaster group"
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
        } as React.CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
