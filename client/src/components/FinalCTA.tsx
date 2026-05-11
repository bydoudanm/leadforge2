import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FinalCTA() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-950 via-blue-950/30 to-slate-950 -z-10"></div>

      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-10 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl"
        ></motion.div>
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 10, repeat: Infinity }}
          className="absolute bottom-10 right-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl"
        ></motion.div>
      </div>

      <div className="container max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-5xl md:text-6xl font-bold mb-6 leading-tight"
            style={{ fontFamily: 'Space Grotesk, sans-serif' }}
          >
            Your next client is
            <br />
            <span className="text-gradient">already searching for help</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
            viewport={{ once: true }}
            className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto"
          >
            Stop guessing who needs your services. LeadForge finds them for you, automatically generates outreach, and helps you close deals faster.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.8 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Button
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg font-semibold rounded-lg"
            >
              Start Finding Leads
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-6 text-lg font-semibold rounded-lg border-slate-600 text-slate-200 hover:bg-slate-900/50"
            >
              Schedule Demo
            </Button>
          </motion.div>

          {/* Trust indicators */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            viewport={{ once: true }}
            className="mt-12 pt-8 border-t border-slate-700/50"
          >
            <p className="text-slate-400 text-sm mb-4">Trusted by thousands of professionals</p>
            <div className="flex flex-wrap justify-center gap-8 items-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-white">50K+</div>
                <div className="text-sm text-slate-400">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">2M+</div>
                <div className="text-sm text-slate-400">Leads Discovered</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-white">$500M+</div>
                <div className="text-sm text-slate-400">Revenue Generated</div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
