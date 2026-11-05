import { Navigate, createHashRouter, type RouteObject } from 'react-router'
import { Layout } from './pages/Layout'
import { ListePage } from './pages/ListePage'
import { FichePage } from './pages/FichePage'
import { SourcesPage } from './pages/SourcesPage'
import { PlanPage } from './pages/plan/PlanPage'
import { QuizPage } from './pages/quiz/QuizPage'
import { RoadmapPage } from './pages/roadmap/RoadmapPage'

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      { index: true, element: <PlanPage /> },
      { path: 'liste', element: <ListePage /> },
      { path: 'fiche/:id', element: <FichePage /> },
      { path: 'quiz', element: <QuizPage /> },
      { path: 'roadmap', element: <RoadmapPage /> },
      { path: 'sources', element: <SourcesPage /> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
]

export const router = createHashRouter(routes)
