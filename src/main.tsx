import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import dayjs from 'dayjs'
import 'dayjs/locale/de'

// Setze deutsche Lokalisierung
dayjs.locale('de')

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 