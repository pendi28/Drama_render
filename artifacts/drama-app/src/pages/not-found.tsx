import { Link } from "wouter";
import { Film } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[100dvh] bg-background text-foreground p-4 text-center pb-20 animate-in fade-in duration-500">
      <div className="relative mb-8">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
        <Film className="w-24 h-24 text-primary relative z-10 drop-shadow-[0_0_15px_hsla(var(--primary)/0.5)]" strokeWidth={1.5} />
      </div>
      
      <h1 className="text-4xl font-black font-display text-white mb-4 text-glow">
        Scene Missing
      </h1>
      
      <p className="text-muted-foreground mb-8 max-w-xs">
        We searched everywhere, but this episode seems to be lost in the cutting room.
      </p>
      
      <Link 
        href="/"
        className="bg-primary text-primary-foreground px-8 py-3.5 rounded-full font-bold shadow-[0_0_20px_hsla(var(--primary)/0.4)] hover:scale-105 active:scale-95 transition-all"
      >
        Back to Home
      </Link>
    </div>
  );
}
