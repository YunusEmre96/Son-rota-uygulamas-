import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const MapLoader = dynamic(() => import('@/components/map-loader'), {
  ssr: false,
  loading: () => <Skeleton className="h-screen w-screen rounded-none" />,
});

export default function Home() {
  return (
    <main className="h-screen w-screen">
      <MapLoader />
    </main>
  );
}
