"use client"

import { createContext, useContext, useState, type ReactNode, useEffect } from "react"
import type { CartItem } from "./cart-context"

export type OrderType = "delivery" | "retirada"

export type PaymentMethod = "credit" | "pix" | "cash"

export type OrderStatus = "pendente" | "confirmado" | "preparando" | "pronto" | "entregue" | "completo"

export type DeliveryInfo = {
  name: string
  phone: string
  address?: string
  complement?: string
  instructions?: string
  observation?: string
}

export type Order = {
  id: string
  items: CartItem[]
  total: number
  orderType: OrderType
  paymentMethod: PaymentMethod
  deliveryInfo: DeliveryInfo
  status: OrderStatus
  createdAt: string
  pixPaid?: boolean
}

type OrderContextType = {
  orders: Order[]
  addOrder: (order: Omit<Order, "id" | "createdAt" | "status">) => Order
  getOrder: (id: string) => Order | undefined
  updateOrderStatus: (id: string, status: OrderStatus) => void
  markPixAsPaid: (id: string) => void
}

const OrderContext = createContext<OrderContextType | undefined>(undefined)

// Helper to generate a unique ID
const generateId = () => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function OrderProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([])

  // Load orders from localStorage on mount
  useEffect(() => {
    const savedOrders = localStorage.getItem("sabor-fitness-orders")
    if (savedOrders) {
      try {
        setOrders(JSON.parse(savedOrders))
      } catch (e) {
        console.error("Failed to parse saved orders", e)
      }
    }
  }, [])

  // Save orders to localStorage when they change
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem("sabor-fitness-orders", JSON.stringify(orders))
    }
  }, [orders])

  const addOrder = (orderData: Omit<Order, "id" | "createdAt" | "status">) => {
    const newOrder: Order = {
      ...orderData,
      id: generateId(),
      status: "pendente",
      createdAt: new Date().toISOString(),
    }

    setOrders((prev) => [newOrder, ...prev])
    return newOrder
  }

  const getOrder = (id: string) => {
    return orders.find((order) => order.id === id)
  }

  const updateOrderStatus = (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, status } : order)))
  }

  const markPixAsPaid = (id: string) => {
    setOrders((prev) => prev.map((order) => (order.id === id ? { ...order, pixPaid: true } : order)))
  }

  return (
    <OrderContext.Provider
      value={{
        orders,
        addOrder,
        getOrder,
        updateOrderStatus,
        markPixAsPaid,
      }}
    >
      {children}
    </OrderContext.Provider>
  )
}

export function useOrders() {
  const context = useContext(OrderContext)
  if (context === undefined) {
    throw new Error("useOrders must be used within an OrderProvider")
  }
  return context
}

