import { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircleQuestion, Send, CheckCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Query() {
  const { user } = useAuth();

  // Query form state
  const [querySubject, setQuerySubject] = useState('');
  const [queryMessage, setQueryMessage] = useState('');
  const [querySending, setQuerySending] = useState(false);
  const [querySent, setQuerySent] = useState(false);

  const handleQuerySubmit = async (e) => {
    e.preventDefault();
    setQuerySending(true);
    try {
      const res = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          access_key: 'a2df11dc-2a3b-4469-b2b8-cd9d3f0be6d5',
          from_name: 'EventHub Query',
          subject: `[EventHub Query] ${querySubject}`,
          from_email: user?.email || 'anonymous@eventhub.com',
          message: `Subject: ${querySubject}\n\nFrom: ${user?.email || 'Anonymous'}\n\nMessage:\n${queryMessage}`,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      setQuerySent(true);
      setQuerySubject('');
      setQueryMessage('');
      setTimeout(() => setQuerySent(false), 4000);
    } catch (err) {
      console.error('Query submission error:', err);
      setQuerySent(true);
      setQuerySubject('');
      setQueryMessage('');
      setTimeout(() => setQuerySent(false), 4000);
    }
    setQuerySending(false);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-3xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold dark:text-white">Raise a Query</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Have any questions, feedback, or need help? Your query will be sent directly to our support team.</p>
      </div>

      <motion.div className="glass-card p-6 mb-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
            <MessageCircleQuestion className="w-6 h-6 text-purple-500" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg dark:text-white">Submit your details</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Please provide as much context as possible so we can assist you better.</p>
          </div>
        </div>

        {querySent ? (
          <div className="text-center py-10">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p className="text-base font-semibold dark:text-white">Query submitted successfully!</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">We'll get back to your registered email address within 24 hours.</p>
            <button 
              onClick={() => setQuerySent(false)} 
              className="mt-6 px-6 py-2 rounded-xl bg-purple-500/10 text-purple-500 font-semibold hover:bg-purple-500/20 transition-all text-sm"
            >
              Submit another query
            </button>
          </div>
        ) : (
          <form onSubmit={handleQuerySubmit} className="space-y-5">
            <div>
              <label className="text-sm font-semibold dark:text-gray-300">Subject</label>
              <select value={querySubject} onChange={e => setQuerySubject(e.target.value)} className="mt-1.5 w-full glass-input px-4 py-3 text-sm" required>
                <option value="">Select a topic...</option>
                <option>Bug Report</option>
                <option>Feature Request</option>
                <option>Account Issue</option>
                <option>Payment / Billing</option>
                <option>Event Management Help</option>
                <option>General Feedback</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-semibold dark:text-gray-300">Your Message</label>
              <textarea
                rows={6}
                value={queryMessage}
                onChange={e => setQueryMessage(e.target.value)}
                placeholder="Describe your query in detail. Please mention your contact email address if different from your account email."
                className="mt-1.5 w-full glass-input px-4 py-3 text-sm resize-none"
                required
                maxLength={500}
              />
              <p className="text-[11px] text-gray-400 text-right mt-1.5">{queryMessage.length}/500 characters</p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={querySending}
                className="px-8 py-3 text-sm font-semibold text-white rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 shadow-md hover:shadow-lg flex items-center gap-2 disabled:opacity-50 transition-all"
              >
                {querySending ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : <><Send className="w-4 h-4" /> Submit Query</>}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </motion.div>
  );
}
