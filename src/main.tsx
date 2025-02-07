import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import dayjs from 'dayjs'
import 'dayjs/locale/de'
import * as pdfjsLib from 'pdfjs-dist'

// Setze deutsche Lokalisierung
dayjs.locale('de')

// Exakt gleiche Version wie installiert
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.js'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
) 