import { QualityType, type SongType } from "@/types/main";

type GdTrack = {
  id: string;
  name: string;
  artists: string[];
  album: string;
  source: string;
  lyricId: string;
  picId: string;
};

type GdSearchResponse = {
  count: number;
  tracks: GdTrack[];
  attribution: string;
};

type GdLyricResponse = {
  lyric: string;
  translatedLyric: string;
};

export const gdQualityLevels = [
  { name: "标准音质", level: "standard", value: "l", br: 128 },
  { name: "较高音质", level: "higher", value: "m", br: 192 },
  { name: "极高音质", level: "exhigh", value: "h", br: 320 },
  { name: "无损音质", level: "lossless", value: "sq", br: 740 },
  { name: "Hi-Res", level: "hires", value: "hr", br: 999 },
] as const;

export const getGdStreamUrl = (source: string, id: string, bitrate = 320) =>
  `/api/v1/gd/tracks/${encodeURIComponent(source)}/${encodeURIComponent(id)}/stream?br=${bitrate}`;

const stableNumericId = (value: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 1;
};

const convertTrack = (track: GdTrack): SongType => ({
  id: stableNumericId(`${track.source}:${track.id}`),
  name: track.name,
  artists: track.artists.join(" / ") || "未知艺术家",
  album: track.album || "未知专辑",
  cover: track.picId
    ? `/api/v1/gd/covers/${encodeURIComponent(track.source)}/${encodeURIComponent(track.picId)}?size=500`
    : "/images/album.jpg?asset",
  duration: 0,
  free: 0,
  mv: null,
  type: "streaming",
  quality: QualityType.HQ,
  streamUrl: getGdStreamUrl(track.source, track.id),
  originalId: track.id,
  lyricId: track.lyricId,
  serverType: "gdstudio",
  serverId: track.source,
});

export const searchGdMusic = async (name: string, source = "netease", page = 1) => {
  const query = new URLSearchParams({ name, source, page: String(page), count: "20" });
  const response = await fetch(`/api/v1/gd/search?${query}`);
  if (!response.ok) throw new Error(`全网搜索失败：${response.status}`);
  const result = (await response.json()) as GdSearchResponse;
  return { ...result, songs: result.tracks.map(convertTrack) };
};

export const getGdLyrics = async (song: SongType): Promise<GdLyricResponse> => {
  if (!song.serverId || !song.originalId) return { lyric: "", translatedLyric: "" };
  const lyricId = song.lyricId || song.originalId;
  const response = await fetch(
    `/api/v1/gd/tracks/${encodeURIComponent(song.serverId)}/${encodeURIComponent(lyricId)}/lyrics`,
  );
  if (!response.ok) throw new Error(`歌词请求失败：${response.status}`);
  return response.json();
};
