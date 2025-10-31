import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Github, Mail } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="py-8 mt-16">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="border-t border-white/20 pt-8"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* About */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">About QA Tech Builder</h3>
              <p className="text-white/70 text-sm leading-relaxed">
                A modern, minimal tool for building compatible QA testing technology stacks. 
                Choose your technologies and get instant validation.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#java" className="text-white/70 hover:text-white transition-colors text-sm">
                    Java Stack
                  </a>
                </li>
                <li>
                  <a href="#python" className="text-white/70 hover:text-white transition-colors text-sm">
                    Python Stack
                  </a>
                </li>
                <li>
                  <a href="#javascript" className="text-white/70 hover:text-white transition-colors text-sm">
                    JavaScript Stack
                  </a>
                </li>
                <li>
                  <a href="#documentation" className="text-white/70 hover:text-white transition-colors text-sm">
                    Documentation
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h3 className="text-white font-semibold text-lg mb-4">Contact</h3>
              <div className="space-y-3">
                <a
                  href="mailto:contact@qatechbuilder.com"
                  className="flex items-center text-white/70 hover:text-white transition-colors text-sm"
                >
                  <Mail className="w-4 h-4 mr-2" />
                  contact@qatechbuilder.com
                </a>
                <a
                  href="https://github.com/qatechbuilder"
                  className="flex items-center text-white/70 hover:text-white transition-colors text-sm"
                >
                  <Github className="w-4 h-4 mr-2" />
                  GitHub Repository
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="flex flex-col md:flex-row items-center justify-between mt-8 pt-6 border-t border-white/10">
            <p className="text-white/50 text-sm mb-4 md:mb-0">
              © 2024 QA Tech Builder. All rights reserved.
            </p>
            <div className="flex items-center text-white/50 text-sm">
              <span>Made with</span>
              <Heart className="w-4 h-4 mx-1 text-red-400" />
              <span>for QA Engineers</span>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;








