import { useState } from 'react'
import { Routes, Route, Navigate} from 'react-router-dom'
import Welcome from './pages/Welcome'
import ProtectedRoute from './components/ProtectedRoute'
import { ThemeToggle } from './components/ThemeToggle'


function App() {

  return (
    <div className='min-h-screen w-full flex flex-col items-center justify-center'>
      <div className='fixed top-4 right-4'>
        <ThemeToggle />
      </div>
      <Routes>
        <Route path='/' element={<Navigate to='/welcome' replace/> }/>
        <Route path='/welcome' element={<Welcome/>} />
        <Route path='*' element={<ProtectedRoute />} /> {/*Everything except the welcome page is contingent on the user being logged in*/}
      </Routes>
    </div>
  )
}

export default App
