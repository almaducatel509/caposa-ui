"use client";

import { useEffect, useState } from 'react';
import { HiArrowRight } from "react-icons/hi2";
import Link from 'next/link';
import { PiPiggyBankLight } from "react-icons/pi";
import { lusitana } from '@/app/dashboard/fonts';
import { Button } from '@/app/components/button';
import styles from '@/app/dashboard/home.module.css';

export default function Page() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null; // Prevent hydration mismatch

  return (
    <main className="flex min-h-screen flex-col p-6">
      <div className="flex h-20 shrink-0 items-end rounded-lg bg-blue-500 p-4 md:h-52">
        <PiPiggyBankLight /> 
      </div>
      {/* rest of your component stays the same */}
      <div className="mt-4 flex grow flex-col gap-4 md:flex-row">
        <div className="flex flex-col justify-center gap-6 rounded-lg bg-gray-50 px-6 py-10 md:w-2/5 md:px-20">
          <div className={styles.shape} />
          <p className={`${lusitana.className} text-xl text-gray-800 md:text-3xl md:leading-normal`}>
            <strong>Welcome!!!</strong>                        
          </p>
          <Link href="/login" passHref>
            <Button className="self-start px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-400 md:text-base">
              <span>Log in</span> <HiArrowRight className="w-5 md:w-6" />
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-center p-6 md:w-3/5 md:px-28 md:py-12">
          <h1>IMAGE</h1>
        </div>
      </div>
    </main>
  );
}