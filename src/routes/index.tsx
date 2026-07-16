import { authClient } from '@/auth/auth-client';
import { createFileRoute, redirect, useNavigate } from '@tanstack/react-router'
import { Form, Input, Button, Typography, message } from 'antd';
import { useState } from 'react';
import {
  Users, CalendarDays, FileText, BarChart3, Shield, Clock,
  ArrowRight, Sparkles, UserCheck, Building2, MapPin, Award,
} from 'lucide-react';

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
        callbackURL: import.meta.env.VITE_APP_FRONTEND + '/admin',
      });
    } catch (error) {
      console.error('Google login error:', error);
      message.error('Erreur lors de la connexion avec Google');
      setGoogleLoading(false);
    }
  };

  const features = [
    { icon: Users, title: 'Gestion des employés', desc: 'Dossiers, contrats, affectations et historique de carrière centralisés.' },
    { icon: CalendarDays, title: 'Congés & Absences', desc: 'Suivi des demandes, validation multi-niveaux et calendrier interactif.' },
    { icon: FileText, title: 'Lots de bulletins', desc: 'Génération et validation des lots de paie CDI, CDD et temporaires.' },
    { icon: Award, title: 'Nominations', desc: 'Gestion des nominations, promotions et attributions de fonctions.' },
    { icon: Building2, title: 'Divisions & Services', desc: 'Organisation hiérarchique des divisions, services et postes.' },
    { icon: BarChart3, title: 'Reporting RH', desc: 'Tableaux de bord et statistiques avancées en temps réel.' },
  ];

  return (
    <div className="min-h-screen flex bg-slate-50 page-enter">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-[56%] relative overflow-hidden bg-gradient-to-br from-indigo-900 via-indigo-800 to-blue-900">
        {/* Decorative shapes */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] rounded-full bg-indigo-400/10 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 w-72 h-72 rounded-full bg-blue-300/10 blur-2xl" />

        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.06]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
                <path d="M 32 0 L 0 0 0 32" fill="none" stroke="white" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-between w-full p-12 xl:p-16 text-white">
          {/* Logo + heading */}
          <div>
            <div className="flex items-center gap-3 mb-10">
              <div className="p-3 bg-white/15 rounded-2xl backdrop-blur-md ring-1 ring-white/20">
                <Users className="w-7 h-7" />
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight block">GRH CROUS/Z</span>
                <span className="text-xs text-indigo-200/70 font-medium">Gestion des Ressources Humaines</span>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-md ring-1 ring-white/15 mb-6">
              <Sparkles className="w-3.5 h-3.5 text-indigo-200" />
              <span className="text-xs font-medium text-indigo-50">Plateforme RH intégrée</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-bold mb-5 leading-tight tracking-tight">
              Pilotez vos ressources humaines avec efficacité
            </h1>
            <p className="text-lg text-indigo-100/80 max-w-lg leading-relaxed">
              Gérez vos employés, congés, bulletins de paie, nominations et rapports RH sur une plateforme unique, sécurisée et intuitive.
            </p>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-3 gap-3 mt-12">
            {features.map((feature, index) => (
              <div
                key={index}
                className="group p-4 bg-white/8 rounded-xl backdrop-blur-md ring-1 ring-white/10 transition-all duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-white/12 hover:ring-white/20 hover:-translate-y-0.5 press-feedback"
              >
                <div className="p-2 rounded-lg bg-white/10 group-hover:bg-white/15 transition-colors duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] mb-3 w-fit">
                  <feature.icon className="w-5 h-5 text-indigo-200" />
                </div>
                <h3 className="font-semibold text-sm tracking-tight mb-1">{feature.title}</h3>
                <p className="text-xs text-indigo-200/60 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center gap-4 text-indigo-200/50 text-xs mt-12">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              <span>Données chiffrées</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-indigo-300/30" />
            <div className="flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              <span>Contrôle d'accès par rôles</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-indigo-300/30" />
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5" />
              <span>Multi-sites</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login form */}
      <div className="w-full lg:w-[44%] flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2.5 mb-10">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-xl shadow-lg shadow-indigo-500/20">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold text-slate-800 tracking-tight block">GRH CROUS/Z</span>
              <span className="text-[10px] text-slate-500 font-medium">Gestion des Ressources Humaines</span>
            </div>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/60 p-7 sm:p-9 ring-1 ring-slate-200/60 stagger-item">
            <div className="mb-7">
              <Title level={3} style={{ marginBottom: 6, color: '#1e1b4b', fontWeight: 700, letterSpacing: '-0.02em' }}>
                Connexion
              </Title>
              <Text type="secondary" style={{ fontSize: 14 }}>
                Accédez à votre espace de gestion des ressources humaines
              </Text>
            </div>

            {/* Google SSO */}
            <Button
              block
              size="large"
              loading={googleLoading}
              onClick={onGoogleSignIn}
              className="!h-12 !rounded-xl !border-slate-200 !text-slate-700 hover:!border-slate-300 hover:!bg-slate-50 !font-medium !text-[15px] !transition-all"
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

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">ou avec votre email</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            <Form
              form={form}
              name="login"
              onFinish={onFinish}
              layout="vertical"
              size="large"
              requiredMark={false}
            >
              <Form.Item
                name="email"
                label={<span className="font-medium text-slate-700 text-sm">Email professionnel</span>}
                rules={[
                  { required: true, message: 'Veuillez saisir votre email' },
                  { type: 'email', message: 'Email invalide' },
                ]}
              >
                <Input
                  prefix={<svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                  placeholder="nom@crous-z.sn"
                  className="!rounded-xl !h-12"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label={<span className="font-medium text-slate-700 text-sm">Mot de passe</span>}
                rules={[{ required: true, message: 'Veuillez saisir votre mot de passe' }]}
              >
                <Input.Password
                  prefix={<svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>}
                  placeholder="••••••••"
                  className="!rounded-xl !h-12"
                />
              </Form.Item>

              <Form.Item style={{ marginTop: 28, marginBottom: 0 }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  className="!h-12 !rounded-xl !text-[15px] !font-semibold !bg-gradient-to-r !from-indigo-600 !to-blue-600 !border-none hover:!opacity-90 !transition-all !shadow-lg !shadow-indigo-500/25"
                  icon={!loading && <ArrowRight className="w-4 h-4" />}
                  iconPosition="end"
                >
                  Se connecter
                </Button>
              </Form.Item>
            </Form>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-5 pt-6 mt-6 border-t border-slate-100">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Shield className="w-3.5 h-3.5" />
                <span>SSL sécurisé</span>
              </div>
              <div className="w-1 h-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                <Clock className="w-3.5 h-3.5" />
                <span>Session 8h</span>
              </div>
            </div>
          </div>

          <p className="text-center text-slate-400 text-xs mt-8">
            © {new Date().getFullYear()} GRH CROUS/Z • Plateforme de gestion des ressources humaines
          </p>
        </div>
      </div>
    </div>
  )
}
