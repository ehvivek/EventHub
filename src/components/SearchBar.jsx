import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, SlidersHorizontal } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function SearchBar({ placeholder = 'Search events, workshops, hackathons...' }) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/explore?search=${encodeURIComponent(query.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  return (
    <motion.form
      onSubmit={handleSearch}
      className="relative w-full max-w-2xl"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-12 pr-12 py-3.5 glass-input text-sm"
        id="search-bar"
      />
      <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 rounded-lg hover:bg-white/20 dark:hover:bg-white/10 transition-colors">
        <SlidersHorizontal className="w-4 h-4 text-gray-400" />
      </button>
    </motion.form>
  );
}
