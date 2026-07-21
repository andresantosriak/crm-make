import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Target } from 'lucide-react'
import { toast } from 'sonner'
import { useStoreSettings, useUpdateSettings } from '@/hooks/useStoreSettings'
import { formatCurrency } from '@/lib/utils'

function parseCurrencyInput(value: string) {
  const normalized = value.trim().replace(/\./g, '').replace(',', '.')
  if (!normalized) return 0
  return Number(normalized)
}

export function MonthlyGoalControl() {
  const { data: settings } = useStoreSettings()
  const updateSettings = useUpdateSettings()
  const monthlySalesGoal = settings?.monthlySalesGoal ?? 0
  const [goalInput, setGoalInput] = useState('')
  const [savedFeedback, setSavedFeedback] = useState(false)

  useEffect(() => {
    setGoalInput(monthlySalesGoal > 0 ? String(monthlySalesGoal).replace('.', ',') : '')
  }, [monthlySalesGoal])

  const parsedGoal = useMemo(() => parseCurrencyInput(goalInput), [goalInput])
  const isInvalid = goalInput.trim().length > 0 && (!Number.isFinite(parsedGoal) || parsedGoal < 0)

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault()
    if (isInvalid) return

    const normalized = Number.isFinite(parsedGoal)
      ? Math.max(0, Math.round(parsedGoal * 100) / 100)
      : 0

    updateSettings.mutate(
      { monthly_sales_goal: normalized },
      {
        onSuccess: () => {
          setSavedFeedback(true)
          toast.success('Meta mensal salva')
        },
      },
    )
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-[16px] bg-card p-4"
      style={{ border: '1px solid rgba(233,220,198,.08)' }}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-[12px]"
          style={{ background: 'rgba(200,162,76,.14)' }}
        >
          <Target size={18} strokeWidth={1.8} className="text-gold" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[14px] text-text-primary">Meta mensal de vendas</p>
          <p className="mt-0.5 text-[12px] text-text-secondary">
            Atual: {monthlySalesGoal > 0 ? formatCurrency(monthlySalesGoal) : 'não configurada'}
          </p>
        </div>
      </div>

      <div className="mt-3 flex gap-2">
        <input
          value={goalInput}
          onChange={(event) => {
            setGoalInput(event.target.value)
            setSavedFeedback(false)
          }}
          inputMode="decimal"
          placeholder="Ex: 10000,00"
          className="min-w-0 flex-1 rounded-[10px] bg-app-bg px-3.5 py-3 text-[14px] text-text-primary outline-none"
          style={{ border: `1px solid ${isInvalid ? 'rgba(208,124,103,.55)' : 'rgba(233,220,198,.10)'}` }}
        />
        <button
          type="submit"
          disabled={isInvalid || updateSettings.isPending}
          className="rounded-[10px] border-none px-4 text-[13px] font-semibold cursor-pointer"
          style={{ background: 'linear-gradient(135deg, #d6b25c, #b78d3d)', color: '#1a1408' }}
        >
          {updateSettings.isPending ? 'Salvando...' : 'Salvar'}
        </button>
      </div>

      {isInvalid && (
        <p className="mt-2 text-[12px] text-danger">Informe um valor válido para a meta.</p>
      )}
      {savedFeedback && (
        <p className="mt-2 text-[12px] text-success">Meta salva com sucesso.</p>
      )}
      {updateSettings.isError && (
        <p className="mt-2 text-[12px] text-danger">
          {updateSettings.error instanceof Error ? updateSettings.error.message : 'Erro ao salvar meta.'}
        </p>
      )}
    </form>
  )
}
