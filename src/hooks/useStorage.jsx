
import React, { createContext, useContext, useEffect, useRef, useState } from 'react'

const StorageContext = createContext(null)
const LOCAL_KEY = 'trade-tracker:v1'
const SETTINGS_KEY = 'trade-tracker:settings:v1'
const USERS_KEY = 'trade-tracker:users:v1'
const CURRENT_USER_KEY = 'trade-tracker:current-user:v1'

export function StorageProvider({ children }){
  // Initialize with localstorage or defaults
  const defaultUser = 'default'
  const [currentUser, setCurrentUser] = useState(() => {
    return localStorage.getItem(CURRENT_USER_KEY) || defaultUser
  })

  const [users, setUsers] = useState(() => {
    try { 
      return JSON.parse(localStorage.getItem(USERS_KEY)) || [defaultUser] 
    } catch { 
      return [defaultUser] 
    }
  })

  // Load trades from localStorage
  const loadTrades = () => {
    try {
      const savedData = localStorage.getItem(LOCAL_KEY)
      console.log('Loading trades from storage:', savedData)
      if (!savedData) return {}
      return JSON.parse(savedData) || {}
    } catch (error) {
      console.error('Error loading trades:', error)
      return {}
    }
  }

  const [tradesData, setTradesData] = useState(() => loadTrades())
  const trades = tradesData[currentUser] || []
  
  // Create a wrapper for setTrades that updates both state and localStorage
  const setTrades = (newTrades) => {
    const updatedTrades = typeof newTrades === 'function' 
      ? newTrades(trades)
      : newTrades

    setTradesData(prevData => {
      const newData = { ...prevData, [currentUser]: updatedTrades }
      localStorage.setItem(LOCAL_KEY, JSON.stringify(newData))
      console.log('Saving trades:', newData)
      return newData
    })
  }

  const [settings, setSettings] = useState(() => {
    try {
      const savedData = localStorage.getItem(SETTINGS_KEY)
      if (!savedData) return { optionMultiplier: 100 }
      const allSettings = JSON.parse(savedData)
      return allSettings?.[currentUser] || { optionMultiplier: 100 }
    } catch (error) {
      console.error('Error loading settings:', error)
      return { optionMultiplier: 100 }
    }
  })

  // Load trades and settings when currentUser changes
  useEffect(() => {
    try {
      const allTrades = JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}
      setTrades(allTrades[currentUser] || [])
      
      const allSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}
      setSettings(allSettings[currentUser] || { optionMultiplier: 100 })
    } catch (error) {
      console.error('Error loading user data:', error)
      setTrades([])
      setSettings({ optionMultiplier: 100 })
    }
  }, [currentUser])
  
  const [cloudCfg, setCloudCfg] = useState({ enabled:false, url:'', anonKey:'' })

  useEffect(() => {
    localStorage.setItem(CURRENT_USER_KEY, currentUser)
  }, [currentUser])

  useEffect(() => {
    localStorage.setItem(USERS_KEY, JSON.stringify(users))
  }, [users])

  // Save trades whenever they change
  // When currentUser changes, ensure their data exists
  useEffect(() => {
    setTradesData(prevData => {
      if (!prevData[currentUser]) {
        const newData = { ...prevData, [currentUser]: [] }
        localStorage.setItem(LOCAL_KEY, JSON.stringify(newData))
        return newData
      }
      return prevData
    })
  }, [currentUser])

  useEffect(() => {
    try {
      const allSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}
      allSettings[currentUser] = settings
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(allSettings))
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }, [settings, currentUser])

  async function getSupabase(){
    if (!cloudCfg.enabled || !cloudCfg.url || !cloudCfg.anonKey) return null
    const { createClient } = await import('@supabase/supabase-js')
    return createClient(cloudCfg.url, cloudCfg.anonKey)
  }

  async function syncToCloud(){
    const sb = await getSupabase()
    if (!sb) return { ok:false, error:'Cloud not configured' }
    // create table in SQL editor first:
    // create table if not exists trades (id uuid primary key, created_at timestamptz default now(), data jsonb);
    const payload = trades.map(t => ({ id: t.id, data: t }))
    const { error } = await sb.from('trades').upsert(payload, { onConflict:'id' })
    if (error) return { ok:false, error:error.message }
    return { ok:true }
  }

  async function pullFromCloud(){
    const sb = await getSupabase()
    if (!sb) return { ok:false, error:'Cloud not configured' }
    const { data, error } = await sb.from('trades').select()
    if (error) return { ok:false, error:error.message }
    if (Array.isArray(data)) {
      const rows = data.map(r => r.data)
      setTrades(rows)
    }
    return { ok:true }
  }

  const addUser = (username) => {
    if (username && !users.includes(username)) {
      setUsers(prev => [...prev, username])
      // Initialize storage for new user
      try {
        const allTrades = JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}
        const allSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}
        allTrades[username] = []
        allSettings[username] = { optionMultiplier: 100 }
        localStorage.setItem(LOCAL_KEY, JSON.stringify(allTrades))
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(allSettings))
      } catch (error) {
        console.error('Error initializing user storage:', error)
      }
    }
  }

  const updateUser = (oldUsername, newUsername) => {
    if (newUsername && oldUsername !== 'default' && !users.includes(newUsername)) {
      setUsers(prev => prev.map(u => u === oldUsername ? newUsername : u))
      
      // Update all stored data for the user
      try {
        const allTrades = JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}
        const allSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}
        
        allTrades[newUsername] = allTrades[oldUsername]
        allSettings[newUsername] = allSettings[oldUsername]
        delete allTrades[oldUsername]
        delete allSettings[oldUsername]
        
        localStorage.setItem(LOCAL_KEY, JSON.stringify(allTrades))
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(allSettings))
        
        if (currentUser === oldUsername) {
          setCurrentUser(newUsername)
        }
      } catch (error) {
        console.error('Error updating user storage:', error)
      }
    }
  }

  const deleteUser = (username) => {
    if (username !== 'default' && username !== currentUser) {
      setUsers(prev => prev.filter(u => u !== username))
      
      // Clean up stored data for the user
      try {
        const allTrades = JSON.parse(localStorage.getItem(LOCAL_KEY)) || {}
        const allSettings = JSON.parse(localStorage.getItem(SETTINGS_KEY)) || {}
        
        delete allTrades[username]
        delete allSettings[username]
        
        localStorage.setItem(LOCAL_KEY, JSON.stringify(allTrades))
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(allSettings))
      } catch (error) {
        console.error('Error cleaning up user storage:', error)
      }
    }
  }

  const switchUser = (username) => {
    setCurrentUser(username)
  }

  const value = { 
    trades, 
    setTrades, 
    settings, 
    setSettings, 
    cloudCfg, 
    setCloudCfg, 
    syncToCloud, 
    pullFromCloud,
    users,
    currentUser,
    addUser,
    updateUser,
    deleteUser,
    switchUser
  }
  return <StorageContext.Provider value={value}>{children}</StorageContext.Provider>
}

export function useStorage(){ return useContext(StorageContext) }
