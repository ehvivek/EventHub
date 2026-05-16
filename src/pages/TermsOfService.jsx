import { motion } from 'framer-motion';
import { LandingNavbar } from '../components/Navbar';
import FloatingParticles from '../components/FloatingParticles';

import bgLight from '../assets/backgrounds/bg_light.png';
import bgDark from '../assets/backgrounds/bg_dark.png';
import { useTheme } from '../context/ThemeContext';
import { Sparkles, Shield, FileText, User, Upload, AlertTriangle, Globe, Server, Scale, Palette, UserX, RefreshCw, Mail } from 'lucide-react';

const sections = [
  {
    icon: FileText,
    number: '01',
    title: 'Acceptance of Terms',
    gradient: 'from-purple-500 to-indigo-500',
    content: 'By accessing or using EventHub, you agree to comply with these Terms of Service. If you do not agree with any part of these terms, please do not use the platform.',
  },
  {
    icon: Shield,
    number: '02',
    title: 'Use of the Platform',
    gradient: 'from-blue-500 to-cyan-500',
    content: 'EventHub provides tools for creating, discovering, managing, and organizing events. Users may use the platform only for lawful and appropriate purposes.',
  },
  {
    icon: User,
    number: '03',
    title: 'User Accounts',
    gradient: 'from-pink-500 to-rose-500',
    content: 'Users are responsible for maintaining the security of their accounts and credentials. Any activity performed through your account remains your responsibility.',
  },
  {
    icon: Upload,
    number: '04',
    title: 'User Content',
    gradient: 'from-violet-500 to-purple-500',
    content: 'Users retain ownership of the content they upload, including event details, images, descriptions, and external links. By uploading content, you grant EventHub permission to display and process it solely for platform functionality.',
  },
  {
    icon: AlertTriangle,
    number: '05',
    title: 'Acceptable Use',
    gradient: 'from-amber-500 to-orange-500',
    content: null,
    listIntro: 'Users may not:',
    list: [
      'Upload harmful or illegal content',
      'Attempt unauthorized access',
      'Abuse platform systems',
      'Spread spam or malicious links',
      'Disrupt platform performance',
    ],
    listOutro: 'Violation of these rules may result in account suspension or removal.',
  },
  {
    icon: Globe,
    number: '06',
    title: 'Third-Party Services',
    gradient: 'from-teal-500 to-emerald-500',
    content: 'EventHub may integrate with third-party services including authentication providers, analytics tools, or external event links. EventHub is not responsible for third-party content, security, or policies.',
  },
  {
    icon: Server,
    number: '07',
    title: 'Service Availability',
    gradient: 'from-blue-500 to-indigo-500',
    content: 'We may update, modify, or temporarily suspend platform features at any time to improve performance, security, or user experience.',
  },
  {
    icon: Scale,
    number: '08',
    title: 'Limitation of Liability',
    gradient: 'from-rose-500 to-pink-500',
    content: 'EventHub is provided "as is" without warranties of any kind. We are not responsible for losses, damages, interruptions, or issues resulting from platform usage or third-party services.',
  },
  {
    icon: Palette,
    number: '09',
    title: 'Intellectual Property',
    gradient: 'from-purple-500 to-fuchsia-500',
    content: 'All EventHub branding, platform designs, UI elements, graphics, and original content remain the intellectual property of EventHub and may not be copied or redistributed without permission.',
  },
  {
    icon: UserX,
    number: '10',
    title: 'Account Termination',
    gradient: 'from-red-500 to-rose-500',
    content: 'We reserve the right to suspend or terminate accounts that violate these Terms or misuse the platform in harmful ways.',
  },
  {
    icon: RefreshCw,
    number: '11',
    title: 'Changes to Terms',
    gradient: 'from-cyan-500 to-blue-500',
    content: 'These Terms may be updated periodically. Continued use of EventHub after updates indicates acceptance of the revised Terms.',
  },
  {
    icon: Mail,
    number: '12',
    title: 'Contact Information',
    gradient: 'from-indigo-500 to-purple-500',
    content: 'If you have questions regarding these Terms of Service, contact us at:',
    email: 'ev3nthub@gmail.com',
  },
];

export default function TermsOfService() {
  const { isDark } = useTheme();

  return (
    <motion.div
      className="min-h-screen relative"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="fixed inset-0 z-0">
        <img src={isDark ? bgDark : bgLight} alt="" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-white/30 dark:bg-black/40" />
      </div>

      <FloatingParticles />

      <div className="relative z-10">
        <LandingNavbar />

        <section className="w-full px-4 sm:px-8 lg:px-16 xl:px-24 py-16 sm:py-24">
          {/* Header */}
          <motion.div
            className="text-center max-w-3xl mx-auto mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold tracking-[0.2em] uppercase text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/30 rounded-full mb-5">
              <Sparkles className="w-3.5 h-3.5" />
              Discover EventHub
              <span className="mx-1.5 text-purple-300 dark:text-purple-600">/</span>
              Terms of Service
            </span>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold dark:text-white leading-tight">
              Terms of{' '}
              <span className="gradient-text">Service</span>
            </h2>
            <p className="mt-6 text-sm sm:text-base text-gray-600 dark:text-gray-400 leading-relaxed">
              Please read these terms carefully before using EventHub.
            </p>
          </motion.div>

          {/* Terms Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
            {sections.map((section, i) => {
              const Icon = section.icon;
              return (
                <motion.div
                  key={section.title}
                  className="group relative glass-card p-7 sm:p-8 glass-card-hover overflow-hidden"
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.06 }}
                >
                  {/* Glow blob */}
                  <div className={`absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br ${section.gradient} opacity-10 blur-2xl group-hover:opacity-20 transition-opacity duration-500`} />

                  {/* Header */}
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`relative w-11 h-11 rounded-xl bg-gradient-to-br ${section.gradient} flex items-center justify-center shadow-lg flex-shrink-0`}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-purple-400 dark:text-purple-500 tracking-widest uppercase">{section.number}</span>
                      <h3 className="font-display text-lg font-bold dark:text-white leading-snug">{section.title}</h3>
                    </div>
                  </div>

                  {/* Content */}
                  {section.content && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      {section.content}
                    </p>
                  )}

                  {/* List content for Acceptable Use */}
                  {section.listIntro && (
                    <div className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                      <p className="mb-2">{section.listIntro}</p>
                      <ul className="space-y-1.5 ml-1">
                        {section.list.map((item) => (
                          <li key={item} className="flex items-start gap-2">
                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 dark:bg-purple-500 flex-shrink-0" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      {section.listOutro && (
                        <p className="mt-3 text-gray-500 dark:text-gray-500 text-xs font-medium">{section.listOutro}</p>
                      )}
                    </div>
                  )}

                  {/* Email for Contact */}
                  {section.email && (
                    <a
                      href={`mailto:${section.email}`}
                      className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full bg-purple-100/80 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 text-sm font-semibold hover:bg-purple-200/80 dark:hover:bg-purple-900/50 transition-colors"
                    >
                      <Mail className="w-3.5 h-3.5" />
                      {section.email}
                    </a>
                  )}
                </motion.div>
              );
            })}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
