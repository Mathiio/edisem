import { motion } from 'framer-motion';
import { BackgroundEllipse } from '@/assets/svg/BackgroundEllipse';

interface AnimatedBackgroundProps {
  className?: string;
  opacity?: number;
  darkOpacity?: number;
  top?: string;
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className = '', opacity = 20, darkOpacity = 30, top = '-100px' }) => (
  <motion.div className={`absolute z-[-1]  ${className}`} style={{ top }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, ease: 'easeIn' }}>
    <div className={`opacity-${opacity} dark:opacity-${darkOpacity}`}>
      <BackgroundEllipse />
    </div>
  </motion.div>
);
