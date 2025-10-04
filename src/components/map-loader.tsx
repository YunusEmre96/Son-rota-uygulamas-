'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const Map = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => <Skeleton className="h-screen w-screen rounded-none" />,
});

export default function MapLoader() {
  return <Map />;
}
