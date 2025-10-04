import { MapPin } from 'lucide-react';

export default function Header() {
  return (
    <header className="relative z-10">
      <div className="flex items-center justify-center gap-3 bg-card text-card-foreground py-3 px-6 shadow-md border-b">
        <MapPin className="text-primary h-8 w-8" />
        <h1 className="text-3xl font-bold font-headline tracking-tight text-primary">
          RotaBul
        </h1>
      </div>
    </header>
  );
}
