import { Routes, Route } from 'react-router-dom'
import { ToastProvider } from './contexts/ToastContext'
import HomePage from './pages/HomePage'
import BlogListPage from './pages/BlogListPage'
import BlogPostPage from './pages/BlogPostPage'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminBlogEditor from './pages/admin/AdminBlogEditor'
import AdminBlogList from './pages/admin/AdminBlogList'
import AdminTagManager from './pages/admin/AdminTagManager'
import AdminComments from './pages/admin/AdminComments'
import AdminRoute from './components/AdminRoute'

export default function App () {
  return (
    <ToastProvider>
      <Routes>
        {/* Public routes */}
        <Route path='/' element={<HomePage />} />
        <Route path='/blog' element={<BlogListPage />} />
        <Route path='/blog/:slug' element={<BlogPostPage />} />

        {/* Admin routes */}
        <Route path='/admin/login' element={<AdminLoginPage />} />
        <Route
          path='/admin'
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path='/admin/blogs'
          element={
            <AdminRoute>
              <AdminBlogList />
            </AdminRoute>
          }
        />
        <Route
          path='/admin/blogs/new'
          element={
            <AdminRoute>
              <AdminBlogEditor />
            </AdminRoute>
          }
        />
        <Route
          path='/admin/blogs/edit/:id'
          element={
            <AdminRoute>
              <AdminBlogEditor />
            </AdminRoute>
          }
        />
        <Route
          path='/admin/tags'
          element={
            <AdminRoute>
              <AdminTagManager />
            </AdminRoute>
          }
        />
        <Route
          path='/admin/comments'
          element={
            <AdminRoute>
              <AdminComments />
            </AdminRoute>
          }
        />
      </Routes>
    </ToastProvider>
  )
}
