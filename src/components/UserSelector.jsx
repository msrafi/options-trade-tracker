import { useState } from 'react'

export default function UserSelector({ currentUser, users, onUserSwitch, isLoading, onShowUserManagement }) {
  const [isOpen, setIsOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-zinc-800/50 rounded-lg">
        <div className="w-6 h-6 bg-zinc-700 rounded-full animate-pulse"></div>
        <div className="w-20 h-4 bg-zinc-700 rounded animate-pulse"></div>
      </div>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-zinc-800/80 to-zinc-700/80 hover:from-zinc-700/80 hover:to-zinc-600/80 rounded-lg border border-zinc-600/50 transition-all duration-200 shadow-lg hover:shadow-xl"
      >
        <div className="text-2xl">{currentUser?.avatar || '👤'}</div>
        <div className="text-left">
          <div className="text-sm font-medium text-white">{currentUser?.name || 'Select User'}</div>
          <div className="text-xs text-zinc-400">{currentUser?.role || 'Trader'}</div>
        </div>
        <div className="text-zinc-400">
          <svg 
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full left-0 mt-2 w-80 bg-zinc-900/95 backdrop-blur-sm border border-zinc-700/50 rounded-lg shadow-2xl z-20 overflow-hidden">
            <div className="p-4 border-b border-zinc-700/50">
              <h3 className="text-lg font-semibold text-white mb-1">Switch User</h3>
              <p className="text-sm text-zinc-400">Select a different user to view their trading data</p>
            </div>
            
            <div className="max-h-80 overflow-y-auto">
              {users.map((user) => (
                <button
                  key={user.id}
                  onClick={() => {
                    onUserSwitch(user)
                    setIsOpen(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/50 transition-colors duration-200 ${
                    currentUser?.id === user.id ? 'bg-zinc-800/30 border-l-2 border-blue-500' : ''
                  }`}
                >
                  <div className="text-2xl">{user.avatar}</div>
                  <div className="flex-1 text-left">
                    <div className="text-sm font-medium text-white">{user.name}</div>
                    <div className="text-xs text-zinc-400">{user.role}</div>
                    <div className="text-xs text-zinc-500 mt-1">
                      {user.totalTrades} trades • {user.totalPnL >= 0 ? '+' : ''}${user.totalPnL}
                    </div>
                  </div>
                  {currentUser?.id === user.id && (
                    <div className="text-blue-500">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
            
            <div className="p-4 border-t border-zinc-700/50 bg-zinc-800/30">
              <div className="flex items-center justify-between">
                <div className="text-xs text-zinc-500">
                  Each user has their own trading data and settings
                </div>
                {onShowUserManagement && (
                  <button
                    onClick={() => {
                      onShowUserManagement()
                      setIsOpen(false)
                    }}
                    className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Manage Users
                  </button>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
