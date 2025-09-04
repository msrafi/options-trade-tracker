
export const uid = () => crypto.randomUUID?.() || Math.random().toString(36).slice(2)
export const fmt = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' })
export const fmtPct = (x) => `${(x * 100).toFixed(1)}%`
export const parseNum = (x) => (x === '' || x == null ? 0 : Number(x))

export const monthKey = (d) => {
  const date = new Date(d)
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}`
}

export const toISO = (s) => {
  if (!s) return new Date().toISOString().slice(0,10)
  const str = String(s).trim()
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str
  const parts = str.split('/')
  if (parts.length === 2) {
    const [mm, dd] = parts; const yyyy = new Date().getFullYear()
    return `${yyyy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`
  }
  if (parts.length === 3) {
    const [mm, dd, yyyy] = parts
    return `${yyyy}-${String(mm).padStart(2,'0')}-${String(dd).padStart(2,'0')}`
  }
  return str
}

export const moneyToNum = (s) => Number(String(s).replace(/[^\d.-]/g, '')) || 0
