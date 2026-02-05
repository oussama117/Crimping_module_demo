import { ipcMain } from 'electron'
import { SerialPort } from 'serialport'
import { ReadlineParser } from '@serialport/parser-readline'

export class ArduinoBridge {
  private port: SerialPort | null = null
  private parser: ReadlineParser | null = null

  constructor() {}

  // Initialization method called in app.whenReady
  async init(mainWindow: Electron.BrowserWindow) {
    const ports = await SerialPort.list()
    // console.log(ports)
    const arduino = ports.find((p) => p.manufacturer?.includes('Arduino'))

    // if (arduino) {
    // this.port = new SerialPort({ path: arduino.path, baudRate: 115200 })
    this.port = new SerialPort({ path: 'COM10', baudRate: 115200 })
    this.parser = this.port.pipe(new ReadlineParser({ delimiter: '\n' }))

    this.parser.on('data', (data) => {
      // Send every line from Arduino to the Frontend automatically
      mainWindow.webContents.send('arduino:data', data)
    })
    // }

    // Set up IPC Handlers for the Frontend to call
    this.setupHandlers()
  }

  private setupHandlers() {
    // Send a command to Arduino
    ipcMain.handle('hardware:send', (_event, command: string) => {
      if (this.port && this.port.isOpen) {
        this.port.write(`${command}\n`)
        return true
      }
      return false
    })

    // Manual Reconnect
    ipcMain.handle('hardware:reconnect', async () => {
      return await this.init(global.mainWindow) // simplified for example
    })
  }
}
