import { useState } from 'react'
import { Routes, Route, Navigate} from 'react-router-dom'
import Welcome from './pages/Welcome'
import ProtectedRoute from './components/ProtectedRoute'


function App() {

  return (
    <div className='min-h-screen w-full bg-darkpurple text-offwhite flex flex-col items-center justify-center'>
      <Routes>
        <Route path='/' element={<Navigate to='/welcome' replace/> }/>
        <Route path='/welcome' element={<Welcome/>} />
        <Route path='*' element={<ProtectedRoute />} /> {/*Everything except the welcome page is contingent on the user being logged in*/}
      </Routes>
    </div>
  )
}

export default App
