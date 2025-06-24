import { MessageCircle } from 'lucide-react';

export function Logo() {
  return (
    <div className="flex items-center gap-2" aria-label="CircleChat Logo">
      <MessageCircle className="h-7 w-7 text-primary" />
      <h1 className="hidden text-xl font-bold text-foreground sm:block">CircleChat</h1>
    </div>
  );
}
