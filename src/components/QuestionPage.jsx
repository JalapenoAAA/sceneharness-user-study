import { useState, useMemo, useEffect, useRef } from 'react'
import { ModelViewerElement } from '@google/model-viewer'
import { supabase } from '../supabaseClient'

// Reduce WebGL framebuffer resolution (lower GPU memory ~75% on Retina)
ModelViewerElement.minimumRenderScale = 0.5
// Only cache 3 models (current question), evict old ones automatically
ModelViewerElement.modelCacheSize = 3

const questions = [
  {
    question_id: 'q001',
    scene_id: 'dining room',
    instruction: 'Translate the entire round dining table with its chairs little bit closer to the sideboard cabinet.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/dining_room_origin.glb',
    method_a: 'ours',
    method_b: 'e2a',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_dining_room_translate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/E2A_dining_room_translate.glb',
  },

  {
    question_id: 'q002',
    scene_id: 'bedroom',
    instruction: 'Rotate the armchair little bit closer to the bed, so that it faces toward the window."',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/bedroom_origin.glb',
    method_a: 'ours',
    method_b: 'e2a',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_bedroom_rotate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/E2A_bedroom_rotate.glb',
  },

  {
    question_id: 'q003',
    scene_id: 'office',
    instruction: 'Translate the conference table closer to the wall with the two windows.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/office_origin.glb',
    method_a: 'ours',
    method_b: 'e2a',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_office_translate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/E2A_office_translate.glb',
  },

  {
    question_id: 'q004',
    scene_id: 'kids room',
    instruction: 'Rotate the house frame bed 90 degrees clockwise so the headboard is against the light blue wall.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/kids_room_origin.glb',
    method_a: 'ours',
    method_b: 'e2a',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_kids_room_rotate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/E2A_kids_room_rotate.glb',
  },

  {
    question_id: 'q005',
    scene_id: 'living room',
    instruction: 'Translate the sectional sofa a little bit closer to the wall bookcases.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/living_room_origin.glb',
    method_a: 'ours',
    method_b: 'e2a',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_living_room_translate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/E2A_living_room_translate.glb',
  },

  {
    question_id: 'q006',
    scene_id: 'bedroom',
    instruction: 'Translate the two woven armchairs and the ottoman little bitcloser to the foot of the bed.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/bedroom_origin.glb',
    method_a: 'ours',
    method_b: 'vulcan',
    result_a: '',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/vulcan_bedroom_translate.glb',
  },

  {
    question_id: 'q007',
    scene_id: 'bathroom',
    instruction: 'Scale the round illuminated wall mirror to 1.5 times its current size.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/bathroom_origin.glb',
    method_a: 'ours',
    method_b: 'vulcan',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_bathroom_scale.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/vulcan_bathroom_scale.glb',
  },

  {
    question_id: 'q008',
    scene_id: 'game_room',
    instruction: 'Scale the wall tv above the media console slightly bigger.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/gameroom_origin.glb',
    method_a: 'ours',
    method_b: 'vulcan',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_gameroom_scale.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/vulcan_game_room_scale.glb',
  },

  {
    question_id: 'q009',
    scene_id: 'bathroom',
    instruction: 'Translate the round black bath mat 0.5 meters towards the shower glass partition.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/bathroom_origin.glb',
    method_a: 'ours',
    method_b: 'vulcan',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_bathroom_translate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/vulcan_bathroom_translate.glb',
  },

  {
    question_id: 'q010',
    scene_id: 'bathroom',
    instruction: 'Remove the tall wooden slatted storage cabinet next to the vanity.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/bathroom_origin.glb',
    method_a: 'ours',
    method_b: 'vulcan',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_bathroom_remove.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/vulcan_bathroom_remove.glb',
  },

  {
    question_id: 'q011',
    scene_id: '199',
    instruction: 'Place two mannequins in the waiting room, lay a carpet in the corridor, enlarge the paintings in the room, and rotate the X-ray machine clockwise.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/199_origin.glb',
    method_a: 'ours',
    method_b: 'blender_mcp',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_199_mixed.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/BlenderMCP_199_mixed.glb',
  },

  {
    question_id: 'q012',
    scene_id: '099',
    instruction: 'Move the plants from the living room to the bedroom nightstand.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/099_origin.glb',
    method_a: 'ours',
    method_b: 'e2a',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_099_translate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/E2A_099_translate.glb',
  },

  {
    question_id: 'q013',
    scene_id: '203',
    instruction: 'Move the four yoga mats together to form a rectangle.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/203_origin.glb',
    method_a: 'ours',
    method_b: 'blender_mcp',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_203_translate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/BlenderMCP_203_translate.glb',
  },

  {
    question_id: 'q014',
    scene_id: '207',
    instruction: 'Please move the table in the room with the most chairs closer to the whiteboard.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/207_origin.glb',
    method_a: 'ours',
    method_b: 'layoutvlm',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_207_translate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/LayoutVLM_207_translate.glb',
  },

  {
    question_id: 'q015',
    scene_id: '099',
    instruction: 'Add a floor lamp next to the bed in the bedroom, replace the two mirrors in the bathroom with one large mirror, and hang a Mona Lisa painting on the wall in the living room.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/099_origin.glb',
    method_a: 'ours',
    method_b: 'e2a',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_099_mixed.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/E2A_099_mixed.glb',
  },

  {
    question_id: 'q016',
    scene_id: '200',
    instruction: 'Rotate the three sculptures 90 degrees around their collective center.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/200_origin.glb',
    method_a: 'ours',
    method_b: 'e2a',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_200_rotate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/E2A_200_rotate.glb',
  },

  {
    question_id: 'q017',
    scene_id: '099',
    instruction: 'Move the plants from the living room to the bedroom nightstand.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/099_origin.glb',
    method_a: 'ours',
    method_b: 'layoutvlm',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_099_translate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/LayoutVLM_099_translate.glb',
  },

  {
    question_id: 'q018',
    scene_id: '207',
    instruction: 'Rotate the server 90 degrees clockwise',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/207_origin.glb',
    method_a: 'ours',
    method_b: 'blender_mcp',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_207_rotate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/BlenderMCP_207_rotate.glb',
  },

  {
    question_id: 'q019',
    scene_id: '203',
    instruction: 'Move the four yoga mats together to form a rectangle.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/203_origin.glb',
    method_a: 'ours',
    method_b: 'layoutvlm',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_203_translate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/LayoutVLM_203_translate.glb',
  },

  {
    question_id: 'q020',
    scene_id: '200',
    instruction: 'Make the paintings in the hallway smaller.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/200_origin.glb',
    method_a: 'ours',
    method_b: 'blender_mcp',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_200_scale.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/BlenderMCP_200_scale.glb',
  },

  {
    question_id: 'q021',
    scene_id: '099',
    instruction: 'Add a floor lamp next to the bed in the bedroom, replace the two mirrors in the bathroom with one large mirror, and hang a Mona Lisa painting on the wall in the living room.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/099_origin.glb',
    method_a: 'ours',
    method_b: 'blender_mcp',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_099_mixed.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/BlenderMCP_099_mixed.glb',
  },

  {
    question_id: 'q022',
    scene_id: '199',
    instruction: 'Rotate the toilet supply cabinet 90 degrees clockwise.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/199_origin.glb',
    method_a: 'ours',
    method_b: 'layoutvlm',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_199_rotate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/LayoutVLM_199_rotate.glb',
  },

  {
    question_id: 'q023',
    scene_id: '203',
    instruction: 'Enlarge all the chairs in the scene.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/203_origin.glb',
    method_a: 'ours',
    method_b: 'e2a',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_203_scale.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/E2A_203_scale.glb',
  },

  {
    question_id: 'q024',
    scene_id: '200',
    instruction: 'Rotate the three sculptures 90 degrees around their collective center.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/200_origin.glb',
    method_a: 'ours',
    method_b: 'layoutvlm',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_200_rotate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/LayoutVLM_200_rotate.glb',
  },

  {
    question_id: 'q025',
    scene_id: '207',
    instruction: 'Please move the table in the room with the most chairs closer to the whiteboard.',
    original: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/207_origin.glb',
    method_a: 'ours',
    method_b: 'e2a',
    result_a: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/sceneharness_207_translate.glb',
    result_b: 'https://vhdyfdmtiglimbtuvtvg.supabase.co/storage/v1/object/public/scenes/E2A_207_translate.glb',
  },
]

