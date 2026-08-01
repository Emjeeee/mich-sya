import { cn } from '@/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        // The mark's dark ink only reads on a light backdrop, so the chip stays
        // white in both themes; the ring gives it edge definition on dark backgrounds.
        'flex shrink-0 items-center justify-center rounded-xl bg-white p-1.5 shadow-sm ring-1 ring-black/5 dark:ring-white/10',
        className,
      )}
    >
      <img src="/MichSya_Logo.png" alt="MichSya" className="h-full w-full object-contain" />
    </span>
  )
}
