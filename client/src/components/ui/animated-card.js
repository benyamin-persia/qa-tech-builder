import * as React from "react";
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { cn } from "../../lib/utils";

const AnimatedCard = React.forwardRef(({ 
  className, 
  children, 
  onClick,
  ...props 
}, ref) => {
  // Animation variants for the main card container
  const cardVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.03, transition: { type: "spring", stiffness: 300, damping: 20 } },
  };

  return (
    <motion.div
      ref={ref}
      className={cn(
        "relative cursor-pointer overflow-hidden rounded-xl border-2 border-white/20 bg-white/10 shadow-lg h-full flex flex-col",
        className
      )}
      variants={cardVariants}
      initial="initial"
      whileHover="hover"
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.div>
  );
});

AnimatedCard.displayName = "AnimatedCard";

export { AnimatedCard };



