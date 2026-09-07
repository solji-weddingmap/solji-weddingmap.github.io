import { Routes, Route } from 'react-router-dom'
import HomePage from '@/pages/Home/HomePage'
import WeddingRegisterPage from '@/pages/WeddingRegister/WeddingRegisterPage'
import AdminPage from '@/pages/Admin/AdminPage'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/wedding/:id" element={<HomePage />} />
      <Route path="/register" element={<WeddingRegisterPage mode="create" />} />
      <Route path="/register/:id" element={<WeddingRegisterPage mode="edit" />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  )
}
