import { motion } from 'framer-motion';
import { Search, TrendingUp, Mail, Zap, Target, BarChart3, Bell, Repeat2, MessageSquare, Layers, Sparkles, Gauge } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'Find Clients Ready to Buy',
    description: 'Discover high-intent businesses actively losing customers. These are your next paying clients—ready to invest in your solution.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    title: 'Target Businesses That Need You',
    description: 'Identify businesses struggling online with no web presence. They\'re desperate for your help—and ready to pay.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Reach Businesses Losing Revenue',
    description: 'Find companies hemorrhaging leads due to poor SEO. They need your services urgently and will pay premium rates.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Mail,
    title: 'Generate Emails That Convert',
    description: 'AI writes personalized outreach that gets responses and turns prospects into paying customers. No more generic pitches.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Close Deals on Autopilot',
    description: 'Send personalized outreach automatically. Close more deals while you sleep. Scale your revenue without hiring.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Repeat2,
    title: 'Scale Without Getting Blocked',
    description: 'Send from multiple inboxes safely. Reach 10x more prospects without hitting spam filters. Multiply your revenue potential.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Target,
    title: 'Focus on Leads That Convert',
    description: 'AI ranks prospects by likelihood to buy. Stop wasting time on tire-kickers. Close more deals with less effort.',
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: Bell,
    title: 'Never Miss a Hot Lead',
    description: 'Get instant alerts when prospects engage. Strike while interest is hot. Close deals faster with real-time notifications.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: MessageSquare,
    title: 'Convert with Automated Follow-ups',
    description: 'Smart follow-up sequences that nurture leads into clients. Turn "maybe later" into signed contracts.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Sparkles,
    title: 'Reply Faster, Close More',
    description: 'AI suggests responses to prospect questions instantly. Never miss a reply. Convert more conversations into revenue.',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    icon: Layers,
    title: 'Run Full Campaigns on Autopilot',
    description: 'Build multi-step campaigns that find, nurture, and close clients automatically. Your revenue engine runs 24/7.',
    color: 'from-lime-500 to-green-500',
  },
  {
    icon: Gauge,
    title: 'Measure What Matters: Revenue',
    description: 'See exactly how much revenue each campaign generates. Track ROI and CAC. Optimize for profit, not vanity metrics.',
    color: 'from-fuchsia-500 to-purple-500',
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6 },
  },
};

export default function Features() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/10 to-slate-950 -z-10"></div>

      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Your AI Client
            <br />
            <span className="text-gradient">Acquisition Engine</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Everything you need to discover leads, reach them automatically, and turn them into paying clients.
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={index}
                variants={itemVariants}
                className="group relative"
              >
                <div className="absolute inset-0 bg-gradient-to-r opacity-0 group-hover:opacity-100 rounded-xl blur-xl transition-opacity duration-500"
                  style={{
                    backgroundImage: `linear-gradient(to right, var(--tw-gradient-stops))`,
                    '--tw-gradient-from': `hsl(${index * 30}, 100%, 50%)`,
                    '--tw-gradient-to': `hsl(${index * 30 + 60}, 100%, 50%)`,
                  } as any}
                ></div>
                
                <div className="relative bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all duration-300 h-full">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} p-2.5 mb-4 flex items-center justify-center`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
