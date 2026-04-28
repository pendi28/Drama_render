import { BottomNav } from "./bottom-nav";
import { useLocation } from "wouter";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const isWatchPage = location.startsWith("/watch/");

  if (isWatchPage) {
    return <div className="min-h-[100dvh] bg-black text-white">{children}</div>;
  }

  return (
    <div className="min-h-[100dvh] bg-background text-foreground pb-16 bg-grain selection:bg-primary selection:text-white">
      <main className="max-w-md mx-auto w-full min-h-[100dvh] relative pb-safe">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
