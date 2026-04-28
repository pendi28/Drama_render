import { Router, type IRouter } from "express";
import { and, asc, eq, gt, lt, desc } from "drizzle-orm";
import {
  db,
  episodesTable,
  dramasTable,
  unlockedEpisodesTable,
  usersTable,
  progressTable,
} from "@workspace/db";
import {
  GetEpisodeParams,
  GetEpisodeResponse,
  UnlockEpisodeParams,
  UnlockEpisodeResponse,
} from "@workspace/api-zod";
import { DEMO_USER_ID } from "../lib/currentUser";
import { serializeDrama, serializeEpisode } from "../lib/serializers";

const router: IRouter = Router();

router.get("/episodes/:id", async (req, res): Promise<void> => {
  const params = GetEpisodeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [episode] = await db
    .select()
    .from(episodesTable)
    .where(eq(episodesTable.id, params.data.id));

  if (!episode) {
    res.status(404).json({ error: "Episode not found" });
    return;
  }

  const [drama] = await db
    .select()
    .from(dramasTable)
    .where(eq(dramasTable.id, episode.dramaId));

  if (!drama) {
    res.status(404).json({ error: "Drama not found" });
    return;
  }

  const [prev] = await db
    .select()
    .from(episodesTable)
    .where(
      and(
        eq(episodesTable.dramaId, drama.id),
        lt(episodesTable.episodeNumber, episode.episodeNumber),
      ),
    )
    .orderBy(desc(episodesTable.episodeNumber))
    .limit(1);

  const [next] = await db
    .select()
    .from(episodesTable)
    .where(
      and(
        eq(episodesTable.dramaId, drama.id),
        gt(episodesTable.episodeNumber, episode.episodeNumber),
      ),
    )
    .orderBy(asc(episodesTable.episodeNumber))
    .limit(1);

  const [unlocked] = await db
    .select()
    .from(unlockedEpisodesTable)
    .where(
      and(
        eq(unlockedEpisodesTable.userId, DEMO_USER_ID),
        eq(unlockedEpisodesTable.episodeId, episode.id),
      ),
    );

  const [progress] = await db
    .select()
    .from(progressTable)
    .where(
      and(
        eq(progressTable.userId, DEMO_USER_ID),
        eq(progressTable.episodeId, episode.id),
      ),
    );

  const result = {
    episode: serializeEpisode(episode, { unlocked: !!unlocked }),
    drama: serializeDrama(drama),
    prevEpisodeId: prev?.id ?? null,
    nextEpisodeId: next?.id ?? null,
    progressSeconds: progress?.progressSeconds ?? 0,
  };

  res.json(GetEpisodeResponse.parse(result));
});

router.post("/episodes/:id/unlock", async (req, res): Promise<void> => {
  const params = UnlockEpisodeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [episode] = await db
    .select()
    .from(episodesTable)
    .where(eq(episodesTable.id, params.data.id));

  if (!episode) {
    res.status(404).json({ error: "Episode not found" });
    return;
  }

  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, DEMO_USER_ID));

  if (!user) {
    res.status(500).json({ error: "User not initialized" });
    return;
  }

  const [existing] = await db
    .select()
    .from(unlockedEpisodesTable)
    .where(
      and(
        eq(unlockedEpisodesTable.userId, DEMO_USER_ID),
        eq(unlockedEpisodesTable.episodeId, episode.id),
      ),
    );

  let coinsRemaining = user.coins;
  if (!existing) {
    if (user.coins < episode.unlockCost) {
      res.status(402).json({ error: "Not enough coins" });
      return;
    }
    coinsRemaining = user.coins - episode.unlockCost;
    await db
      .update(usersTable)
      .set({ coins: coinsRemaining })
      .where(eq(usersTable.id, DEMO_USER_ID));
    await db
      .insert(unlockedEpisodesTable)
      .values({ userId: DEMO_USER_ID, episodeId: episode.id });
  }

  res.json(
    UnlockEpisodeResponse.parse({
      success: true,
      episode: serializeEpisode(episode, { unlocked: true }),
      coinsRemaining,
    }),
  );
});

export default router;
