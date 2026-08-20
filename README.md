# DSH 第三方插件管理器 (third-party-plugin-manager)

管理 DeepSeek Harness Web 中除了官方插件（`@deepseek-ai/*`）之外的第三方插件。

## 功能

- **列出第三方插件**：只显示非官方插件（当前环境 6 个），读取 package.json 展示真实名称、版本、作者、描述，并标注「本地安装 / npm」
- **启用 / 停用**：切换插件运行状态
- **检查更新**：查询 npm registry，对比当前版本与最新版本
- **卸载**：移除插件（规划中）

## 安装位置

插件以动态 Cordis 插件形式运行在 DSH 进程中（pluginId: `tpm-3`）。
源码托管于本仓库，通过 cordis_define 部署到运行时。

## 目录结构

```
src/
  host.js     Host 半源码（服务 + RPC 方法）
  client.js   Client 半源码（设置页「插件 → 第三方插件」选项卡 UI）
```

## 开发流程

1. 修改 `src/host.js` / `src/client.js`
2. 通过 cordis_define 定义新 Package（kind: existing, pluginId: tpm-3）
3. cordis_run update 激活

## 里程碑

- [x] v1 基础框架：服务 + 设置页选项卡
- [x] v2 修复列表：正确遍历 graph.entries（数组），只显示第三方插件
- [x] v2 显示真实名称：读取 package.json 元信息
- [x] v3 修复检查更新：WebFetchResult.body 为 { kind, content } 结构
- [x] v4 真正的启用/停用/卸载：
  - loader entry.update({ disabled }) 运行时热切换（立即生效）
  - 持久化到 `~/.dsh/cordis.patch.yml`（重启后保持）
  - 卸载时从 profile package.json 移除 dependencies + bundles
  - 列表显示真实运行状态（fiber 存活判断）
- [x] v4.1 修复停用后插件从列表消失：
  - 列表数据源合并 graph（运行中）+ profile.bundles（配置中已停用）
  - 停用的插件仍显示并可重新启用
- [x] v4.2 修复 Windows 路径 bug（停用后插件仍不显示的根本原因）：
  - clientModules.clientPath 返回反斜杠路径，路径推导函数用正斜杠查找导致永远匹配失败
  - normPath() 统一转换；已停用插件从 profile node_modules 直接读 package.json
  - 启用已停用插件时推导 fallback 路径用于持久化
- [ ] v5 更新插件本体：下载新版本并替换（需 npm 安装能力）
