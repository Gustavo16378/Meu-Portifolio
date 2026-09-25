import { useCallback, useRef, useState } from 'react'
import { projectById, projects, type ProjectId } from '../data/projects'
import { useOverlayState } from './useDialog'
import { ProjectRail } from './ProjectRail'
import { ProjectStewer } from './ProjectStewer'
import { TechSheet } from './TechSheet'

/** Seção 03: os cinco projetos um embaixo do outro, com trilho lateral e ficha técnica. */
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
  const openStewer = useCallback(() => openSheet('stewer'), [openSheet])

  return (
    <section id="projetos" data-section ref={sectionRef} className="relative">
      <ProjectRail sectionRef={sectionRef} total={projects.length} />
      <ProjectStewer project={projectById('stewer')} index={0} onSheet={openStewer} />
      <TechSheet project={sheetId ? projectById(sheetId) : null} open={sheet.open} onClose={sheet.hide} />
    </section>
  )
}
