<template>
  <div class="home-online">
    <!-- 登录功能 -->
    <div v-if="isLogin()" class="main-rec">
      <div class="main-rec-grid">
        <n-flex :size="20" class="rec-list" justify="space-between" vertical>
          <!-- 每日推荐 -->
          <SongListCard
            :data="musicStore.dailySongsData.list"
            :title="dailySongsTitle"
            :height="90"
            description="根据你的音乐口味 · 每日更新"
            size="small"
            :hiddenCover="settingStore.hiddenCovers.home"
            @click="router.push({ name: 'daily-songs' })"
          />
          <!-- 我喜欢的音乐 -->
          <SongListCard
            :data="dataStore.likeSongsList.data"
            :height="90"
            title="我喜欢的音乐"
            description="发现你独特的音乐品味"
            size="small"
            :hiddenCover="settingStore.hiddenCovers.home"
            @click="router.push({ name: 'like-songs' })"
          />
        </n-flex>
        <!-- 私人FM -->
        <PersonalFM />
      </div>
    </div>
    <!-- 公共推荐 -->
    <div v-for="(item, index) in sortedRecData" :key="index" class="rec-public">
      <n-flex
        class="title"
        align="center"
        justify="space-between"
        @click="router.push({ path: item.path ?? undefined })"
      >
        <n-h3 prefix="bar">
          <n-text>{{ item.name }}</n-text>
          <SvgIcon v-if="item.path" :size="26" name="Right" />
        </n-h3>
      </n-flex>
      <!-- 列表 -->
      <CoverList
        :data="item.list"
        type="playlist"
        :recommendationSongs="item.songs"
        :loading="loading"
        :loadingNum="6"
        emptyDescription="该栏目暂时没有可用推荐"
        :hiddenCover="settingStore.hiddenCovers.home"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import type { CoverType, SongType } from "@/types/main";
import { NText } from "naive-ui";
import { useDataStore, useMusicStore, useSettingStore } from "@/stores";
import { loadGdHomeSections, type GdHomeSectionKey } from "@/api/gdstudio-home";
import { isLogin } from "@/utils/auth";
import SvgIcon from "@/components/Global/SvgIcon.vue";

interface RecItemTypeBase {
  name: string;
  path?: string;
}

interface RecItemCover extends RecItemTypeBase {
  type: "playlist";
  list: CoverType[];
  songs: SongType[];
}

type RecDataType = Partial<Record<GdHomeSectionKey, RecItemCover>>;

const router = useRouter();
const dataStore = useDataStore();
const musicStore = useMusicStore();
const settingStore = useSettingStore();
const loading = ref(false);

// 日推标题
const dailySongsTitle = computed(() => {
  if (settingStore.hiddenCovers.home) return "每日推荐";
  const day = new Date().getDate();
  return h("div", { class: "date" }, [
    h("div", { class: "date-icon" }, [
      h(SvgIcon, { name: "Calendar-Empty", size: 30, depth: 2 }),
      h(NText, null, () => day),
    ]),
    h(NText, { class: "name text-hidden" }, () => ["每日推荐"]),
  ]);
});

// 推荐数据
const createEmptySection = (name: string): RecItemCover => ({
  name,
  type: "playlist",
  list: [],
  songs: [],
});

const recData = ref<RecDataType>({
  playlist: createEmptySection("推荐歌曲"),
  radar: createEmptySection("场景雷达"),
  artist: createEmptySection("歌手推荐"),
  album: createEmptySection("新碟精选"),
});

// 根据设置过滤和排序推荐数据
const sortedRecData = computed(() => {
  const sections = settingStore.homePageSections
    .filter((section) => section.visible)
    .sort((a, b) => a.order - b.order)
    .map((section) => {
      const key = section.key as GdHomeSectionKey;
      return recData.value[key];
    })
    .filter((item): item is RecItemCover => Boolean(item));
  return sections;
});

// 获取全部推荐
const getAllRecData = async () => {
  if (loading.value) return;
  loading.value = true;
  try {
    const sections = await loadGdHomeSections();
    recData.value = Object.fromEntries(
      sections.map((section) => [
        section.key,
        {
          name: section.name,
          type: "playlist",
          list: section.list,
          songs: section.songs,
        },
      ]),
    );
  } catch (error) {
    window.$message.error("首页推荐获取出错");
    console.error("首页推荐获取出错:", error);
  } finally {
    loading.value = false;
  }
};

onActivated(getAllRecData);

onMounted(() => {
  getAllRecData();
});
</script>

<style lang="scss" scoped>
.main-rec {
  .main-rec-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }
  .date {
    display: flex;
    align-items: center;
    margin-bottom: 4px;
    .date-icon {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 4px;
      .n-text {
        position: absolute;
        font-size: 12px;
        color: var(--primary-hex);
        line-height: normal;
        margin-top: 4px;
        transform: scale(0.8);
      }
    }
    .name {
      font-size: 18px;
      font-weight: bold;
    }
  }
  @media (max-width: 768px) {
    .main-rec-grid {
      grid-template-columns: repeat(1, 1fr);
    }
    .rec-list {
      display: grid !important;
      grid-template-columns: repeat(2, 1fr);
    }
  }
}
.title {
  margin-top: 28px;
  padding: 0 4px;
  width: max-content;
  .n-h {
    margin: 0;
    display: flex;
    align-items: center;
    cursor: pointer;
    .n-icon {
      opacity: 0;
      transform: translateX(4px);
      transition:
        opacity 0.3s,
        transform 0.3s;
    }
    &:hover {
      .n-icon {
        opacity: 1;
        transform: translateX(0);
      }
    }
  }
}
</style>
