import { useState } from 'react'
import { AppButton, AppInput, AppSelect } from '../design-system'

export default function ToolsDrawer({ 
  isOpen, 
  onClose, 
  settings, 
  updateSettings, 
  onImport, 
  onExport, 
  onResetData,
  currentUser 
}) {
  const [multiplier, setMultiplier] = useState(settings?.optionMultiplier ?? 100)

  const handleMultiplierChange = (e) => {
    const value = Number(e.target.value || 100)
    setMultiplier(value)
    updateSettings({ optionMultiplier: value })
  }

  return (
    <div className="space-y-6">
      {/* Data Management Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg">
            <span className="text-white text-lg">📊</span>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Data Management</h3>
        </div>
        
        <div className="space-y-3">
          <AppButton 
            variant="secondary" 
            onClick={onImport}
            className="w-full justify-start"
          >
            <span>📥</span>
            Import Trades
          </AppButton>
          <AppButton 
            variant="secondary" 
            onClick={onExport}
            className="w-full justify-start"
          >
            <span>📤</span>
            Export Trades
          </AppButton>
          <AppButton 
            variant="warning" 
            onClick={onResetData}
            className="w-full justify-start"
          >
            <span>🔄</span>
            Reset All Data
          </AppButton>
        </div>
      </div>

      {/* Settings Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
            <span className="text-white text-lg">⚙️</span>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Settings</h3>
        </div>
        
        <div className="space-y-4">
          <AppInput 
            id="multiplier" 
            label="Options Contract Multiplier" 
            type="number" 
            value={multiplier}
            onChange={handleMultiplierChange}
            className="w-full"
          />
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Common values: 100 (US), 10 (some markets). Set to 1 for Profit = Out − In with no scaling.
          </p>
        </div>
      </div>

      {/* User Stats Section */}
      {currentUser && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
              <span className="text-white text-lg">👤</span>
            </div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">Current User</h3>
          </div>
          
          <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{currentUser.avatar}</span>
              <div>
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{currentUser.name}</h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">{currentUser.role}</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-600 dark:text-zinc-400">Total Trades:</span>
                <span className="ml-2 font-medium">{currentUser.totalTrades}</span>
              </div>
              <div>
                <span className="text-zinc-600 dark:text-zinc-400">Total P&L:</span>
                <span className={`ml-2 font-medium ${currentUser.totalPnL >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {currentUser.totalPnL >= 0 ? '+' : ''}${currentUser.totalPnL}
                </span>
              </div>
              <div>
                <span className="text-zinc-600 dark:text-zinc-400">Join Date:</span>
                <span className="ml-2 font-medium">{new Date(currentUser.joinDate).toLocaleDateString()}</span>
              </div>
              <div>
                <span className="text-zinc-600 dark:text-zinc-400">Email:</span>
                <span className="ml-2 font-medium text-xs">{currentUser.email}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* App Info Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
            <span className="text-white text-lg">ℹ️</span>
          </div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">App Information</h3>
        </div>
        
        <div className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">Version:</span>
            <span className="font-medium">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">Users:</span>
            <span className="font-medium">Multi-User Support</span>
          </div>
          <div className="flex justify-between">
            <span className="text-zinc-600 dark:text-zinc-400">Data Storage:</span>
            <span className="font-medium">Local Browser</span>
          </div>
        </div>
      </div>
    </div>
  )
}
