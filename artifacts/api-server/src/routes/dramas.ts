import { Router, type IRouter } from "express";
import {
  and,
  asc,
  desc,
  eq,
  ilike,
  inArray,
  sql,
} from "drizzle-orm";
import {
  db,
  dramasTable,
  episodesTable,
  favoritesTable,
  unlockedEpisodesTable,
} from "@workspace/db";
import {
  ListDramasQueryParams,
  ListDramasResponse,
  ListFeaturedDramasResponse,
  ListTrendingDramasResponse,
  ListRecommendedDramasResponse,
  ListGenresResponse,
  GetDramaParams,
  GetDramaResponse,
} from "@workspace/api-zod";
import { DEMO_USER_ID } from "../lib/currentUser";
import { serializeDrama, serializeEpisode } from "../lib/serializers";

const router: IRouter = Router();

router.get("/dramas", async (req, res): Promise<void> => {
  const params = ListDramasQueryParams.safeParse(req.query);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const conditions = [];
  if (params.data.search) {
    conditions.push(ilike(dramasTable.title, `%${params.data.search}%`));
  }
  if (params.data.genre) {
    conditions.push(
      sql`${params.data.genre} = ANY(${dramasTable.genre})`,
    );
  }

  let orderBy;
  switch (params.data.sort) {
    case "newest":
      orderBy = desc(dramasTable.releaseYear);
      break;
    case "trending":
      orderBy = asc(
        sql`COALESCE(${dramasTable.trendingRank}, 999999)`,
      );
      break;
    case "popular":
    default:
      orderBy = desc(dramasTable.viewsCount);
  }

  const rows = await db
    .select()
    .from(dramasTable)
    .where(conditions.length ? and(...conditions) : undefined)
    .orderBy(orderBy);

  res.json(ListDramasResponse.parse(rows.map(serializeDrama)));
});

router.get("/dramas/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(dramasTable)
    .where(eq(dramasTable.isFeatured, true))
    .orderBy(desc(dramasTable.rating));
  res.json(ListFeaturedDramasResponse.parse(rows.map(serializeDrama)));
});

router.get("/dramas/trending", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(dramasTable)
    .where(eq(dramasTable.isTrending, true))
    .orderBy(asc(sql`COALESCE(${dramasTable.trendingRank}, 999999)`));
  res.json(ListTrendingDramasResponse.parse(rows.map(serializeDrama)));
});

router.get("/dramas/recommended", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(dramasTable)
    .where(eq(dramasTable.isRecommended, true))
    .orderBy(desc(dramasTable.rating));
  res.json(ListRecommendedDramasResponse.parse(rows.map(serializeDrama)));
});

router.get("/dramas/genres", async (_req, res): Promise<void> => {
  const rows = await db.execute<{ name: string; count: number }>(
    sql`SELECT g AS name, COUNT(*)::int AS count
        FROM (SELECT UNNEST(${dramasTable.genre}) AS g FROM ${dramasTable}) sub
        GROUP BY g
        ORDER BY count DESC, name ASC`,
  );

  res.json(
    ListGenresResponse.parse(
      rows.rows.map((r) => ({ name: r.name, count: Number(r.count) })),
    ),
  );
});

router.get("/dramas/:id", async (req, res): Promise<void> => {
  const params = GetDramaParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [drama] = await db
    .select()
    .from(dramasTable)
    .where(eq(dramasTable.id, params.data.id));

  if (!drama) {
    res.status(404).json({ error: "Drama not found" });
    return;
  }

  const episodes = await db
    .select()
    .from(episodesTable)
    .where(eq(episodesTable.dramaId, drama.id))
    .orderBy(asc(episodesTable.episodeNumber));

  const unlocked = await db
    .select({ episodeId: unlockedEpisodesTable.episodeId })
    .from(unlockedEpisodesTable)
    .where(
      and(
        eq(unlockedEpisodesTable.userId, DEMO_USER_ID),
        episodes.length
          ? inArray(
              unlockedEpisodesTable.episodeId,
              episodes.map((e) => e.id),
            )
          : sql`false`,
      ),
    );
  const unlockedSet = new Set(unlocked.map((u) => u.episodeId));

  const [favRow] = await db
    .select()
    .from(favoritesTable)
    .where(
      and(
        eq(favoritesTable.userId, DEMO_USER_ID),
        eq(favoritesTable.dramaId, drama.id),
      ),
    );

  const result = {
    ...serializeDrama(drama),
    episodes: episodes.map((e) =>
      serializeEpisode(e, { unlocked: unlockedSet.has(e.id) }),
    ),
    isFavorite: !!favRow,
  };

  res.json(GetDramaResponse.parse(result));
});

export default router;
