import { HashRouter, Route, Routes } from 'react-router-dom'
import Registration from './pages/registration/registration'
import Settings from './pages/settings/settings'
import Trail from './pages/trail/trail'
import ScoreBoard from './pages/scoreboard/scoreboard'

function App(): React.JSX.Element {
  // const { t, i18n } = useTranslation()
  return (
    <>
      <HashRouter>
        <Routes>
          <Route path="/" element={<Registration />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/trail" element={<Trail />} />
          <Route path="/scoreBoard" element={<ScoreBoard />} />
        </Routes>
      </HashRouter>
    </>
  )
}

export default App
