// Generate dates between Jan 2025 and Sep 2025
const generateDate = (start, end) => {
  const startDate = new Date(start).getTime()
  const endDate = new Date(end).getTime()
  const randomTime = startDate + Math.random() * (endDate - startDate)
  return new Date(randomTime).toISOString().split('T')[0]
}

// Strategies and their typical price ranges
const strategies = {
  'Iron Condor': { minPrice: 0.3, maxPrice: 1.5, winRate: 0.75 },
  'Credit Spread': { minPrice: 0.2, maxPrice: 1.0, winRate: 0.65 },
  'Debit Spread': { minPrice: 0.5, maxPrice: 2.0, winRate: 0.60 },
  'Covered Call': { minPrice: 0.8, maxPrice: 2.5, winRate: 0.80 },
  'Cash Secured Put': { minPrice: 1.0, maxPrice: 3.0, winRate: 0.70 },
}

const generatePrice = (min, max) => {
  return Number((min + Math.random() * (max - min)).toFixed(2))
}

// Generate 50 sample trades
export const defaultTrades = Array.from({ length: 50 }, (_, i) => {
  const strategy = Object.keys(strategies)[Math.floor(Math.random() * Object.keys(strategies).length)]
  const { minPrice, maxPrice, winRate } = strategies[strategy]
  
  // Generate entry date between Jan 2025 and Aug 2025
  const entryDate = generateDate('2025-01-01', '2025-08-15')
  
  // Generate exit date 1-30 days after entry date
  const exitDate = new Date(entryDate)
  exitDate.setDate(exitDate.getDate() + Math.floor(Math.random() * 30) + 1)
  
  const buyPrice = generatePrice(minPrice, maxPrice)
  // Determine if this trade is a winner based on strategy's win rate
  const isWinner = Math.random() < winRate
  
  // Generate exit price based on whether it's a winning trade
  const exitPrice = isWinner 
    ? generatePrice(buyPrice, buyPrice * 1.5) // winning trade
    : generatePrice(buyPrice * 0.5, buyPrice) // losing trade

  return {
    id: i + 1,
    strategy,
    entryDate,
    exitDate: exitDate.toISOString().split('T')[0],
    buyPrice,
    exitPrice,
    contracts: Math.floor(Math.random() * 3) + 1, // 1-3 contracts
    notes: `Sample ${strategy} trade ${i + 1}`
  }
})

// Sort trades by entry date
defaultTrades.sort((a, b) => new Date(a.entryDate) - new Date(b.entryDate))
