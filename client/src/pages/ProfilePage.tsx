import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { motion } from 'framer-motion';
import { User as UserIcon, ChevronRight, Lock, Moon, Info, LogOut, X } from 'lucide-react';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Preferences } from '@capacitor/preferences';
import { authService } from '../services/authService';
import BottomNav from '../components/BottomNav';

const THEME_STORAGE_KEY = 'adipay_theme_mode';

type ThemeMode = 'dark' | 'light';

interface User {
  full_name: string;
  email: string;
  phone_number: string;
}

const applyTheme = (mode: ThemeMode) => {
  document.documentElement.setAttribute('data-theme', mode);
};

const normalizeUser = (value: any): User => ({
  full_name: value?.full_name || '',
  email: value?.email || '',
  phone_number: value?.phone_number || value?.phone || '',
});

export default function ProfilePage() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [pageMessage, setPageMessage] = useState('');

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editFullName, setEditFullName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [isPasswordOpen, setIsPasswordOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);

  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const loadProfile = async () => {
    setLoadingUser(true);
    try {
      const me = await authService.getMe();
      setUser(normalizeUser(me));
    } catch (error: any) {
      console.error(error);
      if (error?.response?.status === 401) {
        navigate('/login', { replace: true });
        return;
      }
      setPageMessage(error?.response?.data?.message || 'Unable to load profile');
    } finally {
      setLoadingUser(false);
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    const mode: ThemeMode = stored === 'light' ? 'light' : 'dark';
    setDarkMode(mode === 'dark');
    applyTheme(mode);
  }, []);

  useEffect(() => {
    loadProfile();
  }, []);

  const handleToggleDarkMode = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}

    const nextMode: ThemeMode = darkMode ? 'light' : 'dark';
    setDarkMode(nextMode === 'dark');
    applyTheme(nextMode);
    localStorage.setItem(THEME_STORAGE_KEY, nextMode);
  };

  const handleSignOut = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Heavy });
    } catch {}
    await Preferences.remove({ key: 'jwt_token' });
    // Redirect to splash (auto triggers unauthed flow)
    navigate('/splash', { replace: true });
  };

  const handleOpenEditProfile = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}

    setPageMessage('');
    setEditError('');
    setEditFullName(user?.full_name || '');
    setEditEmail(user?.email || '');
    setEditPhone(user?.phone_number || '');
    setIsEditOpen(true);
  };

  const handleSaveProfile = async () => {
    const fullName = editFullName.trim();
    const email = editEmail.trim();
    const phone = editPhone.trim();

    if (!fullName || !email || !phone) {
      setEditError('Full name, email and phone are required.');
      return;
    }

    if (!email.includes('@')) {
      setEditError('Please provide a valid email address.');
      return;
    }

    setEditLoading(true);
    setEditError('');

    try {
      const response = await authService.updateProfile({
        full_name: fullName,
        email,
        phone_number: phone,
      });

      const updatedUserRaw = response?.user ?? response;
      const updatedUser = normalizeUser(updatedUserRaw);

      if (updatedUser.full_name && updatedUser.email) {
        setUser(updatedUser);
      } else {
        await loadProfile();
      }

      setIsEditOpen(false);
      setPageMessage('Profile updated successfully.');
    } catch (error: any) {
      setEditError(error?.response?.data?.message || 'Failed to update profile.');
    } finally {
      setEditLoading(false);
    }
  };

  const handleOpenPassword = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}

    setPageMessage('');
    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setIsPasswordOpen(true);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('All password fields are required.');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setPasswordLoading(true);
    setPasswordError('');

    try {
      await authService.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });

      setIsPasswordOpen(false);
      setPageMessage('Password changed successfully.');
    } catch (error: any) {
      setPasswordError(error?.response?.data?.message || 'Failed to change password.');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleOpenAbout = async () => {
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {}
    setIsAboutOpen(true);
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
            <span className="font-heading text-4xl font-bold tracking-tight text-white shadow-sm">{user ? user.full_name.substring(0, 2).toUpperCase() : 'U'}</span>
            
            {/* Edit Badge Overlay */}
            <div className="absolute bottom-0 right-0 rounded-full border-4 border-bg-primary bg-bg-secondary p-1">
              <div className="h-3 w-3 rounded-full bg-accent-receive" />
            </div>
          </div>
          
          <h2 className="font-heading text-2xl font-bold text-white">
            {loadingUser ? 'Loading profile...' : user?.full_name || 'Unknown User'}
          </h2>
          <p className="mt-1 text-sm font-medium text-text-secondary">{user?.email || '--'}</p>
          {user?.phone_number && (
            <div className="mt-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-sm">
              <p className="font-mono text-xs text-text-tertiary">{user.phone_number}</p>
            </div>
          )}

          {pageMessage && (
            <p className="mt-4 text-center text-sm font-medium text-brand-primary">{pageMessage}</p>
          )}
        </div>

        {/* Menu Section */}
        <div className="flex flex-col space-y-3">
          <MenuItem
            icon={UserIcon}
            label="Edit Profile"
            action={handleOpenEditProfile}
          />
          <MenuItem
            icon={Lock}
            label="Change Password"
            action={handleOpenPassword}
          />
          <MenuItem
            icon={Moon}
            label="Dark Mode / Light Mode"
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
            action={handleOpenAbout}
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
      <BottomNav activeTab="profile" />

      {isEditOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 px-4 pb-6 pt-20 backdrop-blur-sm">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-bg-secondary p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold text-white">Edit Profile</h3>
              <button
                onClick={() => setIsEditOpen(false)}
                className="rounded-full bg-white/5 p-2 text-text-secondary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={editFullName}
                onChange={(e) => setEditFullName(e.target.value)}
                placeholder="Full Name"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
              <input
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value)}
                placeholder="Email"
                type="email"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
              <input
                value={editPhone}
                onChange={(e) => setEditPhone(e.target.value)}
                placeholder="Phone"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </div>

            {editError && <p className="mt-3 text-sm font-medium text-accent-send">{editError}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsEditOpen(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-semibold text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={editLoading}
                className="flex-1 rounded-xl bg-brand-primary py-3 font-semibold text-white"
              >
                {editLoading ? 'Saving...' : 'Save'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isPasswordOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 px-4 pb-6 pt-20 backdrop-blur-sm">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-bg-secondary p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold text-white">Change Password</h3>
              <button
                onClick={() => setIsPasswordOpen(false)}
                className="rounded-full bg-white/5 p-2 text-text-secondary"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-3">
              <input
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Current Password"
                type="password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
              <input
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="New Password"
                type="password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
              <input
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm New Password"
                type="password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white outline-none"
              />
            </div>

            {passwordError && <p className="mt-3 text-sm font-medium text-accent-send">{passwordError}</p>}

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setIsPasswordOpen(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-semibold text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleChangePassword}
                disabled={passwordLoading}
                className="flex-1 rounded-xl bg-brand-primary py-3 font-semibold text-white"
              >
                {passwordLoading ? 'Updating...' : 'Update'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {isAboutOpen && (
        <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/50 px-4 pb-6 pt-20 backdrop-blur-sm">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="w-full max-w-md rounded-3xl border border-white/10 bg-bg-secondary p-6"
          >
            <div className="mb-5 flex items-center justify-between">
              <h3 className="font-heading text-xl font-bold text-white">About AdiPay</h3>
              <button
                onClick={() => setIsAboutOpen(false)}
                className="rounded-full bg-white/5 p-2 text-text-secondary"
              >
                <X size={18} />
              </button>
            </div>

            <p className="text-sm leading-relaxed text-text-secondary">
              AdiPay is an online payment system, developed as a part of mini project for DBMS project by Aditya Jamge and Parth Kondhawale.
            </p>

            <button
              onClick={() => setIsAboutOpen(false)}
              className="mt-6 w-full rounded-xl bg-brand-primary py-3 font-semibold text-white"
            >
              Close
            </button>
          </motion.div>
        </div>
      )}
    </div>
  );
}
