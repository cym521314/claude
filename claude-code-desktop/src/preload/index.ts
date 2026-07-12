// ============================================================
// src/preload/index.ts — 预加载脚本
// 通过 contextBridge 向渲染进程暴露安全的 IPC API
// 这是主进程与渲染进程之间的安全桥梁，遵循最小权限原则
// ============================================================

import { contextBridge, ipcRenderer } from 'electron';

// 定义渲染进程可以访问的 API 接口
// 这些 API 通过 contextBridge.exposeInMainWorld 暴露给 window 对象
interface ClaudeDesktopAPI {
  /**
   * 向主进程发送消息
   * @param channel — 通信频道
   * @param data — 要发送的数据
   */
  send: (channel: string, data: unknown) => void;

  /**
   * 接收来自主进程的消息
   * @param channel — 通信频道
   * @param callback — 收到消息时的回调函数
   */
  on: (channel: string, callback: (...args: unknown[]) => void) => void;

  /**
   * 移除指定频道的消息监听器
   * @param channel — 通信频道
   */
  removeListener: (channel: string, callback: (...args: unknown[]) => void) => void;

  /**
   * 调用主进程方法并获取返回值
   * @param channel — 通信频道
   * @param data — 要发送的数据
   * @returns Promise<unknown> — 主进程返回的结果
   */
  invoke: (channel: string, data?: unknown) => Promise<unknown>;
}

// 将安全的 API 暴露给渲染进程的 window 对象
// 渲染进程可通过 window.claudeDesktop 访问这些方法
contextBridge.exposeInMainWorld('claudeDesktop', {
  // 发送消息到主进程（单向，不等待响应）
  send: (channel: string, data: unknown) => {
    // 白名单校验：只允许预定义的频道，防止任意 IPC 通信
    const validChannels = ['app-info'];
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },

  // 监听来自主进程的消息
  on: (channel: string, callback: (...args: unknown[]) => void) => {
    const validChannels = ['app-info'];
    if (validChannels.includes(channel)) {
      // 移除旧的监听器以避免重复绑定
      ipcRenderer.removeAllListeners(channel);
      ipcRenderer.on(channel, (_event, ...args) => callback(...args));
    }
  },

  // 移除指定频道的监听器
  removeListener: (channel: string, callback: (...args: unknown[]) => void) => {
    ipcRenderer.removeListener(channel, callback);
  },

  // 调用主进程并等待异步响应
  invoke: async (channel: string, data?: unknown): Promise<unknown> => {
    const validChannels = ['app-info'];
    if (validChannels.includes(channel)) {
      return ipcRenderer.invoke(channel, data);
    }
    throw new Error(`未授权的 IPC 频道: ${channel}`);
  },
} as ClaudeDesktopAPI);
