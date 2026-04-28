import { Router, type IRouter } from "express";
import { and, desc, eq, inArray } from "drizzle-orm";
import {
  db,
  dramasTable,
  episodesTable,
  favoritesTable,
  progressTable,
  unlockedEpisodesTable,
} from "@workspace/db";
import {
  AddFavoriteBody,
  ListFavoritesResponse,
  AddFavoriteResponse,
  RemoveFavoriteParams,
  RemoveFavoriteResponse,
  ListContinueWatchingResponse,
  SaveProgressBody,
  SaveProgressResponse,
} from "@workspace/api-zod";
import { DEMO_USER_ID } from "../lib/currentUser";
import { serializeDrama, serializeEpisode } from "../lib/serializers";

const router: IRouter = Router();

async function getFavoriteDramas() {
  const favs = await db
    .select({ dramaId: favoritesTable.dramaId, createdAt: favoritesTable.createdAt })
    .from(favoritesTable)
    .where(eq(favoritesTable.userId, DEMO_USER_ID))
    .orderBy(desc(favoritesTable.createdAt));

  if (favs.length === 0) return [];

  const rows = await db
    .select()
    .from(dramasTable)
    .where(
      inArray(
        dramasTable.id,
        favs.map((f) => f.dramaId),
      ),
    );

  const order = new Map(favs.map((f, i) => [f.dramaId, i]));
  rows.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
  return rows.map(serializeDrama);
}

router.get("/library/favorites", async (_req, res): Promise<void> => {
  const list = await getFavoriteDramas();
  res.json(ListFavoritesResponse.parse(list));
});

router.post("/library/favorites", async (req, res): Promise<void> => {
  const parsed = AddFavoriteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  await db
    .insert(favoritesTable)
    .values({ userId: DEMO_USER_ID, dramaId: parsed.data.dramaId })
    .onConflictDoNothing();

  const list = await getFavoriteDramas();
  res.json(AddFavoriteResponse.parse(list));
});

router.delete("/library/favorites/:dramaId", async (req, res): Promise<void> => {
  const params = RemoveFavoriteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db
    .delete(favoritesTable)
    .where(
      and(
        eq(favoritesTable.userId, DEMO_USER_ID),
        eq(favoritesTable.dramaId, params.data.dramaId),
      ),
    );

  const list = await getFavoriteDramas();
  res.json(RemoveFavoriteResponse.parse(list));
});

router.get("/library/continue-watching", async (_req, res): Promise<void> => {
  const progressRows = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.userId, DEMO_USER_ID))
    .orderBy(desc(progressTable.updatedAt));

  if (progressRows.length === 0) {
    res.json(ListContinueWatchingResponse.parse([]));
    return;
  }

  const epRows = await db
    .select()
    .from(episodesTable)
    .where(
      inArray(
        episodesTable.id,
        progressRows.map((p) => p.episodeId),
      ),
    );
  const epMap = new Map(epRows.map((e) => [e.id, e]));

  const dramaIds = Array.from(new Set(epRows.map((e) => e.dramaId)));
  const dRows = dramaIds.length
    ? await db
        .select()
        .from(dramasTable)
        .where(inArray(dramasTable.id, dramaIds))
    : [];
  const dMap = new Map(dRows.map((d) => [d.id, d]));

  const unlocked = await db
    .select()
    .from(unlockedEpisodesTable)
    .where(eq(unlockedEpisodesTable.userId, DEMO_USER_ID));
  const unlockedSet = new Set(unlocked.map((u) => u.episodeId));

  const items = progressRows
    .map((p) => {
      const ep = epMap.get(p.episodeId);
      if (!ep) return null;
      const drama = dMap.get(ep.dramaId);
      if (!drama) return null;
      return {
        drama: serializeDrama(drama),
        episode: serializeEpisode(ep, { unlocked: unlockedSet.has(ep.id) }),
        progressSeconds: p.progressSeconds,
        progressPercent:
          ep.durationSeconds > 0
            ? Math.min(100, Math.round((p.progressSeconds / ep.durationSeconds) * 100))
            : 0,
        updatedAt: p.updatedAt.toISOString(),
      };
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  res.json(ListContinueWatchingResponse.parse(items));
});

router.post("/library/progress", async (req, res): Promise<void> => {
  const parsed = SaveProgressBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [ep] = await db
    .select()
    .from(episodesTable)
    .where(eq(episodesTable.id, parsed.data.episodeId));

  if (!ep) {
    res.status(404).json({ error: "Episode not found" });
    return;
  }

  const [drama] = await db
    .select()
    .from(dramasTable)
    .where(eq(dramasTable.id, ep.dramaId));

  if (!drama) {
    res.status(404).json({ error: "Drama not found" });
    return;
  }

  const now = new Date();
  await db
    .insert(progressTable)
    .values({
      userId: DEMO_USER_ID,
      episodeId: ep.id,
      progressSeconds: parsed.data.progressSeconds,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [progressTable.userId, progressTable.episodeId],
      set: {
        progressSeconds: parsed.data.progressSeconds,
        updatedAt: now,
      },
    });

  const [unlocked] = await db
    .select()
    .from(unlockedEpisodesTable)
    .where(
      and(
        eq(unlockedEpisodesTable.userId, DEMO_USER_ID),
        eq(unlockedEpisodesTable.episodeId, ep.id),
      ),
    );

  res.json(
    SaveProgressResponse.parse({
      drama: serializeDrama(drama),
      episode: serializeEpisode(ep, { unlocked: !!unlocked }),
      progressSeconds: parsed.data.progressSeconds,
      progressPercent:
        ep.durationSeconds > 0
          ? Math.min(
              100,
              Math.round((parsed.data.progressSeconds / ep.durationSeconds) * 100),
            )
          : 0,
      updatedAt: now.toISOString(),
    }),
  );
});

export default router;
