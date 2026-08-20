import Image from 'next/image';
import { SignUpForm } from '@/components/SignUpForm';

export const metadata = {
  title: 'Sign Up — Note App',
  description: 'Create an account to start taking notes',
};

export default function SignUpPage() {
  return (
    <div className="flex w-full flex-col items-center">
      {/* Figma Illustration */}
      <div className="relative mb-3 h-[160px] w-[135px] flex-shrink-0">
        <Image
          src="/images/signup-character.png"
          alt="Sign up illustration"
          fill
          className="object-contain"
          priority
        />
      </div>

      {/* Figma Title */}
      <h1 className="mb-8 text-center font-serif text-[42px] leading-tight font-bold tracking-tight text-[#88642A] sm:text-[48px]">
        Yay, New Friend!
      </h1>

      {/* SignUp Form */}
      <SignUpForm />
    </div>
  );
}
