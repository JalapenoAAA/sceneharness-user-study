import { useState } from 'react'
import IntroPage from './components/IntroPage'
import QuestionPage from './components/QuestionPage'
import './App.css'

function App() {
  const [started, setStarted] = useState(() => localStorage.getItem('survey_started') === 'true')
  const [lang, setLang] = useState('en')

  const handleStart = () => {
    localStorage.setItem('survey_started', 'true')
    setStarted(true)
  }

  return started ? (
    <QuestionPage lang={lang} setLang={setLang} />
  ) : (
    <IntroPage
      lang={lang}
      setLang={setLang}
      onStart={handleStart}
    />
  )
}

export default App