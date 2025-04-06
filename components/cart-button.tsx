"use client"

import { useState } from "react"
import { ShoppingBag, Trash2, Plus, Minus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import Image from "next/image"
import { useMediaQuery } from "@/hooks/use-media-query"
import { useCart } from "@/contexts/cart-context"
import { CheckoutModal } from "./checkout-modal"

export default function CartButton() {
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)
  const isDesktop = useMediaQuery("(min-width: 768px)")
  const { items, removeItem, updateQuantity, getTotal, getTotalItems, clearCart } = useCart()

  const cartTotal = getTotal()
  const itemCount = getTotalItems()

  const handleCheckout = () => {
    setCartOpen(false)
    setCheckoutOpen(true)
  }

  return (
    <>
      <div className={`fixed ${isDesktop ? "bottom-8 right-8" : "bottom-6 left-0 right-0 flex justify-center"} z-10`}>
        <Sheet open={cartOpen} onOpenChange={setCartOpen}>
          <SheetTrigger asChild>
            <Button
              className={`bg-green-600 hover:bg-green-700 text-white shadow-lg ${isDesktop ? "rounded-lg px-6 py-6" : "rounded-full px-6 py-6"}`}
            >
              <ShoppingBag className="h-6 w-6 mr-2" />
              <span className="font-medium">Ver Carrinho</span>
              <span className="ml-2 bg-white text-green-600 rounded-full h-6 w-6 flex items-center justify-center text-sm font-bold">
                {itemCount}
              </span>
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-md">
            <SheetHeader>
              <SheetTitle>Seu Carrinho</SheetTitle>
            </SheetHeader>

            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[70vh]">
                <ShoppingBag className="h-16 w-16 text-neutral-300 mb-4" />
                <h3 className="text-lg font-medium text-neutral-700">Seu carrinho está vazio</h3>
                <p className="text-neutral-500 text-center mt-2">Adicione itens ao seu carrinho para continuar</p>
                <Button className="mt-6 bg-green-600 hover:bg-green-700 text-white" onClick={() => setCartOpen(false)}>
                  Explorar Cardápio
                </Button>
              </div>
            ) : (
              <div className="flex flex-col h-full">
                <div className="flex-1 overflow-auto py-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center py-4 border-b">
                      <div className="relative h-16 w-16 rounded-md overflow-hidden">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="ml-4 flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        <div className="flex items-center justify-between mt-1">
                          <div className="flex items-center border rounded-md">
                            <button
                              className="p-1 text-green-600"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-2 text-sm">{item.quantity}</span>
                            <button
                              className="p-1 text-green-600"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      </div>
                      <button
                        className="ml-2 p-1 text-neutral-400 hover:text-red-500"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-neutral-600">Subtotal</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span className="text-neutral-600">Taxa de entrega</span>
                    <span className="text-green-600">Grátis</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg mt-2">
                    <span>Total</span>
                    <span>R$ {cartTotal.toFixed(2)}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-4">
                    <Button
                      variant="outline"
                      onClick={() => clearCart()}
                      className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                    >
                      Limpar Carrinho
                    </Button>
                    <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleCheckout}>
                      Finalizar Pedido
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </SheetContent>
        </Sheet>
      </div>

      <CheckoutModal open={checkoutOpen} onOpenChange={setCheckoutOpen} />
    </>
  )
}

