<!-- 2moro OneDrive 歌单 -->
<template>
  <div class="two-moro-list">
    <ListDetail
      :detail-data="detailData"
      :list-data="listData"
      :loading="showLoading"
      :list-scrolling="listScrolling"
      :search-value="searchValue"
      :config="listConfig"
      :play-button-text="playButtonText"
      :more-options="moreOptions"
      hide-comment-tab
      @update:search-value="handleSearchUpdate"
      @play-all="playAllSongs"
    />
    <Transition name="fade" mode="out-in">
      <SongList
        v-if="!searchValue || searchData?.length"
        :data="displayData"
        :loading="loading"
        :height="songListHeight"
        @scroll="handleListScroll"
      />
      <n-empty
        v-else
        :description="`搜不到关于 ${searchValue} 的任何歌曲呀`"
        style="margin-top: 60px"
        size="large"
      >
        <template #icon>
          <SvgIcon name="SearchOff" />
        </template>
      </n-empty>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import type { DropdownOption } from "naive-ui";
import type { CoverType } from "@/types/main";
import { getTwoMoroLibrary } from "@/api/twoMoro";
import { renderIcon } from "@/utils/helper";
import { useListDetail } from "@/composables/List/useListDetail";
import { useListSearch } from "@/composables/List/useListSearch";
import { useListScroll } from "@/composables/List/useListScroll";
import { useListActions } from "@/composables/List/useListActions";

const { detailData, listData, loading, getSongListHeight, setDetailData, setListData, setLoading } =
  useListDetail();
const { searchValue, searchData, displayData, clearSearch, performSearch } =
  useListSearch(listData);
const { listScrolling, handleListScroll, resetScroll } = useListScroll();
const { playAllSongs: playAllSongsAction } = useListActions();

const songListHeight = computed(() => getSongListHeight(listScrolling.value));
const showLoading = computed(() => listData.value.length === 0 && loading.value);
const playButtonText = computed(() => (showLoading.value ? "加载中..." : "播放"));

const listConfig = {
  titleType: "normal" as const,
  showCoverMask: false,
  showPlayCount: false,
  showArtist: false,
  showCreator: false,
  showCount: true,
  searchAlign: "center" as const,
};

const moreOptions = computed<DropdownOption[]>(() => [
  {
    label: "刷新 OneDrive 歌单",
    key: "refresh",
    props: { onClick: () => loadLibrary(true) },
    icon: renderIcon("Refresh"),
  },
  {
    label: "查看公开源码",
    key: "source",
    props: { onClick: () => window.open("https://github.com/WWangZQ/SPlayer-fork") },
    icon: renderIcon("Github"),
  },
]);

const loadLibrary = async (refresh = false) => {
  setLoading(true);
  clearSearch();
  resetScroll();
  try {
    const library = await getTwoMoroLibrary(refresh);
    setListData(library.songs);
    setDetailData({
      id: "2moro-onedrive",
      name: "我的 OneDrive",
      cover: "/images/album.jpg?asset",
      description: "由 2moro Music API 读取，播放流量由 OneDrive 直接提供",
      count: library.count,
      updateTime: Date.parse(library.generatedAt),
    } as CoverType);
  } catch (error) {
    console.error("获取 2moro OneDrive 歌单失败", error);
    window.$message.error("暂时无法读取 OneDrive 歌单");
  } finally {
    setLoading(false);
  }
};

const handleSearchUpdate = (value: string) => {
  searchValue.value = value;
  performSearch(value);
};

const playAllSongs = useDebounceFn(() => {
  if (!displayData.value.length) return;
  playAllSongsAction(displayData.value);
}, 300);

onMounted(() => loadLibrary());
</script>

<style lang="scss" scoped>
.two-moro-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}
</style>
