"use client"

import { useState } from "react"
import { useOrders, type Order } from "@/contexts/order-context"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, Clock, MapPin, Store, CreditCard, DollarSign, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function MyOrdersPage() {
  const { orders } = useOrders()
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return { label: "Pendente", color: "bg-yellow-100 text-yellow-800" }
      case "confirmed":
        return { label: "Confirmado", color: "bg-blue-100 text-blue-800" }
      case "preparing":
        return { label: "Em Preparo", color: "bg-orange-100 text-orange-800" }
      case "ready":
        return { label: "Pronto", color: "bg-purple-100 text-purple-800" }
      case "delivered":
        return { label: "Entregue", color: "bg-green-100 text-green-800" }
      case "completed":
        return { label: "Concluído", color: "bg-green-100 text-green-800" }
      default:
        return { label: "Desconhecido", color: "bg-gray-100 text-gray-800" }
    }
  }

  const formatWhatsAppMessage = (order: Order) => {
    const orderDetails = order.items
      .map((item) => `${item.quantity}x ${item.name} - R$ ${(item.price * item.quantity).toFixed(2)}`)
      .join("\n")

    let message = `*Consulta de Pedido - Sabor Fitness*\n\n`
    message += `*Número do Pedido:* ${order.id.substring(0, 8)}\n`
    message += `*Data:* ${formatDate(order.createdAt)}\n`
    message += `*Cliente:* ${order.deliveryInfo.name}\n`
    message += `*Telefone:* ${order.deliveryInfo.phone}\n\n`

    if (order.orderType === "delivery") {
      message += `*Tipo:* Entrega\n`
      if (order.deliveryInfo.address) message += `*Endereço:* ${order.deliveryInfo.address}\n`
      if (order.deliveryInfo.complement) message += `*Complemento:* ${order.deliveryInfo.complement}\n`
    } else {
      message += `*Tipo:* Retirada\n`
    }

    if (order.deliveryInfo.instructions) {
      message += `*Instruções:* ${order.deliveryInfo.instructions}\n`
    }

    message += `\n*Forma de Pagamento:* ${
      order.paymentMethod === "credit" ? "Cartão" : order.paymentMethod === "pix" ? "PIX" : "Dinheiro"
    }\n\n`

    message += `*Itens do Pedido:*\n${orderDetails}\n\n`
    message += `*Total:* R$ ${order.total.toFixed(2)}\n\n`
    message += `*Status:* ${getStatusLabel(order.status).label}`

    return encodeURIComponent(message)
  }

  const handleWhatsAppSend = (order: Order) => {
    const message = formatWhatsAppMessage(order)
    window.open(`https://wa.me/5500000000000?text=${message}`, "_blank")
  }

  return (
    <main className="pb-24 bg-neutral-50 min-h-screen">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center text-white mb-4">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Voltar ao Cardápio
          </Link>
          <h1 className="text-xl md:text-2xl font-bold">Meus Pedidos</h1>
        </div>
      </div>

      {/* Orders List */}
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        {orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="h-16 w-16 rounded-full bg-neutral-100 flex items-center justify-center mb-4">
              <Clock className="h-8 w-8 text-neutral-400" />
            </div>
            <h2 className="text-xl font-bold text-neutral-700">Nenhum pedido encontrado</h2>
            <p className="text-neutral-500 mt-2 max-w-md">
              Você ainda não fez nenhum pedido. Explore nosso cardápio e faça seu primeiro pedido!
            </p>
            <Button asChild className="mt-6 bg-green-600 hover:bg-green-700">
              <Link href="/">Ver Cardápio</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-lg shadow-sm border border-neutral-100 p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedOrder(order)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold">Pedido #{order.id.substring(0, 8)}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusLabel(order.status).color}`}>
                        {getStatusLabel(order.status).label}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 mt-1">{formatDate(order.createdAt)}</p>
                  </div>
                  <span className="font-bold">R$ {order.total.toFixed(2)}</span>
                </div>

                <div className="mt-3 flex items-center text-sm text-neutral-600">
                  {order.orderType === "delivery" ? (
                    <MapPin className="h-4 w-4 mr-1 text-green-600" />
                  ) : (
                    <Store className="h-4 w-4 mr-1 text-green-600" />
                  )}
                  <span>{order.orderType === "delivery" ? "Entrega" : "Retirada"}</span>

                  <span className="mx-2">•</span>

                  {order.paymentMethod === "credit" && <CreditCard className="h-4 w-4 mr-1 text-green-600" />}
                  {order.paymentMethod === "pix" && <span className="font-bold text-green-600 mr-1">PIX</span>}
                  {order.paymentMethod === "cash" && <DollarSign className="h-4 w-4 mr-1 text-green-600" />}
                  <span>
                    {order.paymentMethod === "credit" ? "Cartão" : order.paymentMethod === "pix" ? "PIX" : "Dinheiro"}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center bg-neutral-50 rounded-full px-2 py-1 text-xs">
                      <span>
                        {item.quantity}x {item.name}
                      </span>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="bg-neutral-50 rounded-full px-2 py-1 text-xs">
                      <span>+{order.items.length - 3} itens</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={!!selectedOrder} onOpenChange={(open) => !open && setSelectedOrder(null)}>
        <DialogContent className="sm:max-w-md md:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader className="sticky top-0 z-10 bg-white pb-2 border-b">
            <DialogTitle>Detalhes do Pedido</DialogTitle>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4 overflow-y-auto flex-1">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-bold">Pedido #{selectedOrder.id.substring(0, 8)}</h3>
                  <p className="text-sm text-neutral-500">{formatDate(selectedOrder.createdAt)}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-sm ${getStatusLabel(selectedOrder.status).color}`}>
                  {getStatusLabel(selectedOrder.status).label}
                </span>
              </div>

              {selectedOrder.orderType === "delivery" ? (
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-medium">Endereço de Entrega</h3>
                  </div>
                  <div className="text-sm text-neutral-700">
                    <p className="font-medium">{selectedOrder.deliveryInfo.name}</p>
                    <p>{selectedOrder.deliveryInfo.phone}</p>
                    <p>{selectedOrder.deliveryInfo.address}</p>
                    {selectedOrder.deliveryInfo.complement && <p>{selectedOrder.deliveryInfo.complement}</p>}
                    {selectedOrder.deliveryInfo.instructions && (
                      <p className="mt-1 italic text-neutral-500">{selectedOrder.deliveryInfo.instructions}</p>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-center">
                    <Store className="h-5 w-5 text-green-600 mr-2" />
                    <h3 className="font-medium">Retirada no Local</h3>
                  </div>
                  <div className="text-sm text-neutral-700">
                    <p className="font-medium">{selectedOrder.deliveryInfo.name}</p>
                    <p>{selectedOrder.deliveryInfo.phone}</p>
                    <p>Sabor Fitness - Av. Exemplo, 1234, Centro</p>
                    {selectedOrder.deliveryInfo.instructions && (
                      <p className="mt-1 italic text-neutral-500">{selectedOrder.deliveryInfo.instructions}</p>
                    )}
                  </div>
                </div>
              )}

              <div className="border rounded-lg p-4 space-y-2">
                <h3 className="font-medium">Itens do Pedido</h3>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="flex items-center py-2 border-b">
                      <div className="relative h-10 w-10 rounded-md overflow-hidden">
                        <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between">
                          <span className="font-medium text-sm">{item.name}</span>
                          <span className="text-sm">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                        <div className="text-xs text-neutral-500">Qtd: {item.quantity}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>R$ {selectedOrder.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Taxa de entrega</span>
                    <span className="text-green-600">Grátis</span>
                  </div>
                  <div className="flex justify-between font-bold pt-1 border-t mt-2">
                    <span>Total</span>
                    <span>R$ {selectedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4 space-y-2">
                <div className="flex items-center">
                  <CreditCard className="h-5 w-5 text-green-600 mr-2" />
                  <h3 className="font-medium">Forma de Pagamento</h3>
                </div>
                <p className="text-sm text-neutral-700">
                  {selectedOrder.paymentMethod === "credit" &&
                    `Cartão de Crédito/Débito (${selectedOrder.orderType === "delivery" ? "na entrega" : "na retirada"})`}
                  {selectedOrder.paymentMethod === "pix" &&
                    `Pix ${selectedOrder.pixPaid ? "(Pago)" : "(Aguardando pagamento)"}`}
                  {selectedOrder.paymentMethod === "cash" &&
                    `Dinheiro (${selectedOrder.orderType === "delivery" ? "na entrega" : "na retirada"})`}
                </p>
              </div>
            </div>
          )}
          <Button
            onClick={() => handleWhatsAppSend(selectedOrder)}
            className="w-full flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 sticky bottom-0 mt-4"
          >
            Consultar Pedido via WhatsApp <ExternalLink className="h-4 w-4" />
          </Button>
        </DialogContent>
      </Dialog>
    </main>
  )
}

