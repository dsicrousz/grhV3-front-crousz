import { createFileRoute } from '@tanstack/react-router'
import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Card } from 'antd'
import { EmployeService } from '@/services/employe.service'
import { SiteService } from '@/services/site.service'
import { CategorieService } from '@/services/categorie.service'
import { PosteService } from '@/services/poste.service'
import { DivisionService, ServiceService } from '@/services/division.service'
import type { Employe } from '@/types/employe'
import dayjs from 'dayjs'

import { EmployeHeader, EmployeTable, EmployeStatistics, CreateEmployeModal } from './components'
import { useEmployeMutations } from './hooks/useEmployeMutations'

export const Route = createFileRoute('/admin/employes/')({
  component: EmployesPage,
})

function EmployesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingEmploye, setEditingEmploye] = useState<Employe | null>(null)
  const [searchText, setSearchText] = useState('')

  // Requêtes pour les données
  const { data: employes = [], isLoading } = useQuery({
    queryKey: ['employes', 'agregated'],
    queryFn: () => EmployeService.getAllAgregated(),
  })

  console.log(employes)

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: () => CategorieService.getAll(),
  })

  const { data: sites = [] } = useQuery({
    queryKey: ['sites'],
    queryFn: () => SiteService.getAll(),
  })

  const { data: postes = [] } = useQuery({
    queryKey: ['postes'],
    queryFn: () => PosteService.getAll(),
  })

  const { data: divisions = [] } = useQuery({
    queryKey: ['divisions'],
    queryFn: () => DivisionService.getAll(),
  })

  const { data: allServices = [] } = useQuery({
    queryKey: ['services'],
    queryFn: () => ServiceService.getAll(),
  })

  // Mutations
  const { createMutation, updateMutation, isPending } = useEmployeMutations(() => {
    handleCloseModal()
  })

  // Gestion du modal
  const handleOpenModal = (employe?: Employe) => {
    if (employe) {
      setEditingEmploye(employe)
    } else {
      setEditingEmploye(null)
    }
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingEmploye(null)
  }

  const handleSubmit = (data: {
    employe: any
    contrat?: any
    affectation?: any
  }) => {
    if (editingEmploye) {
      updateMutation.mutate({ id: editingEmploye._id, data: data.employe })
    } else {
      createMutation.mutate({
        employe: data.employe,
        contrat: data.contrat,
        affectation: data.affectation,
      })
    }
  }

  // Valeurs initiales du formulaire
  const initialFormValues = useMemo(() => {
    if (!editingEmploye) return undefined
    
    return {
      ...editingEmploye,
      categorie: typeof editingEmploye.contrat_actif?.categorie === 'object' 
        ? editingEmploye.contrat_actif?.categorie?._id 
        : editingEmploye.contrat_actif?.categorie,
      date_de_naissance: dayjs(editingEmploye.date_de_naissance),
    }
  }, [editingEmploye])

  return (
    <div className="p-6">
      <EmployeHeader 
        employes={employes} 
        onAddClick={() => handleOpenModal()} 
      />

      <Card>
        <EmployeTable
          employes={employes}
          categories={categories}
          isLoading={isLoading}
          searchText={searchText}
          onSearchChange={setSearchText}
          onEdit={handleOpenModal}
        />
      </Card>

      <EmployeStatistics employes={employes} />

      <CreateEmployeModal
        isOpen={isModalOpen}
        editingEmploye={editingEmploye}
        initialValues={initialFormValues}
        categories={categories}
        sites={sites}
        postes={postes}
        divisions={divisions}
        allServices={allServices}
        isPending={isPending}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  )
}
