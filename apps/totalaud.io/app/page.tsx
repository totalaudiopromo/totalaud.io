/**
 * TotalAud.io Landing Page
 * Redirects to OperatorOS
 */

'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/operator');
  }, [router]);

  return (
    <div className="fixed inset-0 bg-black flex items-center justify-center">
      <div className="text-[#3AA9BE] font-['JetBrains_Mono']">
        Loading OperatorOS...
      </div>
    </div>
  );
}
