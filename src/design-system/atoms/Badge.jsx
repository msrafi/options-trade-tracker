
import React from 'react'
export default function Badge({ children }){
  return <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">{children}</span>
}
