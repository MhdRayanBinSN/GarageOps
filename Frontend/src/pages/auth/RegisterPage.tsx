import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { authApi } from '@/api/auth'
import { showToast } from '@/store/toastStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Car, Building2, User, Mail, Phone, MapPin, Lock, ArrowRight } from 'lucide-react'

const registerSchema = z.object({
  workshopName: z.string().min(2, 'Workshop name is required'),
  workshopPhone: z.string().min(5, 'Phone number is required'),
  workshopEmail: z.string().email('Invalid email address'),
  workshopAddress: z.string().min(3, 'Address is required'),
  ownerUsername: z.string().min(3, 'Username must be at least 3 characters'),
  ownerEmail: z.string().email('Invalid owner email address'),
  ownerPassword: z.string().min(6, 'Password must be at least 6 characters'),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true)
    try {
      await authApi.register(data as any)
      showToast('Workshop registered successfully! Please sign in.', 'success')
      navigate('/login')
    } catch (err: any) {
      const message =
        err.response?.data?.message || 'Registration failed. Please check inputs and try again.'
      showToast(message, 'error')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-6 relative py-12">
      <div className="w-full max-w-2xl relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-md bg-brand-red shadow-lg shadow-brand-red/30 mb-3">
            <Car className="w-6 h-6 text-white" />
          </div>
          <h1 className="font-display text-xl font-bold tracking-wider text-slate-900 uppercase">
            Register Workshop
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Create your workshop profile and primary owner administrator
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-lg p-6 shadow-sm backdrop-blur-md">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Workshop Information Section */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-200 text-slate-500">
                <Building2 className="w-4 h-4" />
                <h3 className="font-display text-sm font-bold uppercase tracking-wider">
                  Workshop Details
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Workshop Name"
                  placeholder="e.g. Apex Auto Care"
                  error={errors.workshopName?.message}
                  {...register('workshopName')}
                />
                <Input
                  label="Phone Number"
                  placeholder="e.g. 0771234567"
                  leftIcon={<Phone className="w-4 h-4" />}
                  error={errors.workshopPhone?.message}
                  {...register('workshopPhone')}
                />
                <Input
                  label="Workshop Email"
                  type="email"
                  placeholder="workshop@apex.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={errors.workshopEmail?.message}
                  {...register('workshopEmail')}
                />
                <Input
                  label="Physical Address"
                  placeholder="123 Industrial Way"
                  leftIcon={<MapPin className="w-4 h-4" />}
                  error={errors.workshopAddress?.message}
                  {...register('workshopAddress')}
                />
              </div>
            </div>

            {/* Owner Account Information Section */}
            <div>
              <div className="flex items-center gap-2 pb-2 mb-4 border-b border-slate-200 text-slate-500">
                <User className="w-4 h-4" />
                <h3 className="font-display text-sm font-bold uppercase tracking-wider">
                  Owner Admin Account
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Admin Username"
                  placeholder="e.g. apexadmin"
                  leftIcon={<User className="w-4 h-4" />}
                  error={errors.ownerUsername?.message}
                  {...register('ownerUsername')}
                />
                <Input
                  label="Admin Email"
                  type="email"
                  placeholder="admin@apex.com"
                  leftIcon={<Mail className="w-4 h-4" />}
                  error={errors.ownerEmail?.message}
                  {...register('ownerEmail')}
                />
                <Input
                  label="Password"
                  type="password"
                  placeholder="••••••••••••"
                  leftIcon={<Lock className="w-4 h-4" />}
                  error={errors.ownerPassword?.message}
                  {...register('ownerPassword')}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full mt-4"
              size="lg"
              isLoading={isLoading}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Complete Workshop Registration
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          Already have a workshop registered?{' '}
          <Link
            to="/login"
            className="text-brand-red font-semibold hover:underline hover:text-red-400 transition-colors"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
