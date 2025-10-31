import React from "react";
import { motion } from "framer-motion";
import { Database, Lock } from "lucide-react";

/**
 * BounceCardSqlLab Component
 * 
 * Animated SQL Lab entry card with bounce/rotate on hover
 * Shows lock icon when user is not logged in
 */
export const BounceCardSqlLab = ({ user, onOpenLab }) => {
  return (
    <motion.div
      whileHover={{ scale: 0.98, rotate: "-1deg" }}
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-6 min-h-[160px]"
      onClick={onOpenLab}
    >
      {/* Background gradient effect on hover */}
      <div className="absolute bottom-0 left-0 right-0 top-0 translate-y-8 rounded-t-2xl bg-gradient-to-br from-blue-600/20 to-purple-600/20 opacity-0 transition-all duration-[250ms] group-hover:translate-y-4 group-hover:opacity-100" />
      
      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-5 h-5 text-blue-400" />
            <h3 className="text-white font-semibold text-lg">Practice SQL (in-browser)</h3>
            {!user && <Lock className="w-4 h-4 text-yellow-400" />}
          </div>
        </div>
        <p className="text-white/70 text-sm mb-4">
          Run queries against a seeded dataset without installing Postgres.
          {!user && <span className="text-yellow-400 block mt-2">⚠️ Login required to access SQL Lab</span>}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-white/50 text-xs">QA Tester Learning</span>
          <div className="flex items-center gap-2 text-white">
            <span className="text-sm font-medium">Open Lab</span>
            <motion.div
              animate={{ x: [0, 4, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.5 }}
            >
              →
            </motion.div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

