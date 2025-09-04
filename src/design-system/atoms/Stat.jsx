
import React from 'react'
export default function Stat({ label, value, sub, className = "" }){
  return (
    <div className={`p-4 rounded-2xl bg-gradient-to-b from-white to-zinc-50 dark:from-zinc-900 dark:to-zinc-900/60 border border-zinc-200 dark:border-zinc-800 ${className}`}>
      <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400">{label}</div>
      <div className="text-2xl font-semibold mt-1 dark:text-white">{value}</div>
      {sub && <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">{sub}</div>}
    </div>
  )
}
