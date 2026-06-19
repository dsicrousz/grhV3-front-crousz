import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces'
import dayjs from 'dayjs'
import 'dayjs/locale/fr'
import type { Contrat } from '@/types/contrat'
import { TypeContrat } from '@/types/contrat'
import type { Employe } from '@/types/employe'
import { Genre } from '@/types/employe'

pdfMake.vfs = pdfFonts.vfs as any

dayjs.locale('fr')

const ROMAN: Record<number, string> = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V',
  6: 'VI', 7: 'VII', 8: 'VIII', 9: 'IX', 10: 'X',
  11: 'XI', 12: 'XII', 13: 'XIII', 14: 'XIV', 15: 'XV',
}

export function toRoman(num: number): string {
  if (ROMAN[num]) return ROMAN[num]
  const lookup: [number, string][] = [
    [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'],
    [100, 'C'], [90, 'XC'], [50, 'L'], [40, 'XL'],
    [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
  ]
  let result = ''
  let n = num
  for (const [value, numeral] of lookup) {
    while (n >= value) {
      result += numeral
      n -= value
    }
  }
  return result || String(num)
}

const getPosteName = (poste: any): string => {
  if (!poste) return '_______'
  if (typeof poste === 'string') return poste
  return poste.nom || poste.libelle || '_______'
}

const getCategorieCode = (categorie: any): number | null => {
  if (!categorie) return null
  if (typeof categorie === 'string') return null
  return typeof categorie.code === 'number' ? categorie.code : null
}

export function generateContratDecisionPDF(contrat: Contrat, employe: Employe) {
  const isFemme = employe.genre === Genre.FEMME
  const civilite = isFemme ? 'Madame' : 'Monsieur'
  const neeNe = isFemme ? 'née' : 'né'
  const employeFullName = `${employe.prenom} ${employe.nom.toUpperCase()}`
  const dateNaissance = employe.date_de_naissance ? dayjs(employe.date_de_naissance).format('DD/MM/YYYY') : '__/__/____'
  const lieuNaissance = employe.lieu_de_naissance || '_______'
  const qualification = employe.qualification || getPosteName(contrat.poste)
  const dureeContrat = contrat.type === TypeContrat.CDI
    ? 'à durée indéterminée'
    : 'à durée déterminée'

  const categorieCode = getCategorieCode(contrat.categorie) ?? getCategorieCode(employe.categorie)
  const classeRomain = categorieCode ? toRoman(categorieCode) : '___'
  const niveau = categorieCode ?? '___'

  const dateDebut = dayjs(contrat.date_debut).format('DD/MM/YYYY')
  const lieuDate = `Ziguinchor, le ${dayjs().format('DD MMMM YYYY')}`

  const docDefinition: TDocumentDefinitions = {
    pageSize: 'A4',
    pageMargins: [50, 40, 50, 50],
    defaultStyle: {
      fontSize: 10,
      lineHeight: 1.3,
    },
    content: [
      // En-tête : République à gauche, référence et date à droite
      {
        columns: [
          {
            width: '*',
            stack: [
              { text: 'République du Sénégal', alignment: 'center', bold: true, fontSize: 11 },
              { text: 'Un Peuple – Un But – Une Foi', alignment: 'center', italics: true, fontSize: 9, margin: [0, 2, 0, 8] },
              { text: 'MINISTÈRE DE L\'ENSEIGNEMENT SUPÉRIEUR, DE LA', alignment: 'center', bold: true, fontSize: 9 },
              { text: 'RECHERCHE ET DE L\'INNOVATION', alignment: 'center', bold: true, fontSize: 9, margin: [0, 0, 0, 6] },
              { text: 'CENTRE RÉGIONAL DES ŒUVRES UNIVERSITAIRES', alignment: 'center', bold: true, fontSize: 9 },
              { text: 'SOCIALES DE ZIGUINCHOR (CROUSZ)', alignment: 'center', bold: true, fontSize: 9 },
            ],
          },
          {
            width: 'auto',
            stack: [
              { text: 'N°______/MESRI/CROUSZ/DIR/CSA/Div.RH', fontSize: 9, margin: [0, 0, 0, 20] },
              { text: lieuDate, fontSize: 10, margin: [0, 0, 0, 15] },
              {
                text: [
                  { text: 'ANALYSE : ', bold: true },
                  { text: `Décision portant engagement d'un agent pour un contrat ${dureeContrat}.`, fontSize: 9 },
                ],
                margin: [0, 0, 0, 15],
              },
              { text: 'LE DIRECTEUR', alignment: 'center', bold: true, decoration: 'underline', fontSize: 11 },
            ],
          },
        ],
        columnGap: 20,
        margin: [0, 0, 0, 20],
      },

      // Visas
      {
        ul: [
          'Vu la loi n°97-17 du 1er décembre 1997 portant code du travail modifié par la loi n°2015-04 du 02 février 2015 ;',
          'Vu la loi n° 2016-08 du 02 mars 2016 portant création des Centres Régionaux des Œuvres Universitaires Sociales (CROUS) de Ziguinchor, de Bambey et de Thiès ;',
          'Vu le décret n° 2017-962 du 10 mai 2017 fixant les règles d\'organisation et de fonctionnement des Centres Régional des Œuvres Universitaires Sociales (CROUS) de Ziguinchor, de Bambey et de Thiès ;',
          'Vu le décret n°2023-1694 du 03 août 2023, fixant le régime spécial applicable aux personnels techniques, administratifs et de service (PATS) des établissements publics d\'enseignement supérieur et des centres des Œuvres universitaires ;',
          'Vu le décret n° 2024-1290 du 03 Juillet 2024 portant nomination du Directeur du Centre Régional des Œuvres Universitaires Sociales de Ziguinchor ;',
          'Vu les nécessités de Service.',
        ],
        fontSize: 10,
        margin: [0, 0, 0, 15],
      },

      // DECIDE
      { text: 'DECIDE', alignment: 'center', bold: true, decoration: 'underline', fontSize: 13, margin: [0, 5, 0, 10] },

      // Article Premier
      {
        text: [
          { text: 'ARTICLE Premier – ', bold: true },
          { text: `${civilite} ${employeFullName}, ${neeNe} le ${dateNaissance} à ${lieuNaissance}, engagé${isFemme ? 'e' : ''} en qualité d'${qualification} au Centre Régional des Œuvres Universitaires Sociales de Ziguinchor (CROUSZ), pour un contrat ${dureeContrat} et est classé${isFemme ? 'e' : ''} comme suit :` },
        ],
        alignment: 'justify',
        margin: [0, 0, 0, 10],
      },

      {
        text: `Classe ${classeRomain} ; Niveau ${niveau} ; Catégorie ${classeRomain} ; Echelon I`,
        margin: [20, 0, 0, 12],
      },

      // Article 2
      {
        text: [
          { text: 'ARTICLE 2 : ', bold: true },
          { text: `Il est conclu pour être exécuté à Ziguinchor et/ou à Kolda (Sénégal) ou en tout autre lieu du territoire où l'agent pourrait être appelé à exercer pour nécessité de service.` },
        ],
        alignment: 'justify',
        margin: [0, 0, 0, 10],
      },

      // Article 3
      {
        text: [
          { text: 'ARTICLE 3 : ', bold: true },
          { text: 'La dépense est imputable au budget du CROUSZ.' },
        ],
        alignment: 'justify',
        margin: [0, 0, 0, 10],
      },

      // Article 4
      {
        text: [
          { text: 'ARTICLE 4 : ', bold: true },
          { text: `Le Chef des Services Administratifs, le Chef de la Division des Ressources Humaines, le Chef de la Division des Affaires Financières et l'Agent Comptable sont chargés, chacun en ce qui le concerne de l'exécution de la présente décision qui prend effet à compter du ${dateDebut}.` },
        ],
        alignment: 'justify',
        margin: [0, 0, 0, 25],
      },

      // Ampliations
      {
        stack: [
          { text: 'Ampliations', bold: true, decoration: 'underline', fontSize: 11, margin: [0, 0, 0, 6] },
          {
            ul: ['CSA', 'AC', 'Intéressé' + (isFemme ? 'e' : ''), 'Dossier', 'Chrono'],
            fontSize: 10,
          },
        ],
        margin: [0, 0, 0, 30],
      },
    ] as Content[],
    footer: () => ({
      stack: [
        { text: 'Université Assane SECK de Ziguinchor – BP 10 12 – Tél : 781714127 ; 777078054', alignment: 'center', fontSize: 8 },
        { text: 'icoly@crousz.sn', alignment: 'center', fontSize: 8, italics: true },
      ],
      margin: [50, 0],
    }),
  }

  pdfMake.createPdf(docDefinition).open()
}
