import * as XLSX from 'xlsx'
import dayjs from 'dayjs'

interface ExportColumn {
  header: string
  key: string
  transform?: (value: any, row: any) => string | number
}

export function exportToExcel(
  data: Record<string, any>[],
  columns: ExportColumn[],
  filename: string,
  sheetName = 'Données'
) {
  const headers = columns.map(col => col.header)
  const rows = data.map(row =>
    columns.map(col => {
      const value = col.key.split('.').reduce((obj, key) => obj?.[key], row)
      return col.transform ? col.transform(value, row) : (value ?? '')
    })
  )

  const wsData = [headers, ...rows]
  const ws = XLSX.utils.aoa_to_sheet(wsData)

  // Auto-size columns
  const colWidths = headers.map((h, i) => {
    const maxLen = Math.max(
      h.length,
      ...rows.map(r => String(r[i] ?? '').length)
    )
    return { wch: Math.min(maxLen + 2, 50) }
  })
  ws['!cols'] = colWidths

  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, sheetName)

  const dateStr = dayjs().format('YYYY-MM-DD')
  XLSX.writeFile(wb, `${filename}_${dateStr}.xlsx`)
}

export function exportToCSV(
  data: Record<string, any>[],
  columns: ExportColumn[],
  filename: string
) {
  const headers = columns.map(col => col.header)
  const rows = data.map(row =>
    columns.map(col => {
      const value = col.key.split('.').reduce((obj, key) => obj?.[key], row)
      const result = col.transform ? col.transform(value, row) : (value ?? '')
      const str = String(result)
      return str.includes(',') || str.includes('"') || str.includes('\n')
        ? `"${str.replace(/"/g, '""')}"`
        : str
    })
  )

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  const dateStr = dayjs().format('YYYY-MM-DD')
  link.download = `${filename}_${dateStr}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

// --- Colonnes prédéfinies pour chaque module ---

export const employeExportColumns: ExportColumn[] = [
  { header: 'Matricule', key: 'contrat_actif', transform: (_v, row) => row?.contrat_actif?.matricule_de_solde ?? '' },
  { header: 'Civilité', key: 'civilite' },
  { header: 'Prénom', key: 'prenom' },
  { header: 'Nom', key: 'nom' },
  { header: 'Genre', key: 'genre' },
  { header: 'Date de naissance', key: 'date_de_naissance', transform: (v) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
  { header: 'Lieu de naissance', key: 'lieu_de_naissance' },
  { header: 'Nationalité', key: 'nationalite' },
  { header: 'CNI', key: 'nci' },
  { header: 'Téléphone', key: 'telephone' },
  { header: 'Adresse', key: 'adresse' },
  { header: 'Poste', key: 'contrat_actif', transform: (_v, row) => row?.contrat_actif?.poste ?? '' },
  { header: 'Type contrat', key: 'contrat_actif', transform: (_v, row) => row?.contrat_actif?.type ?? '' },
  { header: 'Date début contrat', key: 'contrat_actif', transform: (_v, row) => row?.contrat_actif?.date_debut ? dayjs(row.contrat_actif.date_debut).format('DD/MM/YYYY') : '' },
  { header: 'Date fin contrat', key: 'contrat_actif', transform: (_v, row) => row?.contrat_actif?.date_fin ? dayjs(row.contrat_actif.date_fin).format('DD/MM/YYYY') : '' },
  { header: 'Site', key: 'affectation_site', transform: (_v, row) => { const s = row?.affectation_site?.site; return typeof s === 'object' ? s?.nom ?? '' : '' } },
  { header: 'Catégorie', key: 'categorie', transform: (v) => v?.code ?? '' },
  { header: 'Catégorie valeur', key: 'categorie', transform: (v: any) => v?.valeur ?? '' },
  { header: 'Actif', key: 'is_actif', transform: (v) => v ? 'Oui' : 'Non' },
]

export const absenceExportColumns: ExportColumn[] = [
  { header: 'Employé', key: 'employe', transform: (v) => typeof v === 'object' && v ? `${v.prenom} ${v.nom}` : '' },
  { header: 'Type', key: 'type' },
  { header: 'Date début', key: 'date_debut', transform: (v) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
  { header: 'Date fin', key: 'date_fin', transform: (v) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
  { header: 'Motif', key: 'motif' },
  { header: 'Statut', key: 'statut' },
  { header: 'Date création', key: 'createdAt', transform: (v) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '' },
]

export const congeExportColumns: ExportColumn[] = [
  { header: 'Employé', key: 'employe', transform: (v) => typeof v === 'object' && v ? `${v.prenom} ${v.nom}` : '' },
  { header: 'Type', key: 'type' },
  { header: 'Date début', key: 'date_debut', transform: (v) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
  { header: 'Date fin', key: 'date_fin', transform: (v) => v ? dayjs(v).format('DD/MM/YYYY') : '' },
  { header: 'Nombre jours', key: 'nombre_jours' },
  { header: 'Motif', key: 'motif' },
  { header: 'Statut', key: 'statut' },
  { header: 'Date création', key: 'createdAt', transform: (v) => v ? dayjs(v).format('DD/MM/YYYY HH:mm') : '' },
]
