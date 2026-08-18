<template>
  <div class="home">
    <n-card class="hero" :bordered="false">
      <n-flex vertical :size="18">
        <n-text depth="3">2MORO MUSIC</n-text>
        <n-h1>想听什么？</n-h1>
        <n-text depth="3">从右上角搜索歌曲，双击即可加入播放队列。</n-text>
        <n-flex align="center" :size="8">
          <n-tag round type="primary">网易云</n-tag>
          <n-tag round>Joox</n-tag>
          <n-tag round>Bilibili</n-tag>
        </n-flex>
        <n-text depth="3" class="attribution">音乐数据由 GD音乐台 提供</n-text>
      </n-flex>
    </n-card>
  </div>
</template>

<style lang="scss" scoped>
.home {
  display: grid;
  place-items: center;
  width: 100%;
  min-height: 100%;
}

.hero {
  width: min(680px, 100%);
  padding: 28px;

  .n-h1 {
    margin: 0;
    font-size: clamp(42px, 8vw, 72px);
    line-height: 1.05;
  }

  .attribution {
    margin-top: 12px;
    font-size: 12px;
  }
}
</style>
