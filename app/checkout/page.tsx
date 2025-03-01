"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, CreditCard, Truck, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Steps } from "@/components/checkout/steps"
import { AddressForm } from "@/components/checkout/address-form"
import { PaymentForm } from "@/components/checkout/payment-form"
import { OrderSummary } from "@/components/checkout/order-summary"
import { useCart } from "@/hooks/use-cart"
import { processPayment } from "@/lib/payment"

const steps = [
  { id: "address", title: "Endereço" },
  { id: "payment", title: "Pagamento" },
  { id: "review", title: "Revisão" },
]

export default function CheckoutPage() {
  const [currentStep, setCurrentStep] = useState("address")
  const [loading, setLoading] = useState(false)
  const { cart, total, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const handleSubmit = async () => {
    try {
      setLoading(true)
      await processPayment({
        amount: total,
        items: cart,
        // ... outros dados do checkout
      })

      clearCart()
      toast({
        title: "Pedido realizado com sucesso!",
        description: "Você receberá um email com os detalhes.",
        variant: "success",
      })
      router.push("/orders")
    } catch (error) {
      toast({
        title: "Erro ao processar pagamento",
        description: "Por favor, tente novamente.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-[390px] mx-auto px-4 py-4">
          <div className="flex items-center">
            <button onClick={() => router.back()} className="mr-4">
              <ArrowLeft className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold">Checkout</h1>
          </div>
        </div>
      </header>

      <main className="max-w-[390px] mx-auto p-4">
        <Steps steps={steps} currentStep={currentStep} />

        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
          >
            {currentStep === "address" && <AddressForm onNext={() => setCurrentStep("payment")} />}

            {currentStep === "payment" && (
              <PaymentForm onBack={() => setCurrentStep("address")} onNext={() => setCurrentStep("review")} />
            )}

            {currentStep === "review" && (
              <div className="space-y-6">
                <OrderSummary cart={cart} total={total} />

                <div className="bg-white p-4 rounded-lg shadow-sm space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Truck className="h-4 w-4" />
                    <span>Entrega estimada em 3-5 dias úteis</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CreditCard className="h-4 w-4" />
                    <span>Pagamento seguro via stripe</span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Lock className="h-4 w-4" />
                    <span>Dados criptografados</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setCurrentStep("payment")} className="flex-1">
                    Voltar
                  </Button>
                  <Button onClick={handleSubmit} disabled={loading} className="flex-1">
                    {loading ? "Processando..." : "Finalizar Compra"}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

