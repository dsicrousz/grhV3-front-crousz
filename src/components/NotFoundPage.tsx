import { Link } from '@tanstack/react-router'
import { Button, Typography } from 'antd'
import { FileQuestion, ArrowLeft } from 'lucide-react'

const { Title, Text } = Typography

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center max-w-md px-6">
        <div className="flex justify-center mb-6">
          <div className="p-5 bg-teal-50 rounded-full">
            <FileQuestion className="w-16 h-16 text-teal-500" />
          </div>
        </div>
        <Title level={1} style={{ fontSize: 72, marginBottom: 0, color: '#0d9488', lineHeight: 1 }}>
          404
        </Title>
        <Title level={3} style={{ marginTop: 12, marginBottom: 8, color: '#1e293b' }}>
          Page introuvable
        </Title>
        <Text type="secondary" style={{ fontSize: 15 }}>
          La page que vous recherchez n'existe pas ou a été déplacée.
        </Text>
        <div className="mt-8">
          <Link to="/admin">
            <Button
              type="primary"
              size="large"
              icon={<ArrowLeft className="w-4 h-4" />}
              style={{ backgroundColor: '#0d9488', borderColor: '#0d9488', borderRadius: 8, height: 44 }}
            >
              Retour à l'accueil
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
