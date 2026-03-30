import { Routes, Route, Navigate, useLocation } from 'react-router';
import { AnimatePresence, motion } from 'framer-motion';
import SplashPage from './pages/SplashPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SendMoneyPage from './pages/SendMoneyPage';
import AddMoneyPage from './pages/AddMoneyPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import TransactionDetailPage from './pages/TransactionDetailPage';
import ProfilePage from './pages/ProfilePage';

const PageTransition = ({ children }: { children: React.ReactNode }) => (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: -20 }}
    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    className="h-full w-full bg-bg-primary"
  >
    {children}
  </motion.div>
);

export default function App() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        <Route path="/splash" element={<PageTransition><SplashPage /></PageTransition>} />
        <Route path="/onboarding" element={<PageTransition><OnboardingPage /></PageTransition>} />
        <Route path="/home" element={<PageTransition><HomePage /></PageTransition>} />
        <Route path="/send" element={<PageTransition><SendMoneyPage /></PageTransition>} />
        <Route path="/add-money" element={<PageTransition><AddMoneyPage /></PageTransition>} />
        <Route path="/history" element={<PageTransition><TransactionHistoryPage /></PageTransition>} />
        <Route path="/transaction/:id" element={<PageTransition><TransactionDetailPage /></PageTransition>} />
        <Route path="/profile" element={<PageTransition><ProfilePage /></PageTransition>} />
        <Route path="/login" element={<PageTransition><LoginPage /></PageTransition>} />
        <Route path="/signup" element={<PageTransition><SignupPage /></PageTransition>} />
        <Route path="*" element={<Navigate to="/splash" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
