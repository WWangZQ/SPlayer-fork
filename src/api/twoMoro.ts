import type { SongType } from "@/types/main";

type TwoMoroTrack = {
  id: string;
  name: string;
  title?: string;
  artist?: string;
  album?: string;
  path: string;
  size?: number;
  mimeType?: string;
  createdAt?: string;
  updatedAt?: string;
  streamUrl: string;
};

type TwoMoroLibrary = {
  generatedAt: string;
  count: number;
  tracks: TwoMoroTrack[];
};

const apiBase = (import.meta.env.VITE_2MORO_API_BASE || "").replace(/\/$/, "");

/** 将字符串转换为稳定的正整数 */
const stableNumericId = (value: string): number => {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0 || 1;
};

/** 补全 API 返回的相对地址 */
const resolveApiUrl = (value: string): string => {
  if (/^https?:\/\//i.test(value)) return value;
  if (apiBase) return `${apiBase}${value.startsWith("/") ? value : `/${value}`}`;
  return new URL(value, window.location.origin).toString();
};

/** 转换为 SPlayer 统一歌曲格式 */
const convertTrack = (track: TwoMoroTrack): SongType => ({
  id: stableNumericId(track.id),
  name: track.title || track.name.replace(/\.[^.]+$/, ""),
  artists: track.artist || "未知艺术家",
  album: track.album || "我的 OneDrive",
  cover: "/images/album.jpg?asset",
  duration: 0,
  free: 0,
  mv: null,
  size: track.size,
  createTime: track.createdAt ? Date.parse(track.createdAt) : undefined,
  updateTime: track.updatedAt ? Date.parse(track.updatedAt) : undefined,
  type: "streaming",
  streamUrl: resolveApiUrl(track.streamUrl),
  originalId: track.id,
  serverType: "2moro",
});

/** 获取 2moro OneDrive 歌单 */
export const getTwoMoroLibrary = async (refresh = false) => {
  const response = await fetch(`${apiBase}/api/v1/library${refresh ? "?refresh=1" : ""}`, {
    headers: { Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`2moro API 请求失败：${response.status}`);
  const library = (await response.json()) as TwoMoroLibrary;
  return {
    generatedAt: library.generatedAt,
    count: library.count,
    songs: library.tracks.map(convertTrack),
  };
};
