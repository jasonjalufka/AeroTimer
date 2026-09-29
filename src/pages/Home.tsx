import { Link } from 'react-router';
import { recipes } from '../recipes';
import logo from '../components/icons/AeroTimerLogo.svg';
import styles from './Home.module.css';

export default function Home() {
  return (
    <div className="page">
      <header className={styles.hero}>
        <h1>AeroTimer</h1>
        <img src={logo} alt="" width="186" height="186" />
      </header>
      <section aria-labelledby="recipes-title">
        <h2 id="recipes-title" className={styles.title}>Recipes</h2>
        <ul className={styles.recipes}>
          {recipes.map(recipe => (
            <li key={recipe.id}>
              <Link className={styles.recipe} to={`/recipe/${recipe.id}`}>
                {recipe.name}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
