import { motion } from "framer-motion";
import React from "react";

interface FloatingPathsProps {
  position: number;
}

const FloatingPaths: React.FC<FloatingPathsProps> = ({ position }) => {
  const paths = Array.from({ length: 36 }, (_, i) => ({
    id: i,
    d: `M-${380 - i * 5 * position} -${189 + i * 6}
        C-${380 - i * 5 * position} -${189 + i * 6}
        -${312 - i * 5 * position} ${216 - i * 6}
        ${152 - i * 5 * position} ${343 - i * 6}
        C${616 - i * 5 * position} ${470 - i * 6}
        ${684 - i * 5 * position} ${875 - i * 6}
        ${684 - i * 5 * position} ${875 - i * 6}`,
    width: 0.5 + i * 0.03,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none">
      <svg
        className="w-full h-full text-white"
        viewBox="0 0 696 316"
        fill="none"
      >
        <title>Animated Background Paths</title>
        {paths.map((path) => (
          <motion.path
            key={path.id}
            d={path.d}
            stroke="currentColor"
            strokeWidth={path.width}
            strokeOpacity={0.1 + path.id * 0.03}
            initial={{ pathLength: 0.3, opacity: 0.4 }}
            animate={{
              pathLength: 1,
              opacity: [0.3, 0.6, 0.3],
              pathOffset: [0, 1, 0],
            }}
            transition={{
              duration: 18 + path.id * 0.4,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        ))}
      </svg>
    </div>
  );
};

interface BackgroundPathsProps {
  children: React.ReactNode;
  className?: string;
}

export const BackgroundPaths: React.FC<BackgroundPathsProps> = ({
  children,
  className = "",
}) => {
  return (
    <div className={`relative min-h-screen w-full bg-black ${className}`}>
      <div className="fixed inset-0 z-0 opacity-20">
        <FloatingPaths position={1} />
        <FloatingPaths position={-1} />
      </div>

      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};
