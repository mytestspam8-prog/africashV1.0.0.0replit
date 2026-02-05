import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { AdPlaceholder } from "./AdPlaceholder";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle } from "lucide-react";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  reward: number;
  duration: number; // seconds
  isLoading?: boolean;
}

export function TaskModal({ isOpen, onClose, onComplete, reward, duration, isLoading }: TaskModalProps) {
  const [timeLeft, setTimeLeft] = useState(duration);
  const [canCollect, setCanCollect] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeLeft(duration);
      setCanCollect(false);
      
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setCanCollect(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [isOpen, duration]);

  const progress = ((duration - timeLeft) / duration) * 100;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isLoading && !open && onClose()}>
      <DialogContent className="glass-card border-none text-white sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-display text-2xl text-primary">
            Regarder la Publicité
          </DialogTitle>
          <DialogDescription className="text-center text-gray-400">
            Regardez l'annonce jusqu'à la fin pour gagner votre récompense.
          </DialogDescription>
        </DialogHeader>

        <div className="my-4 space-y-4">
          <AdPlaceholder height="h-48" className="bg-white/90" />
          
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progression</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2 bg-secondary" indicatorClassName="bg-primary" />
          </div>

          <div className="text-center">
            {timeLeft > 0 ? (
              <p className="text-sm font-mono text-primary animate-pulse">
                Patientez {timeLeft} secondes...
              </p>
            ) : (
              <p className="text-sm text-green-400 font-semibold flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4" /> Tâche terminée!
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-center pt-2">
          <AnimatePresence>
            {canCollect && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="w-full"
              >
                <Button 
                  onClick={onComplete} 
                  disabled={isLoading}
                  className="w-full h-12 text-lg font-bold bg-gradient-gold text-black hover:scale-105 transition-transform"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Validation...
                    </>
                  ) : (
                    `Collecter ${reward.toFixed(2)} FCFA`
                  )}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </DialogContent>
    </Dialog>
  );
}
