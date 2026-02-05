import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { api, type EarnRequest, type InsertWithdrawal } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useTransactions() {
  return useQuery({
    queryKey: [api.user.transactions.path],
    queryFn: async () => {
      const res = await fetch(api.user.transactions.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch transactions");
      return api.user.transactions.responses[200].parse(await res.json());
    },
  });
}

export function useEarn() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: EarnRequest) => {
      const res = await fetch(api.user.earn.path, {
        method: api.user.earn.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to earn");
      }
      return api.user.earn.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      queryClient.invalidateQueries({ queryKey: [api.user.transactions.path] });
      toast({ 
        title: "Succès!", 
        description: data.message,
        className: "bg-green-500 border-green-600 text-white"
      });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useWithdraw() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertWithdrawal) => {
      const res = await fetch(api.user.withdraw.path, {
        method: api.user.withdraw.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to withdraw");
      }
      return api.user.withdraw.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      queryClient.invalidateQueries({ queryKey: [api.user.transactions.path] });
      toast({ title: "Retrait initié", description: "Votre demande est en cours de traitement." });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });
}

export function useActivate() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      const res = await fetch(api.user.activate.path, {
        method: api.user.activate.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Activation failed");
      }
      return api.user.activate.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.auth.me.path] });
      toast({ title: "Compte activé!", description: "Bienvenue sur AFRICASH VIP." });
    },
    onError: (error: Error) => {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
    },
  });
}
