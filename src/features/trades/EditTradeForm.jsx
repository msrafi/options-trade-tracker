import React, { useState } from 'react'
import { AppInput, AppSelect, AppButton } from '../../design-system'
import { parseNum } from './utils'

export default function EditTradeForm({ trade, onEdit, onCancel }) {
  const [type, setType] = useState(trade.type)
  const [symbol, setSymbol] = useState(trade.symbol)
  const [entryDate, setEntryDate] = useState(trade.entryDate)
  const [entryPrice, setEntryPrice] = useState(trade.entryPrice)
  const [exitPrice, setExitPrice] = useState(trade.exitPrice || '')
  const [exitDate, setExitDate] = useState(trade.exitDate || '')
  const [strategy, setStrategy] = useState(trade.strategy)
  const [side, setSide] = useState(trade?.option?.side || 'CALL')
  const [strike, setStrike] = useState(trade?.option?.strike || '')
  const [exp, setExp] = useState(trade?.option?.expiration || '')

  const submit = (e) => {
    e.preventDefault()
    const updatedTrade = {
      ...trade,
      symbol: symbol.toUpperCase(),
      entryDate,
      entryPrice: parseNum(entryPrice),
      exitPrice: exitPrice ? parseNum(exitPrice) : null,
      exitDate: exitDate || null,
      type,
      strategy
    }
    if (type === 'option') {
      updatedTrade.option = { side, strike: parseNum(strike), expiration: exp }
    }
    onEdit(updatedTrade)
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-12 text-sm text-zinc-600 dark:text-zinc-300">
        Editing trade for <b>{trade.symbol}</b>
      </div>
      <AppSelect id="type" label="Instrument" value={type} onChange={(e)=>setType(e.target.value)}
        options={[{value:'option',label:'Option'},{value:'stock',label:'Stock'}]} className="md:col-span-2" />
      <AppInput id="symbol" label="Symbol" value={symbol} onChange={(e)=>setSymbol(e.target.value)} className="md:col-span-2" />
      <AppInput id="entryDate" label="Entry Date" type="date" value={entryDate} onChange={(e)=>setEntryDate(e.target.value)} className="md:col-span-2" />
      <AppInput id="entryPrice" label="Entry Price" type="number" step="0.01" prefix="$" value={entryPrice} onChange={(e)=>setEntryPrice(e.target.value)} className="md:col-span-2" />
      <AppInput id="exitPrice" label="Exit Price (Optional)" type="number" step="0.01" prefix="$" value={exitPrice} onChange={(e)=>setExitPrice(e.target.value)} className="md:col-span-2" />
      <AppInput id="exitDate" label="Exit Date (Optional)" type="date" value={exitDate} onChange={(e)=>setExitDate(e.target.value)} className="md:col-span-2" />
      <AppSelect id="strategy" label="Strategy" value={strategy} onChange={(e)=>setStrategy(e.target.value)}
        options={['Single','Vertical','Covered Call','Iron Condor','Strangle','Straddle','Wheel','Other'].map(s=>({value:s,label:s}))} className="md:col-span-2" />
      {type === 'option' && (<>
        <AppSelect id="side" label="Option Type" value={side} onChange={(e)=>setSide(e.target.value)}
           options={[{value:'CALL',label:'CALL'},{value:'PUT',label:'PUT'}]} className="md:col-span-2" />
        <AppInput id="strike" label="Strike" type="number" step="0.01" value={strike} onChange={(e)=>setStrike(e.target.value)} className="md:col-span-2" />
        <AppInput id="exp" label="Expiration" type="date" value={exp} onChange={(e)=>setExp(e.target.value)} className="md:col-span-2" />
      </>)}
      <div className="md:col-span-12 flex gap-3 justify-end">
        <AppButton type="button" variant="ghost" onClick={onCancel}>Cancel</AppButton>
        <AppButton type="submit" variant="primary">Update Trade</AppButton>
      </div>
    </form>
  )
}
