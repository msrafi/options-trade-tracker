import { useState, useEffect } from 'react'
import { defaultTrades } from '../defaultData'

const STORAGE_KEY = 'options-trade-tracker'

const defaultSettings = {
  optionMultiplier: 100
}

const getInitialData = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      const data = JSON.parse(stored)
      return {
        trades: data.trades || defaultTrades,
        settings: { ...defaultSettings, ...data.settings }
      }
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error)
  }
  
  // Default data if nothing in storage or error
  return {
    trades: defaultTrades,
    settings: defaultSettings
  }
}

const saveToStorage = (data) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

export function useTradeStorage() {
  // Initialize with data from localStorage or defaults
  const [data, setData] = useState(getInitialData)
  
  // Save to localStorage whenever data changes
  useEffect(() => {
    saveToStorage(data)
  }, [data])

  const saveTrade = (trade) => {
    setData(current => {
      const newTrades = trade.id 
        ? current.trades.map(t => t.id === trade.id ? trade : t)
        : [{ ...trade, id: Date.now() }, ...current.trades]
      
      return {
        ...current,
        trades: newTrades
      }
    })
  }

  const deleteTrade = (id) => {
    setData(current => ({
      ...current,
      trades: current.trades.filter(t => t.id !== id)
    }))
  }

  const updateSettings = (newSettings) => {
    setData(current => ({
      ...current,
      settings: { ...current.settings, ...newSettings }
    }))
  }

  return {
    trades: data.trades,
    settings: data.settings,
    saveTrade,
    deleteTrade,
    updateSettings
  }
}
