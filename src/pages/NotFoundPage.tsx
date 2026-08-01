import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg text-center text-text">
      <span className="text-4xl">💔</span>
      <p className="font-heading text-lg font-semibold">Halaman tidak ditemukan</p>
      <Link to="/" className="text-sm font-semibold text-primary hover:underline">
        Kembali ke beranda
      </Link>
    </div>
  )
}
