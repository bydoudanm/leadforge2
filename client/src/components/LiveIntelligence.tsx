import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Users, Zap } from 'lucide-react';

const stats = [
  {
    icon: Users,
    label: 'Businesses Discovered',
    value: '2.3M+',
    change: '+18.2%',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: TrendingUp,
    label: 'Opportunities Found',
    value: '1.8M+',
    change: '+24.5%',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: BarChart3,
    label: 'Conversion Rate',
    value: '12.3%',
    change: '+5.2%',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Zap,
    label: 'Emails Sent',
    value: '5.2M+',
    change: '+31.8%',
    color: 'from-orange-500 to-red-500',
  },
];

export default function LiveIntelligence() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/10 to-slate-950 -z-10"></div>

      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-500/10 border border-green-500/30 mb-6">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-green-400">Live Intelligence</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Real-Time Lead
            <br />
            <span className="text-gradient">Intelligence</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            See live data from our AI discovering opportunities across the globe
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1, duration: 0.6 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all"
              >
                <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${stat.color} p-2.5 mb-4 flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>

                <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.3, duration: 0.8 }}
                  viewport={{ once: true }}
                  className="mb-3"
                >
                  <div className="text-3xl font-bold text-white">{stat.value}</div>
                </motion.div>

                <div className="flex items-center gap-1 text-green-400 text-sm font-medium">
                  <TrendingUp className="w-4 h-4" />
                  <span>{stat.change} this month</span>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
