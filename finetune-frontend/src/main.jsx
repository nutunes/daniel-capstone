import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './components/ThemeProvider.jsx'
import { AuthProvider } from './components/AuthProvider.jsx'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  //<StrictMode>
    <BrowserRouter>
      <ThemeProvider defaultTheme='dark' storagKey='vite-ui-theme'>
        <AuthProvider>
          <App />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  //</StrictMode>,
)