function SceneViewer({ title, src, onLoaded }) {
  const viewerRef = useRef(null)
  const onLoadedRef = useRef(onLoaded)
  onLoadedRef.current = onLoaded

  useEffect(() => {
    const viewer = viewerRef.current
    if (!viewer) return

    let done = false

    const markDone = () => {
      if (done) return
      done = true
      onLoadedRef.current()
    }

    const handleLoad = () => markDone()

    const handleProgress = (event) => {
      if (event.detail?.totalProgress >= 1) {
        markDone()
      }
    }

    viewer.addEventListener('load', handleLoad)
    viewer.addEventListener('progress', handleProgress)

    const timer = setTimeout(() => {
      markDone()
    }, 5000)

    return () => {
      clearTimeout(timer)
      viewer.removeEventListener('load', handleLoad)
      viewer.removeEventListener('progress', handleProgress)
    }
  }, [src])

  return (
    <div className="viewer-item">
      <h3>{title}</h3>

      <model-viewer
        ref={viewerRef}
        key={src}
        src={src}
        camera-controls
        interaction-prompt="none"
        loading="eager"
        reveal="auto"
        style={{
          width: '100%',
          height: '360px',
          backgroundColor: '#f5f5f5',
          borderRadius: '12px'
        }}
      ></model-viewer>

      <p className="viewer-hint">
        Drag to rotate the scene. Hold Shift and drag to pan the view. Use the mouse wheel to zoom in or out.
      </p>
    </div>
  )
}

