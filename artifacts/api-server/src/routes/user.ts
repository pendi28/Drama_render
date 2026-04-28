import { Router, type IRouter } from "express";
import { eq, count } from "drizzle-orm";
import {
  db,
  usersTable,
  favoritesTable,
  progressTable,
} from "@workspace/db";
import {
  GetMeResponse,
  PurchaseCoinsBody,
  PurchaseCoinsResponse,
  ListCoinPacksResponse,
} from "@workspace/api-zod";
import { DEMO_USER_ID } from "../lib/currentUser";

const router: IRouter = Router();

const COIN_PACKS = [
  { id: "starter", coins: 100, priceUsd: 0.99, bonus: 0, label: "Starter" },
  { id: "fan", coins: 300, priceUsd: 2.99, bonus: 30, label: "Fan Pack" },
  { id: "binge", coins: 800, priceUsd: 6.99, bonus: 120, label: "Binge Pack" },
  {
    id: "obsessed",
    coins: 2000,
    priceUsd: 14.99,
    bonus: 400,
    label: "Obsessed",
  },
];

async function getMeProfile() {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.id, DEMO_USER_ID));

  if (!user) {
    throw new Error("Demo user not initialized");
  }

  const [{ value: favoritesCount }] = await db
    .select({ value: count() })
    .from(favoritesTable)
    .where(eq(favoritesTable.userId, DEMO_USER_ID));

  const [{ value: watchedCount }] = await db
    .select({ value: count() })
    .from(progressTable)
    .where(eq(progressTable.userId, DEMO_USER_ID));

  return {
    id: user.id,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
    coins: user.coins,
    favoritesCount,
    watchedCount,
    memberSince: user.memberSince.toISOString(),
  };
}

router.get("/me", async (_req, res): Promise<void> => {
  const profile = await getMeProfile();
  res.json(GetMeResponse.parse(profile));
});

router.get("/coins/packs", async (_req, res): Promise<void> => {
  res.json(ListCoinPacksResponse.parse(COIN_PACKS));
});

router.post("/coins/purchase", async (req, res): Promise<void> => {
  const parsed = PurchaseCoinsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const pack = COIN_PACKS.find((p) => p.id === parsed.data.packId);
  if (!pack) {
    res.status(404).json({ error: "Coin pack not found" });
    return;
  }
  const totalCoins = pack.coins + pack.bonus;
  await db
    .update(usersTable)
    .set({
      coins: (
        await db
          .select({ coins: usersTable.coins })
          .from(usersTable)
          .where(eq(usersTable.id, DEMO_USER_ID))
      )[0].coins + totalCoins,
    })
    .where(eq(usersTable.id, DEMO_USER_ID));

  const profile = await getMeProfile();
  res.json(PurchaseCoinsResponse.parse(profile));
});

export default router;
