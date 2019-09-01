import WebFont from 'webfontloader';
import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import configureHistory from './utils/configureHistory';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { ThemeProvider } from 'styled-components';
import theme from './styles/theme';
import { GlobalStyle } from './styles';

WebFont.load({
  google: {
    families: ['Rubik:300,400,700,900', 'sans-serif']
  }
});

const history = configureHistory();

ReactDOM.render(
  <ThemeProvider theme={theme}>
    <main id='main'>
      <GlobalStyle />
      <HashRouter history={history}>
        <App />
      </HashRouter>
    </main>
  </ThemeProvider>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
