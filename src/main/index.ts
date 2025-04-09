import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?raw'
import { DatabaseManager } from './utils/database.js'
import { apiHandlers, registerAPIHandlers } from '../preload/utils/api/handler.js'
import fs from 'fs'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
      devTools: process.env['NODE_ENV'] === 'development'
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  if (process.env['NODE_ENV'] === 'development') {
    mainWindow.webContents.once('did-frame-finish-load', () => {
      mainWindow.webContents.openDevTools({ mode: 'right' })
    })
  }

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url).then((r) => {
      console.log('openExternal', r)
    })
    return { action: 'deny' }
  })

  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']).then((r) => {
      console.log('loadURL', r)
    })
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html')).then((r) => {
      console.log('loadFile', r)
    })
  }
}

const initialFiles = [
  {
    name: 'ccprojects',
    files: [],
  },
  {
    name: 'config',
    files: [
      'config.user.json',
      'config.ui.json',
      'config.project.json',
    ]
  }
]

ipcMain.handle('database:initialize', async () => {
  const db = DatabaseManager.getDB()
  return new Promise((resolve, reject) => {
    db.all('SELECT * FROM chats', (err, rows) => {
      if (err) {
        reject(err)
      } else {
        resolve(rows)
      }
    })
  })
})

app.whenReady().then(() => {
  electronApp.setAppUserModelId('com.electron')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // プロジェクトの専用フォルダを作成

  const userDataPath = app.getPath('userData')
  const projectsPath = join(userDataPath, 'CCProject')
  if (!fs.existsSync(projectsPath)) {
    fs.mkdirSync(projectsPath)
  }

  for (const folder of initialFiles) {
    const folderPath = join(projectsPath, folder.name)
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath)
    }
    for (const file of folder.files) {
      const filePath = join(folderPath, file)
      if (!fs.existsSync(filePath)) {
        fs.writeFileSync(filePath, JSON.stringify({}))
      }
    }
  }

  createWindow()
  registerAPIHandlers(apiHandlers)

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
