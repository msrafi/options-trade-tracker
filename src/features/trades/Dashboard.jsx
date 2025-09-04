
import React, { useMemo, useState } from 'react'
import { AppCard, Stat } from '../../design-system'
import { PieChart, Pie, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, Cell, ComposedChart, Line } from 'recharts'
import { fmt, fmtPct, monthKey } from './utils'
import { useTradeStorage } from '../../hooks/useTradeStorage'

const formatPeriodLabel = (date, period) => {
  const options = { 
    daily: { day: 'numeric', month: 'short' },
    weekly: { day: 'numeric', month: 'short' },
    monthly: { month: 'long', year: 'numeric' }
  }
  return new Intl.DateTimeFormat('en-US', options[period]).format(date)
}

export default function Dashboard({ trades, settings }){
  const [period, setPeriod] = useState('daily')
  const [currentDate, setCurrentDate] = useState(new Date())

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

  const aggregates = useMemo(() => {
    const closed = trades.filter(t => t.exitDate && t.exitPrice)
    const open = trades.filter(t => !t.exitDate || !t.exitPrice)
    const m = settings.optionMultiplier

    // Function to filter trades by current period
    const isInCurrentPeriod = (date) => {
      const tradeDate = new Date(date)
      switch(period) {
        case 'daily':
          return tradeDate.toDateString() === currentDate.toDateString()
        case 'weekly':
          const weekStart = new Date(currentDate)
          weekStart.setDate(currentDate.getDate() - currentDate.getDay() + (currentDate.getDay() === 0 ? -6 : 1))
          const weekEnd = new Date(weekStart)
          weekEnd.setDate(weekStart.getDate() + 6)
          return tradeDate >= weekStart && tradeDate <= weekEnd
        case 'monthly':
          return tradeDate.getMonth() === currentDate.getMonth() && 
                 tradeDate.getFullYear() === currentDate.getFullYear()
        default:
          return true
      }
    }

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
        groups[key].pnl += (trade.exitPrice - trade.buyPrice)
        groups[key].trades++
      })
      return groups
    }

    // Calculate P&L without contract multiplier
    const calculatePnL = (trade) => {
      return trade.exitPrice - trade.buyPrice
    }

    // Overall P&L stats
    const totalPnL = closed.reduce((acc, t) => acc + calculatePnL(t), 0)
    const invested = trades.reduce((acc, t) => acc + t.buyPrice, 0)
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
    const periodGroups = groupTradesByPeriod(closed, period)
    let cumulative = 0
    const periodData = Object.entries(periodGroups)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, data]) => {
        cumulative += data.pnl
        return {
          date,
          pnl: Number(data.pnl.toFixed(2)),
          trades: data.trades,
          cumulative: Number(cumulative.toFixed(2))
        }
      })

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
  }, [trades, settings])

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
      <div className="xl:col-span-12 grid grid-cols-2 md:grid-cols-4 gap-4">
        <Stat 
          label="Total P&L" 
          value={fmt.format(aggregates.totalPnL)} 
          sub={`${aggregates.closed.length} closed / ${aggregates.open.length} open`}
          className={aggregates.totalPnL >= 0 ? "!from-emerald-50 dark:!from-emerald-900/20" : "!from-rose-50 dark:!from-rose-900/20"}
        />
        <Stat 
          label="Win Rate" 
          value={fmtPct(aggregates.winRate)} 
          sub={aggregates.winningTrades.length > 0 ? `Avg Win: ${fmt.format(aggregates.avgWinAmount)}` : 'No winning trades yet'}
          className="!from-indigo-50 dark:!from-indigo-900/20"
        />
        <Stat 
          label="Loss Rate" 
          value={fmt.format(Math.abs(aggregates.avgLossAmount))} 
          sub={`ROI: ${fmtPct(aggregates.roi)}`}
          className="!from-zinc-50 dark:!from-zinc-900/20"
        />
        <Stat 
          label="Total Invested" 
          value={fmt.format(aggregates.invested)} 
          sub={`${aggregates.open.length} open positions`}
          className="!from-blue-50 dark:!from-blue-900/20"
        />
      </div>

      <AppCard className="xl:col-span-7 h-[320px] !bg-zinc-900/95 !border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <h3 className="text-lg font-semibold text-white">P&L History</h3>
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
              </div>
              <div className="flex items-center gap-2 bg-zinc-800/50 rounded-lg p-1">
                <button 
                  onClick={() => navigatePeriod(-1)}
                  className="px-2 py-1 text-sm text-zinc-400 hover:text-white"
                >
                  ←
                </button>
                <span className="text-sm text-white px-2">{formatPeriodLabel()}</span>
                <button 
                  onClick={() => navigatePeriod(1)}
                  className="px-2 py-1 text-sm text-zinc-400 hover:text-white"
                >
                  →
                </button>
              </div>
            </div>
          </div>
          <span className="text-xs text-zinc-400">Sum of realized P&L</span>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <ComposedChart 
            data={aggregates.periodData || []} 
            margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
          >
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 12 }}
              dy={10}
              tickFormatter={(value) => {
                const date = new Date(value)
                return period === 'daily' 
                  ? date.getDate()
                  : period === 'weekly'
                  ? `W${Math.ceil(date.getDate() / 7)}`
                  : date.toLocaleString('default', { month: 'short' })
              }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#71717a', fontSize: 12 }}
              dx={-10}
              tickFormatter={(value) => `${value >= 0 ? '+' : ''}${fmt.format(value)}`}
            />
            <Tooltip 
              formatter={(value) => [`${value >= 0 ? '+' : ''}${fmt.format(value)}`, 'P&L']}
              contentStyle={{
                backgroundColor: 'rgba(24, 24, 27, 0.95)',
                border: '1px solid #27272a',
                borderRadius: '8px',
                color: '#ffffff'
              }}
              cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Bar 
              dataKey="pnl" 
              name="P&L"
              radius={[2, 2, 2, 2]}
              minPointSize={4}
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
            />
          </ComposedChart>
        </ResponsiveContainer>
      </AppCard>

      <AppCard className="xl:col-span-5 h-[320px]">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Profit by Strategy (abs)</h3>
          <span className="text-xs text-zinc-500">Absolute P&L distribution</span>
        </div>
        <ResponsiveContainer width="100%" height={250}>
          <PieChart>
            <Pie data={aggregates.stratSeries} dataKey="value" nameKey="name" outerRadius={110} label />
          </PieChart>
        </ResponsiveContainer>
      </AppCard>
    </div>
  )
}
