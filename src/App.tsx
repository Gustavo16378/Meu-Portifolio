import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ScrollToTop from './components/ScrollToTop'
import Home from './pages/Home'
import Sobre from './pages/Sobre'
import Servicos from './pages/Servicos'
import Projetos from './pages/Projetos'
import ProjetoDetalhe from './pages/ProjetoDetalhe'
import Skills from './pages/Skills'
import Contato from './pages/Contato'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-dark-900 overflow-x-hidden">
        <ScrollToTop />
        <Navbar />
        <Routes>
          <Route path="/"                element={<Home />} />
          <Route path="/sobre"           element={<Sobre />} />
          <Route path="/servicos"        element={<Servicos />} />
          <Route path="/projetos"        element={<Projetos />} />
          <Route path="/projetos/:slug"  element={<ProjetoDetalhe />} />
          <Route path="/skills"          element={<Skills />} />
          <Route path="/contato"         element={<Contato />} />
          <Route path="*"               element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </BrowserRouter>
  )
}
