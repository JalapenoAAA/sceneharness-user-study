import { useState } from 'react'
import IntroPage from './components/IntroPage'
import QuestionPage from './components/QuestionPage'
import './App.css'

function App() {
  const [started, setStarted] = useState(false)
  const [lang, setLang] = useState('en')

  return started ? (
    <QuestionPage lang={lang} setLang={setLang} />
  ) : (
    <IntroPage
      lang={lang}
      setLang={setLang}
      onStart={() => setStarted(true)}
    />
  )
}

export default App