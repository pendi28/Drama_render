import { db, dramasTable, episodesTable, usersTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import { logger } from "./logger";
import {
  DEMO_USER_ID,
  DEMO_USER_DISPLAY_NAME,
  DEMO_USER_AVATAR_URL,
  DEMO_USER_STARTING_COINS,
} from "./currentUser";

const SAMPLE_VIDEO_URL =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";
const SAMPLE_VIDEO_URL_2 =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";
const SAMPLE_VIDEO_URL_3 =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4";
const SAMPLE_VIDEO_URL_4 =
  "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4";

const SAMPLE_VIDEOS = [
  SAMPLE_VIDEO_URL,
  SAMPLE_VIDEO_URL_2,
  SAMPLE_VIDEO_URL_3,
  SAMPLE_VIDEO_URL_4,
];

type DramaSeed = {
  id: string;
  title: string;
  description: string;
  category: string;
  genre: string[];
  releaseYear: number;
  coverUrl: string;
  bannerUrl: string;
  rating: number;
  viewsCount: number;
  durationLabel: string;
  isNew: boolean;
  isHot: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  isRecommended: boolean;
  trendingRank: number | null;
  episodes: Array<{
    title: string;
    durationSeconds: number;
    isLockedByDefault: boolean;
    unlockCost: number;
  }>;
};

const DRAMAS: DramaSeed[] = [
  {
    id: "billionaire-husband",
    title: "My Billionaire Husband Returns",
    description:
      "Three years after he disappeared on their wedding night, Lena's mysterious husband returns — only this time he owns half the city, and someone is trying to take it from him.",
    category: "Romance Thriller",
    genre: ["Romance", "Drama", "Thriller"],
    releaseYear: 2026,
    coverUrl:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&h=900&fit=crop",
    bannerUrl:
      "https://images.unsplash.com/photo-1490300472339-79e4adc6be4a?w=1600&h=900&fit=crop",
    rating: 4.9,
    viewsCount: 12_400_000,
    durationLabel: "90s eps · 36 episodes",
    isNew: true,
    isHot: true,
    isFeatured: true,
    isTrending: true,
    isRecommended: true,
    trendingRank: 1,
    episodes: Array.from({ length: 12 }).map((_, i) => ({
      title: [
        "The Wedding Night",
        "Three Years Later",
        "The Stranger at the Door",
        "His Empire",
        "The Contract",
        "Old Wounds",
        "A Dangerous Deal",
        "The Other Woman",
        "Confessions",
        "Betrayal",
        "Fire and Ash",
        "The Vow",
      ][i] ?? `Episode ${i + 1}`,
      durationSeconds: 75 + (i % 4) * 5,
      isLockedByDefault: i >= 3,
      unlockCost: i >= 3 ? 30 : 0,
    })),
  },
  {
    id: "alpha-bite",
    title: "Bite of the Alpha",
    description:
      "After being rejected by her fated mate, a runaway omega discovers she carries the bloodline of a long-extinct queen — and every wolf in the kingdom is hunting her.",
    category: "Werewolf Romance",
    genre: ["Romance", "Fantasy", "Werewolf"],
    releaseYear: 2026,
    coverUrl:
      "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=600&h=900&fit=crop",
    bannerUrl:
      "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=1600&h=900&fit=crop",
    rating: 4.8,
    viewsCount: 8_700_000,
    durationLabel: "75s eps · 48 episodes",
    isNew: true,
    isHot: true,
    isFeatured: true,
    isTrending: true,
    isRecommended: true,
    trendingRank: 2,
    episodes: Array.from({ length: 10 }).map((_, i) => ({
      title: `Episode ${i + 1}`,
      durationSeconds: 70 + (i % 3) * 5,
      isLockedByDefault: i >= 4,
      unlockCost: i >= 4 ? 25 : 0,
    })),
  },
  {
    id: "ceos-secret-baby",
    title: "The CEO's Secret Baby",
    description:
      "A one-night stand with a stranger leaves Maya pregnant. Five years later, she walks into the boardroom of her new employer — and meets her daughter's father.",
    category: "Office Romance",
    genre: ["Romance", "Drama"],
    releaseYear: 2025,
    coverUrl:
      "https://images.unsplash.com/photo-1521575107034-e0fa0b594529?w=600&h=900&fit=crop",
    bannerUrl:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?w=1600&h=900&fit=crop",
    rating: 4.7,
    viewsCount: 15_300_000,
    durationLabel: "60s eps · 60 episodes",
    isNew: false,
    isHot: true,
    isFeatured: false,
    isTrending: true,
    isRecommended: true,
    trendingRank: 3,
    episodes: Array.from({ length: 10 }).map((_, i) => ({
      title: `Episode ${i + 1}`,
      durationSeconds: 60 + (i % 4) * 5,
      isLockedByDefault: i >= 5,
      unlockCost: i >= 5 ? 20 : 0,
    })),
  },
  {
    id: "vampire-prince",
    title: "Bound to the Vampire Prince",
    description:
      "On her eighteenth birthday, Sage learns the truth: she was promised to the heir of the Crimson Court before she was born. Tonight, he's coming to collect.",
    category: "Paranormal Romance",
    genre: ["Romance", "Fantasy", "Vampire"],
    releaseYear: 2026,
    coverUrl:
      "https://images.unsplash.com/photo-1518002054494-3a6f94352e9d?w=600&h=900&fit=crop",
    bannerUrl:
      "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=1600&h=900&fit=crop",
    rating: 4.8,
    viewsCount: 6_200_000,
    durationLabel: "90s eps · 30 episodes",
    isNew: true,
    isHot: false,
    isFeatured: true,
    isTrending: true,
    isRecommended: true,
    trendingRank: 4,
    episodes: Array.from({ length: 8 }).map((_, i) => ({
      title: `Episode ${i + 1}`,
      durationSeconds: 80 + (i % 3) * 5,
      isLockedByDefault: i >= 3,
      unlockCost: i >= 3 ? 30 : 0,
    })),
  },
  {
    id: "midnight-mafia",
    title: "Midnight & The Mafia King",
    description:
      "A jazz singer with a deadly voice. A mob boss with everything to lose. One performance changes the war for the city forever.",
    category: "Mafia Romance",
    genre: ["Romance", "Crime", "Drama"],
    releaseYear: 2025,
    coverUrl:
      "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?w=600&h=900&fit=crop",
    bannerUrl:
      "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1600&h=900&fit=crop",
    rating: 4.6,
    viewsCount: 4_900_000,
    durationLabel: "75s eps · 42 episodes",
    isNew: false,
    isHot: true,
    isFeatured: false,
    isTrending: true,
    isRecommended: true,
    trendingRank: 5,
    episodes: Array.from({ length: 9 }).map((_, i) => ({
      title: `Episode ${i + 1}`,
      durationSeconds: 75,
      isLockedByDefault: i >= 4,
      unlockCost: i >= 4 ? 25 : 0,
    })),
  },
  {
    id: "second-chance-ex",
    title: "Second Chance With My Ex-Husband",
    description:
      "Divorced for three years, Iris returns to her hometown to find her ex remarried — to her sister. But nothing about this new family is what it seems.",
    category: "Drama",
    genre: ["Romance", "Drama", "Mystery"],
    releaseYear: 2025,
    coverUrl:
      "https://images.unsplash.com/photo-1519741497674-611481863552?w=600&h=900&fit=crop",
    bannerUrl:
      "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=1600&h=900&fit=crop",
    rating: 4.5,
    viewsCount: 3_700_000,
    durationLabel: "60s eps · 50 episodes",
    isNew: false,
    isHot: false,
    isFeatured: false,
    isTrending: true,
    isRecommended: true,
    trendingRank: 6,
    episodes: Array.from({ length: 8 }).map((_, i) => ({
      title: `Episode ${i + 1}`,
      durationSeconds: 60 + (i % 3) * 5,
      isLockedByDefault: i >= 4,
      unlockCost: i >= 4 ? 20 : 0,
    })),
  },
  {
    id: "fated-to-the-dragon",
    title: "Fated to the Dragon Lord",
    description:
      "Sold by her stepmother to the dragon clan in the mountains, Wren expected to die. She didn't expect to be claimed as queen by the most feared dragon of them all.",
    category: "Fantasy Romance",
    genre: ["Fantasy", "Romance"],
    releaseYear: 2026,
    coverUrl:
      "https://images.unsplash.com/photo-1504805572947-34fad45aed93?w=600&h=900&fit=crop",
    bannerUrl:
      "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?w=1600&h=900&fit=crop",
    rating: 4.7,
    viewsCount: 5_100_000,
    durationLabel: "90s eps · 28 episodes",
    isNew: true,
    isHot: false,
    isFeatured: false,
    isTrending: false,
    isRecommended: true,
    trendingRank: null,
    episodes: Array.from({ length: 8 }).map((_, i) => ({
      title: `Episode ${i + 1}`,
      durationSeconds: 80,
      isLockedByDefault: i >= 3,
      unlockCost: i >= 3 ? 30 : 0,
    })),
  },
  {
    id: "revenge-bride",
    title: "The Revenge Bride",
    description:
      "Twenty years ago, her family was destroyed by his. Now she's marrying him with a smile and a knife behind her back.",
    category: "Thriller",
    genre: ["Drama", "Thriller", "Romance"],
    releaseYear: 2025,
    coverUrl:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=900&fit=crop",
    bannerUrl:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&h=900&fit=crop",
    rating: 4.6,
    viewsCount: 2_800_000,
    durationLabel: "75s eps · 40 episodes",
    isNew: false,
    isHot: false,
    isFeatured: false,
    isTrending: false,
    isRecommended: true,
    trendingRank: null,
    episodes: Array.from({ length: 8 }).map((_, i) => ({
      title: `Episode ${i + 1}`,
      durationSeconds: 75,
      isLockedByDefault: i >= 4,
      unlockCost: i >= 4 ? 25 : 0,
    })),
  },
  {
    id: "rejected-luna",
    title: "The Rejected Luna's Awakening",
    description:
      "He chose another at the moon ceremony. Now her wolf is finally awake, her power is unmatched, and she has nothing left to lose.",
    category: "Werewolf Romance",
    genre: ["Romance", "Fantasy", "Werewolf"],
    releaseYear: 2026,
    coverUrl:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=600&h=900&fit=crop",
    bannerUrl:
      "https://images.unsplash.com/photo-1448375240586-882707db888b?w=1600&h=900&fit=crop",
    rating: 4.7,
    viewsCount: 6_900_000,
    durationLabel: "60s eps · 56 episodes",
    isNew: true,
    isHot: true,
    isFeatured: false,
    isTrending: false,
    isRecommended: true,
    trendingRank: null,
    episodes: Array.from({ length: 10 }).map((_, i) => ({
      title: `Episode ${i + 1}`,
      durationSeconds: 60 + (i % 3) * 5,
      isLockedByDefault: i >= 5,
      unlockCost: i >= 5 ? 20 : 0,
    })),
  },
  {
    id: "boss-from-hell",
    title: "My Boss From Hell",
    description:
      "Working for the city's most ruthless attorney was supposed to be temporary. Falling for him was supposed to be impossible.",
    category: "Office Romance",
    genre: ["Romance", "Drama", "Comedy"],
    releaseYear: 2025,
    coverUrl:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600&h=900&fit=crop",
    bannerUrl:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1600&h=900&fit=crop",
    rating: 4.4,
    viewsCount: 1_900_000,
    durationLabel: "60s eps · 36 episodes",
    isNew: false,
    isHot: false,
    isFeatured: false,
    isTrending: false,
    isRecommended: true,
    trendingRank: null,
    episodes: Array.from({ length: 8 }).map((_, i) => ({
      title: `Episode ${i + 1}`,
      durationSeconds: 60,
      isLockedByDefault: i >= 4,
      unlockCost: i >= 4 ? 20 : 0,
    })),
  },
  {
    id: "stepbrother-secret",
    title: "My Stepbrother's Secret",
    description:
      "When her family blends, she gains a stepbrother who hates her on sight — and the locked door at the end of the hallway that no one is allowed to open.",
    category: "Mystery Drama",
    genre: ["Drama", "Mystery", "Romance"],
    releaseYear: 2026,
    coverUrl:
      "https://images.unsplash.com/photo-1463453091185-61582044d556?w=600&h=900&fit=crop",
    bannerUrl:
      "https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1600&h=900&fit=crop",
    rating: 4.5,
    viewsCount: 2_400_000,
    durationLabel: "75s eps · 44 episodes",
    isNew: true,
    isHot: false,
    isFeatured: false,
    isTrending: false,
    isRecommended: false,
    trendingRank: null,
    episodes: Array.from({ length: 8 }).map((_, i) => ({
      title: `Episode ${i + 1}`,
      durationSeconds: 70,
      isLockedByDefault: i >= 4,
      unlockCost: i >= 4 ? 25 : 0,
    })),
  },
  {
    id: "fake-marriage",
    title: "Our Very Fake Marriage",
    description:
      "She needed a green card. He needed a wife to inherit his grandfather's vineyard. Two years, no feelings. That was the deal.",
    category: "Romantic Comedy",
    genre: ["Romance", "Comedy"],
    releaseYear: 2025,
    coverUrl:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&h=900&fit=crop",
    bannerUrl:
      "https://images.unsplash.com/photo-1505873242700-f289a29e1e0f?w=1600&h=900&fit=crop",
    rating: 4.6,
    viewsCount: 3_300_000,
    durationLabel: "60s eps · 32 episodes",
    isNew: false,
    isHot: false,
    isFeatured: false,
    isTrending: false,
    isRecommended: false,
    trendingRank: null,
    episodes: Array.from({ length: 8 }).map((_, i) => ({
      title: `Episode ${i + 1}`,
      durationSeconds: 60,
      isLockedByDefault: i >= 4,
      unlockCost: i >= 4 ? 20 : 0,
    })),
  },
];

export async function seedIfEmpty(): Promise<void> {
  const [{ count: dramaCount }] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(dramasTable);

  if (dramaCount > 0) {
    logger.info({ dramaCount }, "Seed skipped — data already present");
    return;
  }

  logger.info("Seeding initial DramaShort data");

  await db
    .insert(usersTable)
    .values({
      id: DEMO_USER_ID,
      displayName: DEMO_USER_DISPLAY_NAME,
      avatarUrl: DEMO_USER_AVATAR_URL,
      coins: DEMO_USER_STARTING_COINS,
    })
    .onConflictDoNothing();

  for (const d of DRAMAS) {
    await db
      .insert(dramasTable)
      .values({
        id: d.id,
        title: d.title,
        description: d.description,
        category: d.category,
        genre: d.genre,
        releaseYear: d.releaseYear,
        coverUrl: d.coverUrl,
        bannerUrl: d.bannerUrl,
        rating: d.rating,
        viewsCount: d.viewsCount,
        episodesCount: d.episodes.length,
        durationLabel: d.durationLabel,
        isNew: d.isNew,
        isHot: d.isHot,
        isFeatured: d.isFeatured,
        isTrending: d.isTrending,
        isRecommended: d.isRecommended,
        trendingRank: d.trendingRank,
      })
      .onConflictDoNothing();

    for (let i = 0; i < d.episodes.length; i++) {
      const ep = d.episodes[i];
      await db
        .insert(episodesTable)
        .values({
          id: `${d.id}-ep-${i + 1}`,
          dramaId: d.id,
          episodeNumber: i + 1,
          title: ep.title,
          durationSeconds: ep.durationSeconds,
          thumbnailUrl: d.coverUrl,
          videoUrl: SAMPLE_VIDEOS[i % SAMPLE_VIDEOS.length],
          isLockedByDefault: ep.isLockedByDefault,
          unlockCost: ep.unlockCost,
        })
        .onConflictDoNothing();
    }
  }

  logger.info({ dramaCount: DRAMAS.length }, "Seed complete");
}
