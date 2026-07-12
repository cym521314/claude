// ============================================================
// src/main/tray.ts — 系统托盘模块
// 在系统通知区域创建应用图标，支持右键菜单和点击操作
// ============================================================

import { app, BrowserWindow, Tray, Menu, nativeImage } from 'electron';
import * as path from 'node:path';

/**
 * 创建系统托盘图标
 * @param mainWindow — 主窗口引用，用于点击托盘图标时聚焦/恢复窗口
 */
export function createTray(mainWindow: BrowserWindow): void {
  // 构建托盘图标的路径
  // 优先使用 public 目录下的图标文件，若不存在则使用默认图标
  const iconPath = path.join(__dirname, '..', 'public', 'icon.png');

  // 尝试加载托盘图标，失败则使用空图像（Electron 会自动处理回退）
  let trayIcon: Electron.NativeImage;
  try {
    trayIcon = nativeImage.createFromPath(iconPath);
    if (trayIcon.isEmpty()) {
      trayIcon = nativeImage.createEmpty();
    }
  } catch {
    trayIcon = nativeImage.createEmpty();
  }

  // 创建托盘实例
  const tray = new Tray(trayIcon);

  // 设置托盘提示文本
  tray.setToolTip('Claude Code Desktop');

  // 定义托盘右键菜单
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '显示主窗口',
      click: () => {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.show();
        mainWindow.focus();
      },
    },
    { type: 'separator' },
    {
      label: '刷新页面',
      click: () => {
        mainWindow?.reload();
      },
    },
    { type: 'separator' },
    {
      label: '退出',
      click: () => {
        app.quit();
      },
    },
  ]);

  // 设置托盘右键菜单
  tray.setContextMenu(contextMenu);

  // 单击托盘图标时显示/聚焦主窗口
  tray.on('click', () => {
    if (mainWindow.isVisible()) {
      mainWindow.blur(); // 失焦隐藏窗口
    } else {
      mainWindow.show();
      mainWindow.focus();
    }
  });
}
