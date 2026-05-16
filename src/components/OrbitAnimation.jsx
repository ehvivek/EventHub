import { motion } from 'framer-motion';
import logoImg from '../assets/logos/eventhub_logo.png';
import orbitRings from '../assets/effects/orbit_rings.png';
import calendarIcon from '../assets/icons/calendar-days-svgrepo-com.svg';
import mailIcon from '../assets/icons/mail-alt-svgrepo-com.svg';
import usersIcon from '../assets/icons/users-svgrepo-com.svg';
import mapPinIcon from '../assets/icons/mappin-pin-map-svgrepo-com.svg';
import musicIcon from '../assets/icons/music-svgrepo-com.svg';

export default function OrbitAnimation() {
  return (
    <div className="relative w-full flex items-center justify-center">
      {/*
        Large container — orbit sits in the center ~60% of this,
        cards sit in the outer 20% margins on each side.
        This guarantees cards never overlap the orbit.
      */}
      <div
        className="relative mx-auto"
        style={{ width: 'min(100%, 680px)', aspectRatio: '1' }}
      >
        {/* === ORBIT RINGS — centered, taking ~70% of container === */}
        <div className="absolute inset-[15%] flex items-center justify-center">
          <motion.img
            src={orbitRings}
            alt=""
            className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            animate={{ rotate: 360 }}
            transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
          />
          <motion.img
            src={orbitRings}
            alt=""
            className="absolute inset-[14%] w-[72%] h-[72%] object-contain opacity-40 pointer-events-none"
            animate={{ rotate: -360 }}
            transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
          />

          {/* Center logo — large */}
          <motion.div
            className="relative z-10"
            animate={{ scale: [1, 1.03, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          >
            <img
              src={logoImg}
              alt="EventHub Logo"
              className="w-32 h-32 sm:w-40 sm:h-40 md:w-48 md:h-48 lg:w-56 lg:h-56 object-contain drop-shadow-2xl"
            />
            {/* Shine sweep */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              style={{
                maskImage: 'radial-gradient(ellipse 80% 80% at center, black 40%, transparent 70%)',
                WebkitMaskImage: 'radial-gradient(ellipse 80% 80% at center, black 40%, transparent 70%)',
              }}
            >
              <div
                className="absolute top-0 h-full animate-shine"
                style={{
                  width: '35%',
                  background: 'linear-gradient(105deg, transparent 20%, rgba(255,255,255,0.08) 35%, rgba(255,255,255,0.35) 48%, rgba(255,255,255,0.08) 62%, transparent 80%)',
                  left: '-50%',
                }}
              />
            </div>
          </motion.div>
        </div>

        {/* === FLOATING CARDS — positioned in the OUTER margin zone === */}
        {/* Cards use % positions relative to the large container.
            Orbit is inset 15% on each side, so anything at 0-12% or 88-100% is OUTSIDE the orbit. */}

        {/* 📅 Event Calendar — top-left */}
        <motion.div
          className="absolute top-[2%] left-[0%] hidden md:block z-20"
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <FeatureCard icon={calendarIcon} title="Event Calendar" desc="Manage your events in one place" />
        </motion.div>

        {/* ✉️ Custom Invites — left middle */}
        <motion.div
          className="absolute top-[45%] left-[0%] hidden md:block z-20"
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <FeatureCard icon={mailIcon} title="Custom Invites" desc="Create beautiful invites in seconds" />
        </motion.div>

        {/* 🎵 Music Fest — top-right */}
        <motion.div
          className="absolute top-[0%] right-[5%] hidden md:block z-20"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4, duration: 0.5 }}
          animate={{ y: [0, -4, 0] }}
        >
          <MiniCard icon={musicIcon} title="Music Fest" />
        </motion.div>

        {/* 👥 RSVP Tracking — right upper */}
        <motion.div
          className="absolute top-[25%] right-[0%] hidden md:block z-20"
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <FeatureCard icon={usersIcon} title="RSVP Tracking" desc="Track guests and responses easily" />
        </motion.div>

        {/* 📍 Guest Management — bottom-right */}
        <motion.div
          className="absolute bottom-[8%] right-[2%] hidden md:block z-20"
          initial={{ opacity: 0, scale: 0.85 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8, duration: 0.5 }}
          whileHover={{ scale: 1.05 }}
        >
          <FeatureCard icon={mapPinIcon} title="Guest Management" desc="Know who's coming and stay organized" />
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="glass-card p-2.5 px-3.5 flex items-center gap-2.5 shadow-lg whitespace-nowrap">
      <img src={icon} alt="" className="w-5 h-5 lg:w-6 lg:h-6 flex-shrink-0 dark:invert" />
      <div>
        <p className="text-[10px] lg:text-xs font-bold dark:text-white">{title}</p>
        <p className="text-[8px] lg:text-[10px] text-gray-500 dark:text-gray-400">{desc}</p>
      </div>
    </div>
  );
}

function MiniCard({ icon, title, date }) {
  return (
    <div className="glass-card p-2 px-3 flex items-center gap-2 shadow-md whitespace-nowrap">
      <img src={icon} alt="" className="w-4 h-4 flex-shrink-0 dark:invert" />
      <div>
        <p className="text-[10px] font-bold dark:text-white">{title}</p>
        {date && <p className="text-[8px] text-gray-500 dark:text-gray-400">{date}</p>}
      </div>
    </div>
  );
}
