import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/api/auth'
import { useAuthStore } from '@/store/authStore'
import { showToast } from '@/store/toastStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Car, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react'
import { getHomePath } from '@/utils/permissions'

const loginSchema = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
})

type LoginFormValues = z.infer<typeof loginSchema>

const demoCredentials = [
  { role: 'Admin', username: 'cityadmin2' },
  { role: 'Front Desk', username: 'advisor1' },
  { role: 'Mechanic', username: 'mechanic1' },
  { role: 'Customer', username: 'customer1' },
] as const
const demoPassword = 'ChangeMe123!'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: '',
      password: '',
    },
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    try {
      const res = await authApi.login(data as any)
      setAuth(res)
      showToast('Successfully signed in!', 'success')
      navigate(getHomePath(res.userType, res.employeeRole))
    } catch (err: any) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 401 ? 'Invalid username or password' : 'Login failed. Please check backend connection.')
      showToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  const fillQuickCredentials = (u: string, p: string) => {
    setValue('username', u, { shouldValidate: true })
    setValue('password', p, { shouldValidate: true })
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-brand-red/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-sand/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main card */}
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-6">
          <img src="/logo.png" alt="GarageOps Logo" className="mx-auto w-22 h-20 mb-2" />
          {/* <p className="mt-1 text-sm text-slate-500">Workshop & Fleet Operations Management</p> */}
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm backdrop-blur-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Sign in to your account</h2>
          <p className="text-xs text-slate-500 mb-6">
            Enter your workshop credentials to access the console
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Username"
              placeholder="e.g. cityadmin"
              leftIcon={<User className="w-4 h-4" />}
              error={errors.username?.message}
              {...register('username')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••••••"
              leftIcon={<Lock className="w-4 h-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Button
              type="submit"
              className="w-full mt-2"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </form>

          {/* Quick Demo Login Fillers */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-500" /> Demo Credentials:
            </p>
            <div className="flex flex-wrap gap-2">
              {demoCredentials.map(({ role, username }) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => fillQuickCredentials(username, demoPassword)}
                  className="text-xs bg-slate-50 hover:bg-slate-100 text-slate-700 px-2.5 py-1.5 rounded-md border border-slate-200 transition-colors"
                  title={`Fill ${role} demo login`}
                >
                  {role}: <span className="font-mono text-slate-500">{username}</span>
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-500">Demo password: <span className="font-mono">{demoPassword}</span></p>
          </div>
        </div>

        {/* Footer link to register */}
        <p className="text-center text-sm text-slate-500 mt-6">
          Setting up a new workshop?{' '}
          <Link
            to="/register"
            className="text-brand-red font-semibold hover:underline hover:text-red-400 transition-colors"
          >
            Register Workshop
          </Link>
        </p>
      </div>
    </div>
  )
}
