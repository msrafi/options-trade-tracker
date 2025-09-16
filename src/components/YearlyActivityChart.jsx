import React, { useMemo } from 'react'

const YearlyActivityChart = ({ trades, selectedDate, onFilterByDate }) => {
  // Calculate yearly activity data
  const yearlyData = useMemo(() => {
    const closed = trades.filter(t => t.exitDate && t.exitPrice)
    const activityMap = {}
    
    // Initialize all days of the year
    const currentYear = new Date().getFullYear()
    const startOfYear = new Date(currentYear, 0, 1)
    const endOfYear = new Date(currentYear, 11, 31)
    
    // Create activity map for each day
    for (let date = new Date(startOfYear); date <= endOfYear; date.setDate(date.getDate() + 1)) {
      const dateKey = date.toISOString().split('T')[0]
      activityMap[dateKey] = {
        date: new Date(date),
        trades: 0,
        pnl: 0,
        volume: 0,
        tradeDetails: []
      }
    }
    
    // Populate with actual trade data
    closed.forEach(trade => {
      const tradeDate = new Date(trade.exitDate)
      const dateKey = tradeDate.toISOString().split('T')[0]
      
      if (activityMap[dateKey]) {
        activityMap[dateKey].trades++
        activityMap[dateKey].pnl += (trade.exitPrice - trade.entryPrice)
        activityMap[dateKey].volume += Math.abs(trade.exitPrice - trade.entryPrice)
        activityMap[dateKey].tradeDetails.push({
          symbol: trade.symbol,
          strategy: trade.strategy || 'Unknown',
          pnl: trade.exitPrice - trade.entryPrice,
          entryPrice: trade.entryPrice,
          exitPrice: trade.exitPrice
        })
      }
    })
    
    // Group by months
    const months = []
    for (let month = 0; month < 12; month++) {
      const monthData = {
        name: new Date(currentYear, month, 1).toLocaleDateString('en-US', { month: 'short' }),
        days: [],
        totalTrades: 0,
        totalPnl: 0,
        totalVolume: 0
      }
      
      // Get days for this month
      const daysInMonth = new Date(currentYear, month + 1, 0).getDate()
      const firstDay = new Date(currentYear, month, 1)
      const firstDayOfWeek = firstDay.getDay()
      
      // Add empty days to align with calendar
      for (let i = 0; i < firstDayOfWeek; i++) {
        monthData.days.push(null)
      }
      
      // Add actual days
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(currentYear, month, day)
        const dateKey = date.toISOString().split('T')[0]
        const dayData = activityMap[dateKey]
        
        monthData.days.push(dayData)
        monthData.totalTrades += dayData.trades
        monthData.totalPnl += dayData.pnl
        monthData.totalVolume += dayData.volume
      }
      
      months.push(monthData)
    }
    
    return months
  }, [trades])

  // Calculate color based on P&L
  const getActivityColor = (dayData) => {
    if (!dayData || dayData.trades === 0) return '#e5e7eb' // Light grey for no trades
    
    // Color based on P&L: Green for profit, Red for loss
    if (dayData.pnl > 0) return '#10b981' // Green for profit
    if (dayData.pnl < 0) return '#ef4444' // Red for loss
    return '#6b7280' // Grey for break-even
  }


  const formatHours = (volume) => {
    // Convert volume to "hours" for display (similar to the image)
    return `${Math.round(volume)}h`
  }

  const formatTooltipContent = (dayData) => {
    if (!dayData || dayData.trades === 0) {
      return 'No trading activity'
    }

    const dateStr = dayData.date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    })
    
    let tooltip = `${dateStr}\n${dayData.trades} trade${dayData.trades > 1 ? 's' : ''}\nTotal P&L: $${dayData.pnl.toFixed(2)}\n\n`
    
    if (dayData.tradeDetails && dayData.tradeDetails.length > 0) {
      tooltip += 'Trades:\n'
      dayData.tradeDetails.forEach((trade, index) => {
        const pnlStr = trade.pnl >= 0 ? `+$${trade.pnl.toFixed(2)}` : `-$${Math.abs(trade.pnl).toFixed(2)}`
        tooltip += `• ${trade.symbol} (${trade.strategy}) ${pnlStr}\n`
      })
    }
    
    return tooltip.trim()
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Trading Activity</h3>
          {selectedDate && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-blue-600">
                Filtered: {selectedDate.toLocaleDateString()}
              </span>
              <button
                onClick={() => onFilterByDate(null)}
                className="px-2 py-1 text-xs text-gray-500 hover:text-gray-700 bg-gray-100 hover:bg-gray-200 rounded transition-colors"
              >
                Reset
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-gray-300"></div>
              <span className="text-gray-500 text-xs">No Trade</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <span className="text-gray-500 text-xs">Loss</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              <span className="text-gray-500 text-xs">Profit</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex gap-3 overflow-x-auto">
          {yearlyData.map((month, monthIndex) => (
            <div key={monthIndex} className="flex-shrink-0">
              <div className="grid grid-cols-7 gap-1 mb-2" style={{ gridTemplateRows: 'repeat(6, 1fr)' }}>
                {month.days.map((dayData, dayIndex) => {
                  const isSelected = selectedDate && dayData && 
                    dayData.date.toDateString() === selectedDate.toDateString()
                  
                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-full transition-all ${
                        isSelected ? 'ring-2 ring-blue-500' : ''
                      }`}
                      style={{ 
                        backgroundColor: getActivityColor(dayData),
                        opacity: dayData ? 1 : 0.3
                      }}
                      title={formatTooltipContent(dayData)}
                    />
                  )
                })}
              </div>
              
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">{month.name}</div>
                <div className={`text-xs font-medium ${
                  month.totalPnl >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {month.totalPnl !== 0 ? `$${month.totalPnl.toFixed(2)}` : '$0.00'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <p className="text-xs text-gray-500">
        Color intensity represents trading activity for each day.
      </p>
    </div>
  )
}

export default YearlyActivityChart
