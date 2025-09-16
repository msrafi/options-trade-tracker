import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AppButton, AppCard, AppInput, AppSelect, Divider } from './design-system'
import { monthKey } from './features/trades/utils.js'
import { useTradeStorage } from './hooks/useTradeStorage'
import { useUserManagement } from './hooks/useUserManagement'
import Header from './components/Header'
import UserManagement from './components/UserManagement'
import CollapsiblePanel from './components/CollapsiblePanel'
import Dashboard from './features/trades/Dashboard'
import TradeForm from './features/trades/TradeForm'
import TradesTable from './features/trades/TradesTable'
import ExitTradeForm from './features/trades/ExitTradeForm'
import EditTradeForm from './features/trades/EditTradeForm'


export default function App() {
  // User management
  const {
    currentUser,
    users,
    isLoading: userLoading,
    switchUser,
    getUserTrades,
    saveUserTrades,
    addUserTrade,
    updateUserTrade,
    deleteUserTrade,
    addUser,
    editUser,
    deleteUser
  } = useUserManagement()

  // Legacy trade storage (for settings only)
  const { 
    settings = { optionMultiplier: 100 }, 
    updateSettings = () => {},
    resetToDefaults = () => {}
  } = useTradeStorage() || {}
  
  const [filterMonth, setFilterMonth] = useState("")
  const [search, setSearch] = useState("")
  const [dashboardFilter, setDashboardFilter] = useState("all")
  const [dateFilter, setDateFilter] = useState(null)
  const [exiting, setExiting] = useState(null)
  const [editing, setEditing] = useState(null)
  const [showUserManagement, setShowUserManagement] = useState(false)

  // Get trades for current user
  const trades = currentUser ? getUserTrades() : []

  const monthOptions = useMemo(() => {
    const months = new Set(trades.flatMap(t => [
      monthKey(t.entryDate),
      t.exitDate ? monthKey(t.exitDate) : null
    ]).filter(Boolean))
    return Array.from(months).sort().reverse()
  }, [trades])

  const filtered = useMemo(() => {
    let filteredTrades = trades.filter(t => {
      const okMonth = filterMonth ? monthKey(t.entryDate) === filterMonth || 
        (t.exitDate && monthKey(t.exitDate) === filterMonth) : true

      const searchTerms = search.toLowerCase().split(' ').filter(Boolean)
      const searchText = `${t.symbol} ${t.strategy} ${t.type} ${t.notes || ''} ${
        t.type === 'option' ? `${t.option?.side} ${t.option?.strike} ${t.option?.expiration}` : ''
      }`.toLowerCase()
      
      return okMonth && searchTerms.every(term => searchText.includes(term))
    })

    // Apply dashboard filter
    switch (dashboardFilter) {
      case 'winning':
        filteredTrades = filteredTrades.filter(t => t.exitDate && t.exitPrice && (t.exitPrice - t.entryPrice) > 0)
        break
      case 'losing':
        filteredTrades = filteredTrades.filter(t => t.exitDate && t.exitPrice && (t.exitPrice - t.entryPrice) <= 0)
        break
      case 'open':
        filteredTrades = filteredTrades.filter(t => !t.exitDate || !t.exitPrice)
        break
      default:
        // 'all' - no additional filtering
        break
    }

    // Apply date filter
    if (dateFilter) {
      const beforeFilter = filteredTrades.length
      
      // Debug: Show sample trade dates before filtering
      console.log('Sample trade dates before filtering:', 
        filteredTrades.slice(0, 10).map(t => ({
          symbol: t.symbol,
          exitDate: t.exitDate,
          parsedDate: t.exitDate ? new Date(t.exitDate).toDateString() : 'No exit date',
          rawExitDate: t.exitDate
        }))
      )
      
      console.log('Filter date being used:', {
        dateFilter: dateFilter,
        dateFilterString: dateFilter.toDateString(),
        dateFilterISO: dateFilter.toISOString()
      })
      
      filteredTrades = filteredTrades.filter(t => {
        if (!t.exitDate) return false
        const tradeDate = new Date(t.exitDate)
        const filterDate = new Date(dateFilter)
        
        // Compare dates by setting time to 00:00:00 to avoid timezone issues
        const tradeDateOnly = new Date(tradeDate.getFullYear(), tradeDate.getMonth(), tradeDate.getDate())
        const filterDateOnly = new Date(filterDate.getFullYear(), filterDate.getMonth(), filterDate.getDate())
        
        const matches = tradeDateOnly.getTime() === filterDateOnly.getTime()
        
        // Debug first few trades to see what's happening
        if (filteredTrades.indexOf(t) < 3) {
          console.log('Trade filtering debug:', {
            symbol: t.symbol,
            exitDate: t.exitDate,
            tradeDate: tradeDate.toDateString(),
            filterDate: filterDate.toDateString(),
            tradeDateOnly: tradeDateOnly.toDateString(),
            filterDateOnly: filterDateOnly.toDateString(),
            tradeTime: tradeDateOnly.getTime(),
            filterTime: filterDateOnly.getTime(),
            matches: matches
          })
        }
        
        return matches
      })
      console.log('App.jsx date filter debug:', {
        dateFilter: dateFilter.toDateString(),
        beforeFilter,
        afterFilter: filteredTrades.length,
        filteredTrades: filteredTrades.map(t => ({ symbol: t.symbol, exitDate: t.exitDate })),
        sampleTradeDates: filteredTrades.slice(0, 3).map(t => ({
          symbol: t.symbol,
          exitDate: t.exitDate,
          parsedDate: new Date(t.exitDate).toDateString()
        }))
      })
    }

    // Debug logging
    console.log('Filtered trades:', {
      totalTrades: trades.length,
      filteredCount: filteredTrades.length,
      searchTerm: search,
      dashboardFilter: dashboardFilter,
      filterMonth: filterMonth
    })

    return filteredTrades
  }, [trades, filterMonth, search, dashboardFilter, dateFilter])

  const handleImport = () => {
    if (!currentUser) {
      alert('Please select a user first.')
      return
    }
    
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = e => {
      const file = e.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = e => {
        try {
          const trades = JSON.parse(e.target.result)
          const asArray = Array.isArray(trades) ? trades : [trades]
          const currentTrades = getUserTrades()
          const newTrades = [...currentTrades, ...asArray]
          saveUserTrades(newTrades)
          alert(`Successfully imported ${asArray.length} trades for ${currentUser.name}`)
        } catch (error) {
          console.error('Error importing trades:', error)
          alert('Failed to import trades. Please check the file format.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleExport = () => {
    if (!currentUser) {
      alert('Please select a user first.')
      return
    }
    
    const data = JSON.stringify(trades, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trades-${currentUser.name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  // Show loading state while users are being initialized
  if (userLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-indigo-950 text-zinc-900 dark:text-zinc-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-zinc-700 dark:text-zinc-300 mb-2">Loading Trading App</h2>
          <p className="text-zinc-500">Initializing user data...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50 dark:from-neutral-900 dark:via-neutral-800 dark:to-primary-900 text-neutral-800 dark:text-neutral-100">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header 
          settings={settings} 
          updateSettings={updateSettings} 
          onImport={handleImport} 
          onExport={handleExport}
          onResetData={() => {
            if (confirm('Are you sure you want to reset all data? This will replace your current trades with sample data.')) {
              resetToDefaults()
            }
          }}
          currentUser={currentUser}
          users={users}
          onUserSwitch={switchUser}
          isLoading={userLoading}
          onShowUserManagement={() => setShowUserManagement(true)}
        />
        <Divider className="my-6" />
        
        <CollapsiblePanel 
          title="New Trade"
          subtitle="Add a new trade to your portfolio"
          icon="➕"
          defaultExpanded={true}
          className="mb-6"
        >
          <TradeForm 
            onSubmit={trade => {
              addUserTrade(trade)
            }}
            onCancel={null}
          />
        </CollapsiblePanel>

        <div className="space-y-6">
          <Dashboard 
            trades={filtered} 
            settings={settings} 
            onSearchChange={setSearch}
            onFilterChange={setDashboardFilter}
            currentUser={currentUser}
            onDateFilterChange={setDateFilter}
          />
          <AppCard>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Manage Trades</h3>
            </div>
            <TradesTable 
              trades={filtered} 
              onExitClick={setExiting}
              onEdit={setEditing}
              onDelete={deleteUserTrade} 
            />
          </AppCard>
        </div>
      </div>

      <AnimatePresence>
        {showUserManagement && (
          <UserManagement
            users={users}
            currentUser={currentUser}
            onUserSwitch={switchUser}
            onAddUser={addUser}
            onEditUser={editUser}
            onDeleteUser={deleteUser}
            onClose={() => setShowUserManagement(false)}
          />
        )}

        {editing && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <AppCard>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">
                    {editing.id ? 'Edit Trade' : 'New Trade'}
                  </h3>
                  <AppButton variant="ghost" onClick={() => setEditing(null)}>
                    Close
                  </AppButton>
                </div>
                {editing.id ? (
                  <EditTradeForm 
                    trade={editing} 
                    onSubmit={trade => {
                      updateUserTrade(trade.id, trade)
                      setEditing(null)
                    }}
                    onCancel={() => setEditing(null)}
                  />
                ) : (
                  <TradeForm 
                    onSubmit={trade => {
                      addUserTrade(trade)
                      setEditing(null)
                    }}
                    onCancel={() => setEditing(null)}
                  />
                )}
              </AppCard>
            </motion.div>
          </motion.div>
        )}

        {exiting && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50"
          >
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }} 
              exit={{ y: 20, opacity: 0 }}
              className="w-full max-w-2xl"
            >
              <AppCard>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Exit Trade</h3>
                  <AppButton variant="ghost" onClick={() => setExiting(null)}>
                    Close
                  </AppButton>
                </div>
                <ExitTradeForm
                  trade={exiting}
                  onExit={exit => {
                    const pnl = exit.price - exiting.entryPrice
                    updateUserTrade(exiting.id, { 
                      exitDate: exit.date, 
                      exitPrice: exit.price, 
                      fees: exit.fees,
                      status: 'closed',
                      pnl: Number(pnl.toFixed(2))
                    })
                    setExiting(null)
                  }}
                  onCancel={() => setExiting(null)}
                />
              </AppCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
