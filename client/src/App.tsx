import { Routes, Route, Navigate } from 'react-router';
import SplashPage from './pages/SplashPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import SendMoneyPage from './pages/SendMoneyPage';

export default function App() {
  return (
    <Routes>
      <Route path="/splash" element={<SplashPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/send" element={<SendMoneyPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="*" element={<Navigate to="/splash" replace />} />
    </Routes>
  );
}
