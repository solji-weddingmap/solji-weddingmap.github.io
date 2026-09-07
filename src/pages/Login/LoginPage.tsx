import { useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Camera, UserRound } from 'lucide-react'
import ErrorBanner from '@/components/common/ErrorBanner'
import { signIn, signUp } from '@/services/authService'
import { useAuth } from '@/context/AuthContext'
import { cn } from '@/utils/cn'

type Mode = 'login' | 'signup'

export default function LoginPage() {
  const navigate = useNavigate()
  const { refreshProfile, authAvailable } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupDone, setSignupDone] = useState(false)

  function handleAvatarPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = () => setAvatarPreview(typeof reader.result === 'string' ? reader.result : null)
    reader.readAsDataURL(file)
  }

  function switchMode(next: Mode) {
    setMode(next)
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!email.trim() || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }
    if (mode === 'signup' && !nickname.trim()) {
      setError('닉네임을 입력해주세요.')
      return
    }

    setSubmitting(true)
    try {
      if (mode === 'signup') {
        await signUp({ email: email.trim(), password, nickname: nickname.trim(), avatarFile })
        setSignupDone(true)
      } else {
        await signIn({ email: email.trim(), password })
        await refreshProfile()
        navigate('/my', { replace: true })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '요청을 처리하지 못했습니다.')
    } finally {
      setSubmitting(false)
    }
  }

  if (!authAvailable) {
    return (
      <div className="flex h-screen flex-col bg-beige">
        <PageHeader onBack={() => navigate(-1)} title="로그인" />
        <div className="flex flex-1 items-center justify-center px-6 text-center">
          <p className="text-sm text-subtext">
            로그인 기능을 사용할 수 없습니다.
            <br />
            잠시 후 다시 시도해주세요.
          </p>
        </div>
      </div>
    )
  }

  if (signupDone) {
    return (
      <div className="flex h-screen flex-col bg-beige">
        <PageHeader onBack={() => navigate(-1)} title="회원가입" />
        <div className="mx-auto flex w-full max-w-sm flex-1 flex-col items-center justify-center px-6 py-10 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-olive-light">
            <UserRound size={36} className="text-olive-dark" strokeWidth={1.75} />
          </div>
          <h1 className="mt-6 text-lg font-bold text-ink">회원가입이 완료되었습니다!</h1>
          <p className="mt-2 text-sm text-subtext">
            가입하신 이메일과 비밀번호로 로그인하고
            <br />
            내가 등록한 웨딩홀, 최근 본 웨딩홀을 계속 확인해보세요.
          </p>
          <button
            type="button"
            onClick={() => {
              setSignupDone(false)
              setMode('login')
              setPassword('')
            }}
            className="mt-8 w-full rounded-full bg-olive py-3 text-sm font-semibold text-white transition hover:bg-olive-dark"
          >
            로그인하러 가기
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen flex-col overflow-y-auto bg-beige">
      <PageHeader onBack={() => navigate(-1)} title={mode === 'login' ? '로그인' : '회원가입'} />

      <form onSubmit={handleSubmit} className="mx-auto w-full max-w-sm flex-1 px-5 py-8">
        {mode === 'signup' && (
          <div className="mb-6 flex flex-col items-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="relative flex h-24 w-24 items-center justify-center overflow-hidden rounded-full border border-line bg-white"
              aria-label="프로필 사진 선택"
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="프로필 사진 미리보기" className="h-full w-full object-cover" />
              ) : (
                <UserRound size={36} className="text-subtext" strokeWidth={1.5} />
              )}
              <span className="absolute bottom-0 right-0 flex h-7 w-7 items-center justify-center rounded-full bg-olive text-white shadow-card">
                <Camera size={13} />
              </span>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarPick} className="hidden" />
            <p className="mt-2 text-xs text-subtext">프로필 사진 (선택)</p>
          </div>
        )}

        <div className="space-y-4">
          {mode === 'signup' && (
            <Field label="닉네임">
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="사용하실 닉네임을 입력해주세요"
                maxLength={20}
                className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-olive"
              />
            </Field>
          )}

          <Field label="이메일">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@email.com"
              autoComplete="email"
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-olive"
            />
          </Field>

          <Field label="비밀번호">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="6자 이상 입력해주세요"
              autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
              className="w-full rounded-xl border border-line bg-white px-4 py-3 text-sm text-ink outline-none focus:border-olive"
            />
          </Field>
        </div>

        {error && (
          <div className="mt-4">
            <ErrorBanner message={error} />
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 w-full rounded-full bg-olive py-3 text-sm font-semibold text-white transition hover:bg-olive-dark disabled:opacity-60"
        >
          {submitting ? '처리 중...' : mode === 'login' ? '로그인' : '회원가입'}
        </button>

        <div className="mt-5 flex items-center justify-center gap-1.5 text-sm">
          <span className="text-subtext">{mode === 'login' ? '아직 계정이 없으신가요?' : '이미 계정이 있으신가요?'}</span>
          <button
            type="button"
            onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
            className="font-semibold text-olive"
          >
            {mode === 'login' ? '회원가입' : '로그인'}
          </button>
        </div>
      </form>
    </div>
  )
}

function PageHeader({ onBack, title }: { onBack: () => void; title: string }) {
  return (
    <div className="flex shrink-0 items-center gap-3 border-b border-line bg-white px-4 py-3">
      <button type="button" onClick={onBack} aria-label="뒤로 가기" className="text-ink">
        <ArrowLeft size={22} />
      </button>
      <h1 className="text-base font-semibold text-ink">{title}</h1>
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className={cn('block')}>
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  )
}
