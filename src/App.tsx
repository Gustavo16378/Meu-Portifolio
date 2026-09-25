import { LenisProvider } from './motion/useLenis'
import { Hud } from './components/Hud'
import { Grain } from './components/Grain'
import { Hero } from './components/Hero'
import { Manifesto } from './components/Manifesto'
import { Projects } from './components/Projects'
import { Others } from './components/Others'
import { Process } from './components/Process'
import { Story } from './components/Story'
import { Contact } from './components/Contact'

export default function App() {
  return (
    <LenisProvider>
      <main>
        <Hero />
        <Manifesto />
        <Projects />
        <Others />
        <Process />
        <Story />
        <Contact />
      </main>
      <Hud />
      <Grain />
    </LenisProvider>
  )
}
