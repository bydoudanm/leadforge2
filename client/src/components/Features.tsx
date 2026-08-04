import { motion } from 'framer-motion';
import { Search, TrendingUp, Mail, Zap, Target, BarChart3, Bell, Repeat2, MessageSquare, Layers, Sparkles, Gauge } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'AI Lead Discovery',
    description: 'Find high-intent businesses ready to become your next paying clients.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    title: 'No Website Detection',
    description: 'Identify businesses losing customers online—your ideal sales targets.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Weak SEO Detection',
    description: 'Discover businesses actively losing revenue to poor online visibility.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Mail,
    title: 'AI Outreach Generation',
    description: 'Generate personalized emails that get responses and turn prospects into clients.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Email Automation',
    description: 'Automatically reach out and convert leads into paying customers at scale.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Repeat2,
    title: 'Multi-Inbox Sending',
    description: 'Scale your client acquisition engine across multiple accounts safely.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Target,
    title: 'Smart Lead Scoring',
    description: 'Focus on the highest-probability leads to close more deals faster.',
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: Bell,
    title: 'Live Monitoring',
    description: 'Real-time alerts on prospect engagement to strike while interest is hot.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: MessageSquare,
    title: 'Auto Follow-up',
    description: 'Intelligent follow-up sequences that turn interested prospects into paying clients.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Sparkles,
    title: 'AI Reply Assistant',
    description: 'Respond to prospects instantly and close deals faster with AI suggestions.',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    icon: Layers,
    title: 'Campaign Automation',
    description: 'Run complete client acquisition campaigns on autopilot from discovery to close.',
    color: 'from-lime-500 to-green-500',
  },
  {
    icon: Gauge,
    title: 'Performance Analytics',
    description: 'Track revenue, ROI, and client acquisition cost for every campaign.',
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
