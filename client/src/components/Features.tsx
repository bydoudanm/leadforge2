import { motion } from 'framer-motion';
import { Search, TrendingUp, Mail, Zap, Target, BarChart3, Bell, Repeat2, MessageSquare, Layers, Sparkles, Gauge } from 'lucide-react';

const features = [
  {
    icon: Search,
    title: 'AI Lead Discovery',
    description: 'Intelligent algorithms find high-potential leads matching your ideal customer profile.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    title: 'No Website Detection',
    description: 'Identify businesses without online presence—your perfect prospects.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    title: 'Weak SEO Detection',
    description: 'Find businesses struggling with search visibility and ready for your services.',
    color: 'from-orange-500 to-red-500',
  },
  {
    icon: Mail,
    title: 'AI Outreach Generation',
    description: 'Generate personalized, compelling outreach emails powered by advanced AI.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: 'Email Automation',
    description: 'Automate your entire outreach workflow with intelligent sequencing.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Repeat2,
    title: 'Multi-Inbox Sending',
    description: 'Send from multiple email accounts simultaneously for maximum reach.',
    color: 'from-indigo-500 to-blue-500',
  },
  {
    icon: Target,
    title: 'Smart Lead Scoring',
    description: 'AI-powered scoring helps you prioritize the most valuable leads.',
    color: 'from-rose-500 to-pink-500',
  },
  {
    icon: Bell,
    title: 'Live Monitoring',
    description: 'Real-time alerts keep you updated on lead activity and engagement.',
    color: 'from-cyan-500 to-blue-500',
  },
  {
    icon: MessageSquare,
    title: 'Auto Follow-up',
    description: 'Intelligent follow-up sequences that convert interested prospects.',
    color: 'from-violet-500 to-purple-500',
  },
  {
    icon: Sparkles,
    title: 'AI Reply Assistant',
    description: 'Get AI-suggested responses to prospect replies in real-time.',
    color: 'from-amber-500 to-yellow-500',
  },
  {
    icon: Layers,
    title: 'Campaign Automation',
    description: 'Build complex multi-step campaigns without manual intervention.',
    color: 'from-lime-500 to-green-500',
  },
  {
    icon: Gauge,
    title: 'Landing Page Generator',
    description: 'Create high-converting landing pages with AI-optimized copy.',
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
            Powerful Features
            <br />
            <span className="text-gradient">Built for Growth</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Everything you need to find, reach, and convert your ideal clients at scale.
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
