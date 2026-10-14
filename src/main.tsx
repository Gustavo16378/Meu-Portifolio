import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles/globals.css'
import App from './App'
import { NotFound } from './components/NotFound'
import { Grain } from './components/Grain'
import { Cursor } from './components/Cursor'

const root = document.getElementById('root')
if (!root) throw new Error('#root não encontrado')

// One page: qualquer outro caminho é a página de não encontrado.
const isHome = ['/', '/index.html'].includes(window.location.pathname)

// O preloader estático do index.html: na home o Preloader o substitui; nas outras páginas ele só sai.
if (!isHome) document.getElementById('boot')?.remove()

createRoot(root).render(
  <StrictMode>
    {isHome ? (
      <App />
    ) : (
      <>
        <NotFound />
        <Grain />
        <Cursor />
      </>
    )}
  </StrictMode>,
)
