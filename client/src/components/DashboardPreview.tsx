import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const dashboardTabs = [
  {
    name: 'Dashboard',
    description: 'Real-time overview of your client acquisition performance and revenue',
  },
  {
    name: 'Leads',
    description: 'Track high-intent prospects and move them through your sales pipeline',
  },
  {
    name: 'Campaigns',
    description: 'Launch automated client acquisition campaigns that close deals',
  },
  {
    name: 'Analytics',
    description: 'Track revenue, ROI, and client acquisition cost for every campaign',
  },
];

export default function DashboardPreview() {
  return (
    <section className="py-20 px-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-950/20 via-slate-950 to-slate-950 -z-10"></div>

      <div className="container max-w-6xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Your Client Acquisition
            <br />
            <span className="text-gradient">Command Center</span>
          </h2>
          <p className="text-xl text-slate-400 max-w-2xl mx-auto">
            Manage leads, campaigns, and revenue in one powerful interface. Turn prospects into paying clients.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.8 }}
          viewport={{ once: true }}
          className="bg-slate-900/50 backdrop-blur-sm border border-slate-700/50 rounded-2xl overflow-hidden glow-blue-lg"
        >
          <Tabs defaultValue="Dashboard" className="w-full">
            <TabsList className="w-full justify-start bg-slate-800/50 border-b border-slate-700/50 rounded-none p-0 h-auto">
              {dashboardTabs.map((tab) => (
                <TabsTrigger
                  key={tab.name}
                  value={tab.name}
                  className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-500 data-[state=active]:bg-transparent px-6 py-4 text-sm font-medium"
                >
                  {tab.name}
                </TabsTrigger>
              ))}
            </TabsList>

            {dashboardTabs.map((tab) => (
              <TabsContent key={tab.name} value={tab.name} className="p-0">
                <div className="relative w-full h-96 md:h-[500px] overflow-hidden">
                  {/* Dashboard preview image */}
                  <img
                    src="https://d2xsxph8kpxj0f.cloudfront.net/310519663650809757/eFaTuxdwpBPRDRMwcG8ZPj/leadforge-dashboard-preview-QxjtqM3M2VBHVgZVVNmxuK.webp"
                    alt="LeadForge Dashboard"
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent"></div>

                  {/* Description overlay */}
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-semibold mb-2">{tab.name}</h3>
                    <p className="text-slate-300">{tab.description}</p>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </motion.div>
      </div>
    </section>
  );
}
