import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Home } from "lucide-react"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="text-6xl font-bold text-emerald-600">404</h1>
      <h2 className="text-2xl font-semibold mt-4">Página não encontrada</h2>
      <p className="text-gray-600 mt-2 max-w-md">
        Desculpe, não conseguimos encontrar a página que você está procurando.
      </p>
      <Button asChild className="mt-8 bg-emerald-600 hover:bg-emerald-700">
        <Link href="/">
          <Home className="mr-2 h-4 w-4" />
          Voltar para o início
        </Link>
      </Button>
    </div>
  )
}

