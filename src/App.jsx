import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './pages/Home.jsx'
import Games from './pages/Games.jsx'
import Soccer from './pages/Soccer.jsx'
import Albums from './pages/Albums.jsx'
import Tree from './pages/Tree.jsx'
import Projects from './pages/Projects.jsx'
import Interests from './pages/Interests.jsx'
import Guwen from './pages/Guwen.jsx'
import Admin from './pages/Admin.jsx'
import NotFound from './pages/NotFound.jsx'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="interests" element={<Interests />} />
        <Route path="games" element={<Games />} />
        <Route path="soccer" element={<Soccer />} />
        <Route path="albums" element={<Albums />} />
        <Route path="tree" element={<Tree />} />
        <Route path="tree/:id" element={<Tree />} />
        <Route path="projects" element={<Projects />} />
        <Route path="guwen" element={<Guwen />} />
        <Route path="cv" element={<Navigate to="/" replace />} />
        <Route path="admin" element={<Admin />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
