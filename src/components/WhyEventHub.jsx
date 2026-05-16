import { motion } from 'framer-motion';
import { Sparkles, Users, CalendarCheck, Building2, LayoutDashboard, ShieldCheck } from 'lucide-react';

const features = [
  { icon: Sparkles,       title: 'Beautiful event pages',        desc: 'Impress your guests',                  color: 'text-amber-500'   },
  { icon: CalendarCheck,  title: 'Smart RSVP tracking',          desc: 'Know exactly who is coming',           color: 'text-blue-500'    },
  { icon: Building2,      title: 'Third party events organizer', desc: 'Collaborate with external organizers', color: 'text-purple-500'  },
  { icon: Users,          title: 'Impress your guests',          desc: 'Deliver memorable event experiences',  color: 'text-pink-500'    },
  { icon: LayoutDashboard,title: 'Stay organized effortlessly',  desc: 'All your events in one place',         color: 'text-cyan-500'    },
  { icon: ShieldCheck,    title: 'Secure & reliable',            desc: 'Your data is safe with us',            color: 'text-emerald-500' },
];

export default function WhyEventHub() {
  return (
    <div className="glass-card p-6 sm:p-8">
      <h3 className="font-display font-bold text-lg dark:text-white mb-6">
        Why EventHub?
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {features.map((feat, i) => {
          const Icon = feat.icon;
          return (
            <motion.div
              key={feat.title}
              className="flex flex-col items-center text-center gap-2 p-3 rounded-2xl hover:bg-white/40 dark:hover:bg-white/5 transition-all duration-300"
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
            >
              <div className="w-11 h-11 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                <Icon className={`w-5 h-5 ${feat.color}`} />
              </div>
              <div>
                <p className="text-xs font-semibold dark:text-white leading-tight">{feat.title}</p>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-0.5 leading-tight">{feat.desc}</p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
