import { Routes, Route } from 'react-router-dom'
import Layout from './Layout.jsx'
import Home from './pages/Home.jsx'
import Games from './pages/Games.jsx'
import Animals from './pages/Animals.jsx'
import Soccer from './pages/Soccer.jsx'
import NotFound from './pages/NotFound.jsx'
import './App.css'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="games" element={<Games />} />
        <Route path="animals" element={<Animals />} />
        <Route path="soccer" element={<Soccer />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
