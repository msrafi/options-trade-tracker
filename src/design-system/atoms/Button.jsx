
import React from 'react'
export default function AppButton({ variant = "primary", size = "md", className = "", children, ...props }) {
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-700 text-white",
    secondary: "bg-zinc-100 hover:bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:hover:bg-zinc-700 dark:text-zinc-100",
    ghost: "bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800 text-indigo-600 dark:text-indigo-400",
    danger: "bg-rose-600 hover:bg-rose-700 text-white",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white",
  };
  const sizes = { sm: "px-3 py-1.5 text-sm", md: "px-4 py-2", lg: "px-5 py-3 text-lg" };
  return (
    <button
      className={`rounded-2xl transition-colors duration-150 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
