"use client";

import { motion } from "framer-motion";
import clsx from "clsx";
import { DollarSign } from "lucide-react";

interface AnimatedTitleProps {
  text: string;
  className?: string;
  loopDuration?: number;
  showIcon?: boolean;
}

export function AnimatedTitle({
  text,
  className,
  loopDuration = 2.5,
  showIcon = true,
}: AnimatedTitleProps) {
  const words = text.split(" ");

  return (
    <div className={clsx("flex items-center justify-center gap-2", className)}>
      {showIcon && (
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, -10, 10, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "easeInOut",
          }}
        >
          <DollarSign className="w-10 h-10 text-green-500" />
        </motion.div>
      )}

      <h1 className="text-3xl md:text-5xl font-bold flex flex-wrap gap-2">
        {words.map((word, index) => (
          <motion.span
            key={index}
            style={{ display: "inline-block" }}
            animate={{
              y: [0, -10, 0],
              opacity: [1, 0.5, 1],
              rotate: [0, 5, -5, 0],
            }}
            transition={{
              repeat: Infinity,
              duration: loopDuration,
              ease: "easeInOut",
              delay: index * 0.2,
            }}
          >
            {word}
          </motion.span>
        ))}
      </h1>
    </div>
  );
}
