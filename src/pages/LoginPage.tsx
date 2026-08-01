import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input, Label } from '@/components/ui/Input'
import { Card } from '@/components/ui/Card'
import { Logo } from '@/components/layout/Logo'

export function LoginPage() {
  const { session, signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  if (session) return <Navigate to="/app" replace />

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const { error } = await signIn(email, password)
    setLoading(false)
    if (error) {
      setError(error)
      return
    }
    navigate('/app')
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-bg via-secondary/10 to-bg px-4">
      <Card className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Logo className="mx-auto h-12 w-12" />
          <h1 className="mt-2 font-heading text-xl font-bold text-text">Selamat Datang Kembali</h1>
          <p className="mt-1 text-sm text-muted">Masuk ke MichSya</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="kamu@email.com"
            />
          </div>
          <div>
            <Label>Password</Label>
            <Input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Memproses...' : 'Masuk'}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-muted">
          Belum punya akun?{' '}
          <Link to="/signup" className="font-semibold text-primary hover:underline">
            Daftar
          </Link>
        </p>
      </Card>
    </div>
  )
}
