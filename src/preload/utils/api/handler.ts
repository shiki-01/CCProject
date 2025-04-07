import { BrowserWindow, ipcMain, ipcRenderer } from 'electron'
import { APIRecord, APISchema, RecursiveAPI } from '../../types/index.js'
import { logStatus } from '../logStatus.js'
import { v4 as uuid } from 'uuid'
import { registerAPIListeners } from './listener.js'

/**
 * API のハンドラ郡
 */
const apiHandlers = {
} satisfies APIRecord<APISchema>

/**
 * API のハンドラを登録する
 * @param apiObj API のハンドラ郡
 * @param parentKey 親のキー
 */
const registerAPIHandlers = <T>(apiObj: APIRecord<T>, parentKey = ''): void => {
  for (const key in apiObj) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key
    if (typeof apiObj[key] === 'function') {
      ipcMain.handle(`invoke-api:${fullKey}`, async (_event, ...args) => {
        try {
          return await (apiObj[key] as (...args: unknown[]) => Promise<T>)(...args)
        } catch (err) {
          return logStatus({ code: 500, message: 'API の呼び出しに失敗しました' }, null, err)
        }
      })
    } else {
      registerAPIHandlers(apiObj[key] as APIRecord<T>, fullKey)
    }
  }
  registerAPIListeners(apiObj, parentKey)
}

/**
 * API のインボーカを作成する
 * @param apiObj API のハンドラ郡
 * @param parentKey 親のキー
 * @returns API のインボーカ
 */
const createAPIInvoker = <T>(apiObj: APIRecord<T>, parentKey = ''): RecursiveAPI<T> => {
  const apiRenderer: Partial<RecursiveAPI<T>> = {}

  for (const key in apiObj) {
    const fullKey = parentKey ? `${parentKey}.${key}` : key
    if (typeof apiObj[key] === 'function') {
      apiRenderer[key] = async (...args: unknown[]): Promise<APISchema> => {
        return ipcRenderer.invoke(`invoke-api:${fullKey}`, ...args)
      }
    } else {
      apiRenderer[key] = createAPIInvoker(apiObj[key] as APIRecord<T>, fullKey)
    }
  }

  return apiRenderer as RecursiveAPI<T>
}

type APIHandler = RecursiveAPI<typeof apiHandlers>

export { apiHandlers, registerAPIHandlers, createAPIInvoker, type APIHandler }
