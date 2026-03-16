'use client';

import { FormEvent, useEffect, useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { signIn, useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function SignInPage() {
  const router = useRouter();
  const { status } = useSession();
  const [email, setEmail] = useState('demo@example.com');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/');
    }
  }, [status, router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    const response = await signIn('credentials', {
      email,
      redirect: false,
      callbackUrl: '/',
    });
    setIsSubmitting(false);
    if (response?.error) {
      setError(response.error);
      return;
    }
    router.push(response?.url || '/');
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4 text-stone-500">
          <Loader2 className="animate-spin" size={32} />
          <span>Checking your session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-md rounded-[2.5rem] bg-white border border-stone-100 shadow-2xl p-10 space-y-6">
        <div className="flex items-center gap-3 text-stone-500">
          <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Sign in to MoodFlow</h1>
            <p className="text-xs uppercase tracking-[0.4em] text-stone-400">demo credentials</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <label className="text-xs uppercase tracking-[0.4em] text-stone-400 font-bold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="w-full rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium text-stone-900 focus:border-stone-900 focus:outline-none"
            required
          />

          {error && (
            <div className="text-xs text-rose-500 font-bold tracking-[0.3em] uppercase">{error}</div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-2xl px-4 py-3 text-sm font-bold uppercase tracking-widest transition ${
              isSubmitting ? 'bg-stone-100 text-stone-300 cursor-not-allowed' : 'bg-stone-900 text-white hover:scale-105'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Signing in
              </div>
            ) : (
              'Continue with Demo'
            )}
          </button>
        </form>

        <p className="text-xs text-stone-400 leading-relaxed">
          MoodFlow uses a lightweight credential provider for quick demos. The submitted email is used only to
          seed your personalized session history.
        </p>

        <Link href="/" className="text-xs font-bold uppercase tracking-[0.3em] text-stone-500 hover:text-stone-900">
          Back to home
        </Link>
      </div>
    </div>
  );
}
