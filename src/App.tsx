import { useEffect, useMemo, useRef, useState } from 'react'
import { AchievementToast } from './components/AchievementToast'
import { Board } from './components/Board'
import { BreathingModal } from './components/BreathingModal'
import { CampaignModal } from './components/CampaignModal'
import { CertificateModal } from './components/CertificateModal'
import { CheckInCard } from './components/CheckInCard'
import { ErrorBoundary } from './components/ErrorBoundary'
import { FirstAidModal } from './components/FirstAidModal'
import { HUD } from './components/HUD'
import { QuizModal } from './components/QuizModal'
import { ResultModal } from './components/ResultModal'
import { StatsModal } from './components/StatsModal'
import { TutorialModal } from './components/TutorialModal'
import type { Achievement } from './data/achievements'
import { stageSeed, type Stage } from './data/campaign'
import { QUIZ_POOL, type QuizQuestion } from './data/quiz'
import {
  DIFFICULTIES,
  LIVES_BY_DIFFICULTY,
  MODES,
  getItemById,
  itemLabel,
  type Difficulty,
  type Mode,
} from './data/cards'
import { RESOURCES } from './data/resources'
import { I18nProvider, useI18n } from './i18n/context'
import { pick, type Lang } from './i18n'
import { multiplierFor, loadSession, useGame } from './hooks/useGame'
import { useHighScore } from './hooks/useHighScore'
import { levelFor, useStats } from './hooks/useStats'
import { dateSeed, getUrlParam } from './utils/seed'
import { todayISO } from './utils/format'
import { isAmbientEnabled, isSoundEnabled, setAmbientEnabled, setSoundEnabled } from './utils/sound'

type Settings = { mode: Mode; difficulty: Difficulty }

const TUTORIAL_KEY = 'salud-mental:tutorial-seen'
const DAILY_KEY = 'salud-mental:daily'

function readDailyDone(): boolean {
  try {
    const raw = localStorage.getItem(DAILY_KEY)
    if (!raw) return false
    const parsed: unknown = JSON.parse(raw)
    const entry = parsed as { date?: string; done?: boolean }
    return entry.date === todayISO() && entry.done === true
  } catch {
    return false
  }
}

function markDailyDone(): void {
  try {
    localStorage.setItem(DAILY_KEY, JSON.stringify({ date: todayISO(), done: true }))
  } catch {
    /* almacenamiento no disponible */
  }
}

function readUrlNumber(param: string, validate: (value: number) => boolean): number | null {
  const raw = getUrlParam(param)
  if (raw === null) return null
  const value = Number(raw)
  return Number.isFinite(value) && validate(value) ? value : null
}

export default function App() {
  return (
    <I18nProvider>
      <ErrorBoundary>
        <AppShell />
      </ErrorBoundary>
    </I18nProvider>
  )
}

