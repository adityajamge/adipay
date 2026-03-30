import { Routes, Route, Navigate } from 'react-router';
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

export default function App() {
  return (
    <Routes>
      <Route path="/splash" element={<SplashPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/send" element={<SendMoneyPage />} />
      <Route path="/add-money" element={<AddMoneyPage />} />
      <Route path="/history" element={<TransactionHistoryPage />} />
      <Route path="/transaction/:id" element={<TransactionDetailPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/splash" replace />} />
    </Routes>
  );
}
