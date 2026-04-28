import { useEffect, useRef, useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import { 
  useGetEpisode, 
  useGetMe, 
  useUnlockEpisode, 
  useSaveProgress,
  getGetEpisodeQueryKey,
  getGetDramaQueryKey,
  getGetMeQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronUp, ChevronDown, Lock, Coins, Play, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function Watch() {
  const { episodeId } = useParams<{ episodeId: string }>();
  const [_, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const { data: playback, isLoading: isLoadingEpisode } = useGetEpisode(episodeId || "", {
    query: { enabled: !!episodeId, queryKey: getGetEpisodeQueryKey(episodeId || "") }
  });

  const { data: user } = useGetMe();
  const unlockMutation = useUnlockEpisode();
  const saveProgressMutation = useSaveProgress();

  // Handle controls visibility
  const resetControlsTimeout = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) setShowControls(false);
    }, 3000);
  };

  useEffect(() => {
    resetControlsTimeout();
    return () => {
      if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current);
    };
  }, [isPlaying]);

  // Handle progress saving
  useEffect(() => {
    if (!playback || playback.episode.isLocked) return;

    const interval = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        saveProgressMutation.mutate({
          data: {
            episodeId: playback.episode.id,
            progressSeconds: Math.floor(videoRef.current.currentTime)
          }
        });
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [playback, saveProgressMutation]);

  // Seek to previous progress when loaded
  useEffect(() => {
    if (videoRef.current && playback && !playback.episode.isLocked && playback.progressSeconds > 0) {
      // Only seek if we're near the beginning to avoid seeking back if user re-watches
      if (videoRef.current.currentTime < 5) {
        videoRef.current.currentTime = playback.progressSeconds;
      }
    }
  }, [playback, videoRef.current]);

  const handleUnlock = () => {
    if (!playback || !user) return;
    
    if (user.coins < playback.episode.unlockCost) {
      toast({
        title: "Not enough coins",
        description: "Please top up your balance to unlock this episode.",
        variant: "destructive"
      });
      setLocation("/profile");
      return;
    }

    unlockMutation.mutate({ id: playback.episode.id }, {
      onSuccess: () => {
        toast({
          title: "Episode Unlocked!",
          description: "Enjoy watching.",
        });
        queryClient.invalidateQueries({ queryKey: getGetEpisodeQueryKey(playback.episode.id) });
        queryClient.invalidateQueries({ queryKey: getGetDramaQueryKey(playback.drama.id) });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: (err: any) => {
        toast({
          title: "Unlock failed",
          description: err.message || "Something went wrong.",
          variant: "destructive"
        });
      }
    });
  };

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
    resetControlsTimeout();
  };

  // Add swipe handling for episode navigation
  const touchStartY = useRef<number | null>(null);
  
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
  };
  
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    const diff = touchStartY.current - touchEndY;
    
    // Swipe up (next)
    if (diff > 50 && playback?.nextEpisodeId) {
      setLocation(`/watch/${playback.nextEpisodeId}`);
    }
    // Swipe down (prev)
    else if (diff < -50 && playback?.prevEpisodeId) {
      setLocation(`/watch/${playback.prevEpisodeId}`);
    }
    
    touchStartY.current = null;
  };

  if (isLoadingEpisode) {
    return (
      <div className="h-[100dvh] w-full bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!playback) {
    return (
      <div className="h-[100dvh] w-full bg-black flex flex-col items-center justify-center text-white p-4">
        <p className="mb-4">Episode not found</p>
        <Link href="/" className="text-primary">Go back home</Link>
      </div>
    );
  }

  const { episode, drama, nextEpisodeId, prevEpisodeId } = playback;

  return (
    <div 
      className="h-[100dvh] w-full bg-black relative overflow-hidden flex flex-col touch-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={resetControlsTimeout}
    >
      {/* Video Layer */}
      <div className="absolute inset-0 bg-black z-0">
        {!episode.isLocked ? (
          <video
            ref={videoRef}
            src={episode.videoUrl}
            poster={episode.thumbnailUrl}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            loop={!nextEpisodeId}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
            onEnded={() => {
              if (nextEpisodeId) {
                setLocation(`/watch/${nextEpisodeId}`);
              }
            }}
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          />
        ) : (
          <img 
            src={episode.thumbnailUrl} 
            alt={episode.title}
            className="w-full h-full object-cover blur-xl opacity-50 scale-110"
          />
        )}
      </div>

      {/* UI Overlay Layer */}
      <div className={cn(
        "absolute inset-0 z-10 flex flex-col transition-opacity duration-300",
        (!showControls && isPlaying && !episode.isLocked) ? "opacity-0" : "opacity-100"
      )}>
        {/* Header */}
        <div className="p-4 pt-safe flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
          <Link 
            href={`/drama/${drama.id}`}
            className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
          >
            <ChevronLeft className="w-6 h-6" />
          </Link>
          
          <div className="flex gap-2">
            {prevEpisodeId && (
              <Link 
                href={`/watch/${prevEpisodeId}`}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <ChevronUp className="w-5 h-5" />
              </Link>
            )}
            {nextEpisodeId && (
              <Link 
                href={`/watch/${nextEpisodeId}`}
                className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors"
              >
                <ChevronDown className="w-5 h-5" />
              </Link>
            )}
          </div>
        </div>

        {/* Center - Play/Pause indicator or Unlock UI */}
        <div className="flex-1 flex flex-col items-center justify-center p-6">
          {!episode.isLocked ? (
            <div 
              className={cn(
                "w-20 h-20 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white transition-all duration-300 transform",
                isPlaying ? "opacity-0 scale-150 pointer-events-none" : "opacity-100 scale-100 pointer-events-auto"
              )}
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
            >
              <Play className="w-10 h-10 ml-2" fill="currentColor" />
            </div>
          ) : (
            <div className="w-full max-w-sm glass-panel p-6 rounded-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
              <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-xl font-bold font-display text-white mb-2">
                Episode Locked
              </h2>
              <p className="text-sm text-gray-300 mb-6">
                Unlock this episode to continue watching the drama.
              </p>
              
              <div className="w-full space-y-4">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-white/10">
                  <span className="text-sm font-medium text-white">Cost</span>
                  <span className="flex items-center gap-1 font-bold text-yellow-500">
                    <Coins className="w-4 h-4" /> {episode.unlockCost}
                  </span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-white/10">
                  <span className="text-sm font-medium text-white">Your Balance</span>
                  <span className="flex items-center gap-1 font-bold text-white">
                    <Coins className="w-4 h-4" /> {user?.coins || 0}
                  </span>
                </div>

                <Button 
                  className="w-full py-6 text-lg font-bold shadow-[0_0_20px_hsla(var(--primary)/0.4)]"
                  onClick={handleUnlock}
                  disabled={unlockMutation.isPending}
                >
                  {unlockMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>Unlock Episode</>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer Metadata */}
        <div className="p-4 pb-safe bg-gradient-to-t from-black/90 via-black/60 to-transparent">
          <Link href={`/drama/${drama.id}`}>
            <h1 className="text-lg font-bold font-display text-white mb-1 hover:text-primary transition-colors line-clamp-1 text-glow">
              {drama.title}
            </h1>
          </Link>
          <p className="text-sm text-gray-300 line-clamp-2">
            <span className="font-bold text-white">Ep {episode.episodeNumber}:</span> {episode.title}
          </p>
        </div>
      </div>
    </div>
  );
}
