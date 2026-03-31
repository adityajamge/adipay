import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { authService } from '../services/authService';

export default function LoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // States for errors to trigger shake animation
  const [errors, setErrors] = useState({ identifier: '', password: '' });
  const [shake, setShake] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const triggerShake = async () => {
    setShake((prev) => prev + 1);
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch (e) {
      // Ignore if haptics are unavailable (web browser testing)
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    const newErrors = { identifier: '', password: '' };

    if (!identifier) {
      newErrors.identifier = 'Email or Phone is required';
      valid = false;
    }
    
    // Quick real-time validation mockup
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
      valid = false;
    }

    setErrors(newErrors);

    if (!valid) {
      await triggerShake();
      return;
    }

    try {
      await Haptics.impact({ style: ImpactStyle.Medium });
    } catch (e) {}

    setIsSubmitting(true);

    try {
      const res = await authService.login(identifier, password);
      if (res.token) {
        await Preferences.set({ key: 'jwt_token', value: res.token });
        navigate('/home', { replace: true });
        return;
      }

      setErrors({
        identifier: 'Login failed: missing auth token',
        password: ''
      });
      await triggerShake();
    } catch (error: any) {
      setErrors({ 
        identifier: error.response?.data?.message || 'Invalid credentials', 
        password: '' 
      });
      await triggerShake();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <div className="flex min-h-screen flex-col bg-bg-primary text-text-primary">
      {/* Top Header */}
      <div className="flex items-center justify-between p-6">
        <button
          onClick={handleBack}
          className="rounded-full bg-white/5 p-3 text-text-secondary transition-colors active:bg-white/10 active:text-white"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      {/* Title Section */}
      <div className="px-6 pb-8 pt-4">
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <h1 className="font-heading text-3xl font-bold text-white">
            Welcome back
          </h1>
          <p className="mt-2 text-base text-text-secondary">
            Sign in to continue to AdiPay
          </p>
        </motion.div>
      </div>

      {/* Form Section */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex-1 px-6 pb-6"
      >
        <form onSubmit={handleSignIn} className="flex flex-col space-y-5">
          {/* Glassmorphism Email/Phone Input with Floating Label */}
          <motion.div
            animate={{ x: shake ? [-10, 10, -10, 10, 0] : 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col"
          >
            <div className="relative">
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => {
                  setIdentifier(e.target.value);
                  if (errors.identifier) setErrors({ ...errors, identifier: '' });
                }}
                className={`peer w-full rounded-2xl border bg-white/5 px-4 pb-3 pt-7 text-white backdrop-blur-md transition-all focus:outline-none focus:ring-1 ${
                  errors.identifier
                    ? 'border-accent-send focus:border-accent-send focus:ring-accent-send'
                    : 'border-white/10 focus:border-brand-primary focus:ring-brand-primary'
                }`}
                placeholder=" "
              />
              <label
                htmlFor="identifier"
                className={`absolute left-4 top-3 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-3 peer-focus:text-xs ${
                  errors.identifier
                    ? 'text-accent-send peer-focus:text-accent-send'
                    : 'text-text-tertiary peer-placeholder-shown:text-text-secondary peer-focus:text-brand-primary'
                }`}
              >
                Email or Phone
              </label>
            </div>
            {errors.identifier && (
              <span className="mt-2 text-sm text-accent-send pl-1">
                {errors.identifier}
              </span>
            )}
          </motion.div>

          {/* Glassmorphism Password Input with Floating Label */}
          <motion.div
            animate={{ x: shake ? [-10, 10, -10, 10, 0] : 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col"
          >
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password) setErrors({ ...errors, password: '' });
                }}
                className={`peer w-full rounded-2xl border bg-white/5 pl-4 pr-12 pb-3 pt-7 text-white backdrop-blur-md transition-all focus:outline-none focus:ring-1 ${
                  errors.password
                    ? 'border-accent-send focus:border-accent-send focus:ring-accent-send'
                    : 'border-white/10 focus:border-brand-primary focus:ring-brand-primary'
                }`}
                placeholder=" "
              />
              <label
                htmlFor="password"
                className={`absolute left-4 top-3 text-xs transition-all peer-placeholder-shown:top-5 peer-placeholder-shown:text-base peer-focus:top-3 peer-focus:text-xs ${
                  errors.password
                    ? 'text-accent-send peer-focus:text-accent-send'
                    : 'text-text-tertiary peer-placeholder-shown:text-text-secondary peer-focus:text-brand-primary'
                }`}
              >
                Password
              </label>
              
              {/* Eye Toggle */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-[1.15rem] text-text-tertiary transition-colors hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <span className="mt-2 text-sm text-accent-send pl-1">
                {errors.password}
              </span>
            )}
          </motion.div>

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              className="text-sm font-medium text-brand-primary transition-colors hover:text-blue-400"
            >
              Forgot Password?
            </button>
          </div>

          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-[#4285F4] to-[#5B9EF7] py-4 font-semibold text-white shadow-[0_8px_20px_-6px_rgba(66,133,244,0.6)] transition-all active:scale-[0.98]"
            >
              <span>{isSubmitting ? 'Signing In...' : 'Sign In'}</span>
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>

        {/* Unified Bottom Link */}
        <div className="mt-12 flex items-center justify-center space-x-1 text-base text-text-secondary">
          <span>Don't have an account?</span>
          <button
            onClick={() => navigate('/signup')}
            className="font-semibold text-brand-primary transition-colors hover:text-blue-400"
          >
            Sign Up
          </button>
        </div>
      </motion.div>
    </div>
  );
}
