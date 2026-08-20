/**
 * third-party-plugin-manager — Client 半源码
 *
 * 在设置页「插件 → 第三方插件」选项卡渲染管理界面。
 * 通过 host.call 调用 Host 半的 RPC 方法。
 *
 * 本文件是 cordis_define 时传给 code.client 的函数体（return { apply(ctx) {...} }）。
 */

return {
  apply(ctx) {
    const slots = ctx.get('slots');
    if (!slots) return;

    const style = document.createElement('style');
    style.textContent = `
      .plugin-manager { padding: 16px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      .plugin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid #e5e7eb; }
      .plugin-header h3 { margin: 0; font-size: 16px; font-weight: 600; color: #111827; }
      .plugin-count { font-size: 13px; color: #6b7280; margin-left: 8px; }
      .plugin-header .refresh-btn { padding: 6px 14px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 13px; }
      .plugin-header .refresh-btn:hover { background: #2563eb; }
      .plugin-header .refresh-btn:disabled { background: #9ca3af; cursor: not-allowed; }
      .plugin-list { display: flex; flex-direction: column; gap: 8px; }
      .plugin-item { border: 1px solid #e5e7eb; border-radius: 8px; padding: 12px 16px; background: white; }
      .plugin-item:hover { box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
      .plugin-top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; }
      .plugin-name { font-size: 14px; font-weight: 600; color: #111827; margin: 0; display: flex; align-items: center; gap: 8px; }
      .plugin-badge { font-size: 10px; padding: 2px 8px; border-radius: 10px; background: #ecfdf5; color: #059669; font-weight: 500; }
      .plugin-badge.local { background: #eff6ff; color: #2563eb; }
      .plugin-id { font-size: 11px; color: #9ca3af; margin: 2px 0 0 0; font-family: monospace; }
      .plugin-desc { font-size: 12px; color: #6b7280; margin: 6px 0 0 0; line-height: 1.5; }
      .plugin-meta { display: flex; gap: 12px; font-size: 11px; color: #9ca3af; margin-top: 8px; flex-wrap: wrap; }
      .plugin-actions { display: flex; gap: 6px; flex-shrink: 0; }
      .plugin-actions button { padding: 4px 10px; border: 1px solid #e5e7eb; border-radius: 4px; cursor: pointer; font-size: 12px; background: white; color: #374151; transition: all 0.2s; white-space: nowrap; }
      .plugin-actions button:hover { background: #f3f4f6; }
      .plugin-actions button.enable { border-color: #10b981; color: #10b981; }
      .plugin-actions button.enable:hover { background: #ecfdf5; }
      .plugin-actions button.disable { border-color: #f59e0b; color: #f59e0b; }
      .plugin-actions button.disable:hover { background: #fffbeb; }
      .plugin-actions button.update { border-color: #3b82f6; color: #3b82f6; }
      .plugin-actions button.update:hover { background: #eff6ff; }
      .plugin-actions button.uninstall { border-color: #ef4444; color: #ef4444; }
      .plugin-actions button.uninstall:hover { background: #fef2f2; }
      .empty-state { text-align: center; padding: 32px; color: #9ca3af; }
      .error { color: #dc2626; background: #fef2f2; border: 1px solid #fecaca; padding: 10px 14px; border-radius: 6px; margin-bottom: 12px; font-size: 13px; }
      .notice { color: #2563eb; background: #eff6ff; border: 1px solid #bfdbfe; padding: 10px 14px; border-radius: 6px; margin-bottom: 12px; font-size: 13px; }
    `;
    document.head.appendChild(style);

    slots.inject('settings.plugins.tab', function () {
      slots.register(
        { name: 'settings.plugins.tab', id: 'third-party', order: 20, label: '第三方插件' },
        function (props) {
          function PluginManager() {
            var state = React.useState({ plugins: [], loading: false, error: null, notice: null });
            var plugins = state[0].plugins;
            var loading = state[0].loading;
            var error = state[0].error;
            var notice = state[0].notice;
            var setState = state[1];

            var fetchPlugins = React.useCallback(function () {
              setState({ plugins: plugins, loading: true, error: null, notice: null });
              host.call('listThirdPartyPlugins').then(function (result) {
                setState({ plugins: result || [], loading: false, error: null, notice: null });
              }).catch(function (err) {
                setState({ plugins: [], loading: false, error: (err && err.message) || String(err), notice: null });
              });
            }, [plugins]);

            var runAction = React.useCallback(function (method, pluginId, confirmMsg) {
              if (confirmMsg && !confirm(confirmMsg)) return;
              host.call(method, { pluginId: pluginId }).then(function (result) {
                var msg = result && result.message ? result.message : '操作完成';
                if (result && result.success) {
                  setState({ plugins: plugins, loading: false, error: null, notice: msg });
                } else {
                  setState({ plugins: plugins, loading: false, error: msg, notice: null });
                }
              }).catch(function (err) {
                setState({ plugins: plugins, loading: false, error: (err && err.message) || String(err), notice: null });
              });
            }, [plugins]);

            React.useEffect(function () {
              setState({ plugins: [], loading: true, error: null, notice: null });
              host.call('listThirdPartyPlugins').then(function (result) {
                setState({ plugins: result || [], loading: false, error: null, notice: null });
              }).catch(function (err) {
                setState({ plugins: [], loading: false, error: (err && err.message) || String(err), notice: null });
              });
            }, []);

            return React.createElement('div', { className: 'plugin-manager' },
              React.createElement('div', { className: 'plugin-header' },
                React.createElement('div', null,
                  React.createElement('h3', null, '第三方插件'),
                  React.createElement('span', { className: 'plugin-count' }, '共 ' + plugins.length + ' 个')
                ),
                React.createElement('button', { className: 'refresh-btn', onClick: fetchPlugins, disabled: loading },
                  loading ? '加载中...' : '刷新'
                )
              ),
              error && React.createElement('div', { className: 'error' }, error),
              notice && React.createElement('div', { className: 'notice' }, notice),
              plugins.length === 0
                ? React.createElement('div', { className: 'empty-state' }, React.createElement('p', null, loading ? '正在加载...' : '暂无第三方插件'))
                : React.createElement('div', { className: 'plugin-list' }, plugins.map(function (plugin) {
                    return React.createElement('div', { key: plugin.id, className: 'plugin-item' },
                      React.createElement('div', { className: 'plugin-top' },
                        React.createElement('div', null,
                          React.createElement('p', { className: 'plugin-name' },
                            plugin.name,
                            React.createElement('span', { className: plugin.installedLocally ? 'plugin-badge local' : 'plugin-badge' },
                              plugin.installedLocally ? '本地安装' : 'npm'
                            )
                          ),
                          React.createElement('p', { className: 'plugin-id' }, plugin.id),
                          plugin.description && React.createElement('p', { className: 'plugin-desc' }, plugin.description),
                          React.createElement('div', { className: 'plugin-meta' },
                            plugin.version && React.createElement('span', null, 'v' + plugin.version),
                            plugin.author && React.createElement('span', null, plugin.author),
                            React.createElement('span', null, '已启用')
                          )
                        ),
                        React.createElement('div', { className: 'plugin-actions' },
                          React.createElement('button', { className: 'disable', onClick: function () { runAction('disablePlugin', plugin.id); } }, '停用'),
                          React.createElement('button', { className: 'update', onClick: function () { runAction('checkForUpdates', plugin.id); } }, '检查更新'),
                          React.createElement('button', { className: 'uninstall', onClick: function () { runAction('uninstallPlugin', plugin.id, '确定要卸载插件 ' + plugin.id + ' 吗？'); } }, '卸载')
                        )
                      )
                    );
                  })
              )
            );
          }

          return React.createElement(PluginManager);
        }
      );
    });
  }
}
