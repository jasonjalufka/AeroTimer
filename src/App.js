import React, { useState } from 'react';
import { Switch, Route } from 'react-router-dom';
import Home from './pages/Home';
import Recipe from './pages/Recipe';
import Timer from './pages/Timer';
import recipeData from './recipes';

function App() {
  const [allRecipes, setAllRecipes] = useState(recipeData);
  const [recipe, setRecipe] = useState({});

  const updateRecipe = recipeName => {
    setRecipe(allRecipes[recipeName]);
  };
  return (
    <div className='App'>
      <Switch>
        <Route
          path='/'
          exact
          render={props => (
            <Home setRecipe={updateRecipe} allRecipes={allRecipes} />
          )}
        />
        <Route
          path='/recipe/'
          render={props => <Recipe selectedRecipe={recipe} />}
        />
        <Route
          path='/timer/'
          render={props => <Timer selectedRecipe={recipe} />}
        />
        <Route
          render={props => (
            <Home setRecipe={updateRecipe} allRecipes={allRecipes} />
          )}
        />
      </Switch>
    </div>
  );
}

export default App;
