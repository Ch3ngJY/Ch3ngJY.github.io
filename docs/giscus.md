# Giscus 评论配置

本项目的 giscus 配置集中放在 `themes/claudia/_config.yml` 的 `comment_giscus` 下。评论功能不需要 GitHub Token、密码或其他私密凭据，下面这些值会被前端公开读取。

## GitHub 端准备

1. 评论仓库必须是公开仓库，且可以被 giscus 访问。
2. 在仓库的 Settings -> Features 中开启 Discussions。
3. 安装或授权 giscus GitHub App：https://github.com/apps/giscus
4. 创建或选择一个 Discussion 分类，建议使用 Announcements、General 或专门的 Comments 分类。
5. 打开 giscus 配置页：https://giscus.app/
6. 在配置页取得 `repo`、`repoId`、`category`、`categoryId`。
7. 将这些值填入 `themes/claudia/_config.yml`。
8. 重新运行 `npm run build` 并部署网站。

## 本项目需要填写的位置

```yaml
comment_giscus:
  enable: true
  repo: OWNER/REPO
  repo_id: REPO_ID
  category: CATEGORY
  category_id: CATEGORY_ID
  mapping: pathname
  strict: 0
  reactions_enabled: 1
  emit_metadata: 0
  input_position: bottom
  lang: zh-CN
  loading: lazy
  theme_light: light
  theme_dark: dark
```

`mapping: pathname` 会使用文章路径作为 Discussion 映射依据，能避免查询参数或锚点导致同一篇文章生成多个评论区。当前网站部署在根路径 `https://ch3ngjy.github.io/`，所以每篇文章的路径都是稳定且唯一的。

## 本地测试

1. 填好 `repo`、`repo_id`、`category`、`category_id`，并将 `enable` 改为 `true`。
2. 运行 `npm run clean && npm run build`。
3. 运行 `npm run server`，打开一篇文章详情页。
4. 确认文章正文后出现评论区，首页、归档、分类、标签和关于页不出现评论区。
5. 切换明暗模式，确认评论区主题同步变化。
