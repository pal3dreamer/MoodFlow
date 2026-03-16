'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { Loader2, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email || !name) {
      setError('Name and email are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, name }),
    });

    setIsSubmitting(false);

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      setError((body as any).error || 'Failed to register');
      return;
    }

    setSuccess(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-md rounded-[2.5rem] bg-white border border-stone-100 p-10 shadow-2xl space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-stone-900 text-white flex items-center justify-center">
            <Sparkles size={20} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.4em] text-stone-400">MoodFlow Access</p>
            <h1 className="text-2xl font-serif font-bold text-stone-900">Create your workspace</h1>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-[10px] uppercase tracking-[0.4em] text-stone-400">Name</label>
            <input
              type="text"
              className="w-full mt-1 rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Maya"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase tracking-[0.4em] text-stone-400">Email</label>
            <input
              type="email"
              className="w-full mt-1 rounded-2xl border border-stone-200 px-4 py-3 text-sm font-medium"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
            />
          </div>

          {error && <p className="text-xs text-rose-500 uppercase tracking-[0.3em]">{error}</p>}
          {success && <p className="text-xs text-emerald-600 uppercase tracking-[0.3em]">Account ready, proceed to sign in.</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full rounded-2xl uppercase tracking-[0.3em] py-3 text-sm font-bold transition ${
              isSubmitting ? 'bg-stone-100 text-stone-400 cursor-not-allowed' : 'bg-stone-900 text-white hover:scale-105'
            }`}
          >
            {isSubmitting ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Creating account
              </div>
            ) : (
              'Register'
            )}
          </button>
        </form>

        <p className="text-xs text-stone-400">
          Already have access?{' '}
          <Link href="/auth/signin" className="font-bold text-stone-900">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
