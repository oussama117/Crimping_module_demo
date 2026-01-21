import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'
import { AppSettings, Languages } from '@/types'

// Custom APIs for renderer
const api = {
  createOrGetCandidate: (candidate_name: string, serial_number: number) => {
    return ipcRenderer.invoke('candidate::create/get', candidate_name, serial_number)
  },
  getTrailJoinCandidate: () => {
    return ipcRenderer.invoke('trail/candidate::getAll')
  },
  getSettings: () => {
    return ipcRenderer.invoke('settings::getSetting')
  },
  updateSettings: (settings: AppSettings) => {
    return ipcRenderer.invoke('settings::updateSetting', settings)
  },
  updateLanguage: (language: Languages) => {
    return ipcRenderer.invoke('settings::updateLaguage', language)
  },
  getTrailByCandidateId: (candidateId: number) => {
    return ipcRenderer.invoke('trail::getByCandidateId', candidateId)
  }
}

const hardware = {
  // Method to send a string to Arduino
  sendCommand: (command: string) => {
    return ipcRenderer.invoke('hardware:send', command)
  },

  // Method to listen for data coming FROM Arduino
  onData: (callback: (data: string) => void) => {
    const listener = (_event: any, data: string) => callback(data)
    ipcRenderer.on('arduino:data', listener)

    // Return cleanup function to prevent memory leaks
    return () => ipcRenderer.removeListener('arduino:data', listener)
  }
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
    contextBridge.exposeInMainWorld('hardware', hardware)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
