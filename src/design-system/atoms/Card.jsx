
import React from 'react'
export default function AppCard({ className = "", children }) {
  return <div className={`rounded-2xl shadow-lg bg-white/70 dark:bg-zinc-900/70 backdrop-blur p-5 border border-zinc-200 dark:border-zinc-800 ${className}`}>{children}</div>;
}
