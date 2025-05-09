import { ipcRenderer } from 'electron'
import { logStatus } from '../logStatus.js'

type Listener<T = unknown> = (...args: T[]) => void

const ipcManager = {
  listeners: new Map<string, Listener[]>(),

  on<T = unknown[]>(channel: string, listener: Listener<T>): () => void {
    if (!this.listeners.has(channel)) {
      this.listeners.set(channel, [])
    }

    const channelListeners = this.listeners.get(channel)!
    channelListeners.push(listener as Listener)

    const wrappedListener = ((_: Electron.IpcRendererEvent, ...args: T[]): void => {
      listener(...args)
    }) as Listener<unknown>

    ipcRenderer.on(channel, wrappedListener)

    logStatus(
      { code: 200, message: `リスナーを登録しました: ${channel}` }
    )

    return () => {
      this.off(channel, wrappedListener)
    }
  },

  off(channel: string, listener: Listener): void {
    const channelListeners = this.listeners.get(channel)
    if (channelListeners) {
      const index = channelListeners.indexOf(listener)
      if (index !== -1) {
        channelListeners.splice(index, 1)
        ipcRenderer.removeListener(channel, listener)
      }

      if (channelListeners.length === 0) {
        this.listeners.delete(channel)
      }

      logStatus(
        { code: 200, message: `リスナーを削除しました: ${channel}` }
      )
    } else {
      logStatus(
        { code: 404, message: `リスナーが見つかりません: ${channel}` },
        null,
        new Error(`リスナーが見つかりません: ${channel}`)
      )
    }
  },

  once<T = unknown[]>(channel: string, listener: Listener<T>): void {
    const wrappedListener = ((...args: T[]): void => {
      listener(...args)
      this.off(channel, wrappedListener)
    }) as Listener<unknown>
    this.on(channel, wrappedListener)

    logStatus(
      { code: 200, message: `リスナーを登録しました: ${channel}` }
    )
  }
}

export { ipcManager }
