import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

export default function Drawer({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  position = 'right',
  size = 'md' 
}) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  const sizeClasses = {
    sm: 'w-80',
    md: 'w-96',
    lg: 'w-[500px]',
    xl: 'w-[600px]'
  }

  const positionClasses = {
    right: 'right-0',
    left: 'left-0'
  }

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ 
              x: position === 'right' ? '100%' : '-100%',
              opacity: 0 
            }}
            animate={{ 
              x: isOpen ? 0 : (position === 'right' ? '100%' : '-100%'),
              opacity: isOpen ? 1 : 0 
            }}
            exit={{ 
              x: position === 'right' ? '100%' : '-100%',
              opacity: 0 
            }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className={`fixed top-0 ${positionClasses[position]} h-full ${sizeClasses[size]} bg-white dark:bg-zinc-900 shadow-2xl z-50 flex flex-col`}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-zinc-200 dark:border-zinc-700">
              <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
