# 项目记忆 / 仓库管理备忘

本文件记录本项目的仓库身份、命名约定与组织归属（最终以实际为准）。供维护与后续会话参考。

## 仓库身份

| 项 | 值 |
|---|---|
| npm 包名 | `dsh-plugin-manager-lite`（npm 名可用，尚未发布） |
| 包版本 | `0.1.0`（GitHub Release v0.1.0 已发布） |
| 层短 id / 路由前缀 | `tppm` / `/tppm/*` |
| 独立仓库 | `ShanHaiFish/dsh-plugin-manager-lite`（Public，活跃，**本项目唯一事实源**） |
| 插件组主页 | 闪烁的 DSH 插件库（Shimmering DSH Plugin Library）· `ShanHaiFish/dsh-plugins`（纯索引，只放链接，不托管源码） |
| 许可证 / 作者 | MIT / ShanHaiFish |

> 原名 `dsh-plugin-manager` 的 npm 名被 `ruihuahe/hrhgit` 的同名项目占用，故改为 `-lite`。

## 归属现状：独立仓库 + 插件组索引（2026-08-21 定稿）

**事实（已核实）：**

- 本插件以**独立仓库** `ShanHaiFish/dsh-plugin-manager-lite` 为唯一事实源：
  独立更新、独立打 tag（`vX.Y.Z`）、独立发 Release。
- 插件组主页 `ShanHaiFish/dsh-plugins` **只做链接归组**（README 索引 + GitHub 标签
  `dsh-plugin`），不托管任何插件源码；5 个 DSH 插件均为此模式。
- 安装命令：
  ```bash
  dsh plugin --profile web add github:ShanHaiFish/dsh-plugin-manager-lite
  ```
- 2026-08-21 曾短暂并入 `dsh-plugins` monorepo（`plugins/` 子目录 + pnpm `#path:` 安装），
  当日因「tag 空间冲突、无法独立更新与发布」回退；monorepo 期间的历史提交保留在
  `dsh-plugins` 仓库的 git 历史中，不影响现状。

> 备注：GitHub 上存在**第三方组织** `dsh-plugins`（DeepSeek Harness Plugins，约 10 个仓库），
> 与 ShanHaiFish 账号无成员关系（membership 查询 404）；与本插件组无归属关系。
> 若后续考虑组织化管理，需先解决该命名冲突（组织名已被占用）。

## 本地开发 / 安装

- 本地开发目录：`M:\2026年\2026-DeepSeekHarness相关\dsh-plugin-Management`（本仓库克隆，origin 指向独立仓库）。
- 插件安装在 `~/.dsh/profiles/web/node_modules/dsh-plugin-manager-lite/`（副本，非自动同步）。
- 改源码后需重新拷贝该副本再重启 DSH 才生效（见仓库 README「开发」）。

## 历史背景

- 早期以动态 Cordis 插件形态开发，后改为静态 bundle；
- 曾评估「转入 dsh-plugins 组织」与「并入 ShanHaiFish/dsh-plugins monorepo」，
  最终采用**独立仓库 + 插件组索引链接**模式。
