export function floor90(v: number): number {
  return Math.floor(v - 0.90 + 1e-9) + 0.90
}

export function ceil90(v: number): number {
  return Math.ceil(v - 0.90 - 1e-9) + 0.90
}

export function round90(v: number): number {
  const d = floor90(v)
  const u = ceil90(v)
  return (v - d) <= (u - v) ? d : u
}

export function calcMarkup(cost: number, price: number): number {
  if (cost <= 0) return 0
  return ((price - cost) / cost) * 100
}

export function calcMargin(cost: number, price: number): number {
  if (price <= 0) return 0
  return ((price - cost) / price) * 100
}
