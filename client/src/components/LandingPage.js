import React from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  Code, 
  Zap, 
  Database, 
  GitBranch, 
  CheckCircle,
  ArrowRight,
  Star,
  Users,
  Globe
} from 'lucide-react';
import { GooeyText } from './ui/gooey-text-morphing';

const LandingPage = ({ onStartBuilding }) => {
  const features = [
    {
      icon: <Code className="w-8 h-8" />,
      title: "Smart Filtering",
      description: "Only shows compatible technologies based on your selections"
    },
    {
      icon: <Zap className="w-8 h-8" />,
      title: "Real-time Validation",
      description: "Instant feedback on technology combinations"
    },
    {
      icon: <Database className="w-8 h-8" />,
      title: "Comprehensive Database",
      description: "Covers Java, Python, and JavaScript ecosystems"
    },
    {
      icon: <GitBranch className="w-8 h-8" />,
      title: "Modern Stack",
      description: "Built with React, Node.js, and MongoDB"
    }
  ];

  const stats = [
    { icon: <Star className="w-6 h-6" />, value: "50+", label: "Technologies" },
    { icon: <Users className="w-6 h-6" />, value: "1000+", label: "Combinations" },
    { icon: <Globe className="w-6 h-6" />, value: "3", label: "Languages" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8"
          >
            {/* Icon and Text Container */}
            <div className="flex flex-col items-center justify-center mb-8">
              {/* Icon at the top */}
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              
              {/* GooeyText with better positioning */}
              <div className="relative h-32 sm:h-36 md:h-40 lg:h-44 flex items-center justify-center w-full">
                <GooeyText
                  texts={["Create", "smart", "test automation", "frameworks"]}
                  morphTime={2}
                  cooldownTime={0.5}
                  className="font-bold w-full"
                  textClassName="text-white drop-shadow-lg"
                />
              </div>
            </div>
            <p className="text-xl text-white/80 mb-8 max-w-3xl mx-auto">
              Build your perfect QA testing technology stack with smart filtering and real-time validation. 
              Choose compatible technologies and get instant feedback.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={onStartBuilding} className="btn-primary text-lg px-8 py-4">
                Start Building
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                View Examples
              </button>
            </div>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto mb-16"
          >
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mx-auto mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-white/70">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-white mb-6">Why Choose QA Tech Builder?</h2>
          <p className="text-xl text-white/80 max-w-3xl mx-auto">
            Our smart filtering system ensures you only see compatible technologies, 
            making it easy to build the perfect testing stack.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className="card hover-lift"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl mb-4">
                {feature.icon}
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-white/70">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <div className="card max-w-4xl mx-auto">
            <h2 className="text-4xl font-bold text-white mb-6">
              Ready to Build Your Perfect Stack?
            </h2>
            <p className="text-xl text-white/80 mb-8">
              Join thousands of QA engineers who have built their ideal testing environments 
              using our smart technology combination tool.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button onClick={onStartBuilding} className="btn-primary text-lg px-8 py-4">
                <CheckCircle className="w-5 h-5 mr-2" />
                Start Building Now
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                Learn More
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;
