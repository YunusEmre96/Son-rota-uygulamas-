import Header from '@/components/header';
import MapLoader from '@/components/map-loader';

export default function Home() {
  return (
    <div className="h-screen w-screen flex flex-col">
      <Header />
      <main className="relative flex-1">
        <MapLoader />
      </main>
    </div>
  );
}
