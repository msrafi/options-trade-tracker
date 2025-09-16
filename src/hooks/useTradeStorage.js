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
      // Check if existing trades have symbol and type fields
      const hasValidData = data.trades && data.trades.length > 0 && 
                          data.trades[0].symbol && data.trades[0].type
      
      if (hasValidData) {
        return {
          trades: data.trades,
          settings: { ...defaultSettings, ...data.settings }
        }
      } else {
        // If old data without symbol/type, use new default data
        console.log('Updating to new data format with symbol and type fields')
        return {
          trades: defaultTrades,
          settings: { ...defaultSettings, ...data.settings }
        }
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
    console.log('Saving trade:', trade)
    setData(current => {
      // Check if trade with this ID already exists
      const existingTradeIndex = current.trades.findIndex(t => t.id === trade.id)
      
      let newTrades
      if (existingTradeIndex >= 0) {
        // Update existing trade
        newTrades = current.trades.map(t => t.id === trade.id ? trade : t)
        console.log('Updating existing trade')
      } else {
        // Add new trade
        newTrades = [trade, ...current.trades]
        console.log('Adding new trade')
      }
      
      console.log('Updated trades:', newTrades)
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

  const resetToDefaults = () => {
    setData({
      trades: defaultTrades,
      settings: defaultSettings
    })
  }

  const clearStorage = () => {
    localStorage.removeItem(STORAGE_KEY)
    resetToDefaults()
  }

  return {
    trades: data.trades,
    settings: data.settings,
    saveTrade,
    deleteTrade,
    updateSettings,
    resetToDefaults,
    clearStorage
  }
}
