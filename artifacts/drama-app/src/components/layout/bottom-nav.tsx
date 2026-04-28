import { Link, useLocation } from "wouter";
import { Home, Compass, Bookmark, User } from "lucide-react";
import { cn } from "@/lib/utils";

export function BottomNav() {
  const [location] = useLocation();

  const links = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/browse", icon: Compass, label: "Browse" },
    { href: "/library", icon: Bookmark, label: "Library" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 glass-panel pb-safe">
      <div className="flex items-center justify-around h-16 max-w-md mx-auto px-4">
        {links.map(({ href, icon: Icon, label }) => {
          const isActive = location === href || (href !== "/" && location.startsWith(href));
          
          return (
            <Link key={href} href={href} className="flex-1 flex flex-col items-center justify-center gap-1 w-full h-full relative group">
              <Icon 
                className={cn(
                  "w-6 h-6 transition-all duration-300",
                  isActive ? "text-primary scale-110" : "text-muted-foreground group-hover:text-foreground"
                )} 
                strokeWidth={isActive ? 2.5 : 2}
              />
              <span 
                className={cn(
                  "text-[10px] font-medium transition-colors",
                  isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                )}
              >
                {label}
              </span>
              {isActive && (
                <span className="absolute -top-1 left-1/2 -translate-x-1/2 w-8 h-1 bg-primary rounded-b-full shadow-[0_0_8px_hsla(var(--primary)/0.8)]" />
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
