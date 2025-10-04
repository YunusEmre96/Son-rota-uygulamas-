'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const Map = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => <Skeleton className="h-screen w-screen" />,
});

export default function Home() {
  return (
    <main className="h-screen w-screen">
      <Map />
    </main>
  );
}
