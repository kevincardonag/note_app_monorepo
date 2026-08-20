'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { signupAction, type AuthState } from '@/app/actions/auth';

export function SignUpForm() {
  const [state, formAction, isPending] = useActionState<
    AuthState | null,
    FormData
  >(signupAction, null);
  const [showPassword, setShowPassword] = useState(false);

  return (
    <form action={formAction} className="w-full space-y-4">
      {state?.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-300 bg-red-100/70 p-3 text-center text-xs text-red-800"
        >
          {state.error}
        </div>
      )}

      {/* Email Input */}
      <div>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          aria-label="Email address"
          placeholder="Email address"
          className="h-11 w-full rounded-[6px] border border-[#957139] bg-transparent px-4 text-xs font-normal text-zinc-900 placeholder-[#957139]/70 transition focus:ring-1 focus:ring-[#957139] focus:outline-none"
        />
      </div>

      {/* Password Input */}
      <div className="relative">
        <input
          id="password"
          name="password"
          type={showPassword ? 'text' : 'password'}
          required
          autoComplete="new-password"
          aria-label="Password"
          placeholder="Password"
          className="h-11 w-full rounded-[6px] border border-[#957139] bg-transparent px-4 pr-11 text-xs font-normal text-zinc-900 placeholder-[#957139]/70 transition focus:ring-1 focus:ring-[#957139] focus:outline-none"
        />
        <button
          type="button"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          onClick={() => setShowPassword(!showPassword)}
          className="absolute top-1/2 right-3 -translate-y-1/2 p-1 text-[#957139] transition hover:opacity-80"
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>

      {/* Submit Button */}
      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="flex h-11 w-full cursor-pointer items-center justify-center gap-2 rounded-full border border-[#957139] bg-transparent text-base font-bold text-[#957139] transition-colors duration-200 hover:bg-[#957139] hover:text-[#FAF1E3] disabled:opacity-50"
        >
          {isPending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <span>Sign Up</span>
          )}
        </button>
      </div>

      {/* Figma Link: "We’re already friends!" */}
      <div className="pt-2 text-center">
        <Link
          href="/login"
          className="text-xs font-normal text-[#957139] underline transition hover:opacity-80"
        >
          We’re already friends!
        </Link>
      </div>
    </form>
  );
}
