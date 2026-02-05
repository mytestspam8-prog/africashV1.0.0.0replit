import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "./ui/button";
import { 
  User, Menu, Gift, MessageCircle, Bell, X, 
  ShoppingBag, HelpCircle, FileText, LogOut, Home, 
  Gem, Wallet
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const menuItems = [
    { label: "Marketplace", icon: ShoppingBag, href: "#" },
    { label: "Support", icon: HelpCircle, href: "#" },
    { label: "Terms of Service", icon: FileText, href: "#" },
    { label: "Privacy Policy", icon: FileText, href: "#" },
  ];

  return (
    <>
      {/* Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-white/10 h-16 px-4 flex items-center justify-between">
        {/* Left: User Profile */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-gold p-[2px]">
            <div className="w-full h-full rounded-full bg-black flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
          </div>
          <div className="hidden sm:block">
            <p className="text-xs text-muted-foreground">ID: {user.id}</p>
            <p className="text-sm font-bold text-white truncate max-w-[100px]">{user.name}</p>
          </div>
        </div>

        {/* Center: Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Button size="icon" variant="ghost" className="relative text-white hover:text-primary hover:bg-white/5 rounded-full">
            <Gift className="w-5 h-5" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-ping" />
          </Button>
          
          <Button size="icon" variant="ghost" className="text-green-500 hover:bg-green-500/10 rounded-full">
            <MessageCircle className="w-5 h-5" />
          </Button>
          
          <Button size="icon" variant="ghost" className="text-white hover:text-primary hover:bg-white/5 rounded-full">
            <Bell className="w-5 h-5" />
          </Button>
        </div>

        {/* Right: Menu Toggle */}
        <Button 
          variant="ghost" 
          size="icon"
          onClick={() => setIsMenuOpen(true)}
          className="text-white hover:bg-white/10"
        >
          <Menu className="w-6 h-6" />
        </Button>
      </header>

      {/* Side Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 bottom-0 z-[60] w-3/4 max-w-sm bg-secondary border-l border-white/10 p-6 flex flex-col"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-display text-primary">Menu</h2>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  <X className="w-6 h-6 text-white" />
                </Button>
              </div>

              <div className="flex-1 space-y-2">
                <Link href="/dashboard" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/5 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <Home className="w-5 h-5 text-primary" />
                  Dashboard
                </Link>
                <Link href="/withdraw" className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white hover:bg-white/5 transition-colors" onClick={() => setIsMenuOpen(false)}>
                  <Wallet className="w-5 h-5 text-primary" />
                  Retrait
                </Link>
                
                <div className="my-4 h-px bg-white/10" />
                
                {menuItems.map((item, idx) => (
                  <button key={idx} className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-white hover:bg-white/5 transition-colors">
                    <item.icon className="w-5 h-5" />
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="mt-auto pt-6 border-t border-white/10">
                <Button 
                  variant="destructive" 
                  className="w-full gap-2"
                  onClick={() => logout.mutate()}
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </Button>
                <p className="text-center text-xs text-muted-foreground mt-4">
                  Version 2.0.1 • AFRICASH © 2026
                </p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Spacer for fixed header */}
      <div className="h-20" />
    </>
  );
}
