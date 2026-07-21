import { useNavigate } from 'react-router-dom'
import { BackButton } from '@/components/shared/BackButton'
import { SophiaIntroCard } from '@/components/promo/SophiaIntroCard'
import { PromoCard } from '@/components/promo/PromoCard'
import { promos } from '@/data/promos'

export default function PromosPage() {
  const navigate = useNavigate()

  return (
    <div className="px-5 pt-1.5 animate-fadeup">
      <div className="flex items-center gap-3 py-2 pb-4">
        <BackButton onClick={() => navigate('/')} />
        <h1 className="font-display text-[28px] font-medium text-text-primary">Promoções</h1>
      </div>

      <SophiaIntroCard />

      <div className="mt-3.5 flex flex-col gap-3">
        {promos.map((promo, index) => (
          <PromoCard key={index} promo={promo} />
        ))}
      </div>
    </div>
  )
}
