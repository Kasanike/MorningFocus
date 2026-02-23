// ============================================================
// FILE: src/components/ProtocolTimer.tsx
// Smart Protocol Timer — Guided Morning Mode
// ============================================================
// Drop this into your project and import it in your dashboard.
// Usage: <ProtocolTimer steps={protocolSteps} onComplete={handleComplete} />
// ============================================================

'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Play, Pause, SkipForward, Check, CheckCircle2, X, Timer, RotateCcw, Volume2, VolumeX, ChevronRight } from 'lucide-react';

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

// Step list color progression (ready screen summary)
const READY_STEP_COLORS = [
  { bg: 'rgba(167,139,250,0.06)', border: 'rgba(167,139,250,0.10)', num: 'rgba(167,139,250,0.6)' },
  { bg: 'rgba(110,195,244,0.05)', border: 'rgba(110,195,244,0.08)', num: 'rgba(110,195,244,0.55)' },
  { bg: 'rgba(180,210,140,0.05)', border: 'rgba(180,210,140,0.08)', num: 'rgba(180,210,140,0.55)' },
  { bg: 'rgba(251,146,60,0.06)', border: 'rgba(251,146,60,0.10)', num: 'rgba(251,146,60,0.6)' },
];
function getReadyStepColor(index: number) {
  return READY_STEP_COLORS[index % READY_STEP_COLORS.length] ?? READY_STEP_COLORS[0];
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
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [completeFlash, setCompleteFlash] = useState(false);

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

  const requestExit = () => {
    clearAllTimers();
    setPhase('paused');
    setShowExitConfirm(true);
  };

  const confirmExit = () => {
    setShowExitConfirm(false);
    onClose();
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
    setCompleteFlash(true);
    if (typeof window !== 'undefined') window.setTimeout(() => setCompleteFlash(false), 300);
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

  // Circle progress for the timer (r=126, 4px stroke)
  const timerRingRadius = 126;
  const circumference = 2 * Math.PI * timerRingRadius;
  const doneProgress = phase === 'step-complete' ? 1 : stepProgress;
  const strokeDashoffset = circumference * (1 - doneProgress);

  // ============================================================
  // RENDER: READY SCREEN
  // ============================================================

  const overlayContent = (content: React.ReactNode) => {
    if (typeof document === 'undefined') return content;
    return createPortal(content, document.body);
  };

  if (phase === 'ready') {
    return overlayContent(
      <div style={styles.overlay}>
        <div style={styles.readyContainer}>
          {/* Top bar: sound (left), exit (right) */}
          <div style={styles.readyTopBar}>
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              style={styles.soundIconButton}
              aria-label={soundEnabled ? 'Sound on' : 'Sound off'}
            >
              {soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
            </button>
            <button onClick={onClose} style={styles.exitButton}>
              <X size={18} />
              <span>Exit</span>
            </button>
          </div>

          {/* Compact header */}
          <div style={styles.readyHeader}>
            <div style={styles.readyIcon}>
              <Timer size={32} strokeWidth={1.5} color="#d4856a" />
            </div>
            <h1 style={styles.readyTitle}>Guided Morning</h1>
            <p style={styles.readySubtitle}>
              {steps.length} steps · {steps.reduce((a, s) => a + s.duration, 0)} min
            </p>
          </div>

          {/* Scrollable steps list */}
          <div style={styles.readyStepsScroll}>
            <div style={styles.stepPreviewList}>
              {steps.map((step, i) => {
                const stepColor = getReadyStepColor(i);
                return (
                  <div
                    key={step.id}
                    style={{
                      ...styles.stepPreviewItem,
                      background: stepColor.bg,
                      border: `1px solid ${stepColor.border}`,
                    }}
                  >
                    <span style={{ ...styles.stepPreviewNum, color: stepColor.num }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span style={styles.stepPreviewTitle}>{step.title}</span>
                    <span style={styles.stepPreviewDuration}>{step.duration}m</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Fixed bottom button with safe area */}
          <div style={styles.readyBottom}>
            <button onClick={beginMorning} style={styles.readyBeginButton}>
              <span style={styles.readyBeginShine} aria-hidden />
              <Play size={20} fill="white" style={{ position: 'relative', zIndex: 1 }} />
              <span style={{ position: 'relative', zIndex: 1 }}>Begin your morning</span>
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

    return overlayContent(
      <div style={styles.overlay}>
        <div style={styles.container}>
          <div style={styles.readyTopBar}>
            <div />
            <button onClick={onClose} style={styles.exitButton}>
              <X size={18} />
              <span>Exit</span>
            </button>
          </div>
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

  return overlayContent(
    <div style={styles.overlay}>
      <div style={styles.container}>
        {/* Top bar: Exit/Cancel (left), progress, sound (right) */}
        <div style={styles.topBar}>
          <button
            onClick={requestExit}
            style={styles.topBarExitButton}
            aria-label="Cancel timer and exit to checklist"
          >
            <X size={20} />
            <span>Exit</span>
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
            style={styles.topBarIconButton}
            aria-label={soundEnabled ? 'Sound on' : 'Sound off'}
          >
            {soundEnabled ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>
        </div>

        {/* Main timer area */}
        <div style={styles.timerArea}>
          {/* Step label + dot progress */}
          <div style={styles.stepLabel}>
            <span
              key={currentStepIndex}
              className="step-label-fade"
              style={styles.stepLabelNum}
            >
              Step {currentStepIndex + 1} of {steps.length}
            </span>
            <div style={styles.stepDots}>
              {steps.map((_, i) => {
                const isCompleted = i < currentStepIndex;
                const isCurrent = i === currentStepIndex;
                const isUpcoming = i > currentStepIndex;
                return (
                  <span
                    key={i}
                    style={{
                      ...styles.stepDot,
                      ...(isCompleted ? styles.stepDotCompleted : {}),
                      ...(isCurrent ? styles.stepDotActive : {}),
                      ...(isUpcoming ? styles.stepDotUpcoming : {}),
                    }}
                    aria-hidden
                  />
                );
              })}
            </div>
          </div>

          <h2 style={styles.stepTitle}>{currentStep.title}</h2>

          {currentStep.description && (
            <p style={styles.stepDescription}>{currentStep.description}</p>
          )}

          {/* Circular timer */}
          <div
            style={styles.timerCircleWrapper}
            className={phase === 'step-complete' ? 'timer-done-ring-pulse' : undefined}
          >
            <svg width="280" height="280" viewBox="0 0 280 280">
              <defs>
                <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#ec4899" />
                </linearGradient>
              </defs>
              {/* Track (background circle) */}
              <circle
                cx="140"
                cy="140"
                r={timerRingRadius}
                fill="none"
                stroke="rgba(255,255,255,0.08)"
                strokeWidth="4"
              />
              {/* Progress arc — gradient stroke */}
              <circle
                cx="140"
                cy="140"
                r={timerRingRadius}
                fill="none"
                stroke="url(#timerGradient)"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                transform="rotate(-90 140 140)"
                style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s ease' }}
              />
            </svg>

            <div style={styles.timerText}>
              {phase === 'step-complete' ? (
                <div style={styles.stepDoneInner}>
                  <span className="timer-done-check-pop" style={{ display: 'inline-flex' }}>
                    <CheckCircle2 size={32} color="rgba(34,197,94,0.9)" />
                  </span>
                  <span style={styles.timerDoneText}>Done</span>
                  {!isLastStep && (
                    <span style={styles.autoAdvanceText}>
                      Next step in <span style={styles.autoAdvanceNumber}>{autoAdvanceCountdown}</span>s
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

          {/* Controls — bottom center, Skip | Pause/Resume (primary) | Complete */}
          <div style={styles.controls}>
            {phase === 'step-complete' ? (
              <div style={styles.stepCompleteActions}>
                <button
                  onClick={() => completeCurrentStep(false)}
                  style={styles.startButton}
                >
                  <span>{isLastStep ? 'Finish morning' : 'Next step'}</span>
                  <ChevronRight size={18} />
                </button>
                <button
                  type="button"
                  onClick={requestExit}
                  style={styles.backToChecklistLink}
                >
                  ← Back to checklist
                </button>
              </div>
            ) : (
              <>
                <button onClick={skipStep} style={styles.controlSecondary} aria-label="Skip step">
                  <SkipForward size={22} color="rgba(255,255,255,0.5)" />
                </button>

                {phase === 'paused' ? (
                  <button onClick={resumeTimer} style={styles.controlPrimary} className="timer-primary-btn" aria-label="Resume">
                    <Play size={24} fill="white" color="white" />
                  </button>
                ) : (
                  <button onClick={pauseTimer} style={styles.controlPrimary} className="timer-primary-btn" aria-label="Pause">
                    <Pause size={24} fill="white" color="white" />
                  </button>
                )}

                <button
                  onClick={finishEarly}
                  style={completeFlash ? styles.controlCompleteFlash : styles.controlSecondary}
                  aria-label="Mark done"
                >
                  <Check size={22} color={completeFlash ? 'rgba(34,197,94,0.8)' : 'rgba(255,255,255,0.5)'} />
                </button>
              </>
            )}
          </div>

          {phase === 'paused' && !showExitConfirm && (
            <div style={styles.pausedBadge}>
              Paused
            </div>
          )}
        </div>
      </div>

      {/* Exit confirmation bottom sheet */}
      {showExitConfirm && (
        <div style={styles.bottomSheetBackdrop} onClick={() => setShowExitConfirm(false)} aria-hidden>
          <div style={styles.bottomSheet} onClick={(e) => e.stopPropagation()}>
            <p style={styles.bottomSheetTitle}>Leave guided mode?</p>
            <div style={styles.bottomSheetActions}>
              <button type="button" onClick={() => setShowExitConfirm(false)} style={styles.bottomSheetButtonSecondary}>
                Continue
              </button>
              <button type="button" onClick={confirmExit} style={styles.bottomSheetButtonPrimary}>
                Exit to checklist
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


// ============================================================
// STYLES — Matching Better Morning design language
// ============================================================

// Dark purple app background for timer overlay (readability, no peach gradient)
const TIMER_OVERLAY_BG = '#1e0d19';

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 9999,
    background: TIMER_OVERLAY_BG,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'stretch',
    alignItems: 'stretch',
    overflow: 'hidden',
  },
  container: {
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    minHeight: '100%',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative' as const,
    flex: 1,
  },

  // Close / Exit button (running + finished)
  closeButton: {
    background: 'rgba(255,255,255,0.06)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '10px',
    color: 'rgba(255, 255, 255, 0.7)',
    padding: '10px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // ---- READY SCREEN (full-screen layout) ----
  readyContainer: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: '100dvh',
    maxWidth: '480px',
    margin: '0 auto',
    width: '100%',
    paddingTop: 'env(safe-area-inset-top)',
    paddingLeft: 'env(safe-area-inset-left)',
    paddingRight: 'env(safe-area-inset-right)',
  },
  readyTopBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 16px 8px',
    flexShrink: 0,
  },
  soundIconButton: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: '8px 12px',
  },
  readyHeader: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '8px 20px 16px',
  },
  readyIcon: {
    width: '48px',
    height: '48px',
    borderRadius: '12px',
    background: 'rgba(212, 133, 106, 0.15)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '12px',
  },
  readyTitle: {
    fontFamily: 'var(--font-dm-sans), var(--font-geist-sans), system-ui, sans-serif',
    fontSize: '1.35rem',
    color: '#f0e8e0',
    marginBottom: '4px',
    textAlign: 'center' as const,
  },
  readySubtitle: {
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: '0.75rem',
    color: 'rgba(240, 232, 224, 0.5)',
    marginBottom: 0,
  },
  readyStepsScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 20px',
    WebkitOverflowScrolling: 'touch',
  },
  readyBottom: {
    flexShrink: 0,
    padding: '16px 20px',
    paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
  },
  readyBeginButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    position: 'relative' as const,
    overflow: 'hidden',
    background: 'linear-gradient(135deg, #f97316 0%, #ef4444 40%, #ec4899 100%)',
    color: '#fff',
    padding: '16px 0',
    borderRadius: '18px',
    fontFamily: 'var(--font-dm-sans), var(--font-geist-sans), system-ui, sans-serif',
    fontSize: '17px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 8px 32px rgba(249,115,22,0.3)',
  },
  readyBeginShine: {
    position: 'absolute' as const,
    top: 0,
    left: 0,
    right: 0,
    height: '50%',
    background: 'linear-gradient(to bottom, rgba(255,255,255,0.12), transparent)',
    pointerEvents: 'none' as const,
    borderTopLeftRadius: '18px',
    borderTopRightRadius: '18px',
  },

  // Step preview list
  stepPreviewList: {
    width: '100%',
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: '14px',
    padding: '6px',
    marginBottom: '24px',
  },
  stepPreviewItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.04)',
    marginBottom: '4px',
  },
  stepPreviewNum: {
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: '0.65rem',
    color: 'rgba(240, 232, 224, 0.35)',
    minWidth: '20px',
  },
  stepPreviewTitle: {
    fontFamily: 'var(--font-dm-sans), var(--font-geist-sans), system-ui, sans-serif',
    fontSize: '0.9rem',
    color: '#f0e8e0',
    flex: 1,
  },
  stepPreviewDuration: {
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: '0.7rem',
    color: 'rgba(240, 232, 224, 0.45)',
  },

  soundButtonSmall: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.7)',
    cursor: 'pointer',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },

  topBarIconButton: {
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.6)',
    cursor: 'pointer',
    padding: '10px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  topBarExitButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    color: 'rgba(255, 255, 255, 0.75)',
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: '0.8rem',
    cursor: 'pointer',
    padding: '8px 12px',
    flexShrink: 0,
  },

  stepCompleteActions: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    width: '100%',
  },
  backToChecklistLink: {
    background: 'none',
    border: 'none',
    padding: 0,
    cursor: 'pointer',
    fontFamily: 'var(--font-dm-sans), var(--font-geist-sans), system-ui, sans-serif',
    fontSize: '0.75rem',
    color: 'rgba(255, 255, 255, 0.5)',
    textDecoration: 'none',
  },

  // Start / primary button (Next step, Finish morning, Begin your morning, Close & save)
  startButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    width: '100%',
    background: 'linear-gradient(135deg, #f97316, #ec4899)',
    color: '#fff',
    padding: '16px 0',
    borderRadius: '16px',
    fontFamily: 'var(--font-dm-sans), var(--font-geist-sans), system-ui, sans-serif',
    fontSize: '16px',
    fontWeight: 700,
    border: 'none',
    cursor: 'pointer',
    boxShadow: '0 6px 24px rgba(249,115,22,0.3)',
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
    fontFamily: 'var(--font-geist-mono), monospace',
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
    marginBottom: '10px',
  },
  stepLabelNum: {
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: '0.7rem',
    color: 'rgba(240, 232, 224, 0.35)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.1em',
  },
  stepDots: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    marginTop: '8px',
  },
  stepDot: {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
  },
  stepDotCompleted: {
    background: 'linear-gradient(135deg, #f97316, #ec4899)',
  },
  stepDotActive: {
    width: '10px',
    height: '10px',
    background: '#fff',
    boxShadow: '0 0 8px rgba(255,255,255,0.3)',
  },
  stepDotUpcoming: {
    background: 'rgba(255,255,255,0.15)',
  },
  stepTitle: {
    fontFamily: 'var(--font-dm-sans), var(--font-geist-sans), system-ui, sans-serif',
    fontSize: '2rem',
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: '#f0e8e0',
    textAlign: 'center' as const,
    marginBottom: '8px',
    lineHeight: 1.2,
  },
  stepDescription: {
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: '0.75rem',
    color: 'rgba(240, 232, 224, 0.4)',
    textAlign: 'center' as const,
    marginBottom: '8px',
    maxWidth: '300px',
  },

  // Timer circle (larger ring, 6px stroke)
  timerCircleWrapper: {
    position: 'relative' as const,
    width: '280px',
    height: '280px',
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
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: '3rem',
    fontWeight: 200,
    color: '#f0e8e0',
    letterSpacing: '-0.02em',
  },
  timerOfTotal: {
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: '0.7rem',
    color: 'rgba(240, 232, 224, 0.6)',
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
    fontFamily: 'var(--font-dm-sans), var(--font-geist-sans), system-ui, sans-serif',
    fontSize: '24px',
    fontWeight: 700,
    color: 'rgba(34,197,94,0.8)',
  },
  autoAdvanceText: {
    fontFamily: 'var(--font-dm-sans), var(--font-geist-sans), system-ui, sans-serif',
    fontSize: '0.85rem',
    fontWeight: 400,
    color: 'rgba(240, 232, 224, 0.6)',
  },
  autoAdvanceNumber: {
    fontWeight: 700,
    color: 'rgba(249,115,22,0.8)',
  },

  // Controls — bottom center: Skip (48px) | Pause/Resume (64px primary) | Complete (48px), gap 20px, ~100px from bottom
  controls: {
    position: 'absolute' as const,
    bottom: '100px',
    left: 0,
    right: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
  },
  controlSecondary: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.08)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  controlPrimary: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #f97316, #ec4899)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 4px 20px rgba(249,115,22,0.35)',
    color: '#fff',
    flexShrink: 0,
  },
  controlCompleteFlash: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'rgba(34,197,94,0.2)',
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    transition: 'background 0.2s ease',
  },

  // Paused badge
  pausedBadge: {
    position: 'absolute' as const,
    top: '6%',
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: '0.7rem',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.15em',
    color: 'rgba(240, 232, 224, 0.3)',
    background: 'rgba(30, 15, 25, 0.6)',
    padding: '6px 16px',
    borderRadius: '100px',
    border: '1px solid rgba(255,255,255,0.08)',
  },

  // Exit confirmation bottom sheet
  bottomSheetBackdrop: {
    position: 'absolute' as const,
    inset: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    justifyContent: 'center',
    zIndex: 10,
    paddingBottom: 'env(safe-area-inset-bottom)',
  },
  bottomSheet: {
    width: '100%',
    maxWidth: '480px',
    background: 'rgba(30, 13, 25, 0.98)',
    borderTopLeftRadius: '20px',
    borderTopRightRadius: '20px',
    padding: '24px 20px',
    paddingBottom: 'calc(24px + env(safe-area-inset-bottom))',
    borderTop: '1px solid rgba(255,255,255,0.08)',
  },
  bottomSheetTitle: {
    fontFamily: 'var(--font-dm-sans), var(--font-geist-sans), system-ui, sans-serif',
    fontSize: '1.1rem',
    fontWeight: 600,
    color: '#f0e8e0',
    marginBottom: '20px',
    textAlign: 'center' as const,
  },
  bottomSheetActions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  bottomSheetButtonSecondary: {
    width: '100%',
    padding: '14px 24px',
    borderRadius: '12px',
    border: '1px solid rgba(255,255,255,0.2)',
    background: 'transparent',
    color: 'rgba(255, 255, 255, 0.9)',
    fontFamily: 'var(--font-dm-sans), var(--font-geist-sans), system-ui, sans-serif',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
  },
  bottomSheetButtonPrimary: {
    width: '100%',
    padding: '14px 24px',
    borderRadius: '12px',
    border: 'none',
    background: 'linear-gradient(135deg, #a78bfa, #f472b6)',
    color: '#fff',
    fontFamily: 'var(--font-dm-sans), var(--font-geist-sans), system-ui, sans-serif',
    fontSize: '0.95rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 20px rgba(167,139,250,0.3)',
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
    fontFamily: 'var(--font-dm-sans), var(--font-geist-sans), system-ui, sans-serif',
    fontSize: '2rem',
    color: '#f0e8e0',
    marginBottom: '8px',
  },
  finishedSubtitle: {
    fontFamily: 'var(--font-geist-mono), monospace',
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
    fontFamily: 'var(--font-dm-sans), var(--font-geist-sans), system-ui, sans-serif',
    fontSize: '0.85rem',
    color: '#f0e8e0',
  },
  resultTime: {
    fontFamily: 'var(--font-geist-mono), monospace',
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
    fontFamily: 'var(--font-dm-sans), var(--font-geist-sans), system-ui, sans-serif',
    fontSize: '1.3rem',
    color: '#f0e8e0',
  },
  statLabel: {
    fontFamily: 'var(--font-geist-mono), monospace',
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
