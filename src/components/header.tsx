import { MapPin } from 'lucide-react';

export default function Header() {
  return (
    <header className="absolute top-0 left-1/2 -translate-x-1/2 z-10 mt-4">
      <div className="flex items-center gap-3 bg-card text-card-foreground py-3 px-6 rounded-lg shadow-lg border">
        <MapPin className="text-primary h-8 w-8" />
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">
          RotaBul
        </h1>
      </div>
    </header>
  );
}
