
import React, { useState } from 'react'
import { AppInput, AppSelect, AppButton } from '../../design-system'
import { parseNum, uid } from './utils'

export default function TradeForm({ onAdd }){
  const [type, setType] = useState('option')
  const [symbol, setSymbol] = useState('')
  const [entryDate, setEntryDate] = useState(()=> new Date().toISOString().slice(0,10))
  const [exitDate, setExitDate] = useState('')
  const [buyPrice, setBuyPrice] = useState('')
  const [exitPrice, setExitPrice] = useState('')
  const [strategy, setStrategy] = useState('Single')
  const [notes, setNotes] = useState('')
  const [side, setSide] = useState('CALL')
  const [strike, setStrike] = useState('')
  const [exp, setExp] = useState('')

  const reset = ()=>{
    setSymbol(''); setBuyPrice(''); setExitPrice(''); setExitDate(''); setNotes(''); setStrike(''); setExp('')
  }

  const submit = (e)=>{
    e.preventDefault()
    if (!symbol) return alert('Please enter a symbol')
    const trade = {
      id: uid(),
      symbol: symbol.toUpperCase(),
      entryDate,
      exitDate,
      buyPrice: parseNum(buyPrice),
      exitPrice: parseNum(exitPrice),
      type,
      strategy,
      notes,
    }
    if (type === 'option') trade.option = { side, strike: parseNum(strike), expiration: exp }
    onAdd(trade); reset()
  }

  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <AppSelect id="type" label="Instrument" value={type} onChange={(e)=>setType(e.target.value)}
        options={[{value:'option',label:'Option'},{value:'stock',label:'Stock'}]} className="md:col-span-2" />
      <AppInput id="symbol" label="Symbol" value={symbol} onChange={(e)=>setSymbol(e.target.value)} className="md:col-span-2" />
      <AppInput id="entryDate" label="Entry Date" type="date" value={entryDate} onChange={(e)=>setEntryDate(e.target.value)} className="md:col-span-2" />
      <AppInput id="buyPrice" label="Buy Price" type="number" step="0.01" prefix="$" value={buyPrice} onChange={(e)=>setBuyPrice(e.target.value)} className="md:col-span-2" />
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
      <AppInput id="notes" label="Notes" value={notes} onChange={(e)=>setNotes(e.target.value)} className="md:col-span-12" />
      <div className="md:col-span-12 flex gap-3 justify-end">
        <AppButton type="reset" variant="ghost" onClick={reset}>Clear</AppButton>
        <AppButton type="submit" variant="primary">Add Trade</AppButton>
      </div>
    </form>
  )
}
