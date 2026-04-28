import { useParams, Link } from "wouter";
import { useGetDrama, useAddFavorite, useRemoveFavorite, getGetDramaQueryKey, getListFavoritesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, Heart, Star, Share2, Lock, Unlock, ChevronLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export default function DramaDetail() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  const { data: drama, isLoading } = useGetDrama(id || "", { 
    query: { enabled: !!id, queryKey: getGetDramaQueryKey(id || "") } 
  });

  const addFavorite = useAddFavorite();
  const removeFavorite = useRemoveFavorite();

  const handleFavoriteToggle = () => {
    if (!drama) return;
    
    if (drama.isFavorite) {
      removeFavorite.mutate({ id: drama.id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDramaQueryKey(drama.id) });
          queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
        }
      });
    } else {
      addFavorite.mutate({ data: { dramaId: drama.id } }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetDramaQueryKey(drama.id) });
          queryClient.invalidateQueries({ queryKey: getListFavoritesQueryKey() });
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <Skeleton className="w-full aspect-video rounded-none" />
        <div className="p-4 space-y-4">
          <Skeleton className="w-2/3 h-8" />
          <Skeleton className="w-1/3 h-4" />
          <Skeleton className="w-full h-20" />
          <div className="space-y-2 mt-8">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="w-full h-24 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!drama) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center p-4">
        <h2 className="text-xl font-bold mb-2">Drama not found</h2>
        <Link href="/" className="text-primary hover:underline">Go back home</Link>
      </div>
    );
  }

  const firstEpisode = drama.episodes?.[0];

  return (
    <div className="min-h-screen pb-20 animate-in fade-in duration-500">
      {/* Hero Banner */}
      <div className="relative w-full aspect-video md:aspect-[21/9]">
        <img 
          src={drama.bannerUrl} 
          alt={drama.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        
        {/* Top Nav */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center justify-between z-10 pt-safe">
          <Link href="/" className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <ChevronLeft className="w-6 h-6" />
          </Link>
          <button className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Title Area */}
        <div className="absolute bottom-0 left-0 right-0 p-4 space-y-2">
          <div className="flex flex-wrap gap-2 mb-2">
            {drama.genre.map(g => (
              <span key={g} className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 bg-white/10 backdrop-blur-md border border-white/20 rounded text-white">
                {g}
              </span>
            ))}
          </div>
          <h1 className="text-3xl font-black font-display text-white text-glow leading-tight">
            {drama.title}
          </h1>
          <div className="flex items-center gap-3 text-sm text-gray-300 font-medium">
            <span className="flex items-center gap-1 text-yellow-500">
              <Star className="w-4 h-4 fill-current" /> {drama.rating.toFixed(1)}
            </span>
            <span>•</span>
            <span>{drama.releaseYear}</span>
            <span>•</span>
            <span>{drama.durationLabel}</span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-4 flex gap-3">
        {firstEpisode ? (
          <Link 
            href={`/watch/${firstEpisode.id}`}
            className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90 shadow-[0_0_20px_hsla(var(--primary)/0.4)] rounded-xl py-3.5 font-bold flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95"
          >
            <Play className="w-5 h-5 fill-current" />
            Play Ep. 1
          </Link>
        ) : (
          <button className="flex-1 bg-muted text-muted-foreground rounded-xl py-3.5 font-bold cursor-not-allowed">
            Coming Soon
          </button>
        )}
        
        <button 
          onClick={handleFavoriteToggle}
          disabled={addFavorite.isPending || removeFavorite.isPending}
          className={cn(
            "w-14 rounded-xl flex items-center justify-center transition-all border",
            drama.isFavorite 
              ? "bg-primary/20 text-primary border-primary shadow-[0_0_15px_hsla(var(--primary)/0.3)]" 
              : "bg-secondary text-secondary-foreground border-white/5 hover:bg-secondary/80"
          )}
        >
          <Heart className={cn("w-6 h-6", drama.isFavorite && "fill-current animate-in zoom-in")} />
        </button>
      </div>

      {/* Description */}
      <div className="px-4 pb-6 border-b border-white/5">
        <p className="text-sm text-muted-foreground leading-relaxed">
          {drama.description}
        </p>
      </div>

      {/* Episodes List */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold font-display text-white">Episodes</h2>
          <span className="text-sm text-muted-foreground">{drama.episodesCount} episodes</span>
        </div>

        <div className="space-y-3">
          {drama.episodes?.map((episode) => {
            const Content = (
              <div className="flex gap-4">
                {/* Thumbnail */}
                <div className="relative w-32 aspect-video rounded-lg overflow-hidden shrink-0 bg-secondary">
                  <img 
                    src={episode.thumbnailUrl} 
                    alt={`Episode ${episode.episodeNumber}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20" />
                  {episode.isLocked ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/60 backdrop-blur-[2px]">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                  ) : (
                    <div className="absolute bottom-1 right-1 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-medium text-white">
                      {Math.floor(episode.durationSeconds / 60)}:{(episode.durationSeconds % 60).toString().padStart(2, '0')}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0 py-1 flex flex-col justify-center">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className={cn("font-bold text-sm line-clamp-1", episode.isLocked ? "text-muted-foreground" : "text-white")}>
                      {episode.episodeNumber}. {episode.title}
                    </h3>
                  </div>
                  {episode.isLocked ? (
                    <div className="flex items-center gap-1.5 mt-auto">
                      <div className="flex items-center gap-1 text-xs font-bold text-yellow-500 bg-yellow-500/10 px-2 py-0.5 rounded-full border border-yellow-500/20">
                        <Lock className="w-3 h-3" />
                        {episode.unlockCost} Coins
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 mt-auto text-xs font-bold text-primary">
                      <Play className="w-3 h-3 fill-current" />
                      Free to watch
                    </div>
                  )}
                </div>
              </div>
            );

            // Wrap in Link or div based on lock status
            const Wrapper = episode.isLocked ? "div" : Link;
            const props = episode.isLocked 
              ? { className: "block w-full text-left glass-panel rounded-xl p-2 cursor-pointer hover:bg-white/5 transition-colors group" } 
              : { href: `/watch/${episode.id}`, className: "block w-full text-left glass-panel rounded-xl p-2 hover:bg-white/5 transition-colors group active:scale-[0.98]" };

            return (
              <Wrapper key={episode.id} {...props as any}>
                {Content}
              </Wrapper>
            );
          })}
        </div>
      </div>
    </div>
  );
}
