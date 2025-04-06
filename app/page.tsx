import Image from "next/image"
import { Utensils, Clock } from "lucide-react"
import CartButton from "@/components/cart-button"
import MenuItemList from "@/components/menu-item-list"
import Header from "./header"

export default function Home() {
  return (
    <main className="pb-24 bg-neutral-50">
      <Header />

      {/* Header Banner */}
      <div className="relative h-56 md:h-72 w-full">
        <Image src="https://eptxlqynlekdnndiwxpd.supabase.co/storage/v1/object/public/fotos//472885694_526725976401411_6962491489097859236_n%20(1).jpg" alt="Sabor Fitness Banner" fill className="object-cover" priority />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex flex-col justify-end p-6 md:px-12">
          <div className="max-w-7xl w-full mx-auto flex flex-col md:flex-row md:items-end">
            <div className="relative h-20 w-20 md:h-24 md:w-24 rounded-xl overflow-hidden border-4 border-white mb-3 md:mb-0 md:mr-6">
              <Image src="https://eptxlqynlekdnndiwxpd.supabase.co/storage/v1/object/public/fotos//472885694_526725976401411_6962491489097859236_n%20(1).jpg" alt="Sabor Fitness Logo" fill className="object-cover" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-white">Sabor Fitness</h1>
              <div className="flex items-center text-sm md:text-base text-white/90 mt-1">
                <Utensils className="h-4 w-4 mr-1" />
                <span>Jantas Fitness</span>
                <span className="mx-2">•</span>
                <Clock className="h-4 w-4 mr-1" />
                <span>19:00 - 22:00</span>
              </div>
              <div className="flex items-center text-xs md:text-sm mt-2">
                <span className="bg-green-500 text-white px-2 py-0.5 rounded-full">Entrega Grátis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 md:px-8 lg:px-12 max-w-7xl mx-auto">
        {/* Menu Items */}
        <div className="mt-6">
          <h2 className="text-xl md:text-2xl font-bold text-neutral-800 mb-4">Pratos Principais</h2>
          <MenuItemList />
        </div>
      </div>

      {/* Cart Button */}
      <CartButton />
    </main>
  )
}

