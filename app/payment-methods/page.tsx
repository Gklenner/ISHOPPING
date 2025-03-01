"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { CreditCard, Plus, Trash2 } from "lucide-react"

interface PaymentMethod {
  id: string
  userId: string
  cardType: string
  lastFourDigits: string
  expiryDate: string
  isDefault: boolean
}

export default function PaymentMethodsPage() {
  const { user } = useAuth()
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await fetch('/api/payment-methods')
        if (!response.ok) throw new Error('Failed to fetch payment methods')
        const data = await response.json()
        setPaymentMethods(data)
      } catch (error) {
        console.error('Error fetching payment methods:', error)
      } finally {
        setLoading(false)
      }
    }

    if (user) {
      fetchPaymentMethods()
    }
  }, [user])

  const removePaymentMethod = async (methodId: string) => {
    try {
      const response = await fetch(`/api/payment-methods/${methodId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to remove payment method')
      
      setPaymentMethods(prev => 
        prev.filter(method => method.id !== methodId)
      )
    } catch (error) {
      console.error('Error removing payment method:', error)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <CreditCard className="h-16 w-16 text-gray-400 mb-4" />
        <h1 className="text-2xl font-semibold mb-2">Métodos de Pagamento</h1>
        <p className="text-gray-600 mb-4 text-center">
          Faça login para gerenciar seus métodos de pagamento
        </p>
        <Button onClick={() => window.location.href = '/login'}>Login</Button>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-[600px] mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold">Métodos de Pagamento</h1>
          <Button onClick={() => window.location.href = '/payment-methods/add'}>
            <Plus className="h-4 w-4 mr-2" />
            Adicionar Cartão
          </Button>
        </div>

        {paymentMethods.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-2">Nenhum cartão cadastrado</h2>
            <p className="text-gray-600 mb-4">
              Adicione um cartão de crédito para fazer compras
            </p>
            <Button onClick={() => window.location.href = '/payment-methods/add'}>
              Adicionar Cartão
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className="bg-white rounded-lg p-4 flex items-center justify-between"
              >
                <div className="flex items-center space-x-4">
                  <CreditCard className="h-8 w-8 text-gray-500" />
                  <div>
                    <p className="font-medium">
                      {method.cardType} •••• {method.lastFourDigits}
                    </p>
                    <p className="text-sm text-gray-500">
                      Expira em {method.expiryDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {method.isDefault && (
                    <span className="text-sm text-primary font-medium">
                      Principal
                    </span>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removePaymentMethod(method.id)}
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}