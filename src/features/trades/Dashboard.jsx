import React, { useMemo, useState, useEffect } from 'react'
import { AppCard, Stat } from '../../design-system'
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell, ComposedChart, Line, ReferenceLine } from 'recharts'
import { fmt, fmtPct, monthKey } from './utils'
import { useTradeStorage } from '../../hooks/useTradeStorage'
import YearlyActivityChart from '../../components/YearlyActivityChart'
import CollapsiblePanel from '../../components/CollapsiblePanel'

const formatPeriodLabel = (date, period) => {
  if (period === 'all') return 'All Time'
  const options = { 
    daily: { day: 'numeric', month: 'short' },
    weekly: { day: 'numeric', month: 'short' },
    monthly: { month: 'long', year: 'numeric' }
  }
  return new Intl.DateTimeFormat('en-US', options[period]).format(date)
}

export default function Dashboard({ trades, settings, onSearchChange, onFilterChange, currentUser, onDateFilterChange }){
  const [period, setPeriod] = useState('all')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [searchTerm, setSearchTerm] = useState('')
  const [activeFilter, setActiveFilter] = useState('all')
  const [drillDownHistory, setDrillDownHistory] = useState([])
  const [selectedDateFilter, setSelectedDateFilter] = useState(null)

  // Notify parent component when date filter changes
  useEffect(() => {
    if (onDateFilterChange) {
      onDateFilterChange(selectedDateFilter)
    }
  }, [selectedDateFilter, onDateFilterChange])

  // Function to navigate periods
  const navigatePeriod = (direction) => {
    const newDate = new Date(currentDate)
    switch(period) {
      case 'daily':
        newDate.setDate(newDate.getDate() + direction)
        break
      case 'weekly':
        newDate.setDate(newDate.getDate() + (direction * 7))
        break
      case 'monthly':
        newDate.setMonth(newDate.getMonth() + direction)
        break
    }
    setCurrentDate(newDate)
  }

  // Drill-down functionality
  const handleDrillDown = (data, index) => {
    if (!data || !data.date) return
    
    const clickedDate = new Date(data.date)
    
    // Save current state to history
    setDrillDownHistory(prev => [...prev, {
      period,
      currentDate: new Date(currentDate),
      data: data
    }])
    
    // Determine next drill-down level
    let nextPeriod, nextDate
    
    switch(period) {
      case 'all':
        // From all time view, drill down to monthly view of that specific month
        nextPeriod = 'monthly'
        // The data.date from "All" view is in format "2025-08", so we need to parse it properly
        const [year, month] = data.date.split('-')
        nextDate = new Date(parseInt(year), parseInt(month) - 1, 1)
        break
      case 'monthly':
        // From monthly view, drill down to weekly view of that specific week
        nextPeriod = 'weekly'
        // The clickedDate is already the Monday of the clicked week, so use it directly
        nextDate = new Date(clickedDate)
        break
      case 'weekly':
        // From weekly view, drill down to daily view of that specific week
        nextPeriod = 'daily'
        // The clickedDate is already the start of the week (Monday), so use it directly
        nextDate = new Date(clickedDate)
        break
      default:
        return // No further drill-down from daily
    }
    
    setPeriod(nextPeriod)
    setCurrentDate(nextDate)
  }

  // Go back to previous drill-down level
  const handleDrillUp = () => {
    if (drillDownHistory.length === 0) return
    
    const previousState = drillDownHistory[drillDownHistory.length - 1]
    setDrillDownHistory(prev => prev.slice(0, -1))
    setPeriod(previousState.period)
    setCurrentDate(previousState.currentDate)
  }

  // Handle search and filter changes
  const handleSearchChange = (value) => {
    setSearchTerm(value)
    if (onSearchChange) {
      onSearchChange(value)
    }
  }

  const handleFilterChange = (filter) => {
    setActiveFilter(filter)
    if (onFilterChange) {
      onFilterChange(filter)
    }
  }

  const aggregates = useMemo(() => {
    const closed = trades.filter(t => t.exitDate && t.exitPrice)
    const open = trades.filter(t => !t.exitDate || !t.exitPrice)
    const m = settings.optionMultiplier

    // Debug logging
    console.log('Dashboard aggregates debug:', {
      totalTrades: trades.length,
      closedTrades: closed.length,
      selectedDateFilter: selectedDateFilter?.toDateString(),
      closedTradeDates: closed.map(t => ({ symbol: t.symbol, exitDate: t.exitDate }))
    })

    // Function to group trades by date period
    const groupTradesByPeriod = (trades, periodType) => {
      const groups = {}
      trades.forEach(trade => {
        if (!trade.exitDate) return
        const date = new Date(trade.exitDate)
        let key
        
        switch(periodType) {
          case 'daily':
            key = new Date(date.getFullYear(), date.getMonth(), date.getDate())
              .toISOString().split('T')[0]
            break
          case 'weekly':
            // Get monday of the week
            const day = date.getDay()
            const diff = date.getDate() - day + (day === 0 ? -6 : 1)
            const weekStart = new Date(date)
            weekStart.setDate(diff)
            key = weekStart.toISOString().split('T')[0]
            break
          case 'monthly':
            key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-01`
            break
          default:
            key = new Date(date.getFullYear(), date.getMonth(), 1)
              .toISOString().split('T')[0]
        }

        if (!groups[key]) {
          groups[key] = { pnl: 0, trades: 0 }
        }
        groups[key].pnl += (trade.exitPrice - trade.entryPrice)
        groups[key].trades++
      })
      return groups
    }

    // Special handling for single-day filtering
    const isSingleDayFilter = selectedDateFilter && closed.length > 0
    
    // Debug logging
    if (selectedDateFilter) {
      console.log('Single-day filter debug:', {
        selectedDateFilter: selectedDateFilter.toDateString(),
        closedTrades: closed.length,
        isSingleDayFilter,
        trades: closed.map(t => ({ symbol: t.symbol, exitDate: t.exitDate, pnl: t.exitPrice - t.entryPrice }))
      })
    }

    // Calculate P&L without contract multiplier
    const calculatePnL = (trade) => {
      return trade.exitPrice - trade.entryPrice
    }

    // Overall P&L stats
    const totalPnL = closed.reduce((acc, t) => acc + calculatePnL(t), 0)
    const invested = trades.reduce((acc, t) => acc + t.entryPrice, 0)
    const roi = invested > 0 ? totalPnL / invested : 0
    const winningTrades = closed.filter(t => calculatePnL(t) > 0)
    const winRate = closed.length ? winningTrades.length / closed.length : 0
    
    // Average trade metrics
    const avgWinAmount = winningTrades.length ? 
      winningTrades.reduce((acc, t) => acc + calculatePnL(t), 0) / winningTrades.length : 0
    const losingTrades = closed.filter(t => calculatePnL(t) <= 0)
    const avgLossAmount = losingTrades.length ? 
      losingTrades.reduce((acc, t) => acc + calculatePnL(t), 0) / losingTrades.length : 0

    // Monthly P&L calculation without contract multiplier
    const byMonth = {}
    for (const t of closed) {
      const key = monthKey(t.exitDate)
      const value = calculatePnL(t)
      byMonth[key] = (byMonth[key] || 0) + value
    }
    
    // Create monthly series with running total
    let runningTotal = 0
    // Calculate period data
    let periodData = []
    
    if (isSingleDayFilter) {
      // For single-day filtering, show individual trades as separate bars
      let cumulative = 0
      periodData = closed.map((trade, index) => {
        const tradePnL = calculatePnL(trade)
        cumulative += tradePnL
        return {
          date: trade.exitDate,
          pnl: Number(tradePnL.toFixed(2)),
          trades: 1,
          cumulative: Number(cumulative.toFixed(2)),
          tradeSymbol: trade.symbol,
          tradeIndex: index + 1
        }
      })
      console.log('Single-day period data:', periodData)
    } else if (period === 'all') {
      // For all time view, show monthly data
      const monthlyGroups = {}
      for (const t of closed) {
        const key = monthKey(t.exitDate)
        const value = calculatePnL(t)
        monthlyGroups[key] = (monthlyGroups[key] || 0) + value
      }
      
      let cumulative = 0
      periodData = Object.entries(monthlyGroups)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([date, pnl]) => {
          cumulative += pnl
          return {
            date,
            pnl: Number(pnl.toFixed(2)),
            trades: closed.filter(t => monthKey(t.exitDate) === date).length,
            cumulative: Number(cumulative.toFixed(2))
          }
        })
    } else if (period === 'weekly') {
      // For weekly view, show 7 days of the current week
      const weekStart = new Date(currentDate)
      weekStart.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1))
      
      let cumulative = 0
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(weekStart)
        dayDate.setDate(weekStart.getDate() + i)
        
        const dayTrades = closed.filter(trade => {
          if (!trade.exitDate) return false
          const tradeDate = new Date(trade.exitDate)
          return tradeDate.toDateString() === dayDate.toDateString()
        })
        
        const dayPnL = dayTrades.reduce((sum, trade) => sum + (trade.exitPrice - trade.entryPrice), 0)
        
        // Only include days that have actual trades
        if (dayTrades.length > 0) {
          cumulative += dayPnL
          periodData.push({
            date: dayDate.toISOString().split('T')[0],
            pnl: Number(dayPnL.toFixed(2)),
            trades: dayTrades.length,
            cumulative: Number(cumulative.toFixed(2))
          })
        }
      }
    } else if (period === 'monthly') {
      // For monthly view, show weeks of the current month
      const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
      
      let cumulative = 0
      let weekNumber = 1
      let currentWeekStart = new Date(monthStart)
      
      // Find the first Monday of the month
      const firstDayOfWeek = monthStart.getDay()
      if (firstDayOfWeek !== 1) {
        const daysToMonday = firstDayOfWeek === 0 ? 1 : 8 - firstDayOfWeek
        currentWeekStart.setDate(monthStart.getDate() + daysToMonday)
      }
      
      // Generate weeks for the month
      while (weekNumber <= 5 && currentWeekStart <= monthEnd) {
        const weekEnd = new Date(currentWeekStart)
        weekEnd.setDate(currentWeekStart.getDate() + 6)
        
        const weekTrades = closed.filter(trade => {
          if (!trade.exitDate) return false
          const tradeDate = new Date(trade.exitDate)
          return tradeDate >= currentWeekStart && tradeDate <= weekEnd
        })
        
        const weekPnL = weekTrades.reduce((sum, trade) => sum + (trade.exitPrice - trade.entryPrice), 0)
        
        // Only include weeks that have actual trades
        if (weekTrades.length > 0) {
          cumulative += weekPnL
          periodData.push({
            date: currentWeekStart.toISOString().split('T')[0],
            pnl: Number(weekPnL.toFixed(2)),
            trades: weekTrades.length,
            cumulative: Number(cumulative.toFixed(2)),
            weekNumber: weekNumber
          })
        }
        
        currentWeekStart.setDate(currentWeekStart.getDate() + 7)
        weekNumber++
      }
    } else {
      // For daily view, show the specific week that was drilled down to
      const dayStart = new Date(currentDate)
      
      let cumulative = 0
      for (let i = 0; i < 7; i++) {
        const dayDate = new Date(dayStart)
        dayDate.setDate(dayStart.getDate() + i)
        
        const dayTrades = closed.filter(trade => {
          if (!trade.exitDate) return false
          const tradeDate = new Date(trade.exitDate)
          return tradeDate.toDateString() === dayDate.toDateString()
        })
        
        const dayPnL = dayTrades.reduce((sum, trade) => sum + (trade.exitPrice - trade.entryPrice), 0)
        
        // Only include days that have actual trades
        if (dayTrades.length > 0) {
          cumulative += dayPnL
          periodData.push({
            date: dayDate.toISOString().split('T')[0],
            pnl: Number(dayPnL.toFixed(2)),
            trades: dayTrades.length,
            cumulative: Number(cumulative.toFixed(2))
          })
        }
      }
    }

    // Strategy breakdown
    const byStrategy = {}
    for (const t of closed) {
      const key = t.strategy || 'Unknown'
      const value = calculatePnL(t)
      byStrategy[key] = (byStrategy[key] || 0) + value
    }
    const stratSeries = Object.entries(byStrategy)
      .map(([name, value]) => ({ 
        name, 
        value: Math.abs(Number(value.toFixed(2)))
      }))

    // Final debug logging
    console.log('Final aggregates result:', {
      periodDataLength: periodData.length,
      periodData: periodData,
      isSingleDayFilter,
      selectedDateFilter: selectedDateFilter?.toDateString()
    })

    return { 
      closed, 
      open, 
      totalPnL, 
      invested, 
      roi, 
      winRate, 
      periodData, 
      stratSeries,
      winningTrades,
      avgWinAmount,
      avgLossAmount
    }
  }, [trades, settings, period, currentDate, selectedDateFilter])

  return (
    <div className="space-y-4">
      {currentUser && (
        <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl border border-primary-200 dark:border-primary-800 shadow-soft">
          <div className="text-3xl">{currentUser.avatar}</div>
          <div>
            <h3 className="font-semibold text-primary-900 dark:text-primary-100 text-lg">{currentUser.name}</h3>
            <p className="text-sm text-primary-700 dark:text-primary-300">{currentUser.role} • {trades.length} trades</p>
          </div>
        </div>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-6">
        <Stat 
          label="Total P&L" 
          value={fmt.format(aggregates.totalPnL)} 
          sub={`${aggregates.closed.length} closed / ${aggregates.open.length} open`}
          icon="💰"
          trend={aggregates.totalPnL >= 0 ? 1 : -1}
          className={aggregates.totalPnL >= 0 
            ? "!from-accent-50 !via-accent-100 !to-accent-200 dark:!from-accent-900/30 dark:!via-accent-800/20 dark:!to-accent-700/10 border-accent-200 dark:border-accent-800" 
            : "!from-red-50 !via-red-100 !to-red-200 dark:!from-red-900/30 dark:!via-red-800/20 dark:!to-red-700/10 border-red-200 dark:border-red-800"
          }
        />
        <Stat 
          label="Win Rate" 
          value={fmtPct(aggregates.winRate)} 
          sub={aggregates.winningTrades.length > 0 ? `Avg Win: ${fmt.format(aggregates.avgWinAmount)}` : 'No winning trades yet'}
          icon="🎯"
          trend={aggregates.winRate >= 0.5 ? 1 : -1}
          className="!from-primary-50 !via-primary-100 !to-primary-200 dark:!from-primary-900/30 dark:!via-primary-800/20 dark:!to-primary-700/10 border-primary-200 dark:border-primary-800"
        />
        <Stat 
          label="Avg Loss" 
          value={fmt.format(Math.abs(aggregates.avgLossAmount))} 
          sub={`ROI: ${fmtPct(aggregates.roi)}`}
          icon="📉"
          trend={aggregates.avgLossAmount >= 0 ? -1 : 1}
          className="!from-orange-50 !via-orange-100 !to-orange-200 dark:!from-orange-900/30 dark:!via-orange-800/20 dark:!to-orange-700/10 border-orange-200 dark:border-orange-800"
        />
        <Stat 
          label="Total Invested" 
          value={fmt.format(aggregates.invested)} 
          sub={`${aggregates.open.length} open positions`}
          icon="💼"
          className="!from-secondary-50 !via-secondary-100 !to-secondary-200 dark:!from-secondary-900/30 dark:!via-secondary-800/20 dark:!to-secondary-700/10 border-secondary-200 dark:border-secondary-800"
        />
      </div>

      {/* Filter Search Section - Enhanced Design */}
      <CollapsiblePanel 
        title="Filter & Search"
        subtitle="Find and filter your trades"
        icon="🔍"
        defaultExpanded={false}
        className="xl:col-span-12"
        headerClassName="!from-slate-50 !via-white !to-slate-50 dark:!from-slate-900/50 dark:!via-slate-800/30 dark:!to-slate-900/50 border-slate-200 dark:border-slate-700"
      >
        <div className="flex items-center justify-end mb-5">
          <button 
            onClick={() => {
              setSearchTerm('')
              setActiveFilter('all')
              if (onSearchChange) onSearchChange('')
              if (onFilterChange) onFilterChange('all')
            }}
            className="px-5 py-2.5 text-sm font-medium text-neutral-600 dark:text-neutral-300 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 dark:hover:bg-neutral-600 rounded-xl transition-all duration-300 shadow-soft hover:shadow-medium"
          >
            Clear All
          </button>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
          {/* Search Input */}
          <div className="lg:col-span-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Search Trades</label>
            <div className="relative">
              <input 
                type="text" 
                placeholder="Symbol, strategy..."
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 text-sm bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-slate-800 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 shadow-sm transition-all duration-200"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-slate-400 dark:text-slate-500 text-sm">🔍</span>
              </div>
            </div>
          </div>
          
          {/* Period & Navigation */}
          <div className="lg:col-span-1">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Time Period</label>
            <div className="space-y-2">
              <div className="flex bg-slate-100 dark:bg-slate-700 rounded-xl p-1 shadow-inner">
                <button 
                  onClick={() => setPeriod('daily')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    period === 'daily' 
                      ? 'bg-white dark:bg-slate-600 text-purple-700 dark:text-purple-300 shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Daily
                </button>
                <button 
                  onClick={() => setPeriod('weekly')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    period === 'weekly' 
                      ? 'bg-white dark:bg-slate-600 text-purple-700 dark:text-purple-300 shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Weekly
                </button>
                <button 
                  onClick={() => setPeriod('monthly')}
                  className={`flex-1 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                    period === 'monthly' 
                      ? 'bg-white dark:bg-slate-600 text-purple-700 dark:text-purple-300 shadow-sm' 
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Monthly
                </button>
              </div>
              <div className="flex items-center bg-slate-100 dark:bg-slate-700 rounded-xl p-1 shadow-inner">
                <button 
                  onClick={() => navigatePeriod(-1)}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all duration-200"
                >
                  ←
                </button>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300 px-3 flex-1 text-center">
                  {formatPeriodLabel(currentDate, period)}
                </span>
                <button 
                  onClick={() => navigatePeriod(1)}
                  className="p-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-600 rounded-lg transition-all duration-200"
                >
                  →
                </button>
              </div>
            </div>
          </div>
          
          {/* Quick Filters */}
          <div className="lg:col-span-2">
            <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Quick Filters</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <button 
                onClick={() => handleFilterChange('all')}
                className={`px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                  activeFilter === 'all' 
                    ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-purple-300 dark:hover:border-purple-500'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>📊</span>
                  <span>All Trades</span>
                </div>
              </button>
              <button 
                onClick={() => handleFilterChange('winning')}
                className={`px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                  activeFilter === 'winning' 
                    ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-emerald-300 dark:hover:border-emerald-500'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>📈</span>
                  <span>Winning</span>
                </div>
              </button>
              <button 
                onClick={() => handleFilterChange('losing')}
                className={`px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                  activeFilter === 'losing' 
                    ? 'bg-gradient-to-r from-rose-500 to-red-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-rose-300 dark:hover:border-rose-500'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>📉</span>
                  <span>Losing</span>
                </div>
              </button>
              <button 
                onClick={() => handleFilterChange('open')}
                className={`px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md ${
                  activeFilter === 'open' 
                    ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg' 
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:border-amber-300 dark:hover:border-amber-500'
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span>⏳</span>
                  <span>Open</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </CollapsiblePanel>

      <AppCard className="xl:col-span-7 h-[400px] !bg-zinc-900/95 !border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {drillDownHistory.length > 0 && (
                <button 
                  onClick={handleDrillUp}
                  className="px-2 py-1 text-sm text-zinc-400 hover:text-white bg-zinc-800/50 rounded-md transition-colors"
                  title="Go back to previous view"
                >
                  ← Back
                </button>
              )}
              <h3 className="text-lg font-semibold text-white">P&L History</h3>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex bg-zinc-800/50 rounded-lg p-1">
                <button 
                  onClick={() => setPeriod('daily')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    period === 'daily' 
                      ? 'bg-zinc-700 text-white' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  D
                </button>
                <button 
                  onClick={() => setPeriod('weekly')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    period === 'weekly' 
                      ? 'bg-zinc-700 text-white' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  W
                </button>
                <button 
                  onClick={() => setPeriod('monthly')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    period === 'monthly' 
                      ? 'bg-zinc-700 text-white' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  M
                </button>
                <button 
                  onClick={() => setPeriod('all')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    period === 'all' 
                      ? 'bg-zinc-700 text-white' 
                      : 'text-zinc-400 hover:text-white'
                  }`}
                >
                  All
                </button>
              </div>
              {period !== 'all' && (
                <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-1">
                  <button 
                    onClick={() => navigatePeriod(-1)}
                    className="px-2 py-1 text-sm text-zinc-400 hover:text-white"
                  >
                    ←
                  </button>
                  <span className="text-sm text-white px-2">{formatPeriodLabel(currentDate, period)}</span>
                  <button 
                    onClick={() => navigatePeriod(1)}
                    className="px-2 py-1 text-sm text-zinc-400 hover:text-white"
                  >
                    →
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Sum of realized P&L</span>
              {period !== 'daily' && (
                <span className="text-xs text-zinc-500">Click bars to drill down</span>
              )}
            </div>
            {selectedDateFilter && (
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-400">
                  Filtered: {selectedDateFilter.toLocaleDateString()}
                </span>
                <button
                  onClick={() => setSelectedDateFilter(null)}
                  className="px-2 py-1 text-xs text-zinc-400 hover:text-white bg-zinc-800/50 rounded transition-colors"
                >
                  Reset
                </button>
              </div>
            )}
          </div>
        </div>
        {aggregates.periodData && aggregates.periodData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart 
              data={aggregates.periodData} 
              margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
              barCategoryGap="20%"
            >
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 12 }}
              dy={10}
              tickFormatter={(value) => {
                const date = new Date(value)
                const dataPoint = aggregates.periodData.find(d => d.date === value)
                
                // Special handling for single-day filtering
                if (selectedDateFilter && dataPoint && dataPoint.tradeSymbol) {
                  return dataPoint.tradeSymbol
                }
                
                switch(period) {
                  case 'daily':
                    return date.getDate().toString()
                  case 'weekly':
                    // For weekly view, show day of week
                    return date.toLocaleDateString('en-US', { weekday: 'short' })
                  case 'monthly':
                    // For monthly view, find the week number from the data
                    return dataPoint ? `W${dataPoint.weekNumber || 1}` : 'W1'
                  case 'all':
                    // For all time view, show month abbreviation
                    return date.toLocaleDateString('en-US', { month: 'short' })
                  default:
                    return date.getDate().toString()
                }
              }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 12 }}
              dx={-10}
              domain={['dataMin - 1', 'dataMax + 1']}
              tickFormatter={(value) => `${value >= 0 ? '+' : ''}${fmt.format(value)}`}
            />
            <Tooltip 
              formatter={(value, name, props) => {
                const color = value >= 0 ? '#22c55e' : '#ef4444'
                return [
                  <span style={{ color }} key="value">
                    {`${value >= 0 ? '+' : ''}${fmt.format(value)}`}
                  </span>, 
                  <span style={{ color: '#94a3b8' }} key="label">P&L</span>
                ]
              }}
              contentStyle={{
                backgroundColor: 'rgba(24, 24, 27, 0.95)',
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#ffffff'
              }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              labelFormatter={(label) => {
                const dataPoint = aggregates.periodData.find(d => d.date === label)
                if (selectedDateFilter && dataPoint && dataPoint.tradeSymbol) {
                  return (
                    <span style={{ color: '#ffffff', fontWeight: '600' }}>
                      {dataPoint.tradeSymbol} - {new Date(label).toLocaleDateString()}
                    </span>
                  )
                }
                return (
                  <span style={{ color: '#ffffff', fontWeight: '600' }}>
                    {new Date(label).toLocaleDateString()}
                  </span>
                )
              }}
            />
            <Bar 
              dataKey="pnl" 
              name="P&L"
              radius={[2, 2, 2, 2]}
              minPointSize={4}
              maxBarSize={40}
              onClick={handleDrillDown}
              style={{ cursor: period !== 'daily' ? 'pointer' : 'default' }}
            >
              {(aggregates.periodData || []).map((entry, index) => (
                <Cell 
                  key={`cell-${index}`}
                  fill={entry.pnl >= 0 ? '#22c55e' : '#ef4444'}
                  fillOpacity={0.9}
                />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="cumulative"
              stroke="#94a3b8"
              strokeWidth={2}
              dot={false}
              name="Cumulative P&L"
              onClick={handleDrillDown}
              style={{ cursor: period !== 'daily' ? 'pointer' : 'default' }}
            />
            <ReferenceLine y={0} stroke="#71717a" strokeDasharray="3 3" />
          </ComposedChart>
        </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[320px] text-zinc-400">
            <div className="text-center">
              <p className="text-lg font-medium">No data available</p>
              <p className="text-sm">Add some trades with exit dates to see P&L history</p>
            </div>
          </div>
        )}
      </AppCard>

      <AppCard className="xl:col-span-5 h-[400px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Profit by Strategy (abs)</h3>
          <span className="text-xs text-zinc-500">Absolute P&L distribution</span>
        </div>
        
        {/* Strategy Legend */}
        <div className="grid grid-cols-2 gap-2">
          {aggregates.stratSeries.map((entry, index) => {
            const colors = [
              '#3B82F6', // Blue
              '#10B981', // Emerald
              '#F59E0B', // Amber
              '#EF4444', // Rose
              '#8B5CF6', // Violet
              '#06B6D4', // Cyan
              '#84CC16', // Lime
              '#F97316', // Orange
            ]
            const percentage = aggregates.stratSeries.reduce((sum, item) => sum + item.value, 0) > 0 
              ? ((entry.value / aggregates.stratSeries.reduce((sum, item) => sum + item.value, 0)) * 100).toFixed(0)
              : 0
            
            return (
              <div key={entry.name} className="flex items-center gap-2 text-sm">
                <div 
                  className="w-3 h-3 rounded-full border border-white/20"
                  style={{ backgroundColor: colors[index % colors.length] }}
                />
                <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate">
                  {entry.name}
                </span>
                <span className="text-zinc-500 dark:text-zinc-400 ml-auto">
                  {percentage}%
                </span>
              </div>
            )
          })}
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie 
              data={aggregates.stratSeries} 
              dataKey="value" 
              nameKey="name" 
              outerRadius={80}
              innerRadius={20}
            >
              {aggregates.stratSeries.map((entry, index) => {
                const colors = [
                  '#3B82F6', // Blue
                  '#10B981', // Emerald
                  '#F59E0B', // Amber
                  '#EF4444', // Rose
                  '#8B5CF6', // Violet
                  '#06B6D4', // Cyan
                  '#84CC16', // Lime
                  '#F97316', // Orange
                ]
                return (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={colors[index % colors.length]}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                )
              })}
            </Pie>
            <Tooltip 
              formatter={(value, name, props) => {
                const colors = [
                  '#3B82F6', // Blue
                  '#10B981', // Emerald
                  '#F59E0B', // Amber
                  '#EF4444', // Rose
                  '#8B5CF6', // Violet
                  '#06B6D4', // Cyan
                  '#84CC16', // Lime
                  '#F97316', // Orange
                ]
                const color = colors[props.payload?.index % colors.length] || '#3B82F6'
                return [
                  <span style={{ color: '#ffffff', fontWeight: '600' }} key="value">
                    ${value}
                  </span>, 
                  <span style={{ color }} key="name">
                    {name}
                  </span>
                ]
              }}
              contentStyle={{
                backgroundColor: 'rgba(24, 24, 27, 0.95)',
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#ffffff'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </AppCard>
      </div>
      
      {/* Yearly Activity Chart - Separate Section */}
      <CollapsiblePanel 
        title="Trading Activity"
        subtitle="Yearly calendar view of your trading activity"
        icon="📅"
        defaultExpanded={false}
        className="col-span-full"
      >
        <YearlyActivityChart
          trades={trades}
          selectedDate={selectedDateFilter}
          onFilterByDate={setSelectedDateFilter}
        />
      </CollapsiblePanel>
    </div>
  )
}