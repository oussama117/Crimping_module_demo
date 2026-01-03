// import Versions from './components/Versions'
// import electronLogo from './assets/electron.svg'

import { Camera, Power, Wifi } from 'lucide-react'
import { Button } from './components/ui/button'
import { Label } from './components/ui/label'

function App(): React.JSX.Element {
  //const ipcHandle = (): void => window.electron.ipcRenderer.send('ping')

  return (
    <>
      <div className="p-6 bg-slate-900 min-h-screen text-white">
        <div className="flex items-center gap-4 mb-8">
          <Camera className="text-sky-400" size={32} />
          <h1 className="text-2xl font-bold">ESP32 Cam Dashboard</h1>
        </div>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => {
            console.log('Hello')
          }}
        >
          <Label className="p-2 text-[red] cursor-pointer">Hello</Label>
        </Button>
        <div className="grid grid-cols-2 gap-4">
          <button className="flex items-center gap-2 bg-slate-800 p-4 rounded-lg hover:bg-slate-700 transition">
            <Wifi size={20} />
            <span>Connect Stream</span>
          </button>

          <button className="flex items-center gap-2 bg-rose-600 p-4 rounded-lg hover:bg-rose-500 transition">
            <Power size={20} />
            <span>Stop Stream</span>
          </button>
        </div>
      </div>
    </>
  )
}

export default App
