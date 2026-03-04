import { Card } from 'antd'
import type { Employe } from '@/types/employe'
import { PDFViewer } from "@react-pdf/renderer";
import Recto from './Recto'
import Verso from './Verso'


interface EmployeInformationsProps {
  employe: Employe
}

export const ProfessionalCard = ({ employe }: EmployeInformationsProps) => {
  return (
    <div>
                  <div className="flex flex-col md:flex-row items-center justify-evenly gap-4">
                    <Card className="w-full md:w-1/2">
                      <PDFViewer width="100%" height={450} style={{ border: 'none', borderRadius: '8px' }}>
                        <Recto user={employe}/>
                      </PDFViewer>
                    </Card>
                    <Card className="w-full md:w-1/2">
                      <PDFViewer width="100%" height={450} style={{ border: 'none', borderRadius: '8px' }}>
                        <Verso value={employe.code} />
                      </PDFViewer>
                    </Card>
                  </div>
    </div>
  )
}
