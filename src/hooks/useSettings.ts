import { useCallback } from 'react'
import { useStoreSettings, useUpdateSettings } from '@/hooks/useStoreSettings'
import { MARKUP_MIN, MARKUP_MAX, MARKUP_STEP } from '@/lib/constants'

interface SettingsToggles {
  promos: boolean
  estoque: boolean
  aniv: boolean
  resumo: boolean
}

export function useSettings() {
  const { data: settings } = useStoreSettings()
  const updateSettings = useUpdateSettings()

  const defaultMarkup = settings?.defaultMarkup ?? 180
  const monthlySalesGoal = settings?.monthlySalesGoal ?? 0

  const setMarkup = useCallback((value: number) => {
    const clamped = Math.max(MARKUP_MIN, Math.min(MARKUP_MAX, value))
    const stepped = Math.round(clamped / MARKUP_STEP) * MARKUP_STEP
    updateSettings.mutate({ default_markup: stepped })
  }, [updateSettings])

  const setMonthlySalesGoal = useCallback((value: number) => {
    const normalized = Number.isFinite(value) ? Math.max(0, Math.round(value * 100) / 100) : 0
    updateSettings.mutate({ monthly_sales_goal: normalized })
  }, [updateSettings])

  const toggles: SettingsToggles = {
    promos: settings?.togglePromos ?? true,
    estoque: settings?.toggleEstoque ?? true,
    aniv: settings?.toggleAniversario ?? true,
    resumo: settings?.toggleResumo ?? false,
  }

  const toggleSetting = useCallback((key: keyof SettingsToggles) => {
    const fieldMap: Record<keyof SettingsToggles, string> = {
      promos: 'toggle_promos',
      estoque: 'toggle_estoque',
      aniv: 'toggle_aniversario',
      resumo: 'toggle_resumo',
    }
    updateSettings.mutate({ [fieldMap[key]]: !toggles[key] })
  }, [toggles, updateSettings])

  return { defaultMarkup, setMarkup, monthlySalesGoal, setMonthlySalesGoal, toggles, toggleSetting }
}