function AppShell() {
  const { t, lang, setLang } = useI18n()
  const { state, startGame, resumeGame, flipCard, useHint, useWild } = useGame()
  const { best, saveIfBetter } = useHighScore()
  const { stats, recordResult, recordEvent, refresh } = useStats()

  const seedOverrideRef = useRef<number | null>(readUrlNumber('seed', (value) => value >= 0))
  const challengeTargetRef = useRef<number | null>(readUrlNumber('reto', (value) => value > 0))

  const [settings, setSettings] = useState<Settings>({ mode: 'clasico', difficulty: 'normal' })
  const [hasSession, setHasSession] = useState<boolean>(() => loadSession() !== null)
  const [showResult, setShowResult] = useState(false)
  const [showStats, setShowStats] = useState(false)
  const [showCertificate, setShowCertificate] = useState(false)
  const [showBreathing, setShowBreathing] = useState(false)
  const [showFirstAid, setShowFirstAid] = useState(false)
  const [showCampaign, setShowCampaign] = useState(false)
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[] | null>(null)
  const [activeStage, setActiveStage] = useState<Stage | null>(null)
  const [dailyDone, setDailyDone] = useState(() => readDailyDone())
  const [kiosk, setKiosk] = useState(() => getUrlParam('kiosk') === '1')
  const [showTutorial, setShowTutorial] = useState(() => {
    try {
      return !localStorage.getItem(TUTORIAL_KEY)
    } catch {
      return false
    }
  })
  const [isRecord, setIsRecord] = useState(false)
  const [unlocked, setUnlocked] = useState<Achievement[]>([])
  const [toast, setToast] = useState<Achievement | null>(null)
  const [announcement, setAnnouncement] = useState('')
  const [soundOn, setSoundOn] = useState(() => isSoundEnabled())
  const [ambientOn, setAmbientOn] = useState(() => isAmbientEnabled())
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light',
  )

  const totalPairs = state.deck.length / 2
  const matchedIds = useMemo(() => [...state.matched], [state.matched])
  const finished = state.status === 'won' || state.status === 'lost'
  const recordedRef = useRef(false)
  const challengeTarget = challengeTargetRef.current
  const seedOverride = seedOverrideRef.current
  const beaten = challengeTarget !== null && state.status === 'won' && state.score >= challengeTarget
  const level = levelFor(stats)

  const showToast = (list: Achievement[]) => {
    if (list.length > 0) setToast(list[0])
  }

  useEffect(() => {
    if (state.status === 'playing') {
      recordedRef.current = false
      return
    }
    if (!finished || recordedRef.current) return
    recordedRef.current = true

    if (state.status === 'won') {
      setIsRecord(
        saveIfBetter(state.difficulty, state.mode, {
          score: state.score,
          seconds: state.seconds,
          moves: state.moves,
        }),
      )
      if (state.seed === dateSeed(todayISO())) {
        markDailyDone()
        setDailyDone(true)
      }
    }

    const outcome = recordResult({
      won: state.status === 'won',
      moves: state.moves,
      matchedPairs: state.matched.size,
      totalPairs,
      seconds: state.seconds,
      score: state.score,
      difficulty: state.difficulty,
      mode: state.mode,
      livesLeft: state.lives,
      livesStart: state.mode === 'vidas' ? LIVES_BY_DIFFICULTY[state.difficulty] : null,
      hintsUsed: state.hintsUsed,
      wildsUsed: state.wildsUsed,
      duelWon: state.mode === 'duelo' && state.duelWinner === 1,
    })

    let allUnlocked = outcome.unlocked
    if (state.status === 'won' && activeStage) {
      const stageOutcome = recordEvent({ kind: 'stage', stage: activeStage.n })
      allUnlocked = [...allUnlocked, ...stageOutcome.unlocked]
    }

    setUnlocked(allUnlocked)
    showToast(allUnlocked)
    setShowResult(true)
    setHasSession(loadSession() !== null)
  }, [state.status])

  const previousRef = useRef(state)
  useEffect(() => {
    const previous = previousRef.current
    previousRef.current = state
    if (previous === state) return

    if (state.status === 'won') {
      setAnnouncement(t('announce.win'))
      return
    }
    if (state.status === 'lost') {
      setAnnouncement(state.loseReason === 'time' ? t('announce.loseTime') : t('announce.loseLives'))
      return
    }
    if (state.wildsUsed > previous.wildsUsed) {
      const newId = matchedIds.find((id) => !previous.matched.has(id))
      const item = newId ? getItemById(newId) : undefined
      if (item) {
        setAnnouncement(t('announce.wild', { label: itemLabel(item, lang) }))
        return
      }
    }
    if (state.hintOpen && !previous.hintOpen) {
      const item = getItemById(state.deck[state.flipped[0]]?.itemId ?? '')
      if (item) {
        setAnnouncement(t('announce.hint', { label: itemLabel(item, lang) }))
        return
      }
    }
    if (state.matched.size > previous.matched.size) {
      const newId = matchedIds.find((id) => !previous.matched.has(id))
      const item = newId ? getItemById(newId) : undefined
      if (item) {
        setAnnouncement(t('announce.match', { label: itemLabel(item, lang) }))
        return
      }
    }
    if (state.flipped.length === 2 && previous.flipped.length === 1) {
      setAnnouncement(
        state.mode === 'duelo' && state.turn !== previous.turn
          ? `${t('announce.miss')} ${t('announce.turn', { n: state.turn + 1 })}`
          : t('announce.miss'),
      )
      return
    }
    if (state.flipped.length === 1 && previous.flipped.length === 0) {
      const item = getItemById(state.deck[state.flipped[0]]?.itemId ?? '')
      if (item) setAnnouncement(t('announce.flip', { label: itemLabel(item, lang) }))
    }
  }, [state, matchedIds, t, lang])

  const play = (mode: Mode, difficulty: Difficulty, seed?: number, itemIds?: string[]) => {
    setShowResult(false)
    setHasSession(false)
    if (!itemIds || itemIds.length === 0) setActiveStage(null)
    if (itemIds && itemIds.length > 0) {
      startGame(mode, difficulty, seed, itemIds)
    } else {
      startGame(mode, difficulty, seed ?? seedOverride ?? undefined)
    }
  }

  const playStage = (stage: Stage) => {
    const pairs = stage.itemIds.length / 2
    const difficulty: Difficulty =
      pairs <= 6 ? 'facil' : pairs <= 9 ? 'normal' : pairs <= 16 ? 'dificil' : 'experto'
    setSettings({ mode: 'clasico', difficulty })
    setActiveStage(stage)
    setShowCampaign(false)
    play('clasico', difficulty, stageSeed(stage.n), stage.itemIds)
  }

  const resume = () => {
    const session = loadSession()
    if (!session) {
      setHasSession(false)
      return
    }
    setShowResult(false)
    setSettings({ mode: session.mode, difficulty: session.difficulty })
    resumeGame(session)
  }

  const applySettings = (next: Settings) => {
    setSettings(next)
    if (state.status !== 'idle') {
      play(next.mode, next.difficulty)
    }
  }

  const restart = () => {
    setShowResult(false)
    if (activeStage) {
      const pairs = activeStage.itemIds.length / 2
      const difficulty: Difficulty =
        pairs <= 6 ? 'facil' : pairs <= 9 ? 'normal' : pairs <= 16 ? 'dificil' : 'experto'
      play('clasico', difficulty, stageSeed(activeStage.n), activeStage.itemIds)
      return
    }
    play(settings.mode, settings.difficulty, state.seed)
  }

  const openQuiz = () => {
    const shuffled = [...QUIZ_POOL].sort(() => Math.random() - 0.5).slice(0, 3)
    setQuizQuestions(shuffled)
  }

  const closeQuiz = (correct: number) => {
    setQuizQuestions(null)
    const outcome = recordEvent({ kind: 'quiz', correct })
    setUnlocked((prev) => [...prev, ...outcome.unlocked])
    showToast(outcome.unlocked)
  }

  const toggleSound = () => {
    const next = !soundOn
    setSoundEnabled(next)
    setSoundOn(next)
  }

  const toggleAmbient = () => {
    const next = !ambientOn
    setAmbientEnabled(next)
    setAmbientOn(next)
  }

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark'
    document.documentElement.dataset.theme = next
    try {
      localStorage.setItem('salud-mental:theme', next)
    } catch {
      /* almacenamiento no disponible */
    }
    setTheme(next)
  }

  const closeTutorial = () => {
    setShowTutorial(false)
    try {
      localStorage.setItem(TUTORIAL_KEY, '1')
    } catch {
      /* almacenamiento no disponible */
    }
  }

  const cycleLang = () => {
    const next: Lang = lang === 'es' ? 'en' : 'es'
    setLang(next)
  }

  const multiplier =
    state.mode === 'duelo' ? multiplierFor(state.duelStreaks[state.turn]) : multiplierFor(state.streak)

  return (
    <div className={`app ${kiosk ? 'app--kiosk' : ''}`} data-difficulty={settings.difficulty}>
      <div className="sr-only" role="status" aria-live="polite">
        {announcement}
      </div>

      <header className="header">
        <div className="header__brand">
          <span className="header__logo" aria-hidden="true">
            🌿
          </span>
          <div>
            <h1 className="header__title">{t('app.title')}</h1>
            <p className="header__subtitle">{t('app.subtitle')}</p>
            <p className="header__sena">{t('app.sena')}</p>
          </div>
        </div>

        <div className="header__controls">
          <span className="chip chip--level" title={t('stats.level', { level: pick(level.name, lang), xp: level.xp })}>
            ⭐ {pick(level.name, lang)} · {level.xp} XP
          </span>

          {!kiosk && (
            <div className="header__levels" role="group" aria-label={t('aria.difficulty')}>
              {DIFFICULTIES.map((levelOption) => (
                <button
                  key={levelOption.id}
                  type="button"
                  className={`chip ${settings.difficulty === levelOption.id ? 'chip--active' : ''}`}
                  onClick={() => applySettings({ ...settings, difficulty: levelOption.id })}
                >
                  {pick(levelOption.label, lang)} · {levelOption.pairs}
                </button>
              ))}
            </div>
          )}

          <div className="header__levels" role="group" aria-label={t('aria.mode')}>
            {MODES.map((mode) => (
              <button
                key={mode.id}
                type="button"
                className={`chip ${settings.mode === mode.id ? 'chip--active' : ''}`}
                title={pick(mode.hint, lang)}
                onClick={() => applySettings({ ...settings, mode: mode.id })}
              >
                {pick(mode.label, lang)}
              </button>
            ))}
          </div>

          {!kiosk && (
            <button
              type="button"
              className="chip chip--icon"
              onClick={() => setShowStats(true)}
              aria-label={t('aria.stats')}
              title={t('aria.stats')}
            >
              📊
            </button>
          )}
          {!kiosk && (
            <button
              type="button"
              className="chip chip--icon"
              onClick={() => setShowTutorial(true)}
              aria-label={t('aria.tutorial')}
              title={t('aria.tutorial')}
            >
              ❓
            </button>
          )}
          <button
            type="button"
            className="chip chip--icon"
            onClick={cycleLang}
            aria-label={t('aria.lang')}
            title={t('aria.lang')}
          >
            🌐
          </button>
          <button
            type="button"
            className="chip chip--icon"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? t('theme.toLight') : t('theme.toDark')}
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button
            type="button"
            className={`chip chip--icon ${kiosk ? 'chip--active' : ''}`}
            onClick={() => setKiosk((value) => !value)}
            aria-label={kiosk ? t('aria.kioskExit') : t('aria.kiosk')}
            title={kiosk ? t('aria.kioskExit') : t('aria.kiosk')}
          >
            🖥
          </button>
        </div>
      </header>

      <main className="main">
        {state.status === 'idle' ? (
          <section className="start">
            <h2 className="start__title">{t('start.title')}</h2>
            <p className="start__text">{t('start.text')}</p>

            {challengeTarget !== null && (
              <p className="start__challenge">🏆 {t('start.challenge', { score: challengeTarget })}</p>
            )}

            <p className="start__mode">
              {t('start.mode')}
              <strong>
                {pick(MODES.find((m) => m.id === settings.mode)?.label ?? { es: '', en: '' }, lang)}
              </strong>
            </p>

            <div className="start__levels">
              {hasSession && (
                <button type="button" className="btn btn--primary" onClick={resume}>
                  {t('start.continue')}
                </button>
              )}
              {DIFFICULTIES.map((levelOption) => (
                <button
                  key={levelOption.id}
                  type="button"
                  className="btn btn--primary"
                  onClick={() => {
                    setSettings({ ...settings, difficulty: levelOption.id })
                    play(settings.mode, levelOption.id)
                  }}
                >
                  {pick(levelOption.label, lang)} · {t('start.pairs', { pairs: levelOption.pairs })}
                </button>
              ))}
            </div>

            <div className="start__extras">
              <button
                type="button"
                className="btn btn--ghost"
                onClick={() => play('clasico', 'normal', dateSeed(todayISO()))}
              >
                {dailyDone ? '📅 ✅' : '📅'} {t('start.daily')}
              </button>
              <button type="button" className="btn btn--ghost" onClick={() => setShowCampaign(true)}>
                🏆 {t('start.campaign')}
              </button>
            </div>

            <CheckInCard
              onChecked={() => {
                const outcome = recordEvent({ kind: 'checkin' })
                setUnlocked(outcome.unlocked)
                showToast(outcome.unlocked)
              }}
            />
          </section>
        ) : (
          <>
            <HUD
              moves={state.moves}
              seconds={state.seconds}
              score={state.score}
              matchedCount={state.matched.size}
              totalPairs={totalPairs}
              mode={state.mode}
              timeLimit={state.timeLimit}
              lives={state.lives}
              hintsLeft={state.hintsLeft}
              hintBlocked={state.flipped.length > 0 || state.status !== 'playing'}
              wildsLeft={state.wildsLeft}
              wildBlocked={state.flipped.length > 0 || state.hintOpen || state.status !== 'playing'}
              multiplier={multiplier}
              turn={state.mode === 'duelo' ? state.turn + 1 : null}
              best={best(state.difficulty, state.mode)}
              soundEnabled={soundOn}
              ambientEnabled={ambientOn}
              onToggleSound={toggleSound}
              onToggleAmbient={toggleAmbient}
              onHint={useHint}
              onWild={useWild}
              onBreathing={() => setShowBreathing(true)}
              onFirstAid={() => setShowFirstAid(true)}
              onRestart={restart}
            />
            <Board
              deck={state.deck}
              flipped={state.flipped}
              matched={state.matched}
              hintOpen={state.hintOpen}
              locked={state.status !== 'playing'}
              onFlip={flipCard}
            />
          </>
        )}
      </main>

      <footer className="footer">
        <p className="footer__sena">{t('footer.sena')}</p>
        <p className="footer__help">
          {t('footer.helpNow')}{' '}
          {RESOURCES.map((resource, index) => (
            <span key={resource.id}>
              {index > 0 && ' · '}
              <a href={resource.href} target={resource.href.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                {pick(resource.name, lang)}
              </a>
            </span>
          ))}
        </p>
        <p>{t('footer.disclaimer')}</p>
      </footer>

      {showResult && finished && (
        <ResultModal
          status={state.status === 'won' ? 'won' : 'lost'}
          loseReason={state.loseReason}
          score={state.score}
          moves={state.moves}
          seconds={state.seconds}
          mode={state.mode}
          difficulty={state.difficulty}
          matchedIds={matchedIds}
          totalPairs={totalPairs}
          isRecord={isRecord}
          beaten={beaten}
          duelWinner={state.duelWinner}
          seed={state.seed}
          challengeTarget={challengeTarget}
          unlocked={unlocked}
          onRestart={restart}
          onClose={() => setShowResult(false)}
          onBreathing={() => setShowBreathing(true)}
          onQuiz={state.status === 'won' ? openQuiz : null}
        />
      )}

      {showStats && (
        <StatsModal
          stats={stats}
          onClose={() => setShowStats(false)}
          onRefresh={refresh}
          onCertificate={() => {
            setShowStats(false)
            setShowCertificate(true)
          }}
        />
      )}

      {showCertificate && (
        <CertificateModal stats={stats} onClose={() => setShowCertificate(false)} />
      )}

      {showBreathing && <BreathingModal onClose={() => setShowBreathing(false)} />}

      {showFirstAid && <FirstAidModal onClose={() => setShowFirstAid(false)} />}

      {showCampaign && (
        <CampaignModal
          stagesDone={stats.stagesDone}
          onPlay={playStage}
          onClose={() => setShowCampaign(false)}
        />
      )}

      {quizQuestions && <QuizModal questions={quizQuestions} onClose={closeQuiz} />}

      {showTutorial && <TutorialModal onClose={closeTutorial} />}

      {toast && <AchievementToast achievement={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
