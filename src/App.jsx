
import React, { useMemo, useState } from 'react'
import { AppButton, AppCard, AppInput, AppSelect, Divider } from './design-system'
import Dashboard from './features/trades/Dashboard.jsx'
import UserManagement from './features/users/UserManagement.jsx'
import TradeForm from './features/trades/TradeForm.jsx'
import TradesTable from './features/trades/TradesTable.jsx'
import ExitTradeForm from './features/trades/ExitTradeForm.jsx'
import EditTradeForm from './features/trades/EditTradeForm.jsx'
import { useStorage } from './hooks/useStorage'
import { monthKey, moneyToNum, toISO, uid } from './features/trades/utils.js'
import { motion, AnimatePresence } from 'framer-motion'

function Header({ onImport, onExport }){
  const { settings = { optionMultiplier: 100 }, updateSettings = () => {} } = useStorage() || {}
  const [multiplier, setMultiplier] = useState(settings?.optionMultiplier ?? 100)

  const handleMultiplierChange = (e) => {
    const value = Number(e.target.value || 100)
    setMultiplier(value)
    updateSettings({ ...settings, optionMultiplier: value })
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">📈 Options & Stock Trade Tracker</h1>
          <p className="text-sm text-zinc-500">Track your options and stock trades with a beautiful dashboard.</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2 items-center">
        <AppButton variant="secondary" onClick={onImport}>Import</AppButton>
        <AppButton variant="secondary" onClick={onExport}>Export</AppButton>
        <div className="w-px h-6 bg-zinc-300 dark:bg-zinc-700 mx-1" />
        <details className="px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <summary className="cursor-pointer text-sm font-medium">Settings</summary>
          <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3 text-sm">
            <AppInput 
              id="mult" 
              label="Options Contract Multiplier" 
              type="number" 
              value={multiplier}
              onChange={handleMultiplierChange} 
              className="md:col-span-5" 
            />
            <p className="md:col-span-12 text-xs text-zinc-500">Common values: 100 (US), 10 (some markets). Set to 1 for Profit = Out − In with no scaling.</p>
          </div>
        </details>
      </div>
    </div>
  )
}

