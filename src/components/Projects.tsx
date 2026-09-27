import { useStackedProjects } from './useStackedProjects'
import { ProjectsStage } from './ProjectsStage'
import { ProjectsStack } from './ProjectsStack'

/**
 * Seção 03. Com mouse e tela larga: um palco preso, um gesto por projeto (ProjectsStage).
 * Com toque ou tela estreita: cinco blocos em scroll normal, nada trava (ProjectsStack).
 */
export function Projects() {
  const stacked = useStackedProjects()
  return stacked ? <ProjectsStack /> : <ProjectsStage />
}
