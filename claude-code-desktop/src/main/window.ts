// ============================================================
// src/main/window.ts — 窗口管理模块
// 负责创建和管理 Electron BrowserWindow 实例
// ============================================================

import { BrowserWindow, shell } from 'electron';
import * as path from 'node:path';

// 全局唯一的主窗口引用
let mainWindow: BrowserWindow | null = null;

/**
 * 创建主窗口
 * - 开发环境：加载 Vite 开发服务器 URL (http://localhost:5173)
 * - 生产环境：加载 dist/renderer/index.html
 */
export function createMainWindow(): BrowserWindow {
  // 如果已存在窗口则复用
  if (mainWindow && !mainWindow.isDestroyed()) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
    return mainWindow;
  }

  // 检测是否在生产模式
  const isProd = process.env.NODE_ENV === 'production';

  // 创建浏览器窗口，尺寸 1200x800
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Claude Code Desktop',
    show: false, // 先隐藏，加载完成后再显示避免白屏闪烁
    backgroundColor: '#1a1a2e', // 深色主题背景色
    webPreferences: {
      preload: path.join(__dirname, '..', 'preload', 'index.js'), // 预加载脚本路径
      contextIsolation: true, // 启用上下文隔离，保障安全
      nodeIntegration: false, // 禁用 Node.js 集成，防止 XSS 攻击
      sandbox: false,
    },
  });

  // 开发环境加载 Vite 开发服务器
  if (isProd) {
    // 生产环境：加载构建后的 renderer HTML 文件
    mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
  } else {
    // 开发环境：加载 Vite dev server
    mainWindow.loadURL('http://localhost:5173');
  }

  // 窗口准备就绪后显示
  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  // 处理外部链接：在新窗口中用默认浏览器打开
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // 监听导航事件，阻止默认行为（如新标签页打开）
  mainWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });

  return mainWindow;
}
