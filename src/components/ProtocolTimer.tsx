// ============================================================
// FILE: src/components/ProtocolTimer.tsx
// Smart Protocol Timer — Guided Morning Mode
// ============================================================
// Drop this into your project and import it in your dashboard.
// Usage: <ProtocolTimer steps={protocolSteps} onComplete={handleComplete} />
// ============================================================

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, CheckCircle2, X, Timer, RotateCcw, Volume2, VolumeX, ChevronRight } from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

interface ProtocolStep {
  id: string;
  title: string;
  duration: number; // in minutes
  description?: string;
}

interface CompletedStep {
  id: string;
  title: string;
  plannedDuration: number;
  actualDuration: number; // in seconds
  skipped: boolean;
}

interface ProtocolTimerProps {
  steps: ProtocolStep[];
  onComplete: (results: {
    completedSteps: CompletedStep[];
    totalTime: number; // seconds
    completionRate: number; // 0-1
  }) => void;
  onClose: () => void;
}

// ============================================================
// UTILITIES
// ============================================================

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatMinutes(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

// Gentle chime using Web Audio API
function playChime() {
  try {
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    
    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
    osc1.type = 'sine';
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc1.start(ctx.currentTime);
    osc1.stop(ctx.currentTime + 0.8);

    // Second tone (harmony)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
    osc2.type = 'sine';
    gain2.gain.setValueAtTime(0.12, ctx.currentTime + 0.15);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.0);
    osc2.start(ctx.currentTime + 0.15);
    osc2.stop(ctx.currentTime + 1.0);

    osc2.onended = () => ctx.close().catch(() => {});
  } catch (e) {
    // Web Audio not available, silent fail
  }
}

// ============================================================
// MAIN COMPONENT
// ============================================================

