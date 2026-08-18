# 2moro Music 接入计划

## 目标

在保留 SPlayer 原有界面、播放器能力和 AGPL-3.0 合规信息的前提下，将现有 OneDrive 曲库作为一个独立歌单接入网页版 SPlayer。现有音乐 API、OneDrive 直连播放方式和 FRP 5002 链路保持不变。

## 架构

```text
SPlayer Web
  -> /api/v1/library
  -> /api/v1/tracks/:id/stream
  -> OneDrive 下载地址
```

SPlayer 负责展示和播放；现有 Express 服务继续负责解析匿名共享目录、生成曲目清单和返回跳转，不代理音频内容。

## 第一阶段

1. 跑通 fork 的纯 Web 安装、类型检查和构建。
2. 新增 2moro API 客户端及类型转换，将曲目转换为 SPlayer 的统一歌曲模型。
3. 新增“我的 OneDrive”歌单入口和详情页，支持刷新、播放全部、单曲播放和播放队列。
4. 对没有封面、歌手、专辑或时长的文件提供合理降级展示。
5. 在 README 和应用关于信息中追加派生项目、上游项目、许可证与公开源码链接。
6. 执行格式化、lint、类型检查和 Web 构建，修复全部问题。

## 第二阶段

1. 本地联调现有 Express API，确认播放请求最终由浏览器跳转到 OneDrive。
2. 生成可部署的 `out/renderer`，但不修改 blog 的 5001/9878 链路。
3. 经确认后替换 music.service 的前端静态资源，后端仍监听 3008，FRP 仍使用 5002。
4. 验证公网首页、曲库、Range 播放、移动端布局和源码链接。

## 暂不处理

- 不把 OneDrive 伪装成网易云或 Subsonic 服务。
- 不让游戏云代理音频数据。
- 不在第一阶段删除 SPlayer 原功能；先完成增量接入，再决定哪些入口需要精简。
- 不触碰 blog 服务、FRP 5001 或 9878。
