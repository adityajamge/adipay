import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';
import confetti from 'canvas-confetti';

const InputField = ({ id, label, type, value, onChange, error, adornment, icon, onIconClick, setErrors }: any) => (
  <div className="flex flex-col">
    <div className="relative flex">
      {adornment && (
        <div className={`flex items-center justify-center rounded-l-2xl border-y border-l bg-white/5 px-4 pt-[0.85rem] pb-1 text-white transition-colors ${error ? 'border-accent-send' : 'border-white/10'}`}>
          <span className="font-medium text-sm">{adornment}</span>
        </div>
      )}
      <div className="relative flex-1">
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (error) setErrors((prev: any) => ({ ...prev, [id]: '' }));
          }}
          className={`peer w-full bg-white/5 px-4 pb-2 pt-6 text-white backdrop-blur-md transition-all focus:outline-none focus:ring-1 ${
            adornment ? 'rounded-r-2xl border' : 'rounded-2xl border'
          } ${icon ? 'pr-12' : ''} ${
            error
              ? 'border-accent-send focus:border-accent-send focus:ring-accent-send'
              : 'border-white/10 focus:border-brand-primary focus:ring-brand-primary'
          } ${adornment ? 'border-l-0' : ''}`}
          placeholder=" "
        />
        <label
          htmlFor={id}
          className={`absolute left-4 top-2 text-xs transition-all peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-focus:top-2 peer-focus:text-xs ${
            error
              ? 'text-accent-send peer-focus:text-accent-send'
              : 'text-text-tertiary peer-placeholder-shown:text-text-secondary peer-focus:text-brand-primary'
          }`}
        >
          {label}
        </label>
        
        {icon && (
          <button
            type="button"
            onClick={onIconClick}
            className="absolute right-4 top-[1.05rem] text-text-tertiary transition-colors hover:text-white z-10"
          >
            {icon}
          </button>
        )}
      </div>
    </div>
    {error && (
      <span className="mt-1 pl-1 text-sm text-accent-send">
        {error}
      </span>
    )}
  </div>
);

export default function SignupPage() {
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [errors, setErrors] = useState({ fullName: '', email: '', phone: '', password: '', confirmPassword: '' });
  const [shake, setShake] = useState(0);

  const getPasswordStrength = () => {
    if (!password) return 0;
    let strength = 0;
    if (password.length >= 6) strength += 1;
    if (password.length >= 8) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    return Math.min(5, strength);
  };
  const strength = getPasswordStrength();

  const getStrengthColor = () => {
    if (strength === 0) return 'bg-white/10';
    if (strength <= 2) return 'bg-accent-send'; 
    if (strength <= 4) return 'bg-accent-warning'; 
    return 'bg-accent-receive'; 
  };

  const getStrengthWidth = () => {
    if (strength === 0) return '0%';
    return `${(strength / 5) * 100}%`;
  };

  const triggerShake = async () => {
    setShake((prev) => prev + 1);
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {}
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    const newErrors = { fullName: '', email: '', phone: '', password: '', confirmPassword: '' };

    if (!fullName.trim()) { newErrors.fullName = 'Required'; valid = false; }
    if (!email.trim() || !email.includes('@')) { newErrors.email = 'Valid email required'; valid = false; }
    if (!phone.trim() || phone.length < 10) { newErrors.phone = 'Valid phone required'; valid = false; }
    if (strength < 2 && password) { newErrors.password = 'Password is too weak'; valid = false; }
    else if (!password) { newErrors.password = 'Required'; valid = false; }
    if (password !== confirmPassword || !confirmPassword) { newErrors.confirmPassword = 'Passwords do not match'; valid = false; }

    setErrors(newErrors);

    if (!valid) {
      await triggerShake();
      return;
    }

    try {
      await Haptics.notification({ type: NotificationType.Success });
    } catch {}

    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#4285F4', '#34A853', '#EA4335', '#FBBC04']
    });

    setTimeout(() => {
      navigate('/home', { replace: true });
    }, 2000);
  };

  return (
    <div className="flex h-screen flex-col bg-bg-primary text-text-primary">
      {/* Header (Fixed) */}
      <div className="flex items-center justify-between px-6 pt-6 pb-2">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full bg-white/5 p-3 text-text-secondary transition-colors active:bg-white/10 active:text-white"
        >
          <ArrowLeft size={24} />
        </button>
      </div>

      <div className="px-6 pb-4 pt-2">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.4 }}>
          <h1 className="font-heading text-3xl font-bold text-white">Create Account</h1>
          <p className="mt-2 text-base text-text-secondary">Start sending money today</p>
        </motion.div>
      </div>

      {/* Form Area (Scrollable to accommodate soft keyboard) */}
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="flex-1 overflow-y-auto px-6 pb-12"
      >
        <form onSubmit={handleSignup} className="flex flex-col space-y-4">
          <motion.div
            animate={{ x: shake ? [-10, 10, -10, 10, 0] : 0 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col space-y-4 pt-2"
          >
            <InputField id="fullName" label="Full Name" type="text" value={fullName} onChange={setFullName} error={errors.fullName} setErrors={setErrors} />
            <InputField id="email" label="Email" type="email" value={email} onChange={setEmail} error={errors.email} setErrors={setErrors} />
            <InputField id="phone" label="Phone Number" type="tel" value={phone} onChange={setPhone} error={errors.phone} setErrors={setErrors} adornment="+91" />
            
            <div className="space-y-2">
              <InputField
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={setPassword}
                error={errors.password}
                setErrors={setErrors}
                icon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                onIconClick={() => setShowPassword(!showPassword)}
              />
              {/* Strength Meter */}
              <div className="px-1 pt-1">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[11px] uppercase tracking-wider text-text-tertiary font-medium">Password strength</span>
                  <span className={`text-[11px] uppercase tracking-wider font-bold ${strength >= 4 ? 'text-accent-receive' : strength >= 2 ? 'text-accent-warning' : 'text-accent-send'}`}>
                    {strength === 0 ? '' : strength <= 2 ? 'Weak' : strength <= 4 ? 'Fair' : 'Strong'}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
                  <motion.div
                    className={`h-full rounded-full transition-colors duration-300 ${getStrengthColor()}`}
                    animate={{ width: getStrengthWidth() }}
                    transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                  />
                </div>
              </div>
            </div>

            <InputField
              id="confirmPassword"
              label="Confirm Password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={setConfirmPassword}
              error={errors.confirmPassword}
              setErrors={setErrors}
              icon={showConfirm ? <EyeOff size={20} /> : <Eye size={20} />}
              onIconClick={() => setShowConfirm(!showConfirm)}
            />
          </motion.div>

          <div className="pt-6">
            <button
              type="submit"
              className="group flex w-full items-center justify-center space-x-2 rounded-2xl bg-gradient-to-r from-[#4285F4] to-[#5B9EF7] py-4 font-semibold text-white shadow-[0_8px_20px_-6px_rgba(66,133,244,0.6)] transition-all active:scale-[0.98]"
            >
              <span>Create Account</span>
              <ArrowRight size={20} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </form>

        <div className="mt-8 flex items-center justify-center space-x-1 text-sm text-text-secondary pb-4">
          <span>Already have an account?</span>
          <button
            onClick={() => navigate('/login')}
            className="font-semibold text-brand-primary transition-colors hover:text-blue-400"
          >
            Sign In
          </button>
        </div>
      </motion.div>
    </div>
  );
}
