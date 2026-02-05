import { useState } from "react";
import { useLocation } from "wouter";
import Confetti from "react-confetti";
import { Laptop, Users, Wallet, Lock, Info } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { useEarn, useActivate } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { AdPlaceholder } from "@/components/AdPlaceholder";
import { DiamondCard } from "@/components/DiamondCard";
import { TaskModal } from "@/components/TaskModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

const TASKS = {
  diamond_1: { id: "diamond_1", title: "Publicité Bronze", reward: 0.05, duration: 5 },
  diamond_2: { id: "diamond_2", title: "Publicité Argent", reward: 0.10, duration: 10 },
  diamond_3: { id: "diamond_3", title: "Publicité Or", reward: 0.30, duration: 30 },
  gagner: { id: "gagner", title: "Super Bonus", reward: 0.50, duration: 60 },
};

export default function Dashboard() {
  const { user } = useAuth();
  const earn = useEarn();
  const activate = useActivate();
  const [, setLocation] = useLocation();
  const [activeTask, setActiveTask] = useState<keyof typeof TASKS | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showActivationModal, setShowActivationModal] = useState(false);

  // Redirect if not logged in
  if (!user) {
    setLocation("/login");
    return null;
  }

  const handleTaskClick = (taskId: keyof typeof TASKS) => {
    if (!user.isActivated) {
      setShowActivationModal(true);
      return;
    }
    setActiveTask(taskId);
  };

  const handleTaskComplete = () => {
    if (activeTask) {
      earn.mutate(
        { amount: TASKS[activeTask].reward, taskId: activeTask },
        {
          onSuccess: () => {
            setActiveTask(null);
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 5000);
          }
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {showConfetti && <Confetti numberOfPieces={200} recycle={false} />}
      
      {/* Top Ad */}
      <div className="container mx-auto px-4 pt-4">
        <AdPlaceholder height="h-20" className="opacity-90" />
      </div>

      <main className="container mx-auto px-4 py-8 space-y-8">
        
        {/* Welcome Section */}
        <section className="text-center space-y-2">
          <h1 className="text-3xl font-display text-white">Bienvenue sur <span className="text-gradient-gold">AFRICASH</span></h1>
          <p className="text-muted-foreground">La plateforme qui récompense votre temps.</p>
          
          <div className="py-6">
            <p className="text-sm text-gray-400 uppercase tracking-widest mb-1">Solde Actuel</p>
            <h2 className="text-5xl font-bold font-display text-gradient-gold">
              {Number(user.balance).toFixed(2)} FCFA
            </h2>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="grid grid-cols-3 gap-4">
          <Button 
            variant="outline" 
            className="h-24 flex flex-col gap-2 border-white/10 hover:bg-white/5 hover:border-primary/50 transition-all group"
          >
            <Laptop className="w-8 h-8 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Formation</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex flex-col gap-2 border-white/10 hover:bg-white/5 hover:border-primary/50 transition-all group"
          >
            <Users className="w-8 h-8 text-green-400 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Invités</span>
          </Button>
          <Button 
            variant="outline" 
            className="h-24 flex flex-col gap-2 border-white/10 hover:bg-white/5 hover:border-primary/50 transition-all group"
            onClick={() => setLocation("/withdraw")}
          >
            <Wallet className="w-8 h-8 text-primary group-hover:scale-110 transition-transform" />
            <span className="text-xs font-semibold">Retrait</span>
          </Button>
        </section>

        {/* Middle Ad */}
        <AdPlaceholder height="h-24" />

        {/* Earning Section */}
        <section className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl text-white font-display">Tâches Quotidiennes</h3>
            <div className="px-3 py-1 bg-primary/10 rounded-full border border-primary/20 text-xs text-primary font-bold">
              VIP Actif
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <DiamondCard 
              {...TASKS.diamond_1} 
              isLocked={!user.isActivated} 
              onUnlock={() => setShowActivationModal(true)}
              onClick={() => handleTaskClick("diamond_1")}
            />
            <DiamondCard 
              {...TASKS.diamond_2} 
              isLocked={!user.isActivated}
              onUnlock={() => setShowActivationModal(true)}
              onClick={() => handleTaskClick("diamond_2")}
            />
            <DiamondCard 
              {...TASKS.diamond_3} 
              isLocked={!user.isActivated}
              onUnlock={() => setShowActivationModal(true)}
              onClick={() => handleTaskClick("diamond_3")}
            />
          </div>

          <div className="pt-4">
            <Button 
              size="lg" 
              className="w-full h-16 text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 shadow-lg shadow-purple-500/20"
              onClick={() => handleTaskClick("gagner")}
            >
              {!user.isActivated && <Lock className="mr-2 w-5 h-5" />}
              SUPER BONUS - 0.50 FCFA
            </Button>
            <p className="text-center text-xs text-muted-foreground mt-2">Nécessite 60 secondes de visionnage</p>
          </div>
        </section>

        {/* Activation Modal */}
        <Dialog open={showActivationModal} onOpenChange={setShowActivationModal}>
          <DialogContent className="glass-card text-white border-none">
            <DialogHeader>
              <DialogTitle className="text-2xl font-display text-primary text-center">Activation du Compte</DialogTitle>
              <DialogDescription className="text-center text-gray-300">
                Pour débloquer les gains, vous devez activer votre compte VIP.
              </DialogDescription>
            </DialogHeader>
            <div className="bg-white/5 p-4 rounded-lg space-y-4 my-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <p className="text-sm">Envoyez <strong>5,000 FCFA</strong> au numéro suivant via Mobile Money:</p>
              </div>
              <p className="text-2xl font-mono font-bold text-center bg-black/40 p-3 rounded border border-white/10 select-all">
                05 04 03 02 01
              </p>
              <p className="text-xs text-center text-muted-foreground">Nom: AFRICASH SERVICE</p>
            </div>
            <Button 
              className="w-full bg-gradient-gold text-black font-bold h-12"
              onClick={() => activate.mutate(undefined, { onSuccess: () => setShowActivationModal(false) })}
              disabled={activate.isPending}
            >
              {activate.isPending ? "Vérification..." : "J'ai effectué le paiement"}
            </Button>
          </DialogContent>
        </Dialog>

        {/* Task Modal */}
        {activeTask && (
          <TaskModal 
            isOpen={!!activeTask}
            onClose={() => setActiveTask(null)}
            onComplete={handleTaskComplete}
            reward={TASKS[activeTask].reward}
            duration={TASKS[activeTask].duration}
            isLoading={earn.isPending}
          />
        )}

        {/* Bottom Ad */}
        <AdPlaceholder height="h-24" />

        {/* Promo Carousel (Static for now) */}
        <section className="overflow-hidden rounded-xl border border-white/10 relative h-40">
           {/* Placeholder for carousel */}
           <img 
             src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=2664&auto=format&fit=crop" 
             alt="Promo" 
             className="w-full h-full object-cover opacity-60"
           />
           <div className="absolute inset-0 flex items-center justify-center bg-black/40">
             <h3 className="text-2xl font-display font-bold text-white">Partenaires Officiels</h3>
           </div>
        </section>

      </main>
      
      {/* Footer */}
      <footer className="bg-secondary text-gray-400 py-12 px-4 border-t border-white/5 mt-12">
        <div className="container mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-sm">
          <div>
            <h4 className="text-white mb-4">À Propos</h4>
            <ul className="space-y-2">
              <li>L'équipe</li>
              <li>Carrières</li>
              <li>Presse</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white mb-4">Support</h4>
            <ul className="space-y-2">
              <li>FAQ</li>
              <li>Contact</li>
              <li>Directives</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white mb-4">Légal</h4>
            <ul className="space-y-2">
              <li>Conditions</li>
              <li>Confidentialité</li>
              <li>Cookies</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white mb-4">Suivez-nous</h4>
            <div className="flex gap-4">
              {/* Social icons placeholders */}
              <div className="w-8 h-8 bg-white/10 rounded-full" />
              <div className="w-8 h-8 bg-white/10 rounded-full" />
              <div className="w-8 h-8 bg-white/10 rounded-full" />
            </div>
          </div>
        </div>
        <div className="container mx-auto mt-8 pt-8 border-t border-white/5 text-center text-xs">
          © 2026 AFRICASH Inc. Tous droits réservés.
        </div>
      </footer>
    </div>
  );
}
