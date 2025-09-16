import { useState, useEffect } from 'react'
import { uid } from '../features/trades/utils'

// Dummy users with realistic data
const DUMMY_USERS = [
  {
    id: 'user-1',
    name: 'Alex Chen',
    email: 'alex.chen@email.com',
    avatar: '👨‍💼',
    role: 'Day Trader',
    joinDate: '2024-01-15',
    totalTrades: 0,
    totalPnL: 0
  },
  {
    id: 'user-2', 
    name: 'Sarah Johnson',
    email: 'sarah.j@email.com',
    avatar: '👩‍💻',
    role: 'Swing Trader',
    joinDate: '2024-02-20',
    totalTrades: 0,
    totalPnL: 0
  },
  {
    id: 'user-3',
    name: 'Mike Rodriguez',
    email: 'mike.r@email.com', 
    avatar: '👨‍🎓',
    role: 'Options Specialist',
    joinDate: '2024-03-10',
    totalTrades: 0,
    totalPnL: 0
  },
  {
    id: 'user-4',
    name: 'Emma Davis',
    email: 'emma.davis@email.com',
    avatar: '👩‍🔬',
    role: 'Quantitative Analyst',
    joinDate: '2024-04-05',
    totalTrades: 0,
    totalPnL: 0
  },
  {
    id: 'user-5',
    name: 'David Kim',
    email: 'david.kim@email.com',
    avatar: '👨‍🚀',
    role: 'Hedge Fund Manager',
    joinDate: '2024-05-12',
    totalTrades: 0,
    totalPnL: 0
  }
]

