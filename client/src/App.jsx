import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import CourseManagement from './pages/admin/CourseManagement'
import SemesterManagement from './pages/admin/SemesterManagement'
import ClassSectionManagement from './pages/admin/ClassSectionManagement'
import ScheduleManagement from './pages/admin/ScheduleManagement'
import RegistrationTracking from './pages/admin/RegistrationTracking'
import StudentInfo from './pages/student/StudentInfo'
import CourseRegistration from './pages/student/CourseRegistration'
import Timetable from './pages/student/Timetable'
import GradeLookup from './pages/student/GradeLookup'
import { api } from './utils/api'
import NotFound from './pages/NotFound'

function App() {
  const [auth, setAuth] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        setLoading(false)
        return
      }

      try {
        const data = await api.get('/auth/me')
        if (data.success) {
          setAuth({
            ...data.data,
            role: data.data.role || 'student',
            name: data.data.full_name || data.data.admin_id,
            studentId: data.data.student_id,
            adminId: data.data.admin_id
          })
        } else {
          localStorage.removeItem('token')
          localStorage.removeItem('user')
        }
      } catch (err) {
        console.error('Auth verification failed:', err)
        localStorage.removeItem('token')
        localStorage.removeItem('user')
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogin = (userData, token) => {
    localStorage.setItem('token', token)
    const formattedUser = {
      ...userData,
      role: userData.role || 'student',
      name: userData.full_name || userData.admin_id,
      studentId: userData.student_id,
      adminId: userData.admin_id
    }
    localStorage.setItem('user', JSON.stringify(formattedUser))
    setAuth(formattedUser)
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setAuth(null)
    navigate('/login')
  }

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loader"></div>
        <p>Đang tải hệ thống...</p>
      </div>
    )
  }

  if (!auth) {
    return <Login onLogin={handleLogin} />
  }

  return (
    <Routes>
      {auth.role === 'admin' ? (
        <Route element={<Layout role="admin" user={auth} onLogout={handleLogout} />}>
          <Route path="/admin/courses" element={<CourseManagement />} />
          <Route path="/admin/semesters" element={<SemesterManagement />} />
          <Route path="/admin/sections" element={<ClassSectionManagement />} />
          <Route path="/admin/schedule" element={<ScheduleManagement />} />
          <Route path="/admin/tracking" element={<RegistrationTracking />} />
          <Route path="*" element={<NotFound role="admin" />} />
        </Route>
      ) : (
        <Route element={<Layout role="student" user={auth} onLogout={handleLogout} />}>
          <Route path="/student/info" element={<StudentInfo />} />
          <Route path="/student/registration" element={<CourseRegistration />} />
          <Route path="/student/timetable" element={<Timetable />} />
          <Route path="/student/grades" element={<GradeLookup />} />
          <Route path="*" element={<NotFound role="student" />} />
        </Route>
      )}
    </Routes>
  )
}

export default App
