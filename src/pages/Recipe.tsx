import { Link } from 'react-router';
import { getTotalTime, type BrewRecipe } from '../recipes';
import styles from './Recipe.module.css';
import { useSound } from '../audio/soundContext';

export default function Recipe({ recipe }: { recipe: BrewRecipe }) {
  const { resumeSound } = useSound();
  const ingredients = [
    ['Brew Method', recipe.method],
    ['Coffee Volume', `${recipe.coffeeVolume}g`],
    ['Grind Size', recipe.grindSize],
    ['Water Volume', `${recipe.waterVolume}g`],
    ['Temperature', `${recipe.temperature}°F`],
    ['Total Time', `${getTotalTime(recipe)}s`],
  ];

  return (
    <div className="page">
      <Link className="backLink" to="/">← Recipes</Link>
      <h1 className={styles.title}>{recipe.name}</h1>
      <dl className={styles.ingredients}>
        {ingredients.map(([label, value]) => (
          <div className={styles.ingredient} key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
      <section className={styles.steps} aria-labelledby="steps-title">
        <h2 id="steps-title">Steps</h2>
        <ol>
          {recipe.steps.map((step, index) => (
            <li className={styles.step} key={`${recipe.id}-${index}`}>
              <span>{step.type}{step.amount !== undefined ? ` / ${step.amount}g` : ''}</span>
              <strong>{step.duration}s</strong>
            </li>
          ))}
        </ol>
        <Link className={styles.brew} to={`/timer/${recipe.id}`} onClick={resumeSound}>Let’s Brew!</Link>
      </section>
    </div>
  );
}
