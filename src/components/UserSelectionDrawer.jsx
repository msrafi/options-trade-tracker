import { useState } from 'react'
import { AppButton } from '../design-system'

export default function UserSelectionDrawer({ 
  isOpen, 
  onClose, 
  users, 
  currentUser, 
  onUserSwitch, 
  onShowUserManagement,
  isLoading 
}) {
  const [searchTerm, setSearchTerm] = useState('')

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-zinc-500">Loading users...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Select User</h3>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Choose a user to view their trading data</p>
        </div>
        <AppButton 
          variant="primary" 
          onClick={onShowUserManagement}
          className="flex items-center gap-2"
        >
          <span>👥</span>
          Manage Users
        </AppButton>
      </div>

      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="Search users..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 pl-10 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
        <div className="absolute left-3 top-2.5 text-zinc-400">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Users List */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🔍</div>
            <p className="text-zinc-500">No users found</p>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <div
              key={user.id}
              className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                currentUser?.id === user.id
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800'
                  : 'bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
              onClick={() => {
                onUserSwitch(user)
                onClose()
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{user.avatar}</div>
                  <div>
                    <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{user.name}</h4>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">{user.role}</p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500">{user.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  {currentUser?.id === user.id && (
                    <div className="text-indigo-600 dark:text-indigo-400 text-sm font-medium mb-1">
                      Current
                    </div>
                  )}
                  <div className="text-xs text-zinc-500">
                    {user.totalTrades} trades
                  </div>
                  <div className={`text-xs font-medium ${
                    user.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {user.totalPnL >= 0 ? '+' : ''}${user.totalPnL}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Quick Stats */}
      {users.length > 0 && (
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4">
          <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-3">Quick Stats</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-zinc-600 dark:text-zinc-400">Total Users:</span>
              <span className="ml-2 font-medium">{users.length}</span>
            </div>
            <div>
              <span className="text-zinc-600 dark:text-zinc-400">Total Trades:</span>
              <span className="ml-2 font-medium">
                {users.reduce((sum, user) => sum + user.totalTrades, 0)}
              </span>
            </div>
            <div>
              <span className="text-zinc-600 dark:text-zinc-400">Combined P&L:</span>
              <span className={`ml-2 font-medium ${
                users.reduce((sum, user) => sum + user.totalPnL, 0) >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {users.reduce((sum, user) => sum + user.totalPnL, 0) >= 0 ? '+' : ''}
                ${users.reduce((sum, user) => sum + user.totalPnL, 0).toFixed(2)}
              </span>
            </div>
            <div>
              <span className="text-zinc-600 dark:text-zinc-400">Active User:</span>
              <span className="ml-2 font-medium">{currentUser?.name || 'None'}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
