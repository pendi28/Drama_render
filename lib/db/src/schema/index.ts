import {
  pgTable,
  text,
  integer,
  real,
  boolean,
  timestamp,
  primaryKey,
  index,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  displayName: text("display_name").notNull(),
  avatarUrl: text("avatar_url").notNull(),
  coins: integer("coins").notNull().default(0),
  memberSince: timestamp("member_since", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const dramasTable = pgTable("dramas", {
  id: text("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  genre: text("genre").array().notNull().default([]),
  releaseYear: integer("release_year").notNull(),
  coverUrl: text("cover_url").notNull(),
  bannerUrl: text("banner_url").notNull(),
  rating: real("rating").notNull().default(0),
  viewsCount: integer("views_count").notNull().default(0),
  episodesCount: integer("episodes_count").notNull().default(0),
  durationLabel: text("duration_label").notNull(),
  isNew: boolean("is_new").notNull().default(false),
  isHot: boolean("is_hot").notNull().default(false),
  isFeatured: boolean("is_featured").notNull().default(false),
  isTrending: boolean("is_trending").notNull().default(false),
  isRecommended: boolean("is_recommended").notNull().default(false),
  trendingRank: integer("trending_rank"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const episodesTable = pgTable(
  "episodes",
  {
    id: text("id").primaryKey(),
    dramaId: text("drama_id")
      .notNull()
      .references(() => dramasTable.id, { onDelete: "cascade" }),
    episodeNumber: integer("episode_number").notNull(),
    title: text("title").notNull(),
    durationSeconds: integer("duration_seconds").notNull(),
    thumbnailUrl: text("thumbnail_url").notNull(),
    videoUrl: text("video_url").notNull(),
    isLockedByDefault: boolean("is_locked_by_default").notNull().default(false),
    unlockCost: integer("unlock_cost").notNull().default(0),
  },
  (table) => ({
    dramaIdx: index("episodes_drama_idx").on(table.dramaId),
  }),
);

export const unlockedEpisodesTable = pgTable(
  "unlocked_episodes",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    episodeId: text("episode_id")
      .notNull()
      .references(() => episodesTable.id, { onDelete: "cascade" }),
    unlockedAt: timestamp("unlocked_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.episodeId] }),
  }),
);

export const favoritesTable = pgTable(
  "favorites",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    dramaId: text("drama_id")
      .notNull()
      .references(() => dramasTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.dramaId] }),
  }),
);

export const progressTable = pgTable(
  "progress",
  {
    userId: text("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    episodeId: text("episode_id")
      .notNull()
      .references(() => episodesTable.id, { onDelete: "cascade" }),
    progressSeconds: integer("progress_seconds").notNull().default(0),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.userId, table.episodeId] }),
    userIdx: index("progress_user_idx").on(table.userId),
  }),
);

export const dramasRelations = relations(dramasTable, ({ many }) => ({
  episodes: many(episodesTable),
}));

export const episodesRelations = relations(episodesTable, ({ one }) => ({
  drama: one(dramasTable, {
    fields: [episodesTable.dramaId],
    references: [dramasTable.id],
  }),
}));

export type DramaRow = typeof dramasTable.$inferSelect;
export type EpisodeRow = typeof episodesTable.$inferSelect;
export type UserRow = typeof usersTable.$inferSelect;
