import { Link } from 'react-router-dom'
import { Logo } from '@/components/layout/Logo'
import { usePublicCoverPhoto } from '@/hooks/useCoverPhoto'

export function LandingPage() {
  const { url: coverUrl } = usePublicCoverPhoto()

  return (
    <div className="min-h-screen bg-gradient-to-b from-bg via-secondary/10 to-bg">
      <div className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <Logo className="h-16 w-16" />

        {/* Uploaded from Pengaturan → Foto Sampul; falls back to a placeholder until then. */}
        <div className="mt-6 flex h-56 w-56 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-gradient-to-br from-primary/30 via-secondary/40 to-accent/30 shadow-glow sm:h-64 sm:w-64">
          {coverUrl ? (
            <img src={coverUrl} alt="Michael & Ruth" className="h-full w-full object-cover" />
          ) : (
            <span className="text-6xl">📷</span>
          )}
        </div>

        <h1 className="mt-8 font-heading text-3xl font-extrabold text-text sm:text-4xl">
          Mich<span className="text-primary">Sya</span>
        </h1>
        <p className="mt-1 font-body text-sm font-medium text-muted">Michael &amp; Ruth Jastine Anatasya</p>
        <p className="mt-3 max-w-md font-body text-sm text-muted sm:text-base">
          Ruang kecil untuk menyimpan cerita, rencana, dan mimpi kita berdua — dari wishlist,
          kenangan, sampai surat untuk masa depan.
        </p>

        <Link
          to="/login"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-primary px-8 py-3 font-body text-sm font-semibold text-white shadow-glow transition hover:opacity-90"
        >
          Masuk ke Ruang Kita
        </Link>

        <p className="mt-16 text-xs text-muted">Dibuat dengan 💗 untuk kita berdua.</p>
      </div>
    </div>
  )
}
