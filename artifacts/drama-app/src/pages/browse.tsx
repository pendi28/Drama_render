import { useState } from "react";
import { useListDramas, useListGenres } from "@workspace/api-client-react";
import { DramaCard } from "@/components/ui/drama-card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, Filter } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Browse() {
  const [search, setSearch] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | undefined>();
  const [sort, setSort] = useState<"popular" | "newest" | "trending">("popular");

  const { data: genres } = useListGenres();
  const { data: dramas, isLoading } = useListDramas({
    search: search || undefined,
    genre: selectedGenre,
    sort,
  });

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-500 pb-8">
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-white/5 pt-6 pb-4 px-4 space-y-4">
        <h1 className="text-2xl font-black font-display text-white">Browse</h1>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            placeholder="Search dramas, actors, genres..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-secondary/50 border-white/10 text-white placeholder:text-muted-foreground focus-visible:ring-primary rounded-full h-12"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          <button
            onClick={() => setSelectedGenre(undefined)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
              !selectedGenre 
                ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsla(var(--primary)/0.4)]" 
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-white/5"
            )}
          >
            All
          </button>
          {genres?.map((genre) => (
            <button
              key={genre.name}
              onClick={() => setSelectedGenre(genre.name)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                selectedGenre === genre.name 
                  ? "bg-primary text-primary-foreground shadow-[0_0_10px_hsla(var(--primary)/0.4)]" 
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80 border border-white/5"
              )}
            >
              {genre.name} <span className="opacity-60 ml-1 text-xs">{genre.count}</span>
            </button>
          ))}
        </div>
      </header>

      <main className="p-4 flex-1">
        <div className="flex items-center justify-between mb-6 text-sm">
          <span className="text-muted-foreground">
            {dramas?.length || 0} results found
          </span>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Filter className="w-4 h-4" />
            <select 
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="bg-transparent border-none outline-none text-white focus:ring-0 cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="newest">Newest Releases</option>
              <option value="trending">Trending Now</option>
            </select>
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-xl" />
            ))}
          </div>
        ) : dramas?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">No dramas found</h3>
            <p className="text-sm text-muted-foreground">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {dramas?.map((drama) => (
              <DramaCard key={drama.id} drama={drama} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
