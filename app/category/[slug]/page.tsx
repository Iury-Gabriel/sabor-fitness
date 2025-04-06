import { notFound } from "next/navigation"
import { ChevronLeft } from "lucide-react"
import Link from "next/link"
import MenuItemList from "@/components/menu-item-list"
import CartButton from "@/components/cart-button"

// Map of category slugs to display names
const categoryNames: Record<string, string> = {
  destaques: "Destaques",
  principais: "Pratos Principais",
  lowcarb: "Low Carb",
  bebidas: "Bebidas",
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { slug } = params

  // Check if the category exists
  if (!categoryNames[slug]) {
    notFound()
  }

  return (
    <main className="pb-24 bg-neutral-50">
      {/* Header */}
      <div className="bg-green-600 text-white p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <Link href="/" className="flex items-center text-white mb-4">
            <ChevronLeft className="h-5 w-5 mr-1" />
            Voltar
          </Link>
          <h1 className="text-xl md:text-2xl font-bold">{categoryNames[slug]}</h1>
        </div>
      </div>

      {/* Menu Items */}
      <div className="max-w-7xl mx-auto p-4 md:p-8 mt-4">
        <MenuItemList category={slug} />
      </div>

      {/* Cart Button */}
      <CartButton />
    </main>
  )
}

