"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/contexts/cart-context"

export default function Header() {
  const pathname = usePathname()
  const { getTotalItems } = useCart()
  const itemCount = getTotalItems()

  // Don't show on checkout or order pages
  if (pathname !== "/" && !pathname.startsWith("/category/")) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-20 flex gap-2">
      <Button
        asChild
        variant="outline"
        size="icon"
        className="h-10 w-10 rounded-full bg-white shadow-md border-neutral-200"
      >
        <Link href="/meus-pedidos">
          <User className="h-5 w-5 text-green-600" />
        </Link>
      </Button>
    </div>
  )
}

