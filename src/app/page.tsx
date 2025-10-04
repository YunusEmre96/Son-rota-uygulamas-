import Header from '@/components/header';
import MapLoader from '@/components/map-loader';

export default function Home() {
  return (
    <main className="relative h-screen w-screen overflow-hidden bg-background">
      <Header />
      <MapLoader />
    </main>
  );
}