function AppInner(){
  const { 
    trades = [], 
    saveTrade = () => {}, 
    deleteTrade = () => {}, 
    settings = { optionMultiplier: 100 }, 
    updateSettings = () => {} 
  } = useStorage() || {}
  const [filterMonth, setFilterMonth] = useState("")
  const [search, setSearch] = useState("")
  const [exiting, setExiting] = useState(null)
  const [editing, setEditing] = useState(null)

  const addTrade = (trade) => saveTrade(trade)
  const exitTrade = (id, {date, price, fees}) => {
    const trade = trades.find(t => t.id === id)
    if (trade) {
      saveTrade({
        ...trade,
        exitDate: date,
        exitPrice: price,
        fees: fees || 0
      })
    }
  }
  const editTrade = (updatedTrade) => saveTrade(updatedTrade)

  const filtered = useMemo(() => trades.filter(t => {
    // Month filter
    const okMonth = filterMonth ? monthKey(t.entryDate) === filterMonth || 
      (t.exitDate && monthKey(t.exitDate) === filterMonth) : true

    // Search filter - expanded to include more fields
    const searchTerms = search.toLowerCase().split(' ').filter(Boolean)
    const searchText = `${t.symbol} ${t.strategy} ${t.type} ${t.notes || ''} ${
      t.type === 'option' ? `${t.option?.side} ${t.option?.strike} ${t.option?.expiration}` : ''
    }`.toLowerCase()
    
    const okSearch = search === '' || searchTerms.every(term => searchText.includes(term))
    
    return okMonth && okSearch
  }), [trades, filterMonth, search])

  const monthOptions = Array.from(new Set(trades.flatMap(t => [monthKey(t.entryDate), t.exit ? monthKey(t.exit.date) : null].filter(Boolean))))

  const onImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json,.csv,application/json,text/csv'
    input.onchange = async () => {
      const file = input.files?.[0]; if (!file) return
      try {
        const txt = await file.text()
        let data
        if (file.name.toLowerCase().endsWith('.csv')){
          const lines = txt.split(/\r?\n/).filter(Boolean)
          if (!lines.length) return alert('Empty CSV')
          const headers = lines[0].split(',').map(h=>h.trim())
          data = lines.slice(1).map(line => {
            const cells = line.split(',').map(c=>c.trim())
            return Object.fromEntries(headers.map((h,i)=>[h, cells[i] ?? '']))
          })
        } else {
          data = JSON.parse(txt)
        }
        const asArray = Array.isArray(data) ? data : [data]
        const normalized = asArray.map(r => {
          if (r.symbol || r.type || r.option || r.entryDate) return r
          const t = {
            id: uid(),
            symbol: (r.TradeSymbol || r.Symbol || '').toUpperCase(),
            entryDate: toISO(r.TradeInDate || r.EntryDate),
            purchasePrice: moneyToNum(r.InPrice || r.EntryPrice),
            qty: Number(r.Qty || 1),
            type: (r.Expiry || r.OptionSide || r.Strike) ? 'option' : 'stock',
            strategy: r.Strategy || 'Single',
            notes: r.Notes || '',
          }
          if (t.type === 'option'){
            t.option = {
              side: (r.OptionSide || 'CALL').toUpperCase(),
              strike: moneyToNum(r.Strike || 0),
              expiration: toISO(r.Expiry || r.Expiration),
            }
          }
          if (r.TradeOutDate || r.OutPrice){
            t.exit = {
              date: toISO(r.TradeOutDate || r.ExitDate),
              price: moneyToNum(r.OutPrice || r.ExitPrice),
              fees: moneyToNum(r.Fees || 0),
            }
          }
          return t
        })
        setTrades(normalized)
      } catch (e) {
        alert('Failed to import: ' + e.message)
      }
    }
    input.click()
  }

  const onExport = () => {
    const blob = new Blob([JSON.stringify(trades, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `trades-export-${new Date().toISOString().slice(0,10)}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-zinc-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Header onImport={onImport} onExport={onExport} />
        <Divider />
        <AppCard><TradeForm onAdd={addTrade} /></AppCard>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 mt-6">
          <AppCard className="xl:col-span-3">
            <h3 className="text-lg font-semibold mb-4">Filters</h3>
            <AppSelect id="month" label="Month" value={filterMonth} onChange={(e)=>setFilterMonth(e.target.value)}
              options={[{value:'', label:'All'}, ...monthOptions.map(m=>({value:m,label:m}))]} />
            <AppInput id="search" label="Search" placeholder="AAPL, Vertical, option..." value={search} onChange={(e)=>setSearch(e.target.value)} className="mt-3" />
          </AppCard>

          <div className="xl:col-span-9 space-y-6">
            <Dashboard trades={filtered} />
            <AppCard>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Manage Trades</h3>
                <span className="text-xs text-zinc-500">Exit to realize P&L</span>
              </div>
              <TradesTable 
                trades={filtered} 
                onExitClick={(t)=>setExiting(t)}
                onEdit={(t)=>setEditing(t)}
                onDelete={id=>deleteTrade(id)} 
              />
            </AppCard>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {exiting && (
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-2xl" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
              <AppCard>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Exit Trade</h3>
                  <AppButton variant="ghost" onClick={()=>setExiting(null)}>Close</AppButton>
                </div>
                <ExitTradeForm trade={exiting} onExit={(exit)=>{ exitTrade(exiting.id, exit); setExiting(null) }} onCancel={()=>setExiting(null)} />
              </AppCard>
            </motion.div>
          </motion.div>
        )}
        {editing && (
          <motion.div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-end md:items-center justify-center p-4 z-50"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div className="w-full max-w-2xl" initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 20, opacity: 0 }}>
              <AppCard>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold">Edit Trade</h3>
                  <AppButton variant="ghost" onClick={()=>setEditing(null)}>Close</AppButton>
                </div>
                <EditTradeForm trade={editing} onEdit={(updatedTrade)=>{ editTrade(updatedTrade); setEditing(null) }} onCancel={()=>setEditing(null)} />
              </AppCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function TradeTrackerApp(){
  return <AppInner />
}
