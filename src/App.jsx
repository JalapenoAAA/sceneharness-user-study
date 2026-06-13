import { useState } from 'react'
import IntroPage from './components/IntroPage'
import QuestionPage from './components/QuestionPage'
import './App.css'

function App() {
  const [started, setStarted] = useState(false)

  return started ? (
    <QuestionPage />
  ) : (
    <IntroPage onStart={() => setStarted(true)} />
  )
}

export default App