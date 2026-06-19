import Api from './Api'

export interface ReportingKeyTotal {
  key: string
  total: number
}

export interface ReportingMasseSalariale {
  key: string
  brut: number
  net: number
  chargesSalariales: number
  chargesPatronales: number
  effectif: number
}

export interface ReportingTurnoverAnnee {
  annee: number
  embauches: number
  departs: number
  effectifDebut: number
  effectifFin: number
  effectifMoyen: number
  tauxTurnover: number
}

export interface ReportingTurnoverMois {
  key: string
  embauches: number
  departs: number
  effectifDebut: number
  effectifFin: number
  effectifMoyen: number
  tauxTurnover: number
}

export interface ReportingRetentionCohorte {
  key: string
  effectifInitial: number
  encoreActifs: number
  tauxRetention: number
}

class ReportingServiceClass {
  private base = '/reporting'

  // --- Effectif ---
  async getEffectifByTypeContrat(): Promise<ReportingKeyTotal[]> {
    return Api.get(`${this.base}/effectif/by-type-contrat`).then(res => res.data)
  }

  async getEffectifByPeriode(debut: string, fin: string): Promise<number | ReportingKeyTotal[]> {
    return Api.get(`${this.base}/effectif/by-periode`, { params: { debut, fin } }).then(res => res.data)
  }

  async getEffectifByAge(): Promise<ReportingKeyTotal[]> {
    return Api.get(`${this.base}/effectif/by-age`).then(res => res.data)
  }

  async getEffectifByAnneeRecrutement(): Promise<ReportingKeyTotal[]> {
    return Api.get(`${this.base}/effectif/by-annee-recrutement`).then(res => res.data)
  }

  // --- Contrats ---
  async getContratsByType(): Promise<ReportingKeyTotal[]> {
    return Api.get(`${this.base}/contrats/by-type`).then(res => res.data)
  }

  async getContratsByMotifRupture(): Promise<ReportingKeyTotal[]> {
    return Api.get(`${this.base}/contrats/by-motif-rupture`).then(res => res.data)
  }

  async getContratsByAnnee(): Promise<ReportingKeyTotal[]> {
    return Api.get(`${this.base}/contrats/by-annee`).then(res => res.data)
  }

  // --- Masse salariale ---
  async getMasseSalarialeByAnnee(): Promise<ReportingMasseSalariale[]> {
    return Api.get(`${this.base}/masse-salariale/by-annee`).then(res => res.data)
  }

  async getMasseSalarialeByEmploye(annee?: number): Promise<ReportingMasseSalariale[]> {
    return Api.get(`${this.base}/masse-salariale/by-employe`, {
      params: annee ? { annee } : undefined,
    }).then(res => res.data)
  }

  async getMasseSalarialeByPoste(annee?: number): Promise<ReportingMasseSalariale[]> {
    return Api.get(`${this.base}/masse-salariale/by-poste`, {
      params: annee ? { annee } : undefined,
    }).then(res => res.data)
  }

  async getMasseSalarialeMensuelle(anneeDebut: number, anneeFin: number): Promise<ReportingMasseSalariale[]> {
    return Api.get(`${this.base}/masse-salariale/mensuelle`, {
      params: { anneeDebut, anneeFin },
    }).then(res => res.data)
  }

  // --- Turnover & Rétention ---
  async getTurnoverByAnnee(anneeDebut: number, anneeFin: number): Promise<ReportingTurnoverAnnee[]> {
    return Api.get(`${this.base}/turnover/by-annee`, {
      params: { anneeDebut, anneeFin },
    }).then(res => res.data)
  }

  async getTurnoverByMois(annee: number): Promise<ReportingTurnoverMois[]> {
    return Api.get(`${this.base}/turnover/by-mois`, { params: { annee } }).then(res => res.data)
  }

  async getRetentionByCohorte(): Promise<ReportingRetentionCohorte[]> {
    return Api.get(`${this.base}/retention/by-cohorte`).then(res => res.data)
  }
}

export const ReportingService = new ReportingServiceClass()