function makeParticipantId() {
  const existing = localStorage.getItem('participant_id')
  if (existing) return existing

  const newId = `p_${crypto.randomUUID()}`
  localStorage.setItem('participant_id', newId)
  return newId
}

function QuestionPage() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [reviewMode, setReviewMode] = useState(false)
  const [finished, setFinished] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [loadedViewers, setLoadedViewers] = useState({})

  const participantId = useMemo(() => makeParticipantId(), [])

  const randomizedQuestions = useMemo(() => {
    return questions.map((q) => {
      const swap = Math.random() < 0.5

      return {
        ...q,
        leftMethod: swap ? q.method_b : q.method_a,
        rightMethod: swap ? q.method_a : q.method_b,
        leftSrc: swap ? q.result_b : q.result_a,
        rightSrc: swap ? q.result_a : q.result_b,
      }
    })
  }, [])

  const question = randomizedQuestions[currentIndex]
  const currentAnswer = answers[question.question_id] || null
  const answeredCount = Object.keys(answers).length
  const allAnswered = answeredCount === randomizedQuestions.length

  const viewerLoadKey = question.question_id

  const allViewersLoaded =
    loadedViewers[`${viewerLoadKey}_original`] &&
    loadedViewers[`${viewerLoadKey}_left`] &&
    loadedViewers[`${viewerLoadKey}_right`]

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [currentIndex, reviewMode, finished])

  useEffect(() => {
    setLoadedViewers((prev) => ({
      ...prev,
      [`${viewerLoadKey}_original`]: false,
      [`${viewerLoadKey}_left`]: false,
      [`${viewerLoadKey}_right`]: false,
    }))
  }, [viewerLoadKey])

  const markViewerLoaded = (key) => {
    setLoadedViewers((prev) => ({
      ...prev,
      [key]: true,
    }))
  }

  const saveChoice = (choice) => {
    if (!allViewersLoaded && !currentAnswer) {
      alert('Please wait until all 3D scenes are fully loaded.')
      return
    }

    const winnerMethod =
      choice === 'left'
        ? question.leftMethod
        : question.rightMethod

    const answer = {
      participant_id: participantId,
      question_id: question.question_id,
      scene_id: question.scene_id,
      instruction: question.instruction,
      method_left: question.leftMethod,
      method_right: question.rightMethod,
      choice,
      winner_method: winnerMethod,
      time_spent_ms: null,
    }

    setAnswers((prev) => ({
      ...prev,
      [question.question_id]: answer,
    }))
  }

  const goPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  const goNext = () => {
    if (!currentAnswer) {
      alert('Please select Result A or Result B before continuing.')
      return
    }

    if (currentIndex + 1 < randomizedQuestions.length) {
      setCurrentIndex(currentIndex + 1)
    } else if (allAnswered) {
      setReviewMode(true)
    } else {
      alert('Please answer all questions before reviewing your responses.')
    }
  }

  const goReview = () => {
    if (!allAnswered) {
      alert(`Please answer all questions before submitting. You have answered ${answeredCount} of ${randomizedQuestions.length} questions.`)
      return
    }

    setReviewMode(true)
  }

  const editQuestion = (index) => {
    setCurrentIndex(index)
    setReviewMode(false)
  }

  const handleSubmitAll = async () => {
    if (!allAnswered) {
      alert('Please answer all questions before submitting.')
      return
    }

    setSubmitting(true)

    const records = randomizedQuestions.map((q) => answers[q.question_id])

    const { error } = await supabase
      .from('responses')
      .insert(records)

    if (error) {
      console.error(error)
      alert('Submit failed. Please try again.')
      setSubmitting(false)
      return
    }

    setSubmitting(false)
    setFinished(true)
  }

  if (finished) {
    return (
      <main className="form-page">
        <section className="form-header-card">
          <h1>Thank you for your participation!</h1>
          <p>Your responses have been submitted successfully.</p>
        </section>
      </main>
    )
  }

  if (reviewMode) {
    return (
      <main className="form-page">
        <section className="form-header-card">
          <h1>Review Your Responses</h1>
          <p>
            You have answered {answeredCount} of {randomizedQuestions.length} questions.
            Please confirm your choices before final submission.
          </p>
        </section>

        <section className="form-item-card">
          <div className="review-list">
            {randomizedQuestions.map((q, index) => {
              const answer = answers[q.question_id]

              return (
                <div className="review-item" key={q.question_id}>
                  <strong>Question {index + 1}</strong>
                  <p>{q.instruction}</p>
                  <p>
                    Your choice:{' '}
                    <strong>
                      {answer
                        ? answer.choice === 'left'
                          ? 'Result A'
                          : 'Result B'
                        : 'Not answered'}
                    </strong>
                  </p>

                  <button
                    className="edit-button"
                    onClick={() => editQuestion(index)}
                  >
                    Edit
                  </button>
                </div>
              )
            })}
          </div>

          <button
            className="submit-button"
            onClick={handleSubmitAll}
            disabled={submitting || !allAnswered}
          >
            {submitting ? 'Submitting...' : 'Confirm and Submit'}
          </button>
        </section>
      </main>
    )
  }

  return (
    <main className="form-page">
      <section className="form-header-card">
        <h1>User Preference Study for 3D Scene Editing Results</h1>
        <p>
          Question {currentIndex + 1} of {randomizedQuestions.length}
          {' · '}
          Answered {answeredCount} of {randomizedQuestions.length}
        </p>
      </section>

      <section className="form-item-card">
        <div className="top-grid">
          <div className="instruction-panel">
            <h2>Editing Instruction</h2>
            <p className="instruction-text">
              {question.instruction}
            </p>
          </div>

          <div className="origin-panel">
            <h2>Original Scene</h2>
            <SceneViewer
              title="Original Scene"
              src={question.original}
              onLoaded={() => markViewerLoaded(`${viewerLoadKey}_original`)}
            />
          </div>
        </div>
      </section>

      <section className="form-item-card">
        <h2>Edited Results</h2>

        <div className="results-grid">
          <SceneViewer
            title="Result A"
            src={question.leftSrc}
            onLoaded={() => markViewerLoaded(`${viewerLoadKey}_left`)}
          />

          <SceneViewer
            title="Result B"
            src={question.rightSrc}
            onLoaded={() => markViewerLoaded(`${viewerLoadKey}_right`)}
          />
        </div>
      </section>

      <section className="form-item-card">
        <h2>Which result do you prefer?</h2>

        {!allViewersLoaded && (
          <p className="loading-text">
            Loading 3D scenes... Please wait before making your choice.
          </p>
        )}

        <div className="option-list">
          <button
            className={`option-button ${currentAnswer?.choice === 'left' ? 'selected' : ''}`}
            onClick={() => saveChoice('left')}
            disabled={!allViewersLoaded && !currentAnswer}
          >
            <span className="option-circle" />
            <span>Result A is better</span>
          </button>

          <button
            className={`option-button ${currentAnswer?.choice === 'right' ? 'selected' : ''}`}
            onClick={() => saveChoice('right')}
            disabled={!allViewersLoaded && !currentAnswer}
          >
            <span className="option-circle" />
            <span>Result B is better</span>
          </button>
        </div>

        <div className="navigation-buttons">
          <button
            className="secondary-button"
            onClick={goPrevious}
            disabled={currentIndex === 0}
          >
            Previous Question
          </button>

          {currentIndex + 1 < randomizedQuestions.length ? (
            <button className="next-button" onClick={goNext}>
              Next Question
            </button>
          ) : (
            <button className="next-button" onClick={goReview}>
              Review Responses
            </button>
          )}
        </div>
      </section>
    </main>
  )
}

export default QuestionPage