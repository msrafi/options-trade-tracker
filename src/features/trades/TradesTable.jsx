
import React from 'react'
import { AppButton, Badge } from '../../design-system'
import { fmt } from './utils'
import { useTradeStorage } from '../../hooks/useTradeStorage'

export default function TradesTable({ trades, settings, onExitClick, onDelete, onEdit }){
  return (
    <div className="overflow-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left text-zinc-500">
            <th className="px-3 py-2 whitespace-nowrap">Status</th>
            <th className="px-3 py-2 whitespace-nowrap">Symbol</th>
            <th className="px-3 py-2 whitespace-nowrap">Type</th>
            <th className="px-3 py-2 whitespace-nowrap">Entry Date</th>
            <th className="px-3 py-2 whitespace-nowrap">Buy Price</th>
            <th className="px-3 py-2 whitespace-nowrap">Strategy</th>
            <th className="px-3 py-2 whitespace-nowrap">Details</th>
            <th className="px-3 py-2 whitespace-nowrap">Exit Price</th>
            <th className="px-3 py-2 whitespace-nowrap">Exit Date</th>
            <th className="px-3 py-2 whitespace-nowrap">P&L</th>
            <th className="px-3 py-2 whitespace-nowrap">Actions</th>
          </tr>
        </thead>
        <tbody>
          {trades.map(t => {
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
