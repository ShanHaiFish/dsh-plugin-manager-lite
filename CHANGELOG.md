# Changelog

本项目遵循 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.1.0/) 与
[Semantic Versioning](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added

- 初始第三方插件管理能力（静态 bundle 形态 `dsh-plugin-manager` / 层 id `tppm`）：
  - 设置页「插件 → 第三方插件」选项卡 UI
  - 列表第三方插件（排除 `@deepseek-ai/*` 官方包）
  - 启用 / 停用（持久化到 `~/.dsh/cordis.patch.yml`，重启后保持）
  - 卸载（从 profile 配置移除）
  - 检查 npm 更新
  - `/tppm/debug` 排错端点

### Fixed

- 停用持久化改用 loader entry 裸短 id（`entry.options.id`），修复停用后重启仍生效
- 停用插件从列表消失：profile 根目录推导改为只挑 `/profiles/` 下的 entry，恢复列表
- Client 注册 id 对齐金三角规则（`__ModuleLoader__.load` id = 包名）
