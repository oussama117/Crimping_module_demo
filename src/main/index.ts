import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import AppDatabase from '../database/AppDatabase'
import databaseHandler from '../database/ipcHandler'
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'
import { ArduinoBridge } from './hardware/arduinoBridge'

let db: any
const arduino = new ArduinoBridge()

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    // alwaysOnTop: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  arduino.init(mainWindow).catch((err) => {
    console.error('Failed to initialize Arduino:', err)
  })
}

interface SerialDevice {
  index: number
  path: string
  manufacturer: string
  device_name: string
}

// Global variable to hold the active port
let activeArduinoPort

async function connectToArduino() {
  // 1. Get the list and find the Arduino path
  const ports = await SerialPort.list()
  const arduino = ports.find(
    (port) => port.manufacturer?.includes('Arduino') || port.friendlyName?.includes('Arduino')
  )

  if (!arduino) {
    console.error('❌ No Arduino detected. Please check the USB cable.')
    return null
  }

  console.log(`🔌 Connecting to Arduino on ${arduino.path}...`)

  // 2. Initialize the SerialPort
  activeArduinoPort = new SerialPort({
    path: arduino.path,
    baudRate: 9600,
    autoOpen: false // Better to handle opening manually for error catching
  })

  // 3. Open the connection
  activeArduinoPort.open((err) => {
    if (err) {
      return console.error('Error opening port: ', err.message)
    }
    console.log('✅ Port Opened Successfully')
  })

  // 4. Attach a Parser (to read JSON lines easily)
  const parser = activeArduinoPort.pipe(new ReadlineParser({ delimiter: '\r\n' }))

  return { port: activeArduinoPort, parser }
}

// --- NEW FUNCTION: The Continuous Listener ---
function startListening(parser) {
  if (!parser) {
    console.error('Cannot listen: Parser is undefined.')
    return
  }

  console.log('👂 Listening for Arduino data...')

  // The event trigger: runs every time a newline \r\n is detected
  parser.on('data', (data) => {
    console.log('Arduino sent:', data)
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(async () => {
  db = new AppDatabase()
  databaseHandler(db)
  // const connection = await connectToArduino()

  // if (connection) {
  //   startListening(connection.parser)
  // }

  // .then((obj) => {
  //   console.log('connect: ', obj)
  // })

  // initHardware()
  //setup database:

  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    db.closeDB()
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
