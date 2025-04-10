"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/components/auth-provider"
import { LinkIcon } from "lucide-react"

export function MainNav() {
  const pathname = usePathname()
  const { user } = useAuth()

  const isActive = (path: string) => pathname === path

  return (
    <div className="flex items-center space-x-4 lg:space-x-6">
      <Link href="/" className="flex items-center space-x-2">
        <LinkIcon className="h-6 w-6" />
        <span className="font-bold text-xl">DevParapalli's URL Shortener</span>
      </Link>

      {user && (
        <>
          <nav className="flex items-center space-x-4 lg:space-x-6">
            <Link
              href="/dashboard"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive("/dashboard") ? "text-primary" : "text-muted-foreground",
              )}
            >
              Dashboard
            </Link>
            <Link
              href="/links/create"
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                isActive("/links/create") ? "text-primary" : "text-muted-foreground",
              )}
            >
              Create Link
            </Link>
          </nav>
        </>
      )}
    </div>
  )
}
