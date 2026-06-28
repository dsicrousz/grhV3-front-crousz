import { useMutation, useQueryClient } from '@tanstack/react-query'
import { message } from 'antd'
import { EmployeService } from '@/services/employe.service'
import { ContratService } from '@/services/contrat.service'
import { AffectationSiteService } from '@/services/affectation-site.service'
import type { CreateEmployeDto, UpdateEmployeDto } from '@/types/employe'
import type { CreateContratDto } from '@/types/contrat'
import type { CreateAffectationSiteDto } from '@/types/affectation-site'

interface CreateEmployeWithRelationsDto {
  employe: CreateEmployeDto
  contrat?: CreateContratDto
  affectation?: CreateAffectationSiteDto
}

export function useEmployeMutations(onSuccess?: () => void) {
  const queryClient = useQueryClient()

  const createMutation = useMutation({
    mutationFn: async (data: CreateEmployeWithRelationsDto) => {
      const { employe, contrat, affectation } = data
      
      // 1. Créer l'employé
      const newEmploye = await EmployeService.create(employe)
      
      // 2. Créer le contrat si fourni
      if (contrat) {
        await ContratService.create({
          ...contrat,
          employe: newEmploye._id,
        })
      }
      
      // 3. Créer l'affectation si fournie
      if (affectation) {
        await AffectationSiteService.create({
          ...affectation,
          employe: newEmploye._id,
        })
      }
      
      return newEmploye
    },
    onSuccess: () => {
      message.success('Employé créé avec succès')
      queryClient.invalidateQueries({ queryKey: ['employes'] })
      onSuccess?.()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la création')
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateEmployeDto }) =>
      EmployeService.update(id, data),
    onSuccess: () => {
      message.success('Employé modifié avec succès')
      queryClient.invalidateQueries({ queryKey: ['employes'] })
      onSuccess?.()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la modification')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => EmployeService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employes'] })
      onSuccess?.()
    },
    onError: (error: Error) => {
      message.error(error.message || 'Erreur lors de la suppression')
    },
  })

  return {
    createMutation,
    updateMutation,
    deleteMutation,
    isPending: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
  }
}
