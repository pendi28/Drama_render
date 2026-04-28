import { useGetMe, useListCoinPacks, usePurchaseCoins, getGetMeQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Coins, Settings, CreditCard, Gift, History, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Profile() {
  const { data: user, isLoading: isLoadingUser } = useGetMe();
  const { data: packs, isLoading: isLoadingPacks } = useListCoinPacks();
  
  const purchaseMutation = usePurchaseCoins();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handlePurchase = (packId: string) => {
    purchaseMutation.mutate({ data: { packId } }, {
      onSuccess: () => {
        toast({
          title: "Purchase Successful",
          description: "Coins have been added to your balance.",
        });
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
      },
      onError: () => {
        toast({
          title: "Purchase Failed",
          description: "Something went wrong with the transaction.",
          variant: "destructive"
        });
      }
    });
  };

  return (
    <div className="flex flex-col min-h-screen animate-in fade-in duration-500 pb-8">
      {/* Header Profile Info */}
      <header className="pt-safe pb-6 px-4 bg-gradient-to-b from-card to-background border-b border-white/5">
        <div className="flex justify-end pt-4 pb-2">
          <button className="w-10 h-10 rounded-full flex items-center justify-center text-muted-foreground hover:text-white transition-colors hover:bg-white/5">
            <Settings className="w-5 h-5" />
          </button>
        </div>
        
        {isLoadingUser ? (
          <div className="flex items-center gap-4 mt-2">
            <Skeleton className="w-20 h-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="w-32 h-6" />
              <Skeleton className="w-24 h-4" />
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 mt-2">
            <img 
              src={user?.avatarUrl} 
              alt={user?.displayName}
              className="w-20 h-20 rounded-full border-2 border-primary/20 object-cover shadow-[0_0_15px_hsla(var(--primary)/0.2)]"
            />
            <div>
              <h1 className="text-2xl font-black font-display text-white">
                {user?.displayName}
              </h1>
              <p className="text-sm text-muted-foreground font-medium">
                Member since {new Date(user?.memberSince || Date.now()).getFullYear()}
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 mt-8">
          <div className="glass-panel rounded-2xl p-4 text-center">
            <p className="text-sm text-muted-foreground font-medium mb-1 uppercase tracking-widest text-[10px]">Dramas Watched</p>
            <p className="text-2xl font-bold font-display text-white">{isLoadingUser ? "-" : user?.watchedCount}</p>
          </div>
          <div className="glass-panel rounded-2xl p-4 text-center">
            <p className="text-sm text-muted-foreground font-medium mb-1 uppercase tracking-widest text-[10px]">Favorites</p>
            <p className="text-2xl font-bold font-display text-white">{isLoadingUser ? "-" : user?.favoritesCount}</p>
          </div>
        </div>
      </header>

      <main className="p-4 space-y-8 mt-4">
        {/* Wallet Section */}
        <section className="bg-gradient-to-br from-primary/20 to-primary/5 border border-primary/20 rounded-3xl p-6 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/30 blur-3xl rounded-full pointer-events-none" />
          
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold font-display text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-500" /> My Wallet
            </h2>
            <Link href="/history" className="text-sm text-primary hover:underline font-medium">
              History
            </Link>
          </div>
          
          <div className="flex items-end gap-2">
            <span className="text-5xl font-black font-display text-white text-glow tracking-tight">
              {isLoadingUser ? "..." : user?.coins}
            </span>
            <span className="text-primary font-bold mb-1">Coins</span>
          </div>
        </section>

        {/* Store Section */}
        <section>
          <h2 className="text-xl font-bold font-display text-white mb-4">
            Buy Coins
          </h2>
          
          <div className="space-y-3">
            {isLoadingPacks ? (
              [1, 2, 3].map(i => <Skeleton key={i} className="w-full h-20 rounded-2xl" />)
            ) : (
              packs?.map((pack) => (
                <div 
                  key={pack.id} 
                  className={cn(
                    "glass-panel rounded-2xl p-4 flex items-center justify-between transition-all",
                    pack.label ? "border-primary/50 relative overflow-hidden" : ""
                  )}
                >
                  {pack.label && (
                    <div className="absolute top-0 right-0 bg-primary text-primary-foreground text-[9px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg shadow-[0_0_10px_hsla(var(--primary)/0.5)]">
                      {pack.label}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                      <Coins className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg text-white">{pack.coins}</span>
                        {pack.bonus > 0 && (
                          <span className="text-xs font-bold text-green-400 bg-green-400/10 px-1.5 py-0.5 rounded">
                            +{pack.bonus} Bonus
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{pack.coins + pack.bonus} Total Coins</p>
                    </div>
                  </div>

                  <Button 
                    onClick={() => handlePurchase(pack.id)}
                    disabled={purchaseMutation.isPending}
                    className={cn(
                      "font-bold px-6",
                      pack.label ? "bg-primary hover:bg-primary/90 text-white shadow-[0_0_15px_hsla(var(--primary)/0.4)]" : "bg-white text-black hover:bg-gray-200"
                    )}
                  >
                    {purchaseMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : `$${pack.priceUsd}`}
                  </Button>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Quick Links */}
        <section className="space-y-2 pt-4 border-t border-white/5">
          <button className="w-full flex items-center justify-between p-4 glass-panel rounded-xl hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3 font-medium text-white">
              <Gift className="w-5 h-5 text-primary" /> Redeem Code
            </div>
          </button>
          <button className="w-full flex items-center justify-between p-4 glass-panel rounded-xl hover:bg-white/5 transition-colors">
            <div className="flex items-center gap-3 font-medium text-white">
              <CreditCard className="w-5 h-5 text-muted-foreground" /> Payment Methods
            </div>
          </button>
        </section>
      </main>
    </div>
  );
}
