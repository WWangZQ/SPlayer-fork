<template>
  <div class="search-type">
    <n-flex class="source-bar" align="center" justify="space-between">
      <n-radio-group v-model:value="source" size="small" @update:value="changeSource">
        <n-radio-button value="netease">网易云</n-radio-button>
        <n-radio-button value="joox">Joox</n-radio-button>
        <n-radio-button value="bilibili">Bilibili</n-radio-button>
      </n-radio-group>
      <n-text depth="3">音乐数据由 GD音乐台 提供</n-text>
    </n-flex>
    <Transition name="fade" mode="out-in">
      <SongList
        v-if="searchResultData.length > 0"
        :data="searchResultData"
        :loading="loading"
        doubleClickAction="add"
        loadMore
        disabledSort
        @reachBottom="reachBottom"
      />
      <n-empty
        v-else-if="!loading"
        :description="`很抱歉，未能找到与 ${keyword} 相关的任何歌曲`"
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
import type { SongType } from "@/types/main";
import { searchGdMusic } from "@/api/gdstudio";

const props = defineProps<{ keyword: string }>();

const source = ref("netease");
const page = ref(1);
const hasMore = ref(true);
const loading = ref(true);
const searchResultData = ref<SongType[]>([]);

const getSearchResult = async (reset = false) => {
  if (loading.value && !reset && searchResultData.value.length) return;
  if (reset) {
    page.value = 1;
    hasMore.value = true;
    searchResultData.value = [];
  }
  loading.value = true;
  try {
    const result = await searchGdMusic(props.keyword, source.value, page.value);
    searchResultData.value.push(...result.songs);
    hasMore.value = result.songs.length === 20;
  } catch (error) {
    console.error("全网搜索失败", error);
    window.$message.error("搜索请求过于频繁或上游暂时不可用");
    hasMore.value = false;
  } finally {
    loading.value = false;
  }
};

const reachBottom = () => {
  if (!hasMore.value || loading.value) return;
  page.value++;
  getSearchResult();
};

const changeSource = () => getSearchResult(true);

watch(
  () => props.keyword,
  () => getSearchResult(true),
);

onMounted(() => getSearchResult(true));
</script>

<style lang="scss" scoped>
.search-type {
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.source-bar {
  padding: 0 4px 12px;
}
</style>
