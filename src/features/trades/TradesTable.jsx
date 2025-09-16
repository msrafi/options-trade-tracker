
import React, { useState, useMemo } from 'react'
import { AppButton, Badge } from '../../design-system'
import { fmt } from './utils'
import { useTradeStorage } from '../../hooks/useTradeStorage'

export default function TradesTable({ trades, settings, onExitClick, onDelete, onEdit }){
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' })

  const handleSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedTrades = useMemo(() => {
    if (!sortConfig.key) return trades

    return [...trades].sort((a, b) => {
      let aValue, bValue

      switch (sortConfig.key) {
        case 'status':
          const aIsClosed = Boolean(a.exitPrice && a.exitDate)
          const bIsClosed = Boolean(b.exitPrice && b.exitDate)
          aValue = aIsClosed ? 'Closed' : 'Open'
          bValue = bIsClosed ? 'Closed' : 'Open'
          break
        case 'symbol':
          aValue = a.symbol.toLowerCase()
          bValue = b.symbol.toLowerCase()
          break
        case 'pnl':
          const aIsClosedPnl = Boolean(a.exitPrice && a.exitDate)
          const bIsClosedPnl = Boolean(b.exitPrice && b.exitDate)
          aValue = aIsClosedPnl ? (a.exitPrice - a.entryPrice) : null
          bValue = bIsClosedPnl ? (b.exitPrice - b.entryPrice) : null
          // Handle null values (open trades) - put them at the end
          if (aValue === null && bValue === null) return 0
          if (aValue === null) return 1
          if (bValue === null) return -1
          break
        default:
          return 0
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [trades, sortConfig])

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <span className="text-zinc-400">↕</span>
    }
    return sortConfig.direction === 'asc' ? <span className="text-zinc-600">↑</span> : <span className="text-zinc-600">↓</span>
  }
  return (
    <div className="overflow-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-500">
            <th 
              className="px-3 py-2 whitespace-nowrap cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 select-none"
              onClick={() => handleSort('status')}
            >
              <div className="flex items-center gap-1">
                Status {getSortIcon('status')}
              </div>
            </th>
            <th 
              className="px-3 py-2 whitespace-nowrap cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 select-none"
              onClick={() => handleSort('symbol')}
            >
              <div className="flex items-center gap-1">
                Symbol {getSortIcon('symbol')}
              </div>
            </th>
            <th className="px-3 py-2 whitespace-nowrap">Type</th>
            <th className="px-3 py-2 whitespace-nowrap">Entry Date</th>
            <th className="px-3 py-2 whitespace-nowrap">Buy Price</th>
            <th className="px-3 py-2 whitespace-nowrap">Strategy</th>
            <th className="px-3 py-2 whitespace-nowrap">Details</th>
            <th className="px-3 py-2 whitespace-nowrap">Exit Price</th>
            <th className="px-3 py-2 whitespace-nowrap">Exit Date</th>
            <th 
              className="px-3 py-2 whitespace-nowrap cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 select-none"
              onClick={() => handleSort('pnl')}
            >
              <div className="flex items-center gap-1">
                P&L {getSortIcon('pnl')}
              </div>
            </th>
            <th className="px-3 py-2 whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedTrades.map(t => {
            const isClosed = Boolean(t.exitPrice && t.exitDate)
            const pnl = isClosed ? (t.exitPrice - t.entryPrice) : null
            return (
              <tr key={t.id} className="border-t border-zinc-200 dark:border-zinc-800">
                <td className="px-3 py-2">{isClosed ? <Badge>Closed</Badge> : <Badge>Open</Badge>}</td>
                <td className="px-3 py-2 font-medium">{t.symbol}</td>
                <td className="px-3 py-2">{t.type}</td>
                <td className="px-3 py-2">{t.entryDate}</td>
                <td className="px-3 py-2">{fmt.format(t.entryPrice)}</td>
                <td className="px-3 py-2">{t.strategy}</td>
                <td className="px-3 py-2 text-zinc-500">{t.type==='option' ? `${t?.option?.side} $${t?.option?.strike} exp ${t?.option?.expiration}` : '—'}</td>
                <td className="px-3 py-2">{isClosed ? fmt.format(t.exitPrice) : '—'}</td>
                <td className="px-3 py-2">{isClosed ? t.exitDate : '—'}</td>
                <td className="px-3 py-2">{isClosed ? <span className={pnl >= 0 ? 'text-emerald-600' : 'text-rose-600'}>{fmt.format(pnl)}</span> : '—'}</td>
                <td className="px-3 py-2 flex gap-2">
                  {!isClosed && <AppButton size="sm" onClick={()=>onExitClick(t)} className="!rounded-xl">Exit</AppButton>}
                  <AppButton size="sm" variant="secondary" onClick={()=>onEdit(t)} className="!rounded-xl">Edit</AppButton>
                  <AppButton size="sm" variant="ghost" onClick={()=>onDelete(t.id)} className="!rounded-xl">Delete</AppButton>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
