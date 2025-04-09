import { app, BrowserWindow, ipcMain, ipcRenderer } from 'electron'
import { APIRecord, APISchema, RecursiveAPI } from '../../types/index.js'
import { logStatus } from '../logStatus.js'
import { v4 as uuid } from 'uuid'
import { registerAPIListeners } from './listener.js'
import type { FileStructure, Project } from '../../../global.js'
import path from 'path'
import fs from 'fs'

/**
 * API のハンドラ郡
 */
const apiHandlers = {
  project: {
    create: async (project: Project): Promise<APISchema<Project | null>> => {
      const userDirPath = app.getPath('userData')
      const projectsPath = path.join(userDirPath, 'CCProject/ccprojects')

      try {
        const projects = fs.readdirSync(projectsPath)
        let projectId = uuid()
        while (projects.includes(projectId)) {
          projectId = uuid()
        }
        console.log('projectId', projectId)
        project.id = projectId
        const projectPath = path.join(projectsPath, projectId)
        fs.mkdirSync(projectPath, { recursive: true })
        const projectFilePath = path.join(projectPath, 'project.json')
        fs.writeFileSync(projectFilePath, JSON.stringify(project, null, 2))

        return logStatus(
          { code: 200, message: 'プロジェクトを作成しました' },
          { id: projectId, name: project.name, description: project.description, icon: project.icon, tags: project.tags, status: project.status } as Project,
        )
      } catch (err) {
        return logStatus({ code: 500, message: 'プロジェクトの作成に失敗しました' }, null, err)
      }
    },
    delete: async (projectId: string): Promise<APISchema<null>> => {
      const userDirPath = app.getPath('userData')
      const projectsPath = path.join(userDirPath, 'CCProject/ccprojects')

      try {
        const projectPath = path.join(projectsPath, projectId)
        fs.rmSync(projectPath, { recursive: true, force: true })
        return logStatus({ code: 200, message: 'プロジェクトを削除しました' }, null)
      } catch (err) {
        return logStatus({ code: 404, message: 'プロジェクトが見つかりません' }, null, err)
      }
    },
    update: async (projectId: string, project: Project): Promise<APISchema<null>> => {
      const userDirPath = app.getPath('userData')
      const projectsPath = path.join(userDirPath, 'CCProject/ccprojects')

      try {
        const projectPath = path.join(projectsPath, projectId)
        const projectFilePath = path.join(projectPath, 'project.json')

        fs.writeFileSync(projectFilePath, JSON.stringify(project, null, 2))

        return logStatus({ code: 200, message: 'プロジェクトを更新しました' }, null)
      } catch (err) {
        return logStatus({ code: 404, message: 'プロジェクトが見つかりません' }, null, err)
      }
    },
    get: async (projectId: string): Promise<APISchema<{ project: Project, structure: FileStructure[] } | null>> => {
      const userDirPath = app.getPath('userData')
      const projectsPath = path.join(userDirPath, 'CCProject/ccprojects')

      try {
        const projectPath = path.join(projectsPath, projectId)
        const projectFilePath = path.join(projectPath, 'project.json')
        const projectData = fs.readFileSync(projectFilePath, 'utf-8')

        const getFileStructure = (dirPath: string): object[] => {
          const entries = fs.readdirSync(dirPath, { withFileTypes: true });
          return entries.map((entry) => {
            const fullPath = path.join(dirPath, entry.name);
            if (entry.isDirectory()) {
              return {
                name: entry.name,
                type: 'folder',
                children: getFileStructure(fullPath),
              };
            } else {
              return {
                name: entry.name,
                type: 'file',
              };
            }
          });
        };

        const fileStructure = getFileStructure(projectPath) as FileStructure[];

        return logStatus({ code: 200, message: 'プロジェクトを取得しました' }, {
          project: JSON.parse(projectData),
          structure: fileStructure,
        })
      } catch (err) {
        return logStatus({ code: 404, message: 'プロジェクトが見つかりません' }, null, err)
      }
    },
    getAll: async (): Promise<APISchema<Project[] | null>> => {
      const userDirPath = app.getPath('userData')
      const projectsPath = path.join(userDirPath, 'CCProject/ccprojects')

      try {
        const projectDirs = fs.readdirSync(projectsPath)
        const projects = projectDirs.map((projectId) => {
          const projectFilePath = path.join(projectsPath, projectId, 'project.json')
          if (fs.existsSync(projectFilePath)) {
            const projectData = fs.readFileSync(projectFilePath, 'utf-8')
            return JSON.parse(projectData)
          }
          return null
        }).filter((project) => project !== null) as Project[]

        return logStatus({ code: 200, message: 'プロジェクトを取得しました' }, projects)
      } catch (err) {
        return logStatus({ code: 500, message: 'プロジェクトの取得に失敗しました' }, null, err)
      }
    },
    getFile: async (projectId: string, fileName: string): Promise<APISchema<object | string | Buffer | null>> => {
      const userDirPath = app.getPath('userData')
      const projectsPath = path.join(userDirPath, 'CCProject/ccprojects')

      try {
        const projectPath = path.join(projectsPath, projectId);
        const filePath = path.join(projectPath, fileName);

        if (!fs.existsSync(filePath)) {
          return logStatus({ code: 404, message: 'ファイルが見つかりません' }, null);
        }

        const fileExtension = path.extname(fileName).toLowerCase();

        if (['.json', '.txt', '.md', '.log'].includes(fileExtension)) {
          const fileData = fs.readFileSync(filePath, 'utf-8');
          return logStatus({ code: 200, message: 'テキストファイルを取得しました' }, fileData);
        } else if (['.png', '.jpg', '.jpeg', '.gif', '.bmp', '.webp'].includes(fileExtension)) {
          const fileData = fs.readFileSync(filePath);
          const base64Data = fileData.toString('base64');
          const mimeType = `image/${fileExtension.replace('.', '')}`;
          const dataUrl = `data:${mimeType};base64,${base64Data}`;
          return logStatus({ code: 200, message: '画像ファイルを取得しました' }, dataUrl);
        } else {
          // その他のバイナリファイルの場合
          const fileData = fs.readFileSync(filePath);
          return logStatus({ code: 200, message: 'バイナリファイルを取得しました' }, fileData);
        }
      } catch (err) {
        return logStatus({ code: 404, message: 'ファイルが見つかりません' }, null, err)
      }
    }
  }
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
