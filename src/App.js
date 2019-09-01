import React from 'react';
import { Route } from "react-router-dom"
import Home from './pages/Home';
import Recipe from './pages/Recipe';
import Timer from './pages/Timer';

function App() {
  return (
    <div className='App'>
      <Route path="/" exact component={Home} />
      <Route path="/recipe/" component={Recipe} />
      <Route path="/timer/" component={Timer} />
    </div>
  );
}

export default App;
