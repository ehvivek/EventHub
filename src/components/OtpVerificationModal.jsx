import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Shield, CheckCircle, X, Loader2, RefreshCw } from 'lucide-react';
import { sendOtpEmail } from '../lib/emailService';

const OTP_LENGTH = 6;
const COOLDOWN_SECONDS = 60;

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function OtpVerificationModal({ isOpen, onClose, email, onVerified }) {
  const [step, setStep] = useState('send'); // 'send' | 'verify' | 'success'
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef([]);

  // Countdown timer
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => setTimer(t => t - 1), 1000);
    return () => clearInterval(interval);
  }, [timer]);

  // Auto-focus first input when entering verify step
  useEffect(() => {
    if (step === 'verify' && inputRefs.current[0]) {
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setStep('send');
      setOtp(Array(OTP_LENGTH).fill(''));
      setError('');
      setLoading(false);
      setTimer(0);
      setAttempts(0);
    }
  }, [isOpen]);

  const handleSendOtp = async () => {
    if (!email) {
      setError('Please provide a valid email address first.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    const code = generateOtp();
    setGeneratedOtp(code);
    
    console.log(`%c[OTP] Verification code for ${email}: ${code}`, 'color: #a855f7; font-weight: bold; font-size: 14px;');
    
    const result = await sendOtpEmail(email, code);
    
    if (!result.success) {
      setError('Failed to send email. Please try again.');
      setLoading(false);
      return;
    }
    
    setTimer(COOLDOWN_SECONDS);
    setStep('verify');
    setLoading(false);
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    setOtp(Array(OTP_LENGTH).fill(''));
    await handleSendOtp();
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d?$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError('');

    // Auto-advance to next input
    if (value && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits are entered
    if (value && index === OTP_LENGTH - 1 && newOtp.every(d => d !== '')) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (pasteData.length === OTP_LENGTH) {
      const newOtp = pasteData.split('');
      setOtp(newOtp);
      inputRefs.current[OTP_LENGTH - 1]?.focus();
      verifyOtp(pasteData);
    }
  };

  const verifyOtp = async (code) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    if (code === generatedOtp) {
      setStep('success');
      setLoading(false);
      setTimeout(() => {
        onVerified(email);
        onClose();
      }, 1500);
    } else {
      setAttempts(a => a + 1);
      setError(attempts >= 2 ? 'Too many failed attempts. Please resend OTP.' : 'Invalid verification code. Please try again.');
      setOtp(Array(OTP_LENGTH).fill(''));
      setLoading(false);
      inputRefs.current[0]?.focus();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="relative w-full max-w-md rounded-2xl border border-white/10 bg-white/10 dark:bg-gray-900/80 backdrop-blur-2xl shadow-2xl shadow-purple-500/10 overflow-hidden"
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Glow effects */}
              <div className="absolute -top-20 -left-20 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-48 h-48 bg-pink-500/15 rounded-full blur-3xl" />

              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-white/10 transition-colors z-10"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>

              <div className="relative p-8">
                {/* STEP: Send OTP */}
                <AnimatePresence mode="wait">
                  {step === 'send' && (
                    <motion.div
                      key="send"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 flex items-center justify-center">
                        <Mail className="w-7 h-7 text-purple-400" />
                      </div>
                      <h3 className="font-display text-xl font-bold dark:text-white mb-2">Verify Contact Email</h3>
                      <p className="text-sm text-gray-400 mb-6">
                        We'll send a 6-digit verification code to
                      </p>
                      <div className="p-3 rounded-xl bg-white/5 border border-white/10 mb-6">
                        <p className="text-lg font-mono font-semibold text-purple-300">{email}</p>
                      </div>

                      {error && (
                        <p className="text-xs text-red-400 mb-4">{error}</p>
                      )}

                      <button
                        onClick={handleSendOtp}
                        disabled={loading}
                        className="w-full py-3.5 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 hover:-translate-y-0.5 flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
                      >
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending Email...</> : <><Shield className="w-4 h-4" /> Send Verification Code</>}
                      </button>
                    </motion.div>
                  )}

                  {/* STEP: Enter OTP */}
                  {step === 'verify' && (
                    <motion.div
                      key="verify"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      className="text-center"
                    >
                      <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30 flex items-center justify-center">
                        <Shield className="w-7 h-7 text-blue-400" />
                      </div>
                      <h3 className="font-display text-xl font-bold dark:text-white mb-2">Enter Verification Code</h3>
                      <p className="text-sm text-gray-400 mb-6">
                        Enter the 6-digit code sent via email to <span className="text-purple-300 font-medium">{email}</span>
                      </p>

                      {/* OTP Input Boxes */}
                      <div className="flex justify-center gap-2.5 mb-5" onPaste={handlePaste}>
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={el => inputRefs.current[i] = el}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={e => handleOtpChange(i, e.target.value)}
                            onKeyDown={e => handleKeyDown(i, e)}
                            className={`w-11 h-13 text-center text-xl font-bold rounded-xl border-2 transition-all duration-200 bg-white/5 backdrop-blur-sm focus:outline-none
                              ${digit ? 'border-purple-500/60 text-white' : 'border-white/10 text-gray-300'}
                              ${error ? 'border-red-400/60 animate-shake' : ''}
                              focus:border-purple-400 focus:shadow-lg focus:shadow-purple-500/20`}
                          />
                        ))}
                      </div>

                      {/* Error message */}
                      {error && (
                        <motion.p
                          initial={{ opacity: 0, y: -5 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="text-xs text-red-400 mb-4"
                        >
                          {error}
                        </motion.p>
                      )}

                      {/* Verify button */}
                      <button
                        onClick={() => verifyOtp(otp.join(''))}
                        disabled={loading || otp.some(d => !d)}
                        className="w-full py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-lg shadow-purple-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50 mb-4"
                      >
                        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Verifying...</> : 'Verify Code'}
                      </button>

                      {/* Resend */}
                      <div className="flex items-center justify-center gap-2 text-xs">
                        {timer > 0 ? (
                          <span className="text-gray-500">
                            Resend code in <span className="text-purple-400 font-semibold">{timer}s</span>
                          </span>
                        ) : (
                          <button
                            onClick={handleResendOtp}
                            disabled={loading}
                            className="flex items-center gap-1.5 text-purple-400 hover:text-purple-300 transition-colors font-medium"
                          >
                            <RefreshCw className="w-3.5 h-3.5" /> Resend Code
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* STEP: Success */}
                  {step === 'success' && (
                    <motion.div
                      key="success"
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-4"
                    >
                      <motion.div
                        className="w-20 h-20 mx-auto mb-5 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/40 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: 'spring', damping: 15, stiffness: 200, delay: 0.1 }}
                      >
                        <CheckCircle className="w-10 h-10 text-green-400" />
                      </motion.div>
                      <h3 className="font-display text-xl font-bold text-green-400 mb-2">Email Verified!</h3>
                      <p className="text-sm text-gray-400">
                        Your contact email has been verified successfully.
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