export default function ProtocolTimer({ steps, onComplete, onClose }: ProtocolTimerProps) {
  // State
  const [phase, setPhase] = useState<'ready' | 'running' | 'paused' | 'step-complete' | 'finished'>('ready');
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [timeElapsedInStep, setTimeElapsedInStep] = useState(0);
  const [totalElapsed, setTotalElapsed] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<CompletedStep[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [autoAdvanceCountdown, setAutoAdvanceCountdown] = useState(0);

  // Refs
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const autoAdvanceRef = useRef<NodeJS.Timeout | null>(null);
  const stepStartTimeRef = useRef<number>(0);

  const currentStep = steps[currentStepIndex] ?? steps[0];
  const isLastStep = currentStepIndex === steps.length - 1;

  // ============================================================
  // TIMER LOGIC
  // ============================================================

  const clearAllTimers = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (autoAdvanceRef.current) {
      clearInterval(autoAdvanceRef.current);
      autoAdvanceRef.current = null;
    }
  }, []);

  const startTimer = useCallback(() => {
    clearAllTimers();
    stepStartTimeRef.current = Date.now() - (timeElapsedInStep * 1000);

    intervalRef.current = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearAllTimers();
          if (soundEnabled) playChime();
          setPhase('step-complete');
          setAutoAdvanceCountdown(3);
          return 0;
        }
        return prev - 1;
      });
      setTimeElapsedInStep(prev => prev + 1);
      setTotalElapsed(prev => prev + 1);
    }, 1000);
  }, [clearAllTimers, soundEnabled, timeElapsedInStep]);

  const completeCurrentStepRef = useRef<(skipped: boolean) => void>(() => {});

  // Cleanup on unmount
  useEffect(() => {
    return () => clearAllTimers();
  }, [clearAllTimers]);

  // ============================================================
  // STEP MANAGEMENT
  // ============================================================

  const beginMorning = () => {
    setTimeRemaining(currentStep.duration * 60);
    setTimeElapsedInStep(0);
    setPhase('running');
    stepStartTimeRef.current = Date.now();
  };

  useEffect(() => {
    if (phase === 'running') {
      startTimer();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, startTimer]);

  const pauseTimer = () => {
    clearAllTimers();
    setPhase('paused');
  };

  const resumeTimer = () => {
    setPhase('running');
  };

  const completeCurrentStep = (skipped: boolean) => {
    clearAllTimers();

    const completed: CompletedStep = {
      id: currentStep.id,
      title: currentStep.title,
      plannedDuration: currentStep.duration * 60,
      actualDuration: timeElapsedInStep,
      skipped,
    };

    const newCompleted = [...completedSteps, completed];
    setCompletedSteps(newCompleted);

    if (isLastStep) {
      setPhase('finished');
      if (soundEnabled) {
        playChime();
        setTimeout(playChime, 400);
      }
    } else {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      setTimeRemaining(steps[nextIndex].duration * 60);
      setTimeElapsedInStep(0);
      setAutoAdvanceCountdown(0);
      setPhase('running');
      stepStartTimeRef.current = Date.now();
    }
  };

  completeCurrentStepRef.current = completeCurrentStep;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (phase !== 'step-complete') return;
    if (autoAdvanceCountdown > 0) {
      autoAdvanceRef.current = setTimeout(() => {
        setAutoAdvanceCountdown(prev => prev - 1);
      }, 1000);
      return () => {
        if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      };
    }
    completeCurrentStepRef.current(false);
  }, [phase, autoAdvanceCountdown]);

  const skipStep = () => {
    setTotalElapsed(prev => prev + (currentStep.duration * 60 - timeRemaining));
    completeCurrentStep(true);
  };

  const finishEarly = () => {
    if (soundEnabled) playChime();
    setPhase('step-complete');
    setAutoAdvanceCountdown(3);
  };

  const handleFinish = () => {
    const completionRate = steps.length > 0
      ? completedSteps.filter(s => !s.skipped).length / steps.length
      : 0;
    onComplete({
      completedSteps,
      totalTime: totalElapsed,
      completionRate,
    });
  };

  // ============================================================
  // PROGRESS CALCULATIONS
  // ============================================================

  const stepProgress = currentStep
    ? 1 - (timeRemaining / (currentStep.duration * 60))
    : 0;

  const overallProgress = (currentStepIndex + stepProgress) / steps.length;

  // Circle progress for the timer
  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference * (1 - stepProgress);

  // ============================================================
  // RENDER: READY SCREEN
  // ============================================================

  if (phase === 'ready') {
    return (
      <div style={styles.overlay}>
        <div style={styles.container}>
          {/* Close button */}
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>

          <div style={styles.readyContent}>
            <div style={styles.readyIcon}>
              <Timer size={48} strokeWidth={1.5} color="#d4856a" />
            </div>

            <h1 style={styles.readyTitle}>Guided Morning</h1>
            <p style={styles.readySubtitle}>
              {steps.length} steps · {steps.reduce((a, s) => a + s.duration, 0)} minutes
            </p>

            {/* Step preview */}
            <div style={styles.stepPreviewList}>
              {steps.map((step, i) => (
                <div key={step.id} style={styles.stepPreviewItem}>
                  <span style={styles.stepPreviewNum}>{String(i + 1).padStart(2, '0')}</span>
                  <span style={styles.stepPreviewTitle}>{step.title}</span>
                  <span style={styles.stepPreviewDuration}>{step.duration}m</span>
                </div>
              ))}
            </div>

            {/* Sound toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={styles.soundToggle}
            >
              {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
              <span>{soundEnabled ? 'Sound on' : 'Sound off'}</span>
            </button>

            {/* Start button */}
            <button onClick={beginMorning} style={styles.startButton}>
              <Play size={20} fill="white" />
              <span>Begin your morning</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: FINISHED SCREEN
  // ============================================================

  if (phase === 'finished') {
    const completedCount = completedSteps.filter(s => !s.skipped).length;
    const skippedCount = completedSteps.filter(s => s.skipped).length;

    return (
      <div style={styles.overlay}>
        <div style={styles.container}>
          <div style={styles.finishedContent}>
            <div style={styles.finishedIcon}>
              <CheckCircle2 size={64} strokeWidth={1.5} color="#7bc47f" />
            </div>

            <h1 style={styles.finishedTitle}>Morning complete.</h1>
            <p style={styles.finishedSubtitle}>
              {formatMinutes(totalElapsed)} · {completedCount}/{steps.length} steps
            </p>

            {/* Results */}
            <div style={styles.resultsList}>
              {completedSteps.map((step, i) => (
                <div key={step.id} style={styles.resultItem}>
                  <div style={{
                    ...styles.resultCheck,
                    ...(step.skipped ? styles.resultCheckSkipped : styles.resultCheckDone)
                  }}>
                    {step.skipped ? '—' : '✓'}
                  </div>
                  <div style={styles.resultInfo}>
                    <span style={styles.resultTitle}>{step.title}</span>
                    <span style={styles.resultTime}>
                      {step.skipped ? 'Skipped' : formatMinutes(step.actualDuration)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Stats row */}
            <div style={styles.statsRow}>
              <div style={styles.statItem}>
                <span style={styles.statValue}>{formatMinutes(totalElapsed)}</span>
                <span style={styles.statLabel}>Total time</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <span style={styles.statValue}>{completedCount}/{steps.length}</span>
                <span style={styles.statLabel}>Completed</span>
              </div>
              <div style={styles.statDivider} />
              <div style={styles.statItem}>
                <span style={styles.statValue}>{Math.round((completedCount / steps.length) * 100)}%</span>
                <span style={styles.statLabel}>Score</span>
              </div>
            </div>

            <button onClick={handleFinish} style={styles.startButton}>
              <span>Close & save</span>
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDER: RUNNING / PAUSED / STEP-COMPLETE
  // ============================================================

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <button onClick={onClose} style={styles.closeButton}>
            <X size={20} />
          </button>

          {/* Overall progress */}
          <div style={styles.overallProgress}>
            <div style={styles.overallProgressFill}>
              <div style={{
                ...styles.overallProgressBar,
                width: `${overallProgress * 100}%`
              }} />
            </div>
            <span style={styles.overallProgressText}>
              {currentStepIndex + 1}/{steps.length}
            </span>
          </div>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            style={styles.soundButtonSmall}
          >
            {soundEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
          </button>
        </div>

        {/* Main timer area */}
        <div style={styles.timerArea}>
          {/* Step label */}
          <div style={styles.stepLabel}>
            <span style={styles.stepLabelNum}>
              Step {currentStepIndex + 1} of {steps.length}
            </span>
          </div>

          <h2 style={styles.stepTitle}>{currentStep.title}</h2>

          {currentStep.description && (
            <p style={styles.stepDescription}>{currentStep.description}</p>
          )}

          {/* Circular timer */}
          <div style={styles.timerCircleWrapper}>
            <svg width="264" height="264" viewBox="0 0 264 264">
              {/* Background circle */}
              <circle
                cx="132" cy="132" r="120"
                fill="none"
                stroke="rgba(255,255,255,0.06)"
                strokeWidth="4"
              />
              {/* Progress circle */}
              <circle
                cx="132" cy="132" r="120"
                fill="none"
                stroke={phase === 'step-complete' ? '#7bc47f' : '#d4856a'}
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 132 132)"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
              />
            </svg>

            <div style={styles.timerText}>
              {phase === 'step-complete' ? (
                <div style={styles.stepDoneInner}>
                  <CheckCircle2 size={32} color="#7bc47f" />
                  <span style={styles.timerDoneText}>Done</span>
                  {!isLastStep && (
                    <span style={styles.autoAdvanceText}>
                      Next in {autoAdvanceCountdown}...
                    </span>
                  )}
                </div>
              ) : (
                <>
                  <span style={styles.timerDigits}>{formatTime(timeRemaining)}</span>
                  <span style={styles.timerOfTotal}>
                    of {currentStep.duration}m
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Controls */}
          <div style={styles.controls}>
            {phase === 'step-complete' ? (
              <button
                onClick={() => completeCurrentStep(false)}
                style={styles.startButton}
              >
                <span>{isLastStep ? 'Finish morning' : 'Next step'}</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <>
                <button onClick={skipStep} style={styles.secondaryButton}>
                  <SkipForward size={24} />
                  <span>Skip</span>
                </button>

                {phase === 'paused' ? (
                  <button onClick={resumeTimer} style={styles.primaryRoundButton}>
                    <Play size={24} fill="white" />
                  </button>
                ) : (
                  <button onClick={pauseTimer} style={styles.primaryRoundButton}>
                    <Pause size={24} fill="white" />
                  </button>
                )}

                <button onClick={finishEarly} style={styles.secondaryButton}>
                  <CheckCircle2 size={24} />
                  <span>Done</span>
                </button>
              </>
            )}
          </div>

          {phase === 'paused' && (
            <div style={styles.pausedBadge}>
              Paused
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


// ============================================================
// STYLES — Matching Better Morning design language
// ============================================================

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: 'linear-gradient(170deg, #2a1b3d 0%, #44254a 15%, #5e3352 28%, #7a4058 40%, #8f4d5c 50%, #a66b62 62%, #bf8a6e 75%, #d4a67a 88%, #e0bd8a 100%)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'auto',
  },
  container: {
    width: '100%',
    maxWidth: '480px',
    minHeight: '100vh',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
  },

  // Close button
  closeButton: {
    background: 'rgba(30, 15, 25, 0.5)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: 'rgba(240, 232, 224, 0.6)',
    padding: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
  },

  // ---- READY SCREEN ----
  readyContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: '40px',
  },
  readyIcon: {
    width: '80px',
    height: '80px',
    borderRadius: '20px',
    background: 'rgba(212, 133, 106, 0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '24px',
  },
  readyTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: '2rem',
    color: '#f0e8e0',
    marginBottom: '8px',
    textAlign: 'center' as const,
  },
  readySubtitle: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.8rem',
    color: 'rgba(240, 232, 224, 0.5)',
    marginBottom: '36px',
  },

  // Step preview list
  stepPreviewList: {
    width: '100%',
    background: 'rgba(30, 15, 25, 0.55)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '8px',
    marginBottom: '24px',
  },
  stepPreviewItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '14px 16px',
    borderRadius: '10px',
    background: 'rgba(60, 30, 40, 0.3)',
    marginBottom: '4px',
  },
  stepPreviewNum: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.65rem',
    color: 'rgba(240, 232, 224, 0.3)',
    minWidth: '20px',
  },
  stepPreviewTitle: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: '0.9rem',
    color: '#f0e8e0',
    flex: 1,
  },
  stepPreviewDuration: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.7rem',
    color: 'rgba(240, 232, 224, 0.4)',
  },

  // Sound toggle
  soundToggle: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    color: 'rgba(240, 232, 224, 0.4)',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.75rem',
    cursor: 'pointer',
    padding: '8px 16px',
    marginBottom: '32px',
  },
  soundButtonSmall: {
    background: 'none',
    border: 'none',
    color: 'rgba(240, 232, 224, 0.4)',
    cursor: 'pointer',
    padding: '10px',
  },

  // Start / primary button
  startButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    background: 'linear-gradient(135deg, #d4856a, #c46b6b)',
    color: '#fff',
    padding: '16px 32px',
    borderRadius: '12px',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.9rem',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(196, 107, 107, 0.25)',
  },

  // ---- RUNNING SCREEN ----
  topBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    paddingBottom: '20px',
  },
  overallProgress: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  overallProgressFill: {
    flex: 1,
    height: '3px',
    background: 'rgba(255,255,255,0.08)',
    borderRadius: '2px',
    overflow: 'hidden',
  },
  overallProgressBar: {
    height: '100%',
    background: 'linear-gradient(90deg, #d4856a, #c46b6b)',
    borderRadius: '2px',
    transition: 'width 1s linear',
  },
  overallProgressText: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.65rem',
    color: 'rgba(240, 232, 224, 0.4)',
    whiteSpace: 'nowrap' as const,
  },

  timerArea: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative' as const,
  },

  stepLabel: {
    marginBottom: '8px',
  },
  stepLabelNum: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.7rem',
    color: 'rgba(240, 232, 224, 0.35)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  stepTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: '1.6rem',
    color: '#f0e8e0',
    textAlign: 'center' as const,
    marginBottom: '8px',
    lineHeight: 1.2,
  },
  stepDescription: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.75rem',
    color: 'rgba(240, 232, 224, 0.4)',
    textAlign: 'center' as const,
    marginBottom: '8px',
    maxWidth: '300px',
  },

  // Timer circle
  timerCircleWrapper: {
    position: 'relative' as const,
    width: '264px',
    height: '264px',
    margin: '24px 0 40px',
  },
  timerText: {
    position: 'absolute' as const,
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timerDigits: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '3rem',
    fontWeight: 600,
    color: '#f0e8e0',
    letterSpacing: '-0.02em',
  },
  timerOfTotal: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.7rem',
    color: 'rgba(240, 232, 224, 0.35)',
    marginTop: '4px',
  },

  // Step done state
  stepDoneInner: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
  },
  timerDoneText: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: '1.4rem',
    color: '#7bc47f',
  },
  autoAdvanceText: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.7rem',
    color: 'rgba(240, 232, 224, 0.35)',
  },

  // Controls
  controls: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '24px',
    width: '100%',
  },
  secondaryButton: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    minWidth: '80px',
    minHeight: '72px',
    background: 'rgba(30, 15, 25, 0.7)',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '14px',
    color: '#f0e8e0',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.85rem',
    fontWeight: 600,
    cursor: 'pointer',
    padding: '14px 20px',
    backdropFilter: 'blur(12px)',
    WebkitBackdropFilter: 'blur(12px)',
    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.2)',
  },
  primaryRoundButton: {
    width: '72px',
    height: '72px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #d4856a, #c46b6b)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 24px rgba(196, 107, 107, 0.3)',
    color: '#fff',
  },

  // Paused badge
  pausedBadge: {
    position: 'absolute' as const,
    top: '20%',
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.7rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: 'rgba(240, 232, 224, 0.3)',
    background: 'rgba(30, 15, 25, 0.6)',
    padding: '6px 16px',
    borderRadius: '100px',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  // ---- FINISHED SCREEN ----
  finishedContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 0',
  },
  finishedIcon: {
    marginBottom: '24px',
  },
  finishedTitle: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: '2rem',
    color: '#f0e8e0',
    marginBottom: '8px',
  },
  finishedSubtitle: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.85rem',
    color: 'rgba(240, 232, 224, 0.5)',
    marginBottom: '32px',
  },

  // Results list
  resultsList: {
    width: '100%',
    background: 'rgba(30, 15, 25, 0.55)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '16px',
    padding: '8px',
    marginBottom: '24px',
  },
  resultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    background: 'rgba(60, 30, 40, 0.3)',
    borderRadius: '10px',
    marginBottom: '4px',
  },
  resultCheck: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.7rem',
    fontWeight: 700,
    flexShrink: 0,
  },
  resultCheckDone: {
    background: '#7bc47f',
    color: '#fff',
  },
  resultCheckSkipped: {
    background: 'rgba(255,255,255,0.1)',
    color: 'rgba(240, 232, 224, 0.3)',
  },
  resultInfo: {
    flex: 1,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resultTitle: {
    fontFamily: "'IBM Plex Sans', sans-serif",
    fontSize: '0.85rem',
    color: '#f0e8e0',
  },
  resultTime: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.7rem',
    color: 'rgba(240, 232, 224, 0.4)',
  },

  // Stats row
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0',
    width: '100%',
    padding: '20px 0',
    marginBottom: '24px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
  },
  statItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
  },
  statValue: {
    fontFamily: "'DM Serif Display', Georgia, serif",
    fontSize: '1.3rem',
    color: '#f0e8e0',
  },
  statLabel: {
    fontFamily: "'IBM Plex Mono', monospace",
    fontSize: '0.6rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
    color: 'rgba(240, 232, 224, 0.3)',
  },
  statDivider: {
    width: '1px',
    height: '32px',
    background: 'rgba(255,255,255,0.06)',
  },
};
