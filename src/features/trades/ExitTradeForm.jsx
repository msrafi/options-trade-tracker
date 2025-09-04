
import React, { useState } from 'react'
import { AppInput, AppButton } from '../../design-system'

export default function ExitTradeForm({ trade, onExit, onCancel }){
  const [date, setDate] = useState(()=> new Date().toISOString().slice(0,10))
  const [price, setPrice] = useState('')
  const [fees, setFees] = useState(0)
  const submit = (e)=>{ e.preventDefault(); onExit({ date, price: Number(price||0), fees: Number(fees||0) }) }
  return (
    <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-12 text-sm text-zinc-600 dark:text-zinc-300">
        Closing <b>{trade.symbol}</b> ({trade.type==='option' ? `${trade?.option?.side} ${trade?.option?.strike} ${trade?.option?.expiration}` : trade.strategy})
      </div>
      <AppInput id="exitDate" label="Exit Date" type="date" value={date} onChange={(e)=>setDate(e.target.value)} className="md:col-span-4" />
      <AppInput id="exitPrice" label="Exit Price" type="number" step="0.01" prefix="$" value={price} onChange={(e)=>setPrice(e.target.value)} className="md:col-span-4" />
      <AppInput id="fees" label="Fees" type="number" step="0.01" prefix="$" value={fees} onChange={(e)=>setFees(e.target.value)} className="md:col-span-4" />
      <div className="md:col-span-12 flex gap-3 justify-end">
        <AppButton type="button" variant="ghost" onClick={onCancel}>Cancel</AppButton>
        <AppButton type="submit" variant="success">Confirm Exit</AppButton>
      </div>
    </form>
  )
}
