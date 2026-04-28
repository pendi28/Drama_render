import { useListFeaturedDramas, useListTrendingDramas, useListRecommendedDramas } from "@workspace/api-client-react";
import { DramaCard } from "@/components/ui/drama-card";
import { Skeleton } from "@/components/ui/skeleton";
import useEmblaCarousel from "embla-carousel-react";
import { Play } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { data: featured, isLoading: isLoadingFeatured } = useListFeaturedDramas();
  const { data: trending, isLoading: isLoadingTrending } = useListTrendingDramas();
  const { data: recommended, isLoading: isLoadingRecommended } = useListRecommendedDramas();

  const [emblaRef] = useEmblaCarousel({ loop: true, align: "center" });

  return (
    <div className="flex flex-col gap-8 pb-8 animate-in fade-in duration-500">
      {/* Hero Header */}
      <header className="px-4 pt-6 pb-2 flex items-center justify-between sticky top-0 z-40 bg-background/80 backdrop-blur-md border-b border-white/5">
        <h1 className="text-2xl font-black font-display tracking-tighter text-glow text-white">
          Drama<span className="text-primary">Short</span>
        </h1>
      </header>

      {/* Featured Carousel */}
      <section className="relative">
        {isLoadingFeatured ? (
          <div className="px-4">
            <Skeleton className="w-full aspect-[4/5] rounded-2xl" />
          </div>
        ) : (
          <div className="overflow-hidden px-4" ref={emblaRef}>
            <div className="flex gap-4">
              {featured?.map((drama) => (
                <div key={drama.id} className="flex-[0_0_100%] min-w-0 relative">
                  <Link href={`/drama/${drama.id}`} className="block relative aspect-[4/5] rounded-2xl overflow-hidden shadow-2xl group">
                    <img 
                      src={drama.coverUrl} 
                      alt={drama.title} 
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                    
                    <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col items-center text-center">
                      <div className="flex items-center gap-2 mb-3">
                        {drama.genre.slice(0, 3).map((g) => (
                          <span key={g} className="text-[10px] uppercase tracking-wider font-bold px-2 py-1 bg-white/10 backdrop-blur-md rounded border border-white/20 text-white/90">
                            {g}
                          </span>
                        ))}
                      </div>
                      <h2 className="text-3xl font-black font-display text-white mb-2 leading-none text-glow">
                        {drama.title}
                      </h2>
                      <p className="text-sm text-gray-300 line-clamp-2 mb-6 max-w-[90%]">
                        {drama.description}
                      </p>
                      
                      <div className="w-full max-w-[200px] bg-primary text-primary-foreground hover:bg-primary/90 hover-elevate shadow-[0_0_20px_hsla(var(--primary)/0.5)] rounded-full py-3 px-6 font-bold flex items-center justify-center gap-2 transition-all">
                        <Play className="w-5 h-5 fill-current" />
                        Play Now
                      </div>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Trending Now */}
      <section className="px-4">
        <h2 className="text-xl font-bold font-display text-white mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_hsla(var(--primary)/0.8)]" />
          Trending Now
        </h2>
        {isLoadingTrending ? (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="flex-[0_0_120px] aspect-[2/3] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 -mx-4 px-4 snap-x">
            {trending?.map((drama) => (
              <DramaCard key={drama.id} drama={drama} className="flex-[0_0_140px] snap-start" />
            ))}
          </div>
        )}
      </section>

      {/* Recommended For You */}
      <section className="px-4">
        <h2 className="text-xl font-bold font-display text-white mb-4 flex items-center gap-2">
          <span className="w-1.5 h-6 bg-primary rounded-full shadow-[0_0_10px_hsla(var(--primary)/0.8)]" />
          Recommended For You
        </h2>
        {isLoadingRecommended ? (
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {recommended?.map((drama) => (
              <DramaCard key={drama.id} drama={drama} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
