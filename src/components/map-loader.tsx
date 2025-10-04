'use client';

import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

// Harita bileşenini dinamik olarak yüklüyoruz ve sunucu tarafında render edilmesini engelliyoruz (ssr: false).
// Bu, haritanın tarayıcıya özgü 'window' gibi nesnelere erişiminden kaynaklanacak hataları önler.
// Harita yüklenirken bir iskelet (skeleton) gösterilir.
const Map = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => <Skeleton className="h-screen w-screen rounded-none" />,
});

export default function MapLoader() {
  return <Map />;
}
