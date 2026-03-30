import { Routes, Route, Navigate } from 'react-router';
import SplashPage from './pages/SplashPage';
import OnboardingPage from './pages/OnboardingPage';
import HomePage from './pages/HomePage';

export default function App() {
  return (
    <Routes>
      <Route path="/splash" element={<SplashPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="*" element={<Navigate to="/splash" replace />} />
    </Routes>
  );
}
