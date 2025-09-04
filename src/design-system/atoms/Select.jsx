
import React from 'react'
const Label = ({ children, htmlFor }) => (
  <label htmlFor={htmlFor} className="text-xs font-semibold tracking-wide text-zinc-600 dark:text-zinc-300 uppercase">{children}</label>
);
export default function AppSelect({ id, label, options = [], className = "", ...props }){
  return (
    <div className={`flex flex-col gap-1 ${className}`}>
      {label && <Label htmlFor={id}>{label}</Label>}
      <select id={id} className="w-full rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" {...props}>
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  )
}
