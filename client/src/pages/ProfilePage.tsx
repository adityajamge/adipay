import { useState } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { User, ChevronRight, Lock, Moon, Info, LogOut, Home, ArrowUpRight, Clock } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';

export default function ProfilePage() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);

  // Bottom Nav Setup
  const navItems = [
    { id: 'home', icon: Home, label: 'Home', path: '/home' },
    { id: 'send', icon: ArrowUpRight, label: 'Send', path: '/send' },
    { id: 'history', icon: Clock, label: 'History', path: '/history' },
    { id: 'profile', icon: User, label: 'Profile', path: '/profile' },
  ];

  const handleToggleDarkMode = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    setDarkMode(!darkMode);
  };

  const handleSignOut = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {}
    // Redirect to splash (auto triggers unauthed flow)
    navigate('/splash', { replace: true });
  };

  const handleNavigate = async (path: string) => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    navigate(path);
  };

  const MenuItem = ({ icon: Icon, label, action, trailing }: any) => (
    <button
      onClick={action}
      className="flex w-full items-center justify-between rounded-2xl border border-white/5 bg-white/5 p-4 transition-colors active:bg-white/10"
    >
      <div className="flex items-center space-x-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5">
          <Icon size={20} className="text-text-secondary" />
        </div>
        <span className="font-semibold text-white">{label}</span>
      </div>
      <div className="text-text-tertiary">
        {trailing || <ChevronRight size={20} />}
      </div>
    </button>
  );

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-bg-primary text-text-primary">
      
      {/* Header */}
      <div className="flex items-center justify-center px-6 pb-2 pt-6">
        <h1 className="font-heading text-lg font-bold text-white tracking-wide">Profile</h1>
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-1 flex-col overflow-y-auto px-6 pb-24 pt-6"
      >
        {/* User Card */}
        <div className="mb-10 flex flex-col items-center">
          <div className="relative mb-5 flex h-[100px] w-[100px] items-center justify-center rounded-full bg-gradient-to-br from-[#4285F4] to-[#3b77db] shadow-[0_0_30px_rgba(66,133,244,0.4)] border border-white/10">
            <span className="font-heading text-4xl font-bold tracking-tight text-white shadow-sm">AJ</span>
            
            {/* Edit Badge Overlay */}
            <div className="absolute bottom-0 right-0 rounded-full border-4 border-bg-primary bg-bg-secondary p-1">
              <div className="h-3 w-3 rounded-full bg-accent-receive" />
            </div>
          </div>
          
          <h2 className="font-heading text-2xl font-bold text-white">Aditya Jamge</h2>
          <p className="mt-1 text-sm font-medium text-text-secondary">aditya@email.com</p>
          <div className="mt-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm">
            <p className="font-mono text-xs text-text-tertiary">+91 98765 43210</p>
          </div>
        </div>

        {/* Menu Section */}
        <div className="flex flex-col space-y-3">
          <MenuItem
            icon={User}
            label="Edit Profile"
            action={() => handleNavigate('/profile')}
          />
          <MenuItem
            icon={Lock}
            label="Change Password"
            action={() => handleNavigate('/profile')}
          />
          <MenuItem
            icon={Moon}
            label="Dark Mode"
            action={handleToggleDarkMode}
            trailing={
              <div
                className={`flex h-6 w-12 items-center rounded-full p-1 transition-colors ${
                  darkMode ? 'bg-brand-primary' : 'bg-white/10'
                }`}
              >
                <motion.div
                  animate={{ x: darkMode ? 24 : 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  className="h-4 w-4 rounded-full bg-white shadow-sm"
                />
              </div>
            }
          />
          <MenuItem
            icon={Info}
            label="About AdiPay"
            action={() => handleNavigate('/profile')}
          />
        </div>

        {/* Sign Out Button */}
        <div className="mt-10">
          <button
            onClick={handleSignOut}
            className="group flex w-full items-center justify-center space-x-2 rounded-2xl border border-accent-send/20 bg-accent-send/10 p-4 transition-colors active:bg-accent-send/20"
          >
            <LogOut size={20} className="text-accent-send transition-transform group-active:-translate-x-1" />
            <span className="font-bold text-accent-send">Sign Out</span>
          </button>
        </div>
      </motion.div>

      {/* --- BOTTOM NAVIGATION (Shared Component) --- */}
      <div className="absolute bottom-0 w-full z-30">
        <div className="absolute inset-0 -bottom-10 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
        <div className="relative flex items-center justify-around border-t border-white/10 bg-bg-secondary/40 px-6 py-4 backdrop-blur-2xl">
          {navItems.map((tab) => {
            const isActive = tab.id === 'profile';
            return (
              <button
                key={tab.id}
                onClick={() => handleNavigate(tab.path)}
                className="relative flex flex-col items-center space-y-1 p-2 focus:outline-none"
              >
                <tab.icon
                  size={22}
                  className={isActive ? 'text-brand-primary' : 'text-text-secondary transition-colors hover:text-white'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-brand-primary' : 'text-text-tertiary'}`}>
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="bottom-nav-indicator"
                    className="absolute -top-1 h-1 w-1 rounded-full bg-brand-primary shadow-[0_0_8px_rgba(66,133,244,0.8)]"
                  />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
