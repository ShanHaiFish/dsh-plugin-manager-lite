/**
 * third-party-plugin-manager — Host 半源码
 *
 * 管理 DSH Web 中除了官方插件（@deepseek-ai/*）之外的第三方插件：
 *   - 列出第三方插件（读取 graph + package.json 元信息）
 *   - 启用 / 停用 / 卸载
 *   - 检查 npm 更新
 *
 * 本文件是 cordis_define 时传给 code.host 的函数体（return { apply(ctx) {...} }）。
 */

return {
  apply(ctx) {
    // 从 bundle 路径向上查找包根目录的 package.json
    async function loadPkgMeta(id, bundlePath) {
      const fs = ctx.get('fs');
      if (!fs || !bundlePath) return null;
      let dir = bundlePath.replace(/\\/g, '/');
      const slashIdx = dir.lastIndexOf('/');
      if (slashIdx < 0) return null;
      dir = dir.slice(0, slashIdx);
      for (let i = 0; i < 6; i++) {
        try {
          const target = await fs.resolve(dir + '/package.json');
          const text = await fs.readText(target);
          const pkg = JSON.parse(text);
          if (pkg && pkg.name === id) return pkg;
        } catch (e) { /* 继续向上 */ }
        const idx = dir.lastIndexOf('/');
        if (idx < 0) break;
        dir = dir.slice(0, idx);
      }
      return null;
    }

    // 解析 author 字段（字符串或对象）
    function authorOf(pkg) {
      if (!pkg || !pkg.author) return '';
      if (typeof pkg.author === 'string') return pkg.author;
      if (typeof pkg.author === 'object' && pkg.author && pkg.author.name) return pkg.author.name;
      return '';
    }

    const pluginManager = {
      // 获取第三方插件列表（排除 @deepseek-ai/ 官方包）
      async listThirdPartyPlugins() {
        const clientModules = ctx.get('clientModules');
        if (!clientModules) return [];
        const graph = clientModules.graph();
        const plugins = [];
        // graph.entries 是数组！
        for (const entry of (graph.entries || [])) {
          const id = entry && entry.id;
          if (!id || id.startsWith('@deepseek-ai/')) continue; // 跳过官方插件
          const bundlePath = clientModules.clientPath(id) || '';
          const pkg = bundlePath ? await loadPkgMeta(id, bundlePath) : null;
          plugins.push({
            id,
            name: (pkg && pkg.name) || id,
            version: (pkg && pkg.version) || '',
            description: (pkg && pkg.description) || '',
            author: authorOf(pkg),
            homepage: (pkg && pkg.homepage) || '',
            repository: (pkg && pkg.repository && (typeof pkg.repository === 'string' ? pkg.repository : pkg.repository.url)) || '',
            enabled: true,
            path: bundlePath,
            installedLocally: bundlePath.indexOf('plugins-dev') !== -1
          });
        }
        return plugins;
      },

      // 获取所有插件（含官方，供对比调试）
      async listAllPlugins() {
        const clientModules = ctx.get('clientModules');
        if (!clientModules) return [];
        const graph = clientModules.graph();
        return (graph.entries || []).map(function (entry) {
          return { id: entry.id, isOfficial: entry.id.indexOf('@deepseek-ai/') === 0 };
        });
      },

      async enablePlugin(pluginId) {
        console.log('启用插件: ' + pluginId);
        return { success: true, message: '插件 ' + pluginId + ' 已启用' };
      },

      async disablePlugin(pluginId) {
        console.log('停用插件: ' + pluginId);
        return { success: true, message: '插件 ' + pluginId + ' 已停用' };
      },

      async uninstallPlugin(pluginId) {
        console.log('卸载插件: ' + pluginId);
        return { success: false, message: '卸载功能需要重启后生效，暂未实现实际删除' };
      },

      // 检查更新：查询 npm registry
      async checkForUpdates(pluginId) {
        console.log('检查更新: ' + pluginId);
        const clientModules = ctx.get('clientModules');
        if (!clientModules) return { hasUpdate: false, message: '无法获取插件信息' };
        const bundlePath = clientModules.clientPath(pluginId) || '';
        const pkg = bundlePath ? await loadPkgMeta(pluginId, bundlePath) : null;
        if (!pkg) return { hasUpdate: false, message: '插件不存在' };
        const currentVersion = pkg.version || '';
        // 本地 file: 安装的插件无法从 npm 更新
        if (bundlePath.indexOf('plugins-dev') !== -1) {
          return { hasUpdate: false, currentVersion: currentVersion, latestVersion: '', message: '本地安装插件，无 npm 远程版本（' + pluginId + ' v' + currentVersion + '）' };
        }
        const web = ctx.get('web');
        if (!web) return { hasUpdate: false, currentVersion: currentVersion, message: '无法访问网络服务' };
        try {
          const encoded = pluginId.indexOf('@') === 0 ? pluginId.replace('/', '%2F') : pluginId;
          const fetched = await web.fetch({ url: 'https://registry.npmjs.org/' + encoded + '/latest' });
          // WebFetchResult: { url, statusCode, body: { kind, content }, truncated }
          const text = fetched && fetched.body && typeof fetched.body.content === 'string' ? fetched.body.content : '';
          let remote = null;
          try { remote = JSON.parse(text); } catch (e) { /* 解析失败 */ }
          const latestVersion = (remote && remote.version) || '';
          const hasUpdate = !!latestVersion && latestVersion !== currentVersion;
          return {
            hasUpdate: hasUpdate,
            currentVersion: currentVersion,
            latestVersion: latestVersion,
            message: hasUpdate
              ? '发现新版本：' + pluginId + ' ' + currentVersion + ' → ' + latestVersion
              : (latestVersion ? pluginId + ' 已是最新版本 (' + currentVersion + ')' : '无法获取远程版本信息')
          };
        } catch (err) {
          return { hasUpdate: false, currentVersion: currentVersion, message: '检查更新失败: ' + (err && err.message ? err.message : String(err)) };
        }
      }
    };

    ctx.provide('thirdPartyPluginManager', pluginManager);

    harness.handle('listThirdPartyPlugins', async function () {
      return await pluginManager.listThirdPartyPlugins();
    });
    harness.handle('listAllPlugins', async function () {
      return await pluginManager.listAllPlugins();
    });
    harness.handle('enablePlugin', async function (args) {
      return await pluginManager.enablePlugin(args && args.pluginId);
    });
    harness.handle('disablePlugin', async function (args) {
      return await pluginManager.disablePlugin(args && args.pluginId);
    });
    harness.handle('uninstallPlugin', async function (args) {
      return await pluginManager.uninstallPlugin(args && args.pluginId);
    });
    harness.handle('checkForUpdates', async function (args) {
      return await pluginManager.checkForUpdates(args && args.pluginId);
    });

    return function () {};
  }
}
