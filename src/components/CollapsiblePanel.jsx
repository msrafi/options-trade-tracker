import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const CollapsiblePanel = ({ 
  title, 
  subtitle, 
  icon, 
  children, 
  defaultExpanded = false,
  className = "",
  headerClassName = "",
  contentClassName = ""
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <div className={`modern-card rounded-2xl ${className}`}>
      {/* Header */}
      <div 
        className={`flex items-center justify-between p-5 cursor-pointer hover:bg-neutral-50/50 dark:hover:bg-neutral-800/30 transition-all duration-300 rounded-t-2xl ${headerClassName}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-4">
          {icon && (
            <div className="p-3 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-2xl shadow-soft">
              <span className="text-white text-xl">{icon}</span>
            </div>
          )}
          <div>
            <h3 className="text-xl font-semibold text-neutral-800 dark:text-neutral-100">{title}</h3>
            {subtitle && (
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">{subtitle}</p>
            )}
          </div>
        </div>
        
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="text-neutral-400 dark:text-neutral-500 hover:text-primary-500 dark:hover:text-primary-400 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </motion.div>
      </div>

      {/* Content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            <div className={`p-5 pt-0 ${contentClassName}`}>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default CollapsiblePanel
