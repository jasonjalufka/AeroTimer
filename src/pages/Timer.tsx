import { useEffect, useRef } from 'react';
import { Link } from 'react-router';
import { type BrewRecipe } from '../recipes';
import { useBrewTimer } from '../hooks/useBrewTimer';
import { useBrewSounds } from '../hooks/useBrewSounds';
import PourWater from '../components/PourWater';
import logo from '../components/icons/AeroTimerLogo.svg';
import styles from './Timer.module.css';

export default function Timer({ recipe }: { recipe: BrewRecipe }) {
  const timer = useBrewTimer(recipe);
  const sounds = useBrewSounds(timer);
  const completionHeading = useRef<HTMLHeadingElement>(null);
  const complete = timer.status === 'complete';
  const pouring = timer.step.type === 'pour' && !complete;
  const targetAmount = Math.round((timer.step.amount ?? 0) * timer.stepProgress);

  function start() {
    sounds.resumeSound();
    timer.start();
  }

  useEffect(() => {
    if (complete) completionHeading.current?.focus();
  }, [complete]);

  return (
    <div className={styles.timer}>
      {pouring && <PourWater progress={timer.stepProgress} running={timer.status === 'running'} />}
      {!complete && timer.stepIndex > 0 && timer.stepElapsedMs < 1200 && (
        <div key={timer.stepIndex} className={styles.stepFlash} aria-hidden="true" data-testid="step-flash" />
      )}
      <div className={styles.content}>
        <header className={styles.header}>
          <Link to={`/recipe/${recipe.id}`}>← {recipe.name}</Link>
          {!complete && (
            <div className={styles.total}>
              <span>Remaining</span>
              <strong role="timer" aria-label="Total time remaining">{timer.remaining}s</strong>
            </div>
          )}
        </header>
        <div className={styles.soundControls}>
          <button
            className={styles.soundToggle}
            aria-pressed={sounds.soundStatus === 'on'}
            onClick={sounds.toggleSound}
          >
            {sounds.soundStatus === 'on' ? 'Sound on'
              : sounds.soundStatus === 'enabling' ? 'Cancel sound'
                : sounds.soundStatus === 'blocked' ? 'Resume sound'
                : sounds.soundStatus === 'unavailable' ? 'Retry sound' : 'Enable sound'}
          </button>
          <span className={styles.soundHint} role="status">
            {sounds.soundStatus === 'unavailable' ? 'Sound unavailable. Try tapping again.'
              : sounds.soundStatus === 'blocked' ? 'Sound remembered. Tap to resume audio.'
                : sounds.soundStatus === 'on' ? 'Ticks at 3 · 2 · 1. Ding at the next step.' : 'Gentle countdown cues'}
          </span>
        </div>
        {complete ? (
          <section className={styles.completion}>
            <img src={logo} alt="" width="186" height="186" />
            <h1 ref={completionHeading} tabIndex={-1}>All done!</h1>
            <p>Enjoy your {recipe.name} coffee.</p>
            <div className={styles.controls}>
              <button className={styles.primary} onClick={timer.reset}>Brew again</button>
              <Link className={styles.secondary} to="/">More recipes</Link>
            </div>
          </section>
        ) : (
          <>
            <section className={styles.current} aria-label="Current brew step">
              <p className={styles.stepNumber}>Step {timer.stepIndex + 1} of {recipe.steps.length}</p>
              <div className={styles.time} role="timer" aria-label="Step time remaining">{timer.stepRemaining}</div>
              <div aria-live="polite" aria-atomic="true">
                <h1 className={styles.directions}>{timer.step.type}</h1>
                {timer.step.amount !== undefined && <p className={styles.amount}>{timer.step.amount} grams</p>}
                <p className={styles.status}>
                  {timer.status === 'paused' ? 'Paused' : timer.status === 'ready' ? 'Ready to brew' : 'Brewing'}
                </p>
              </div>
              {pouring && timer.step.amount !== undefined && (
                <p
                  className={styles.pourTarget}
                  role="progressbar"
                  aria-label="Pour pacing guide"
                  aria-valuemin={0}
                  aria-valuemax={timer.step.amount}
                  aria-valuenow={targetAmount}
                  aria-valuetext={`${targetAmount} of ${timer.step.amount} grams for this pour`}
                >
                  Aim for <strong>{targetAmount} / {timer.step.amount}g</strong> poured
                </p>
              )}
            </section>
            <div className={styles.controls}>
              {timer.status === 'running' ? (
                <button className={styles.primary} onClick={timer.pause}>Pause</button>
              ) : (
                <button className={styles.primary} onClick={start}>
                  {timer.status === 'paused' ? 'Resume' : 'Start'}
                </button>
              )}
              <button className={styles.secondary} onClick={timer.reset}>Reset</button>
            </div>
            {timer.stepIndex < recipe.steps.length - 1 && (
              <section className={styles.upNext} aria-labelledby="next-steps">
                <h2 id="next-steps">Up next</h2>
                <ol start={timer.stepIndex + 2}>
                  {recipe.steps.slice(timer.stepIndex + 1).map((step, index) => (
                    <li key={`${recipe.id}-${timer.stepIndex + index + 1}`}>
                      <span>{step.type}</span><span>{step.duration}s</span>
                    </li>
                  ))}
                </ol>
              </section>
            )}
          </>
        )}
      </div>
    </div>
  );
}
