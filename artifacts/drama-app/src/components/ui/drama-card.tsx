import { Link } from "wouter";
import { Drama } from "@workspace/api-client-react/src/generated/api.schemas";
import { Play, TrendingUp, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface DramaCardProps {
  drama: Drama;
  className?: string;
  featured?: boolean;
}

export function DramaCard({ drama, className, featured = false }: DramaCardProps) {
  return (
    <Link href={`/drama/${drama.id}`} className={cn("group block relative overflow-hidden rounded-xl bg-card border border-card-border/50 shadow-lg transition-transform active:scale-95 duration-200", className)}>
      <div className={cn("relative w-full overflow-hidden", featured ? "aspect-video" : "aspect-[2/3]")}>
        <img 
          src={featured ? drama.bannerUrl : drama.coverUrl} 
          alt={drama.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {drama.isNew && (
            <span className="inline-flex items-center gap-1 bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded shadow-[0_0_10px_hsla(var(--primary)/0.5)]">
              <Sparkles className="w-3 h-3" /> NEW
            </span>
          )}
          {drama.isHot && (
            <span className="inline-flex items-center gap-1 bg-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-[0_0_10px_rgba(249,115,22,0.5)]">
              <TrendingUp className="w-3 h-3" /> HOT
            </span>
          )}
        </div>

        {/* Play overlay on hover */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-12 h-12 rounded-full bg-primary/90 flex items-center justify-center text-white backdrop-blur-sm shadow-[0_0_20px_hsla(var(--primary)/0.6)] transform scale-75 group-hover:scale-100 transition-transform">
            <Play className="w-6 h-6 ml-1" fill="currentColor" />
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-3">
          <h3 className="text-white font-display font-bold text-sm leading-tight line-clamp-2 shadow-sm text-glow">
            {drama.title}
          </h3>
          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-gray-300 font-medium">
            <span className="truncate">{drama.category}</span>
            <span className="w-1 h-1 rounded-full bg-primary" />
            <span>{drama.episodesCount} eps</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
