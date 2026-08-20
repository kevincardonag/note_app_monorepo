import Image from 'next/image';
import { LoginForm } from '@/components/LoginForm';

export const metadata = {
  title: 'Login — Note App',
  description: 'Sign in to access your notes',
};

export default function LoginPage() {
  return (
    <div className="flex w-full flex-col items-center">
      {/* Figma Illustration */}
      <div className="relative mb-4 h-[114px] w-[96px] flex-shrink-0">
        <Image
          src="/images/login-character.png"
          alt="Login illustration"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Figma Title */}
      <h1 className="mb-8 text-center font-serif text-[42px] leading-tight font-bold tracking-tight text-[#88642A] sm:text-[48px]">
        Yay, You&apos;re Back!
      </h1>

      {/* Login Form */}
      <LoginForm />
    </div>
  );
}
