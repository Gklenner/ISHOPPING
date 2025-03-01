import { z } from "zod"

export const addressSchema = z.object({
  street: z.string().min(1, "Rua é obrigatória"),
  number: z.string().min(1, "Número é obrigatório"),
  complement: z.string().optional(),
  neighborhood: z.string().min(1, "Bairro é obrigatório"),
  city: z.string().min(1, "Cidade é obrigatória"),
  state: z.string().min(2, "Estado é obrigatório").max(2, "Use a sigla do estado"),
  zipCode: z.string().min(8, "CEP inválido").max(9, "CEP inválido")
})

export const paymentSchema = z.object({
  amount: z.number().positive("Valor inválido"),
  items: z.array(
    z.object({
      id: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive()
    })
  ).min(1, "Carrinho vazio"),
  address: addressSchema,
  paymentMethod: z.enum(["credit_card", "pix", "boleto"]),
  installments: z.number().int().min(1).max(12).optional()
})

export type PaymentData = z.infer<typeof paymentSchema>
export type AddressData = z.infer<typeof addressSchema>