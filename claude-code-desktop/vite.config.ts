// ============================================================
// vite.config.ts — Vite 构建配置
// 配置渲染进程的开发和生产构建，集成 Electron 插件实现热更新
// ============================================================

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import electron from 'vite-plugin-electron';

// https://vitejs.dev/config/
export default defineConfig({
  // 插件配置
  plugins: [
    // React 支持插件
    react(),

    // Electron 集成插件：
    // - 开发时自动重启 Electron 主进程
    // - 渲染进程修改时自动刷新浏览器
    electron([
      {
        // 主进程入口
        entry: 'src/main/index.ts',
        vite: {
          build: {
            outDir: 'dist/main',              // 主进程编译输出目录
            rollupOptions: {
              external: ['electron'],           // 排除 electron 依赖，不打包进结果
            },
          },
        },
      },
      {
        // 预加载脚本入口
        entry: 'src/preload/index.ts',
        vite: {
          build: {
            outDir: 'dist/preload',           // 预加载脚本输出目录
            rollupOptions: {
              external: ['electron'],
            },
          },
        },
      },
    ]),
  ],

  // 构建配置
  build: {
    outDir: 'dist/renderer',              // 渲染进程构建输出目录
    emptyOutDir: true,                    // 构建前清空输出目录
    sourcemap: true,                      // 生成 source map
  },

  // 服务器配置（仅开发环境）
  server: {
    port: 5173,                           // Vite 默认端口
    strictPort: true,                     // 端口冲突时直接报错而非自动换端口
  },
});
