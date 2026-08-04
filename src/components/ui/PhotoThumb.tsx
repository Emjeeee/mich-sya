import { useSignedUrl } from '@/hooks/useSignedUrl'
import { cn } from '@/lib/utils'

export function PhotoThumb({ path, className }: { path: string | null; className?: string }) {
  const { data: url, isLoading } = useSignedUrl(path)

  if (!path) {
    return (
      <div
        className={cn(
          'flex items-center justify-center rounded-lg bg-secondary/15 text-2xl',
          className,
        )}
      >
        📷
      </div>
    )
  }

  if (isLoading || !url) {
    return <div className={cn('animate-pulse rounded-lg bg-secondary/20', className)} />
  }

  return <img src={url} alt="" className={cn('animate-fadeIn rounded-lg object-cover', className)} />
}
