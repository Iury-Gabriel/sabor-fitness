"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Minus, Star } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useCart } from "@/contexts/cart-context"

type MenuItem = {
  id: number
  name: string
  description: string
  price: number
  image: string
  tags: string[]
  rating: number
  featured?: boolean
}

export default function MenuItemList() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null)
  const [quantity, setQuantity] = useState(1)
  const { toast } = useToast()
  const { addItem } = useCart()

  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const response = await fetch('https://iurygabriel.com.br/projeto-cardapio/src/api_produtos.php')

        const data = await response.json();

        if (data.status === "success") {
          setMenuItems(data.produtos)
        } else {
          setError("Erro ao carregar os produtos")
        }
      } catch (err) {
        setError("Erro ao conectar com o servidor")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchMenuItems()
  }, [])

  const handleAddToCart = () => {
    if (!selectedItem) return

    addItem(
      {
        id: selectedItem.id,
        name: selectedItem.name,
        price: selectedItem.price,
        image: selectedItem.image,
      },
      quantity,
    )

    toast({
      title: "Adicionado ao carrinho",
      description: `${quantity}x ${selectedItem.name}`,
    })

    setSelectedItem(null)
    setQuantity(1)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} className="mt-4 bg-green-600 hover:bg-green-700">
          Tentar novamente
        </Button>
      </div>
    )
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {menuItems.map((item) => (
          <div
            key={item.id}
            className="flex bg-white rounded-xl shadow-sm overflow-hidden cursor-pointer hover:shadow-md transition-shadow border border-neutral-100 h-full"
            onClick={() => setSelectedItem(item)}
          >
            <div className="flex-1 p-4">
              <h3 className="font-bold text-lg text-neutral-800">{item.name}</h3>
              <p className="text-sm text-neutral-600 mt-2 line-clamp-2">{item.description}</p>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                {item.tags.map((tag, index) => (
                  <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                    {tag}
                  </Badge>
                ))}
              </div>
              <div className="flex items-center justify-between mt-4">
                <span className="text-green-700 font-bold text-lg">R$ {item.price.toFixed(2)}</span>
                <div className="flex items-center text-amber-500">
                  <Star className="h-4 w-4 fill-amber-500" />
                  <span className="text-xs font-medium ml-1">{item.rating}</span>
                </div>
              </div>
            </div>
            <div className="relative w-32 h-32">
              <Image src={item.image || "/placeholder.svg"} alt={item.name} fill className="object-cover" />
            </div>
          </div>
        ))}
      </div>

      {/* Item Detail Dialog */}
      <Dialog
        open={!!selectedItem}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedItem(null)
            setQuantity(1)
          }
        }}
      >
        <DialogContent className="sm:max-w-md md:max-w-2xl max-h-[90vh] flex flex-col">
          <DialogHeader className="sticky top-0 z-10 bg-white pb-2 border-b">
            <DialogTitle>{selectedItem?.name}</DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="grid md:grid-cols-2 gap-6 overflow-y-auto flex-1">
              <div className="relative w-full h-56 md:h-full mt-2">
                <Image
                  src={selectedItem.image || "/placeholder.svg?height=300&width=500"}
                  alt={selectedItem.name}
                  fill
                  className="object-cover rounded-lg"
                />
                <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 flex items-center shadow-md">
                  <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                  <span className="text-xs font-medium ml-1">{selectedItem.rating}</span>
                </div>
              </div>

              <div className="flex flex-col">
                <div className="flex flex-wrap gap-1 mt-0 md:mt-3">
                  {selectedItem.tags.map((tag, index) => (
                    <Badge key={index} variant="outline" className="bg-green-50 text-green-700 border-green-200">
                      {tag}
                    </Badge>
                  ))}
                </div>

                <p className="text-neutral-600 mt-3">{selectedItem.description}</p>

                <div className="flex items-center justify-between mt-auto pt-6">
                  <div className="flex items-center border rounded-lg">
                    <button
                      className="p-2 text-green-600 disabled:text-neutral-300"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="h-5 w-5" />
                    </button>
                    <span className="px-4 font-medium">{quantity}</span>
                    <button className="p-2 text-green-600" onClick={() => setQuantity(quantity + 1)}>
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                  <span className="font-bold text-lg">R$ {(selectedItem.price * quantity).toFixed(2)}</span>
                </div>

                <Button className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white" onClick={handleAddToCart}>
                  Adicionar ao Carrinho
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

