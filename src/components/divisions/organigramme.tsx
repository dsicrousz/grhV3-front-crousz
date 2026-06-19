import { Building2, FolderTree } from 'lucide-react'
import type { DivisionTree, Service } from '@/types/division'
import './organigramme.css'

interface OrganigrammeProps {
  divisions: DivisionTree[]
}

interface DivisionNodeProps {
  division: DivisionTree
  isRoot?: boolean
}

function ServiceCard({ service }: { service: Service }) {
  const isInactive = service.is_active === false
  return (
    <div className={`org-card org-service ${isInactive ? 'org-inactive' : ''}`}>
      <div className="org-card-icon">
        <Building2 className="w-4 h-4" />
      </div>
      <div className="org-card-content">
        <div className="org-card-title">{service.nom}</div>
        <div className="org-card-subtitle">Service</div>
      </div>
    </div>
  )
}

function DivisionNode({ division, isRoot = false }: DivisionNodeProps) {
  const isInactive = division.is_active === false
  const hasChildren = division.children.length > 0 || division.services.length > 0

  return (
    <li className={isRoot ? 'org-root' : ''}>
      <div className={`org-card org-division ${isInactive ? 'org-inactive' : ''}`}>
        <div className="org-card-icon org-division-icon">
          <FolderTree className="w-4 h-4" />
        </div>
        <div className="org-card-content">
          <div className="org-card-title">{division.nom}</div>
          <div className="org-card-subtitle">
            {division.children.length > 0 && `${division.children.length} sous-division(s)`}
            {division.children.length > 0 && division.services.length > 0 && ' • '}
            {division.services.length > 0 && `${division.services.length} service(s)`}
            {!hasChildren && 'Division'}
          </div>
        </div>
      </div>
      {hasChildren && (
        <ul>
          {division.children.map(child => (
            <DivisionNode key={child._id} division={child} />
          ))}
          {division.services.map(service => (
            <li key={service._id}>
              <ServiceCard service={service} />
            </li>
          ))}
        </ul>
      )}
    </li>
  )
}

export function DivisionsOrganigramme({ divisions }: OrganigrammeProps) {
  if (divisions.length === 0) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-500">
        Aucune division à afficher
      </div>
    )
  }

  return (
    <div className="org-chart-container">
      <div className="org-chart">
        <ul>
          {divisions.map(division => (
            <DivisionNode key={division._id} division={division} isRoot />
          ))}
        </ul>
      </div>
    </div>
  )
}
