
import React from 'react'
const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-300 uppercase">{children}</label>
);
export default function AppInput({ id, label, hint, prefix, suffix, className = "", ...props }){
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <div className="relative">
        {prefix && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">{prefix}</span>}
        <input id={id} className={`w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${prefix ? "pl-8" : ""} ${suffix ? "pr-10" : ""}`} {...props} />
        {suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">{suffix}</span>}
      </div>
      {hint && <p className="text-xs text-zinc-500">{hint}</p>}
    </div>
  )
}
