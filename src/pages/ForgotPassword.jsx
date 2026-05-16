import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useTheme } from '../context/ThemeContext';
import FloatingParticles from '../components/FloatingParticles';
import logo from '../assets/logos/eventhub_logo.png';
import bgLight from '../assets/backgrounds/bg_light.png';
import bgDark from '../assets/backgrounds/bg_dark.png';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { isDark } = useTheme();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/login',
    });
    if (err) setError(err.message);
    else setSent(true);
    setLoading(false);
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

        {sent ? (
          <div className="text-center py-4">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <h2 className="font-display text-xl font-bold dark:text-white mb-2">Check your email</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              We sent a password reset link to<br />
              <span className="font-medium text-purple-500">{email}</span>
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-sm text-purple-500 hover:text-purple-600 font-medium"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <h2 className="font-display text-xl font-bold text-center dark:text-white mb-1">Forgot password?</h2>
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mb-6">
              Enter your email and we'll send you a reset link
            </p>

            {error && <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mb-4">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full glass-input pl-11 pr-4 py-3 text-sm"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 shadow-lg transition-all disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Reset Link'}
              </button>
            </form>

            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
              <Link to="/login" className="text-purple-500 font-medium hover:text-purple-600 inline-flex items-center gap-1">
                <ArrowLeft className="w-3 h-3" />
                Back to login
              </Link>
            </p>
          </>
        )}
      </motion.div>
    </div>
  );
}
