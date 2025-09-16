
import React, { useState, useEffect } from 'react'

export default function Stat({ label, value, sub, className = "", trend = null, icon = null }){
  const [animatedValue, setAnimatedValue] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    // Animate numeric values
    if (typeof value === 'string' && value.includes('$')) {
      const numericValue = parseFloat(value.replace(/[$,]/g, ''))
      if (!isNaN(numericValue)) {
        const duration = 1000
        const steps = 60
        const increment = numericValue / steps
        let current = 0
        
        const timer = setInterval(() => {
          current += increment
          if (current >= numericValue) {
            setAnimatedValue(numericValue)
            clearInterval(timer)
          } else {
            setAnimatedValue(current)
          }
        }, duration / steps)
        
        return () => clearInterval(timer)
      }
    }
  }, [value])

  const getTrendIcon = () => {
    if (!trend) return null
    if (trend > 0) return <span className="text-emerald-500">↗️</span>
    if (trend < 0) return <span className="text-rose-500">↘️</span>
    return <span className="text-zinc-500">→</span>
  }

  const displayValue = typeof value === 'string' && value.includes('$') && !isNaN(parseFloat(value.replace(/[$,]/g, '')))
    ? `$${animatedValue.toFixed(2)}`
    : value

  return (
    <div className={`p-6 rounded-2xl bg-gradient-to-br from-white via-white to-zinc-50 dark:from-zinc-900 dark:via-zinc-800 dark:to-zinc-900/80 border border-zinc-200 dark:border-zinc-700 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="text-xs uppercase tracking-wide text-zinc-500 dark:text-zinc-400 font-medium">{label}</div>
        <div className="flex items-center gap-1">
          {icon && <span className="text-lg">{icon}</span>}
          {getTrendIcon()}
        </div>
      </div>
      <div className="text-3xl font-bold mt-1 dark:text-white bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-white dark:to-zinc-300 bg-clip-text text-transparent">
        {displayValue}
      </div>
      {sub && <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 opacity-80">{sub}</div>}
    </div>
  )
}
