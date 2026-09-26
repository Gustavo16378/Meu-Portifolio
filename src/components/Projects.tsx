import { Fragment, useCallback, useMemo, useRef, useState, type ComponentType } from 'react'
import { projects, projectById, type ProjectId } from '../data/projects'
import { useOverlayState } from './useDialog'
import { ProjectRail } from './ProjectRail'
import type { ProjectSceneProps } from './ProjectScene'
import { ProjectStewer } from './ProjectStewer'
import { ProjectPlain } from './ProjectPlain'
import { TechSheet } from './TechSheet'

// Stewer tem cena própria (lâmpadas, navalha, pente); os outros usam a cena padrão até as fotos chegarem.
const scenes: Record<ProjectId, ComponentType<ProjectSceneProps>> = {
  stewer: ProjectStewer,
  autoria: ProjectPlain,
  'monte-vinhedo': ProjectPlain,
  torra: ProjectPlain,
  cleane: ProjectPlain,
}

/**
 * Seção 03: os cinco projetos um embaixo do outro. Entre um e outro, uma faixa de 30svh
 * em degradê faz a cor de fundo de um sangrar no próximo; o último sangra no preto do site.
 */
export function Projects() {
  const sectionRef = useRef<HTMLElement>(null)
  const sheet = useOverlayState()
  // Guarda o último projeto aberto pra ficha não esvaziar enquanto fecha.
  const [sheetId, setSheetId] = useState<ProjectId | null>(null)

  const { show } = sheet
  const openSheet = useCallback(
    (id: ProjectId) => {
      setSheetId(id)
      show()
    },
    [show],
  )
  const openers = useMemo(
    () => Object.fromEntries(projects.map((p) => [p.id, () => openSheet(p.id)])) as Record<ProjectId, () => void>,
    [openSheet],
  )

  return (
    <section id="projetos" data-section ref={sectionRef} className="relative">
      <ProjectRail sectionRef={sectionRef} total={projects.length} />
      {projects.map((project, i) => {
        const Scene = scenes[project.id]
        const next = projects[i + 1]?.background ?? 'var(--c-bg)'
        return (
          <Fragment key={project.id}>
            <Scene project={project} index={i} onSheet={openers[project.id]} />
            <div
              aria-hidden
              className="h-[30svh]"
              style={{ backgroundImage: `linear-gradient(to bottom, ${project.background}, ${next})` }}
            />
          </Fragment>
        )
      })}
      <TechSheet project={sheetId ? projectById(sheetId) : null} open={sheet.open} onClose={sheet.hide} />
    </section>
  )
}
