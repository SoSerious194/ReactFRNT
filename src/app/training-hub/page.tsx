'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TrainingHubPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/program-library');
  }, [router]);

  return null; // optional: you could show a loading spinner here if you want
}
