import { Navigate, Route, Routes, useParams } from 'react-router';
import { findRecipe } from './recipes';
import Home from './pages/Home';
import Recipe from './pages/Recipe';
import Timer from './pages/Timer';
import OfflineNotice from './components/OfflineNotice';
import SoundProvider from './audio/SoundProvider';

function RecipeRoute({ timer = false }: { timer?: boolean }) {
  const { recipeId } = useParams();
  const recipe = findRecipe(recipeId);

  if (!recipe) return <Navigate to="/" replace />;

  return timer ? <Timer key={recipe.id} recipe={recipe} /> : <Recipe recipe={recipe} />;
}

export default function App() {
  return (
    <SoundProvider>
      <main id="main">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipe/:recipeId" element={<RecipeRoute />} />
          <Route path="/timer/:recipeId" element={<RecipeRoute timer />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <OfflineNotice />
    </SoundProvider>
  );
}
