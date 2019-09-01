import { createGlobalStyle } from 'styled-components';
import theme from '../styles/theme';
const { colors } = theme;

const GlobalStyle = createGlobalStyle`
  html {font-size: 18px;}

  body {
    margin: 0;
    width: 100;
    min-height: 100%;
    overflow-x: hidden;
    -moz-osx-font-smoothing: grayscale;
    -webkit-font-smoothing: antialiased;
    color: ${colors.black};
    font-family: 'Rubik', sans-serif;

    &.hidden {
      overflow: hidden;
    }
  }

  h1 {
  margin-top: 0;
  font-size: 3.052em;
  }

  h2 {
    font-size: 2.441em;
  }

  h3 {
    font-size: 1.953em;
  }

  h4 {
    font-size: 1.563em;
  }

  h5 {
    font-size: 1.25em;
  }

  small, .text_small {font-size: 0.8em;}

  #root {
    min-height: 100vh;
  }

  a {
    display: inline-block;
    text-decoration: none;
    text-decoration-skip-ink: auto;
    color: inherit;
    position: relative;
    transition: ${theme.transition};
    cursor: pointer;
    &:hover,
    &:focus {
      color: ${colors.blue};
      outline: 0;
    }
  }

  button {
    cursor: pointer;
    border: 0;
    border-radius: ${theme.borderRadius};
    &:focus,
    &:active {
      outline-color: ${colors.blue};
    }
  }

  p {
    margin: 0 0 15px 0;
  }

  ul, ol {
    padding: 0;
    margin: 0;
    list-style: none;
  }
`;

export default GlobalStyle;
