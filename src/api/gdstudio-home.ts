import { searchGdMusic } from "@/api/gdstudio";
import type { CoverType, SongType } from "@/types/main";

export type GdHomeSectionKey = "playlist" | "radar" | "artist" | "album";

type GdHomePreset = {
  query: string;
  source?: string;
  label?: string;
};

export type GdHomeSection = {
  key: GdHomeSectionKey;
  name: string;
  list: CoverType[];
  songs: SongType[];
};

const homePresets: Record<GdHomeSectionKey, { name: string; items: GdHomePreset[] }> = {
  playlist: {
    name: "推荐歌曲",
    items: [
      { query: "晴天 周杰伦" },
      { query: "Love Story Taylor Swift" },
      { query: "打上花火 DAOKO" },
      { query: "成都 赵雷" },
      { query: "Yellow Coldplay" },
      { query: "孤勇者 陈奕迅" },
    ],
  },
  radar: {
    name: "场景雷达",
    items: [
      { query: "夜空中最亮的星", label: "夜晚" },
      { query: "River Flows in You", label: "学习" },
      { query: "Hall of Fame", label: "运动" },
      { query: "平凡之路", label: "通勤" },
      { query: "春日影", label: "治愈" },
      { query: "Weightless Marconi Union", label: "睡眠" },
    ],
  },
  artist: {
    name: "歌手推荐",
    items: [
      { query: "七里香 周杰伦", label: "周杰伦" },
      { query: "Cruel Summer Taylor Swift", label: "Taylor Swift" },
      { query: "カタオモイ Aimer", label: "Aimer" },
      { query: "富士山下 陈奕迅", label: "陈奕迅" },
      { query: "Viva La Vida Coldplay", label: "Coldplay" },
      { query: "泡沫 邓紫棋", label: "邓紫棋" },
    ],
  },
  album: {
    name: "新碟精选",
    items: [
      { query: "The Fate of Ophelia Taylor Swift" },
      { query: "IRIS OUT 米津玄師" },
      { query: "Golden HUNTR/X" },
      { query: "APT. ROSÉ Bruno Mars" },
      { query: "Die With A Smile" },
      { query: "像晴天像雨天" },
    ],
  },
};

const loadPreset = async (preset: GdHomePreset): Promise<SongType | null> => {
  const result = await searchGdMusic(preset.query, preset.source || "netease");
  const song = result.songs[0];
  if (!song) return null;
  return song;
};

const loadWithConcurrency = async (presets: GdHomePreset[], concurrency = 4) => {
  const songs: ({ song: SongType; preset: GdHomePreset } | null)[] = new Array(presets.length).fill(
    null,
  );
  let nextIndex = 0;
  const worker = async () => {
    while (nextIndex < presets.length) {
      const index = nextIndex++;
      try {
        const song = await loadPreset(presets[index]);
        if (song) songs[index] = { song, preset: presets[index] };
      } catch (error) {
        console.warn(`首页推荐获取失败：${presets[index].query}`, error);
      }
    }
  };
  await Promise.all(Array.from({ length: concurrency }, worker));
  return songs.filter((item): item is { song: SongType; preset: GdHomePreset } => Boolean(item));
};

export const loadGdHomeSections = async (): Promise<GdHomeSection[]> => {
  const entries = Object.entries(homePresets) as [
    GdHomeSectionKey,
    (typeof homePresets)[GdHomeSectionKey],
  ][];
  return Promise.all(
    entries.map(async ([key, section]) => {
      const results = await loadWithConcurrency(section.items);
      const songs = results.map((item) => item.song);
      return {
        key,
        name: section.name,
        songs,
        list: results.map(({ song, preset }) => ({
          id: song.id,
          name: preset.label || song.name,
          cover: song.cover,
          description:
            typeof song.artists === "string"
              ? `${song.artists} · ${typeof song.album === "string" ? song.album : song.album.name}`
              : undefined,
        })),
      };
    }),
  );
};
