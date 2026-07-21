import type { Client, ClientTag } from '@/types'

export function getClientName(clientId: string | null, clients: Client[]): string {
  if (!clientId) return 'Consumidor final'
  const client = clients.find((c) => c.id === clientId)
  return client?.name ?? 'Cliente removido'
}

export function daysUntilBirthday(birthday: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const bMonth = parseInt(birthday.slice(5, 7))
  const bDay = parseInt(birthday.slice(8, 10))

  const thisYear = new Date(today.getFullYear(), bMonth - 1, bDay)
  thisYear.setHours(0, 0, 0, 0)

  if (thisYear >= today) {
    return Math.round((thisYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  }

  const nextYear = new Date(today.getFullYear() + 1, bMonth - 1, bDay)
  nextYear.setHours(0, 0, 0, 0)
  return Math.round((nextYear.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

export function getClientTags(
  birthday: string | null,
  totalSpent: number,
  vipThreshold: number,
  birthdayAlertDays: number,
): ClientTag[] {
  const tags: ClientTag[] = []

  if (totalSpent >= vipThreshold) {
    tags.push({ label: 'VIP', bg: 'rgba(143,169,138,.16)', color: '#8FA98A' })
  }

  if (birthday) {
    const days = daysUntilBirthday(birthday)
    if (days <= birthdayAlertDays) {
      tags.push({ label: 'ANIVERSÁRIO', bg: 'rgba(200,162,76,.16)', color: '#d9b869' })
    }
  }

  return tags
}
