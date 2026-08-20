import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#FAF1E3] p-4 sm:p-6 lg:p-8">
      <div className="flex w-full max-w-[384px] flex-col items-center">
        {children}
      </div>
    </div>
  );
}
