import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, User } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import FloatingParticles from '../components/FloatingParticles';
import logo from '../assets/logos/eventhub_logo.png';
import bgLight from '../assets/backgrounds/bg_light.png';
import bgDark from '../assets/backgrounds/bg_dark.png';

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from ? location.state.from.pathname + (location.state.from.search || '') : '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const { data, error: err } = await signUp(email, password, name);
    
    if (err) {
      if (err.message.includes('User already registered') || err.message.includes('already exists')) {
        setError('This email is already registered. If you joined using Google before, please click "Continue with Google".');
      } else {
        setError(err.message);
      }
    } else if (data?.user?.identities && data.user.identities.length === 0) {
      setError('This email is already registered. If you joined using Google before, please click "Continue with Google" below to log in.');
    } else {
      setSuccessMsg('Account created! Please check your email to confirm your account before signing in.');
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    await signInWithGoogle();
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4">
      <div className="fixed inset-0 z-0">
        <img src={isDark ? bgDark : bgLight} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/20 dark:bg-black/40" />
      </div>
      <FloatingParticles />

      <motion.div
        className="w-full max-w-md glass-card p-8 relative z-10"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        <div className="flex items-center gap-2 mb-6 justify-center">
          <img src={logo} alt="EventHub" className="w-10 h-10 object-contain" />
          <span className="font-display text-2xl font-bold">
            <span className="text-purple-600 dark:text-purple-400">Event</span>
            <span className="dark:text-white">Hub</span>
          </span>
        </div>

        <h2 className="font-display text-xl font-bold text-center dark:text-white mb-1">Create your account</h2>
        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">Join thousands of event organizers</p>

        {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mb-4">{error}</p>}
        {successMsg && <p className="text-sm text-green-600 bg-green-50 dark:bg-green-900/20 p-3 rounded-xl mb-4">{successMsg}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Full name" value={name} onChange={e => setName(e.target.value)} className="w-full glass-input pl-11 pr-4 py-3 text-sm" required />
          </div>
          <div className="relative">
            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} className="w-full glass-input pl-11 pr-4 py-3 text-sm" required />
          </div>
          <div className="relative">
            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type={showPw ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} className="w-full glass-input pl-11 pr-11 py-3 text-sm" required />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-4 top-1/2 -translate-y-1/2">
              {showPw ? <EyeOff className="w-4 h-4 text-gray-400" /> : <Eye className="w-4 h-4 text-gray-400" />}
            </button>
          </div>
          <button type="submit" disabled={loading} className="w-full py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <div className="my-5 flex items-center gap-3">
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          <span className="text-xs text-gray-400">or</span>
          <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
        </div>

        <button onClick={handleGoogle} className="w-full py-3 text-sm font-medium glass-card flex items-center justify-center gap-2 hover:bg-white/40 dark:hover:bg-white/10 transition-all">
          <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>

        <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-purple-500 font-medium hover:text-purple-600">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
