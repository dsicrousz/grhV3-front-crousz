import { authClient } from '@/auth/auth-client';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Form, Input, Button, Divider, Typography, message } from 'antd';
import { useState } from 'react';
import { Users, Calendar, FileText, BarChart3, Shield, Clock } from 'lucide-react';

const { Title, Text } = Typography;

interface LoginFormValues {
  email: string;
  password: string;
}

export const Route = createFileRoute('/')({
  beforeLoad: async () => {
    const session = await authClient.getSession()
    if (session.data?.user) {
      throw redirect({ to: '/admin' })
    }
  },
  component: App,
})

function App() {
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [form] = Form.useForm<LoginFormValues>();
  const navigate = useNavigate();

  const onFinish = async (values: LoginFormValues) => {
    setLoading(true);
    try {
      const result = await authClient.signIn.email({
        email: values.email,
        password: values.password,
      });

      if (result.error) {
        message.error(result.error.message || 'Identifiants incorrects');
        return;
      }

      message.success('Connexion réussie');
      navigate({ to: '/admin' });
    } catch (error) {
      console.error('Login error:', error);
      message.error('Une erreur est survenue lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const onGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await authClient.signIn.social({
        provider: 'google',
        callbackURL: '/admin',
      });
    } catch (error) {
      console.error('Google login error:', error);
      message.error('Erreur lors de la connexion avec Google');
      setGoogleLoading(false);
    }
  };

  const features = [
    { icon: Users, title: 'Gestion des employés', desc: 'Centralisez toutes les informations' },
    { icon: Calendar, title: 'Congés & Absences', desc: 'Suivi automatisé des demandes' },
    { icon: FileText, title: 'Documents RH', desc: 'Contrats et bulletins dématérialisés' },
    { icon: BarChart3, title: 'Tableaux de bord', desc: 'Indicateurs RH en temps réel' },
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-linear-to-br from-emerald-600 via-teal-600 to-cyan-700 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="1" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-center w-full p-12 text-white">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-white/20 rounded-xl backdrop-blur-sm">
                <Users className="w-8 h-8" />
              </div>
              <span className="text-2xl font-bold">GRH Crouz</span>
            </div>
            <h1 className="text-4xl font-bold mb-4">
              Gestion des Ressources Humaines
            </h1>
            <p className="text-lg text-emerald-100 max-w-md">
              Simplifiez la gestion de vos équipes avec notre solution RH complète et intuitive.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-8">
            {features.map((feature, index) => (
              <div key={index} className="p-4 bg-white/10 rounded-xl backdrop-blur-sm">
                <feature.icon className="w-6 h-6 mb-2 text-emerald-200" />
                <h3 className="font-semibold text-sm">{feature.title}</h3>
                <p className="text-xs text-emerald-200 mt-1">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div className="p-2 bg-emerald-600 rounded-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-800">GRH Crouz</span>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 border border-slate-200">
            <div className="text-center mb-6">
              <Title level={3} style={{ marginBottom: 8, color: '#1e293b' }}>
                Connexion
              </Title>
              <Text type="secondary">
                Accédez à votre espace de gestion RH
              </Text>
            </div>

            {/* Google SSO */}
            <Button
              block
              size="large"
              loading={googleLoading}
              onClick={onGoogleSignIn}
              style={{ height: 48, borderRadius: 8, fontSize: 15, fontWeight: 500, borderColor: '#e2e8f0', color: '#374151' }}
              icon={
                !googleLoading && (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )
              }
            >
              Continuer avec Google
            </Button>

            <Divider plain style={{ color: '#94a3b8', fontSize: 13 }}>
              ou avec votre email
            </Divider>

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
            >
              <Form.Item
                name="email"
                label={<span className="font-medium text-slate-700">Email professionnel</span>}
                rules={[
                  { required: true, message: 'Veuillez saisir votre email' },
                  { type: 'email', message: 'Email invalide' },
                ]}
              >
                <Input
                  placeholder="nom@entreprise.com"
                  style={{ borderRadius: 8, height: 44 }}
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="font-medium text-slate-700">Mot de passe</span>}
                rules={[{ required: true, message: 'Veuillez saisir votre mot de passe' }]}
              >
                <Input.Password
                  placeholder="••••••••"
                  style={{ borderRadius: 8, height: 44 }}
                />
              </Form.Item>

              <Form.Item style={{ marginTop: 24 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  style={{
                    height: 48,
                    borderRadius: 8,
                    fontSize: 15,
                    fontWeight: 600,
                    backgroundColor: '#0d9488',
                    borderColor: '#0d9488',
                  }}
                >
                  Se connecter
                </Button>
              </Form.Item>
            </Form>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100">
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <Shield className="w-3 h-3" />
                <span>SSL sécurisé</span>
              </div>
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <Clock className="w-3 h-3" />
                <span>Session 8h</span>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-400 text-xs mt-6">
            © {new Date().getFullYear()} GRH Crouz. Solution de gestion des ressources humaines.
          </p>
        </div>
      </div>
    </div>
  )
}
