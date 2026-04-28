import { useState } from "react";
import { useListContinueWatching, useListFavorites } from "@workspace/api-client-react";
import { Link } from "wouter";
import { DramaCard } from "@/components/ui/drama-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Play, History, Heart } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Library() {
  const [activeTab, setActiveTab] = useState<"continue" | "favorites">("continue");
  
  const { data: history, isLoading: isLoadingHistory } = useListContinueWatching();
  const { data: favorites, isLoading: isLoadingFavorites } = useListFavorites();

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-500 pb-8">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-white/5 pt-6 pb-4 px-4">
        <h1 className="text-2xl font-black font-display text-white mb-6">Library</h1>
        
        <div className="flex bg-secondary/50 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab("continue")}
            className={cn(
              "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
              activeTab === "continue" 
                ? "bg-background text-white shadow-sm" 
                : "text-muted-foreground hover:text-white"
            )}
          >
            <History className="w-4 h-4" /> Continue
          </button>
          <button
            onClick={() => setActiveTab("favorites")}
            className={cn(
              "flex-1 py-2.5 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2",
              activeTab === "favorites" 
                ? "bg-background text-white shadow-sm" 
                : "text-muted-foreground hover:text-white"
            )}
          >
            <Heart className="w-4 h-4" /> Favorites
          </button>
        </div>
      </header>

      <main className="p-4 flex-1">
        {activeTab === "continue" && (
          <div className="space-y-4">
            {isLoadingHistory ? (
              [1, 2, 3].map((i) => (
                <div key={i} className="flex gap-4 p-2">
                  <Skeleton className="w-24 aspect-[2/3] rounded-lg" />
                  <div className="flex-1 py-2 space-y-2">
                    <Skeleton className="w-3/4 h-5" />
                    <Skeleton className="w-1/2 h-4" />
                    <Skeleton className="w-full h-1 mt-4" />
                  </div>
                </div>
              ))
            ) : history?.length === 0 ? (
              <EmptyState 
                icon={<History className="w-8 h-8 text-muted-foreground" />}
                title="No watch history"
                description="Dramas you start watching will appear here."
              />
            ) : (
              history?.map((item) => (
                <Link 
                  key={`${item.drama.id}-${item.episode.id}`}
                  href={`/watch/${item.episode.id}`}
                  className="flex gap-4 bg-card rounded-xl p-2 border border-card-border/50 shadow-sm active:scale-[0.98] transition-transform"
                >
                  <div className="relative w-24 aspect-[2/3] rounded-lg overflow-hidden shrink-0">
                    <img 
                      src={item.drama.coverUrl} 
                      alt={item.drama.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 bg-black/40 transition-opacity">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                        <Play className="w-4 h-4 ml-0.5" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex-1 py-1 flex flex-col">
                    <h3 className="font-bold text-white text-sm line-clamp-1 mb-1">
                      {item.drama.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-auto">
                      Ep {item.episode.episodeNumber}: {item.episode.title}
                    </p>
                    
                    <div className="mt-2">
                      <div className="flex justify-between text-[10px] text-muted-foreground mb-1.5 font-medium uppercase tracking-wider">
                        <span>{item.progressPercent}% Watched</span>
                        <span>{Math.floor(item.progressSeconds / 60)}m left</span>
                      </div>
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${item.progressPercent}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {isLoadingFavorites ? (
              [1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
              ))
            ) : favorites?.length === 0 ? (
              <div className="col-span-full">
                <EmptyState 
                  icon={<Heart className="w-8 h-8 text-muted-foreground" />}
                  title="No favorites yet"
                  description="Dramas you favorite will appear here."
                />
              </div>
            ) : (
              favorites?.map((drama) => (
                <DramaCard key={drama.id} drama={drama} />
              ))
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function EmptyState({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center px-4">
      <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground mb-6">{description}</p>
      <Link 
        href="/browse"
        className="px-6 py-2.5 bg-primary text-primary-foreground rounded-full font-bold text-sm shadow-[0_0_15px_hsla(var(--primary)/0.3)] hover:scale-105 transition-transform"
      >
        Discover Dramas
      </Link>
    </div>
  );
}
