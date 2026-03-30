import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { Preferences } from '@capacitor/preferences';
import { authService } from '../services/authService';

export default function SplashPage() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const { value: token } = await Preferences.get({ key: 'jwt_token' });
        
        // Default unregistered route
        let targetRoute = '/onboarding';

        if (token) {
          try {
            // Natively validate JWT explicitly against backend server
            await authService.getMe();
            targetRoute = '/home';
          } catch (e) {
            // Native Axios logic intercepts 401 Unauthorized via api.ts and securely wipes local token
            await Preferences.remove({ key: 'jwt_token' });
            targetRoute = '/login';
          }
        }

        // Delay navigation for 1.5 seconds guaranteeing fluid graphic initialization
        setTimeout(() => {
          navigate(targetRoute, { replace: true });
        }, 1500);
      } catch (error) {
        navigate('/onboarding', { replace: true });
      }
    };

    checkAuthStatus();
  }, [navigate]);

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0a0a0f] to-[#12121a]">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="flex flex-col items-center"
      >
        <span className="mb-6 text-4xl font-bold tracking-tight text-white font-heading">
          AdiPay
        </span>

        <div className="mt-8 flex space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0.3, y: 0 }}
              animate={{ opacity: 1, y: -4 }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                repeatType: 'reverse',
                delay: i * 0.2,
              }}
              className="h-2 w-2 rounded-full bg-brand-primary"
            />
          ))}
        </div>
      </motion.div>
    </div>
  );
}
