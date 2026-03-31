import { motion } from 'framer-motion';
import { ArrowUpRight, Clock, User, Home } from 'lucide-react';
import { useNavigate } from 'react-router';

export default function BottomNav({ activeTab }: { activeTab: 'home' | 'send' | 'history' | 'profile' }) {
  const navigate = useNavigate();

  return (
    <div className="fixed bottom-0 left-0 w-full z-50">
      {/* Blur overlay below nav for standard safe-area support */}
      <div className="absolute inset-0 -bottom-10 bg-gradient-to-t from-[#0a0a0f] to-transparent pointer-events-none" />
      
      <div className="relative flex items-center justify-around border-t border-white/10 bg-bg-secondary/40 px-6 py-4 backdrop-blur-2xl">
        {[
          { id: 'home', icon: Home, label: 'Home' },
          { id: 'send', icon: ArrowUpRight, label: 'Send' },
          { id: 'history', icon: Clock, label: 'History' },
          { id: 'profile', icon: User, label: 'Profile' },
        ].map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button 
              key={tab.id} 
              className="relative flex flex-col items-center space-y-1 p-2 focus:outline-none"
              onClick={() => navigate(`/${tab.id}`)}
            >
              <tab.icon size={22} className={isActive ? 'text-brand-primary' : 'text-text-secondary transition-colors hover:text-white'} strokeWidth={isActive ? 2.5 : 2} />
              <span className={`text-[10px] font-medium transition-colors ${isActive ? 'text-brand-primary' : 'text-text-tertiary'}`}>
                {tab.label}
              </span>
              {/* Animated dot indicator */}
              {isActive && (
                <motion.div
                  layoutId="bottom-nav-indicator"
                  className="absolute -top-1 h-1 w-1 rounded-full bg-brand-primary"
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
