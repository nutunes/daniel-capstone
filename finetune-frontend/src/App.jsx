import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import Welcome from './pages/Welcome'
import ProtectedRoute from './components/ProtectedRoute'
import './App.css'

function App() {

  return (
    <div className='app'>
      <Routes>
        <Route path='/' element={<Welcome/>} />
        <Route path='*' element={<ProtectedRoute />} /> {/*Everything except the welcome page is contingent on the user being logged in*/}
      </Routes>
    </div>
  )
}

export default App
