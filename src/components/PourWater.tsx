import styles from './PourWater.module.css';

const wave = 'M0 20 Q150 0 300 20 T600 20 T900 20 T1200 20 V40 H0 Z';

export default function PourWater({ progress, running }: { progress: number; running: boolean }) {
  return (
    <div className={styles.scene} aria-hidden="true" data-testid="pour-water" data-running={running}>
      <div
        className={styles.water}
        style={{ transform: `translateY(${(1 - progress) * 100}%)`, opacity: progress > 0 ? 1 : 0 }}
      >
        <svg className={styles.waveBack} viewBox="0 0 1200 40" preserveAspectRatio="none">
          <path d={wave} />
        </svg>
        <svg className={styles.waveFront} viewBox="0 0 1200 40" preserveAspectRatio="none">
          <path d={wave} />
        </svg>
      </div>
    </div>
  );
}
