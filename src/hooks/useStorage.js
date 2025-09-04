import { useState, useEffect } from 'react'
import { defaultTrades } from '../defaultData'

const STORAGE_KEY = 'options-trade-tracker'

export function useStorage() {
  const [initialized, setInitialized] = useState(false)
  const [trades, setTrades] = useState([])
  const [settings, setSettings] = useState({
    optionMultiplier: 100 // Default contract multiplier
  })

  // Load data from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        const data = JSON.parse(stored)
        setTrades(data.trades || [])
        setSettings(data.settings || { optionMultiplier: 100 })
      } else {
        // Use default data if nothing is stored
        setTrades(defaultTrades)
        // Save default data to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          trades: defaultTrades,
          settings: { optionMultiplier: 100 }
        }))
      }
    } catch (error) {
      console.error('Error loading data:', error)
      // Set defaults on error
      setTrades(defaultTrades)
      setSettings({ optionMultiplier: 100 })
    } finally {
      setInitialized(true)
    }
  }, [])

  // Save to localStorage whenever trades or settings change
  const saveTrade = (trade) => {
    const newTrades = trade.id 
      ? trades.map(t => t.id === trade.id ? trade : t)
      : [...trades, { ...trade, id: Date.now() }]
    
    setTrades(newTrades)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      trades: newTrades,
      settings
    }))
  }

  const deleteTrade = (id) => {
    const newTrades = trades.filter(t => t.id !== id)
    setTrades(newTrades)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      trades: newTrades,
      settings
    }))
  }

  const updateSettings = (newSettings) => {
    setSettings(newSettings)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      trades,
      settings: newSettings
    }))
  }

  // Only return the actual values after initialization
  if (!initialized) {
    return {
      trades: [],
      settings: { optionMultiplier: 100 },
      saveTrade: () => {},
      deleteTrade: () => {},
      updateSettings: () => {}
    }
  }

  return {
    trades,
    settings,
    saveTrade,
    deleteTrade,
    updateSettings
  }
}
