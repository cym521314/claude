// ============================================================
// src/main/menu.ts — 菜单栏模块
// 创建标准的应用菜单栏，包含文件、编辑、视图、帮助四个菜单项
// ============================================================

import { app, BrowserWindow, Menu, MenuItem } from 'electron';
import * as path from 'node:path';

/**
 * 创建应用菜单栏
 * @param mainWindow — 主窗口引用，用于视图菜单中的开发者工具切换
 */
export function createMenu(mainWindow: BrowserWindow): void {
  // 定义各菜单项的模板配置
  const template: Electron.MenuItemConstructorOptions[] = [
    // ---------- 文件菜单 ----------
    {
      label: '文件(&F)',
      submenu: [
        {
          label: '新建窗口(&N)',
          accelerator: 'CmdOrCtrl+N',
          click: () => {
            // 创建一个新的主窗口实例
            const { createMainWindow } = require('./window');
            createMainWindow();
          },
        },
        { type: 'separator' },
        {
          label: '退出(&X)',
          accelerator: 'CmdOrCtrl+Q',
          click: () => {
            app.quit();
          },
        },
      ],
    },
    // ---------- 编辑菜单 ----------
    {
      label: '编辑(&E)',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectAll' },
      ],
    },
    // ---------- 视图菜单 ----------
    {
      label: '视图(&V)',
      submenu: [
        {
          label: '刷新(&R)',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            mainWindow?.reload();
          },
        },
        {
          label: '强制刷新(&F)',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            mainWindow?.webContents.reloadIgnoringCache();
          },
        },
        { type: 'separator' },
        {
          label: '切换开发者工具(&T)',
          accelerator: 'F12',
          click: () => {
            mainWindow?.webContents.toggleDevTools();
          },
        },
        { type: 'separator' },
        { role: 'zoomin' },
        { role: 'zoomout' },
        { role: 'resetzoom' },
      ],
    },
    // ---------- 帮助菜单 ----------
    {
      label: '帮助(&H)',
      submenu: [
        {
          label: '关于(&A)',
          click: () => {
            // 显示关于对话框
            const dialog = require('electron').dialog;
            dialog.showMessageBox(mainWindow, {
              type: 'info',
              title: '关于 Claude Code Desktop',
              message: 'Claude Code Desktop',
              detail:
                `版本: ${app.getVersion()}\n` +
                '基于 Electron + React + TypeScript 构建\n' +
                '一款 AI 辅助编程桌面应用',
              buttons: ['确定'],
            });
          },
        },
      ],
    },
  ];

  // 在 macOS 上将应用菜单置顶（系统级要求）
  if (process.platform === 'darwin') {
    const macAppMenu: Electron.MenuItemConstructorOptions = {
      label: app.getName(),
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'services' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideothers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    };
    template.unshift(macAppMenu);
  }

  // 根据模板创建菜单并设置为应用菜单
  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);
}
