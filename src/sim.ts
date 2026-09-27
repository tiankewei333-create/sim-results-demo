export type SimInputs = {
  monthlyVisitors: number
  conversionRate: number
  averageOrderValue: number
  monthlyAdSpend: number
}

export type SimResults = {
  leads: number
  revenue: number
  profit: number
  roas: number
  costPerLead: number
  breakEvenConversion: number
}

export function runSimulation(input: SimInputs): SimResults {
  const leads = Math.round(input.monthlyVisitors * (input.conversionRate / 100))
  const revenue = leads * input.averageOrderValue
  const profit = revenue - input.monthlyAdSpend
  const roas = input.monthlyAdSpend > 0 ? revenue / input.monthlyAdSpend : 0
  const costPerLead = leads > 0 ? input.monthlyAdSpend / leads : 0
  const breakEvenConversion =
    input.monthlyVisitors > 0 && input.averageOrderValue > 0
      ? (input.monthlyAdSpend / input.monthlyVisitors / input.averageOrderValue) * 100
      : 0

  return {
    leads,
    revenue,
    profit,
    roas,
    costPerLead,
    breakEvenConversion,
  }
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatNumber(value: number, digits = 0): string {
  return new Intl.NumberFormat('en-US', {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  }).format(value)
}
