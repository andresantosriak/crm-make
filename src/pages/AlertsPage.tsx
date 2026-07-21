import { useNavigate } from 'react-router-dom'
import { BackButton } from '@/components/shared/BackButton'
import { useAlerts } from '@/hooks/useAlerts'

export default function AlertsPage() {
  const navigate = useNavigate()
  const { alerts, isPending } = useAlerts()

  return (
    <div className="px-5 pt-1.5 animate-fadeup">
      <div className="flex items-center gap-3 py-2 pb-[18px]">
        <BackButton onClick={() => navigate('/')} />
        <h1 className="font-display text-[28px] font-medium text-text-primary">Avisos</h1>
      </div>

      {isPending ? (
        <div className="flex justify-center py-10">
          <div
            className="h-8 w-8 animate-spin rounded-full border-2 border-t-transparent"
            style={{ borderColor: 'rgba(200,162,76,.3)', borderTopColor: 'transparent' }}
          />
        </div>
      ) : (
        alerts.map((alert, index) => (
          <div
            key={index}
            className="mb-2.5 flex gap-[13px] rounded-card bg-card p-[15px]"
            style={{ border: '1px solid rgba(233,220,198,.08)' }}
          >
            <div
              className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
              style={{ background: alert.dot }}
            />
            <div className="flex-1">
              <p
                className="text-[10px] font-medium uppercase tracking-[1.2px]"
                style={{ color: alert.dot }}
              >
                {alert.kind}
              </p>
              <p className="mt-1 text-[14px] leading-[1.5] text-text-primary">{alert.text}</p>
              <p className="mt-1.5 text-[12px] text-text-secondary">{alert.when}</p>
            </div>
          </div>
        ))
      )}
    </div>
  )
}
