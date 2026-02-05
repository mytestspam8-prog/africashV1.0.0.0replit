import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useWithdraw, useTransactions } from "@/hooks/use-user";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, History } from "lucide-react";
import { Link, useLocation } from "wouter";

const withdrawSchema = z.object({
  amount: z.coerce.number().min(100, "Minimum 100 FCFA"),
  phoneNumber: z.string().min(8, "Numéro invalide"),
  method: z.string().min(1, "Méthode requise"),
});

export default function Withdraw() {
  const { user } = useAuth();
  const withdraw = useWithdraw();
  const { data: transactions, isLoading: isLoadingTx } = useTransactions();
  const [, setLocation] = useLocation();

  const form = useForm<z.infer<typeof withdrawSchema>>({
    resolver: zodResolver(withdrawSchema),
    defaultValues: { amount: 0, phoneNumber: user?.phone || "", method: "orange" },
  });

  if (!user) {
    setLocation("/login");
    return null;
  }

  function onSubmit(data: z.infer<typeof withdrawSchema>) {
    if (data.amount > Number(user?.balance || 0)) {
      form.setError("amount", { message: "Solde insuffisant" });
      return;
    }
    withdraw.mutate({ ...data, userId: user!.id }, {
      onSuccess: () => {
        form.reset();
      }
    });
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-4">
      <div className="container mx-auto max-w-2xl space-y-8">
        
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="icon" className="text-white hover:bg-white/10">
              <ArrowLeft className="w-6 h-6" />
            </Button>
          </Link>
          <h1 className="text-2xl font-display text-white">Retrait des gains</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card border-none text-white bg-primary/10">
            <CardHeader>
              <CardDescription className="text-primary/80">Solde Disponible</CardDescription>
              <CardTitle className="text-3xl font-display text-primary">{Number(user.balance).toFixed(2)} FCFA</CardTitle>
            </CardHeader>
          </Card>
          
          <Card className="glass-card border-none text-white">
            <CardHeader>
              <CardDescription>Minimum Retrait</CardDescription>
              <CardTitle className="text-3xl font-display">100.00 FCFA</CardTitle>
            </CardHeader>
          </Card>
        </div>

        <Card className="glass-card border-none text-white">
          <CardHeader>
            <CardTitle>Demander un retrait</CardTitle>
            <CardDescription className="text-gray-400">Les retraits sont traités sous 24h.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Montant à retirer</FormLabel>
                      <FormControl>
                        <Input type="number" {...field} className="bg-black/30 border-white/10 text-white text-lg font-mono" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="method"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Moyen de paiement</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-black/30 border-white/10 text-white">
                              <SelectValue placeholder="Choisir..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-secondary border-white/10 text-white">
                            <SelectItem value="orange">Orange Money</SelectItem>
                            <SelectItem value="mtn">MTN Mobile Money</SelectItem>
                            <SelectItem value="moov">Moov Money</SelectItem>
                            <SelectItem value="wave">Wave</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Numéro de téléphone</FormLabel>
                        <FormControl>
                          <Input {...field} className="bg-black/30 border-white/10 text-white" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Button 
                  type="submit" 
                  disabled={withdraw.isPending}
                  className="w-full bg-gradient-gold text-black font-bold h-12 text-lg hover:opacity-90"
                >
                  {withdraw.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirmer le retrait"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        <Card className="glass-card border-none text-white">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <History className="w-5 h-5 text-primary" /> Historique
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoadingTx ? (
              <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /></div>
            ) : transactions?.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">Aucune transaction.</p>
            ) : (
              <div className="space-y-4">
                {transactions?.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                    <div>
                      <p className="font-semibold capitalize">{tx.type === 'earn' ? 'Gain Publicité' : 'Retrait'}</p>
                      <p className="text-xs text-muted-foreground">{new Date(tx.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className={tx.type === 'earn' ? 'text-green-400 font-mono' : 'text-red-400 font-mono'}>
                      {tx.type === 'earn' ? '+' : '-'}{Number(tx.amount).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
