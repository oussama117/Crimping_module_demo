import { HashRouter, Route, Routes } from 'react-router-dom'
import Registration from './pages/registration/registration'
import Settings from './pages/settings/settings'

function App(): React.JSX.Element {
  // const { t, i18n } = useTranslation()
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Registration />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </HashRouter>
    </>
  )
}

export default App
