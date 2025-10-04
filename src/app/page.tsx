'use client';

import dynamic from 'next/dynamic';

const Map = dynamic(() => import('@/components/map'), {
  ssr: false,
  loading: () => <div className="h-screen w-screen bg-gray-200" />,
});

export default function Home() {
  return (
    <main className="h-screen w-screen">
      <Map />
    </main>
  );
}
