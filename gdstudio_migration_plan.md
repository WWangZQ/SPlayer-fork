# GD Studio API 迁移计划

## 目标

停止线上 OneDrive 曲库功能，将 SPlayer 的主要外部音乐能力切换为 GD Studio API，同时继续保持游戏云不代理音频文件。

## 源码归档

1. 在 `WWangZQ/2moro-music` 为当前提交创建 `onedrive-v0.1.0` 标签。
2. 标签永久保留 OneDrive 匿名共享目录解析器、旧版播放器、测试和使用文档。
3. 仓库中不保存学校分享链接、匿名访问令牌或线上环境变量。

## 新架构

```text
SPlayer Web
  -> 2moro Music API
       -> GD Studio API（搜索、播放地址、封面、歌词）

SPlayer Web
  -> 音乐源站直链（实际音频）
```

游戏云仅处理 JSON、统一数据格式、短时缓存和限流保护，不下载、不缓存、不转发音频内容。

## 后端改造

1. 删除生产服务对 `MUSIC_SHARE_URL` 和 SharePoint 解析器的依赖。
2. 新增 GD Studio 客户端，第一阶段只启用官方标为稳定的 `netease`、`joox`、`bilibili`。
3. 提供统一接口：搜索、播放地址、封面和歌词。
4. 对搜索、封面和歌词做短时缓存；播放地址只做很短缓存，避免过期链接。
5. 限制搜索结果数量并对搜索输入防抖，确保远低于上游“5 分钟 50 次”的限制。
6. 返回明确的来源字段，并在 API 与网页中注明“GD音乐台(music.gdstudio.xyz)”。

## SPlayer 改造

1. 删除“我的 OneDrive”菜单、页面、API 客户端和 `2moro` 流媒体类型扩展。
2. 新增 GD Studio 搜索适配，复用 SPlayer 的搜索页、歌曲列表、播放队列、封面和歌词能力。
3. 播放时向 2moro API 获取临时源站地址，然后由浏览器直接播放该地址。
4. 保留 SPlayer 原版权、AGPL 信息、上游链接和本 fork 的公开源码入口。

## 发布与回滚

1. 本地通过后端测试、SPlayer format、lint、类型检查和完整 Web 构建。
2. 创建新的 `/opt/apps/music/releases/<version>`，不覆盖当前 release。
3. 原子切换 music.service，保持本地端口 3008 和 FRP 5002 不变。
4. 验证搜索、封面、歌词、播放地址和音频 Range 请求。
5. 检查 FRP、Caddy、WatchRec、Home、Minesweeper；不触碰 blog 5001/9878。
6. 旧 release `20260818-224656` 保留，可一键回滚到 OneDrive 版本。
