import type { DramaRow, EpisodeRow } from "@workspace/db";

export function serializeDrama(row: DramaRow) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    genre: row.genre,
    releaseYear: row.releaseYear,
    coverUrl: row.coverUrl,
    bannerUrl: row.bannerUrl,
    rating: row.rating,
    viewsCount: row.viewsCount,
    episodesCount: row.episodesCount,
    durationLabel: row.durationLabel,
    isNew: row.isNew,
    isHot: row.isHot,
  };
}

export function serializeEpisode(
  row: EpisodeRow,
  opts: { unlocked: boolean },
) {
  return {
    id: row.id,
    dramaId: row.dramaId,
    episodeNumber: row.episodeNumber,
    title: row.title,
    durationSeconds: row.durationSeconds,
    thumbnailUrl: row.thumbnailUrl,
    videoUrl: row.videoUrl,
    isLocked: row.isLockedByDefault && !opts.unlocked,
    unlockCost: row.unlockCost,
  };
}
