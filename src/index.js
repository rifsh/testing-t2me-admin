import React from 'react'
import { createRoot } from 'react-dom/client';
import App from './App';
import * as serviceWorker from './serviceWorker';
import 'antd/dist/reset.css'

const container = document.getElementById('root');
// Enable StrictMode in both development and production
const enableStrictMode = process.env.NODE_ENV !== 'production';
const root = createRoot(document.getElementById('root'));
if (enableStrictMode) {
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
} else {
  root.render(<App />);
}


// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
