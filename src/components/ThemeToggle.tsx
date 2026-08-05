"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDark(document.documentElement.getAttribute("data-theme") === "dark");
  }, []);

  function toggle() {
    const next = !dark;
    setDark(next);
    document.documentElement.setAttribute("data-theme", next ? "dark" : "light");
    localStorage.setItem("memvault-theme", next ? "dark" : "light");
  }

  if (!mounted) return <div className="icon-badge w-9 h-9" />;

  return (
    <button onClick={toggle} aria-label="Toggle dark mode" className="icon-badge overflow-hidden">
      <AnimatePresence mode="wait" initial={false}>
        {dark ? (
          <motion.svg
            key="sun"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
            <path d="M12 2v2M12 20v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2 12h2M20 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </motion.svg>
        ) : (
          <motion.svg
            key="moon"
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.25 }}
          >
            <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
          </motion.svg>
        )}
      </AnimatePresence>
    </button>
  );
}