// Generate realistic dummy trades for each user
const generateDummyTrades = (userId, userName) => {
  const trades = []
  const symbols = ['AAPL', 'TSLA', 'MSFT', 'GOOGL', 'AMZN', 'NVDA', 'META', 'NFLX', 'AMD', 'INTC']
  const strategies = ['Long Call', 'Short Put', 'Iron Condor', 'Straddle', 'Butterfly', 'Covered Call', 'Cash Secured Put']
  const statuses = ['open', 'closed']
  
  // Generate 20 trades per user
  for (let i = 0; i < 20; i++) {
    const entryDate = new Date()
    entryDate.setDate(entryDate.getDate() - Math.floor(Math.random() * 180)) // Random date within last 6 months
    
    const isClosed = Math.random() > 0.3 // 70% chance of being closed
    const exitDate = isClosed ? new Date(entryDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000) : null
    
    const quantity = Math.floor(Math.random() * 10) + 1
    const entryPrice = Math.random() * 200 + 50
    const exitPrice = isClosed ? entryPrice + (Math.random() - 0.5) * 50 : null
    
    const pnl = isClosed ? (exitPrice - entryPrice) : 0 // Simple P&L calculation
    
    trades.push({
      id: uid(),
      userId: userId,
      symbol: symbols[Math.floor(Math.random() * symbols.length)],
      strategy: strategies[Math.floor(Math.random() * strategies.length)],
      type: Math.random() > 0.5 ? 'option' : 'stock',
      quantity: quantity,
      entryDate: entryDate.toISOString().split('T')[0],
      entryPrice: Number(entryPrice.toFixed(2)),
      exitDate: exitDate ? exitDate.toISOString().split('T')[0] : null,
      exitPrice: exitPrice ? Number(exitPrice.toFixed(2)) : null,
      status: isClosed ? 'closed' : 'open',
      pnl: Number(pnl.toFixed(2)),
      notes: `Trade ${i + 1} for ${userName}`,
      createdAt: entryDate.toISOString(),
      updatedAt: entryDate.toISOString(),
      // Add option details for option trades
      ...(Math.random() > 0.5 ? {
        option: {
          side: Math.random() > 0.5 ? 'call' : 'put',
          strike: Number((entryPrice * (0.8 + Math.random() * 0.4)).toFixed(2)),
          expiration: new Date(entryDate.getTime() + Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        }
      } : {})
    })
  }
  
  return trades
}

export const useUserManagement = () => {
  const [currentUser, setCurrentUser] = useState(null)
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  // Initialize users and current user
  useEffect(() => {
    const initializeUsers = () => {
      try {
        // Clear existing data to regenerate with correct structure (uncomment to reset data)
        // localStorage.removeItem('trading-app-users')
        // localStorage.removeItem('trading-app-current-user')
        // for (let i = 1; i <= 5; i++) {
        //   localStorage.removeItem(`trades-user-${i}`)
        // }
        
        // Get users from localStorage or create dummy users
        let storedUsers = localStorage.getItem('trading-app-users')
        
        if (!storedUsers) {
          // Create dummy users with trades
          const usersWithTrades = DUMMY_USERS.map(user => {
            const trades = generateDummyTrades(user.id, user.name)
            const totalTrades = trades.length
            const totalPnL = trades.reduce((sum, trade) => sum + (trade.pnl || 0), 0)
            
            // Store trades for this user
            localStorage.setItem(`trades-${user.id}`, JSON.stringify(trades))
            
            return {
              ...user,
              totalTrades,
              totalPnL: Number(totalPnL.toFixed(2))
            }
          })
          
          setUsers(usersWithTrades)
          localStorage.setItem('trading-app-users', JSON.stringify(usersWithTrades))
        } else {
          setUsers(JSON.parse(storedUsers))
        }
        
        // Set current user (default to first user or last selected)
        const lastSelectedUser = localStorage.getItem('trading-app-current-user')
        if (lastSelectedUser) {
          const user = JSON.parse(storedUsers || '[]').find(u => u.id === lastSelectedUser)
          if (user) {
            setCurrentUser(user)
          } else {
            setCurrentUser(JSON.parse(storedUsers || '[]')[0])
          }
        } else {
          setCurrentUser(JSON.parse(storedUsers || '[]')[0])
        }
        
      } catch (error) {
        console.error('Error initializing users:', error)
        // Fallback to first dummy user
        setUsers([DUMMY_USERS[0]])
        setCurrentUser(DUMMY_USERS[0])
      } finally {
        setIsLoading(false)
      }
    }

    initializeUsers()
  }, [])

  // Switch to a different user
  const switchUser = (user) => {
    setCurrentUser(user)
    localStorage.setItem('trading-app-current-user', user.id)
  }

  // Get trades for current user
  const getUserTrades = () => {
    if (!currentUser) return []
    
    try {
      const trades = localStorage.getItem(`trades-${currentUser.id}`)
      return trades ? JSON.parse(trades) : []
    } catch (error) {
      console.error('Error getting user trades:', error)
      return []
    }
  }

  // Save trades for current user
  const saveUserTrades = (trades) => {
    if (!currentUser) return
    
    try {
      localStorage.setItem(`trades-${currentUser.id}`, JSON.stringify(trades))
      
      // Update user stats
      const totalTrades = trades.length
      const totalPnL = trades.reduce((sum, trade) => {
        // Use pnl field if available, otherwise calculate from exit/entry prices
        if (trade.pnl !== undefined) {
          return sum + trade.pnl
        } else if (trade.exitPrice && trade.entryPrice) {
          return sum + (trade.exitPrice - trade.entryPrice)
        }
        return sum
      }, 0)
      
      const updatedUsers = users.map(user => 
        user.id === currentUser.id 
          ? { ...user, totalTrades, totalPnL: Number(totalPnL.toFixed(2)) }
          : user
      )
      
      setUsers(updatedUsers)
      setCurrentUser(prev => ({ ...prev, totalTrades, totalPnL: Number(totalPnL.toFixed(2)) }))
      localStorage.setItem('trading-app-users', JSON.stringify(updatedUsers))
      
    } catch (error) {
      console.error('Error saving user trades:', error)
    }
  }

  // Add a new trade for current user
  const addUserTrade = (trade) => {
    const currentTrades = getUserTrades()
    const newTrade = {
      ...trade,
      id: uid(),
      userId: currentUser.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    const updatedTrades = [...currentTrades, newTrade]
    saveUserTrades(updatedTrades)
    return newTrade
  }

  // Update a trade for current user
  const updateUserTrade = (tradeId, updates) => {
    const currentTrades = getUserTrades()
    const updatedTrades = currentTrades.map(trade => 
      trade.id === tradeId 
        ? { ...trade, ...updates, updatedAt: new Date().toISOString() }
        : trade
    )
    saveUserTrades(updatedTrades)
  }

  // Delete a trade for current user
  const deleteUserTrade = (tradeId) => {
    const currentTrades = getUserTrades()
    const updatedTrades = currentTrades.filter(trade => trade.id !== tradeId)
    saveUserTrades(updatedTrades)
  }

  // User management functions
  const addUser = (userData) => {
    const newUser = {
      id: uid(),
      ...userData,
      joinDate: new Date().toISOString().split('T')[0],
      totalTrades: 0,
      totalPnL: 0
    }
    
    const updatedUsers = [...users, newUser]
    setUsers(updatedUsers)
    localStorage.setItem('trading-app-users', JSON.stringify(updatedUsers))
    
    // Initialize empty trades for new user
    localStorage.setItem(`trades-${newUser.id}`, JSON.stringify([]))
    
    return newUser
  }

  const editUser = (userId, userData) => {
    const updatedUsers = users.map(user => 
      user.id === userId 
        ? { ...user, ...userData }
        : user
    )
    
    setUsers(updatedUsers)
    localStorage.setItem('trading-app-users', JSON.stringify(updatedUsers))
    
    // Update current user if it's the one being edited
    if (currentUser?.id === userId) {
      setCurrentUser({ ...currentUser, ...userData })
    }
  }

  const deleteUser = (userId) => {
    // Don't allow deleting the last user
    if (users.length <= 1) {
      alert('Cannot delete the last user. At least one user must remain.')
      return
    }
    
    const updatedUsers = users.filter(user => user.id !== userId)
    setUsers(updatedUsers)
    localStorage.setItem('trading-app-users', JSON.stringify(updatedUsers))
    
    // Delete user's trades
    localStorage.removeItem(`trades-${userId}`)
    
    // If deleted user was current user, switch to first remaining user
    if (currentUser?.id === userId) {
      const newCurrentUser = updatedUsers[0]
      setCurrentUser(newCurrentUser)
      localStorage.setItem('trading-app-current-user', newCurrentUser.id)
    }
  }

  return {
    currentUser,
    users,
    isLoading,
    switchUser,
    getUserTrades,
    saveUserTrades,
    addUserTrade,
    updateUserTrade,
    deleteUserTrade,
    addUser,
    editUser,
    deleteUser
  }
}
