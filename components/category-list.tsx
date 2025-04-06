"use client"

import { useState, useRef, useEffect } from "react"
import { FlameIcon as Fire, Award, Salad, Coffee } from "lucide-react"
import { cn } from "@/lib/utils"
import { useMediaQuery } from "@/hooks/use-media-query"

const categories = [
  { id: "destaques", name: "Destaques", icon: Award },
  { id: "principais", name: "Pratos Principais", icon: Fire },
  { id: "lowcarb", name: "Low Carb", icon: Salad },
  { id: "bebidas", name: "Bebidas", icon: Coffee },
]

export default function CategoryList() {
  const [activeCategory, setActiveCategory] = useState("destaques")
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  // Scroll active category into view on mobile
  useEffect(() => {
    if (!isDesktop) {
      const activeElement = document.getElementById(`category-${activeCategory}`)
      if (activeElement && scrollContainerRef.current) {
        const container = scrollContainerRef.current
        const scrollLeft = activeElement.offsetLeft - container.offsetWidth / 2 + activeElement.offsetWidth / 2
        container.scrollTo({ left: scrollLeft, behavior: "smooth" })
      }
    }
  }, [activeCategory, isDesktop])

  return (
    <div
      ref={scrollContainerRef}
      className="flex overflow-x-auto py-4 gap-3 no-scrollbar sticky top-0 bg-neutral-50 z-10 -mx-4 md:-mx-8 lg:-mx-12 px-4 md:px-8 lg:px-12 md:justify-center"
    >
      {categories.map((category) => {
        const Icon = category.icon
        return (
          <a
            key={category.id}
            id={`category-${category.id}`}
            href={`#${category.id}`}
            className={cn(
              "flex items-center justify-center p-3 rounded-xl transition-colors",
              isDesktop ? "min-w-[180px]" : "min-w-[140px]",
              activeCategory === category.id
                ? "bg-green-600 text-white"
                : "bg-white text-neutral-700 border border-neutral-200 hover:bg-neutral-100",
            )}
            onClick={(e) => {
              e.preventDefault()
              setActiveCategory(category.id)
              document.getElementById(category.id)?.scrollIntoView({ behavior: "smooth", block: "start" })
            }}
          >
            <Icon className="h-5 w-5 mr-2" />
            <span className="font-medium">{category.name}</span>
          </a>
        )
      })}
    </div>
  )
}

