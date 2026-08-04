import { useCallback, useRef, useState } from 'react'

/**
 * Thin wrapper over MediaRecorder/getUserMedia for voice messages. Requires
 * HTTPS or localhost (browsers block getUserMedia elsewhere) — satisfied by
 * the Vercel deploy and local dev already.
 */
export function useAudioRecorder() {
  const [recording, setRecording] = useState(false)
  const [durationMs, setDurationMs] = useState(0)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const startTimeRef = useRef(0)
  const intervalRef = useRef<ReturnType<typeof setInterval>>()
  const streamRef = useRef<MediaStream | null>(null)

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    streamRef.current = stream
    const recorder = new MediaRecorder(stream)
    chunksRef.current = []
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data)
    }
    recorder.start()
    mediaRecorderRef.current = recorder
    startTimeRef.current = Date.now()
    setDurationMs(0)
    setRecording(true)
    intervalRef.current = setInterval(() => setDurationMs(Date.now() - startTimeRef.current), 200)
  }, [])

  const stop = useCallback((): Promise<{ blob: Blob; durationMs: number } | null> => {
    return new Promise((resolve) => {
      const recorder = mediaRecorderRef.current
      if (!recorder) {
        resolve(null)
        return
      }
      recorder.onstop = () => {
        clearInterval(intervalRef.current)
        streamRef.current?.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' })
        const finalDuration = Date.now() - startTimeRef.current
        setRecording(false)
        mediaRecorderRef.current = null
        resolve({ blob, durationMs: finalDuration })
      }
      recorder.stop()
    })
  }, [])

  const cancel = useCallback(() => {
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.onstop = null
      recorder.stop()
    }
    clearInterval(intervalRef.current)
    streamRef.current?.getTracks().forEach((t) => t.stop())
    mediaRecorderRef.current = null
    setRecording(false)
    setDurationMs(0)
  }, [])

  return { recording, durationMs, start, stop, cancel }
}
