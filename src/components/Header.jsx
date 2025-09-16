import { useState } from 'react'
import { AppButton } from '../design-system'
import Drawer from './Drawer'
import ToolsDrawer from './ToolsDrawer'
import UserSelectionDrawer from './UserSelectionDrawer'

export default function Header({ 
  settings, 
  updateSettings, 
  onImport, 
  onExport, 
  onResetData, 
  currentUser, 
  users, 
  onUserSwitch, 
  isLoading, 
  onShowUserManagement 
}) {
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false)
  const [isUserDrawerOpen, setIsUserDrawerOpen] = useState(false)

  return (
    <>
      <div className="flex flex-col gap-4">
        {/* Main Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              📈 Trade Tracker
            </h1>
            <p className="text-sm text-zinc-500 mt-1">Track your trades with a beautiful, interactive dashboard.</p>
          </div>
          
          <div className="flex items-center gap-6">
            {/* Navigation Links */}
            <div className="flex items-center gap-6 text-sm">
              {/* <button
                onClick={onShowUserManagement}
                className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 font-medium"
              >
                Manage User
              </button>
              <span className="text-zinc-300 dark:text-zinc-600">|</span> */}
              <button
                onClick={() => setIsUserDrawerOpen(true)}
                className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 font-medium"
              >
                Switch User
              </button>
              <span className="text-zinc-300 dark:text-zinc-600">|</span>
              <button
                onClick={() => setIsToolsDrawerOpen(true)}
                className="text-zinc-600 dark:text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors duration-200 font-medium"
              >
                Tools
              </button>
              <span className="text-zinc-300 dark:text-zinc-600">|</span> 
            </div>
            
            {/* Current User Info */}
            {currentUser && (
              <div className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
                <span className="flex items-center gap-1">
                  <span>{currentUser.avatar}</span>
                  <span className="font-medium">{currentUser.name}</span>
                </span>
                <span>•</span>
                <span>{currentUser.role}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tools & Settings Drawer */}
      <Drawer
        isOpen={isToolsDrawerOpen}
        onClose={() => setIsToolsDrawerOpen(false)}
        title="Tools & Settings"
        size="lg"
      >
        <ToolsDrawer
          settings={settings}
          updateSettings={updateSettings}
          onImport={onImport}
          onExport={onExport}
          onResetData={onResetData}
          currentUser={currentUser}
        />
      </Drawer>

      {/* User Selection Drawer */}
      <Drawer
        isOpen={isUserDrawerOpen}
        onClose={() => setIsUserDrawerOpen(false)}
        title="Select User"
        size="md"
      >
        <UserSelectionDrawer
          users={users}
          currentUser={currentUser}
          onUserSwitch={onUserSwitch}
          onShowUserManagement={onShowUserManagement}
          isLoading={isLoading}
        />
      </Drawer>
    </>
  )
}
