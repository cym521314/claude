// ============================================================
// src/main/index.ts — Electron 主进程入口
// 负责初始化应用生命周期、创建主窗口、加载菜单和托盘
// ============================================================

import { app, BrowserWindow } from 'electron';
import * as path from 'node:path';
import { createMainWindow } from './window';
import { createMenu } from './menu';
import { createTray } from './tray';

// 确保应用获得单例锁，防止重复启动多个实例
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

// 注册第二实例请求的处理：聚焦已有窗口
app.on('second-instance', () => {
  const windows = BrowserWindow.getAllWindows();
  if (windows.length > 0) {
    const mainWindow = windows[0];
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

// 应用准备就绪后初始化
app.whenReady().then(async () => {
  // 创建主窗口
  const mainWindow = createMainWindow();

  // 创建菜单栏
  createMenu(mainWindow);

  // 创建系统托盘
  createTray(mainWindow);

  // macOS 上点击托盘图标时重新聚焦窗口
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createMainWindow();
    }
  });
});

// 所有窗口关闭时的行为
app.on('window-all-closed', () => {
  // macOS 上保持应用运行（通过 Cmd+Q 退出），其他平台直接退出
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
