import { ViewScale } from '@/stores/useTimelineStore'

export function getWeeksInRange(start: Date, weeks: number): Date[] {
  const result: Date[] = []
  const current = new Date(start)
  for (let i = 0; i < weeks; i++) {
    result.push(new Date(current))
    current.setDate(current.getDate() + 7)
  }
  return result
}

export function getMonthsInRange(start: Date, months: number): Date[] {
  const result: Date[] = []
  const current = new Date(start)
  current.setDate(1)
  for (let i = 0; i < months; i++) {
    result.push(new Date(current))
    current.setMonth(current.getMonth() + 1)
  }
  return result
}

export function getQuartersInRange(start: Date, quarters: number): Date[] {
  const result: Date[] = []
  const current = new Date(start)
  const quarterMonth = Math.floor(current.getMonth() / 3) * 3
  current.setMonth(quarterMonth, 1)
  for (let i = 0; i < quarters; i++) {
    result.push(new Date(current))
    current.setMonth(current.getMonth() + 3)
  }
  return result
}

export function formatWeek(date: Date): string {
  const day = date.getDate()
  const month = date.toLocaleDateString('en-GB', { month: 'short' })
  return `${day} ${month}`
}

export function formatMonth(date: Date): string {
  return date.toLocaleDateString('en-GB', { month: 'short', year: '2-digit' })
}

export function formatQuarter(date: Date): string {
  const quarter = Math.floor(date.getMonth() / 3) + 1
  const year = date.getFullYear().toString().slice(-2)
  return `Q${quarter} '${year}`
}

export const VIEW_SCALE_CONFIG: Record<
  ViewScale,
  { count: number; columnWidth: number; daysPerUnit: number }
> = {
  weeks: { count: 12, columnWidth: 120, daysPerUnit: 7 },
  months: { count: 6, columnWidth: 180, daysPerUnit: 30 },
  quarters: { count: 4, columnWidth: 240, daysPerUnit: 91 },
}
