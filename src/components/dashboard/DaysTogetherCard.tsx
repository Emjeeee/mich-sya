import { Card } from '@/components/ui/Card'
import { useCountdown } from '@/hooks/useCountdown'
import { zonedMidnightMs, pad2 } from '@/lib/dates'

export function DaysTogetherCard({ anniversaryDate }: { anniversaryDate: string | null }) {
  const referenceMs = anniversaryDate ? zonedMidnightMs(anniversaryDate) : null
  const duration = useCountdown(referenceMs, 'up')

  return (
    <Card className="bg-gradient-to-br from-card to-secondary/10 md:col-span-2">
      <p className="text-center font-body text-xs font-semibold uppercase tracking-widest text-muted">
        Sudah berapa lama kita bersama
      </p>
      {duration ? (
        <>
          <p className="mt-3 text-center font-number text-6xl font-bold tabular-nums text-primary sm:text-7xl">
            {duration.days.toLocaleString('id-ID')}
          </p>
          <p className="mt-1 text-center font-heading text-sm font-semibold tracking-wide text-secondary">
            HARI DALAM CINTA
          </p>
          <div className="mx-auto mt-5 grid max-w-xs grid-cols-3 gap-3">
            {[
              { label: 'Jam', value: duration.hours },
              { label: 'Menit', value: duration.minutes },
              { label: 'Detik', value: duration.seconds },
            ].map((unit) => (
              <div key={unit.label} className="rounded-xl bg-card py-2.5 text-center">
                <p className="font-number text-2xl font-bold tabular-nums text-text">
                  {pad2(unit.value)}
                </p>
                <p className="text-[10px] uppercase tracking-wide text-muted">{unit.label}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="mt-4 text-center text-sm text-muted">
          Tanggal jadian belum diatur — isi di halaman Pengaturan.
        </p>
      )}
    </Card>
  )
}
