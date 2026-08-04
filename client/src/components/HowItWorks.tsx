import { motion } from 'framer-motion';
import { Search, Zap, TrendingUp, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '01',
    title: 'Discover High-Intent Leads',
    description: 'Our AI finds businesses actively losing customers online. These are your next paying clients—ready to buy what you’re selling.',
    icon: Search,
    color: 'from-blue-500 to-cyan-500',
  },
  {
    number: '02',
    title: 'Reach Out Automatically',
    description: 'AI generates personalized emails and sends them automatically. Get responses and build momentum without lifting a finger.',
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
  },
  {
    number: '03',
    title: 'Close Clients & Get Paid',
    description: 'Turn conversations into real clients and paying customers. LeadForge automates follow-ups and helps you move from outreach to closed deals and revenue.',
    icon: TrendingUp,
    color: 'from-green-500 to-emerald-500',
  },
];

export default function HowItWorks() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 to-blue-950/20 -z-10"></div>

      <div className="container max-w-5xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            From Lead to Client
            <br />
            <span className="text-gradient">in 3 Steps</span>
          </h2>
          <p className="text-xl text-slate-400">
            Your complete client acquisition workflow, automated
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connection lines for desktop */}
          <div className="hidden md:block absolute top-32 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent"></div>

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.2, duration: 0.6 }}
                viewport={{ once: true }}
                className="relative"
              >
                {/* Step number circle */}
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10"
                >
                  <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg shadow-blue-500/20 border-4 border-background`}>
                    <span className="text-2xl font-bold text-white">{step.number}</span>
                  </div>
                </motion.div>

                {/* Card */}
                <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-8 pt-16 hover:border-blue-500/50 transition-colors h-full">
                  <div className="flex justify-center mb-4">
                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${step.color} p-2.5 flex items-center justify-center`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  <h3 className="text-2xl font-semibold text-white mb-3 text-center">{step.title}</h3>
                  <p className="text-slate-400 text-center leading-relaxed">{step.description}</p>
                </div>

                {/* Arrow for mobile */}
                {index < steps.length - 1 && (
                  <div className="md:hidden flex justify-center my-4">
                    <ArrowRight className="w-6 h-6 text-blue-400 rotate-90" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
