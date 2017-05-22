import 'intersection-observer';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from 'react-router-dom';
import './styles/main.css';
import App from './components/App';

function createContainer() {
  const container = document.createElement('div');
  const scriptElement = document.currentScript || (() => {
    const scriptElements = document.scripts || document.getElementsByTagName('script');
    return scriptElements[scriptElements.length - 1];
  })();
  scriptElement.parentNode.insertBefore(container, scriptElement);
  return container;
}

function render(element, container) {
  return new Promise((resolve, reject) => {
    try {
      ReactDOM.render(element, container, resolve);
    } catch (error) {
      reject(error);
    }
  });
}

async function main() {
  const container = createContainer();
  await render((
    <Router>
      <App location={location} />
    </Router>
  ), container);
}

main().catch(console.error.bind(console)); // eslint-disable-line no-console
