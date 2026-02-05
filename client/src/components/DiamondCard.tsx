import { Gem, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";

interface DiamondCardProps {
  id: string;
  reward: number;
  duration: number;
  isLocked: boolean;
  onUnlock: () => void;
  onClick: () => void;
  title: string;
}

export function DiamondCard({ id, reward, duration, isLocked, onUnlock, onClick, title }: DiamondCardProps) {
  return (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="glass-card rounded-2xl p-4 flex flex-col items-center justify-between min-h-[160px] relative overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      
      <div className="relative z-10 w-full flex flex-col items-center text-center">
        <h3 className="text-xs uppercase tracking-widest text-muted-foreground mb-2">{title}</h3>
        
        <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-3 text-primary border border-primary/20">
          <Gem className="w-6 h-6 animate-pulse" />
        </div>

        <div className="space-y-1">
          <p className="font-display text-xl font-bold text-white">{reward.toFixed(2)} FCFA</p>
          <p className="text-xs text-muted-foreground">{duration}s timer</p>
        </div>
      </div>

      <div className="w-full mt-4 z-10">
        {isLocked ? (
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-primary/50 text-primary hover:bg-primary hover:text-black transition-all"
            onClick={onUnlock}
          >
            <Lock className="w-3 h-3 mr-2" />
            Activer
          </Button>
        ) : (
          <Button 
            className="w-full bg-gradient-gold text-black font-bold hover:shadow-[0_0_20px_rgba(255,215,0,0.3)] transition-all"
            onClick={onClick}
          >
            Réclamer
          </Button>
        )}
      </div>
    </motion.div>
  );
}
