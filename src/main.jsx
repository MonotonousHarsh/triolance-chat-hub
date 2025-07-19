// src/main.js (or wherever your app bootstraps)
window.global = window;    // so `global` points at the browser window
import './index.css';
//import App from './App.vue';
// …the rest of your imports/bootstrap

import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById("root")).render(<App />);
