import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, LinkIcon, BarChart, Shield } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)]">
      <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48">
        <div className="w-full px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_400px] lg:gap-12 xl:grid-cols-[1fr_600px]">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none">
                  Shorten, Share, and Track Your Links
                </h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  DevParapalli's URL Shortener makes it easy to create short, memorable links that you can share anywhere. Track clicks and
                  analyze your link performance.
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <Link href="/dashboard">
                  <Button size="lg" className="gap-1.5">
                    Get Started
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/auth/login">
                  <Button size="lg" variant="outline">
                    Log in
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <div className="relative h-[450px] w-full overflow-hidden rounded-xl bg-muted p-4 shadow-lg">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-muted-foreground/20" />
                <div className="relative z-10 flex h-full flex-col items-center justify-center space-y-4 text-center">
                  <LinkIcon className="h-16 w-16 text-primary" />
                  <h2 className="text-2xl font-bold">Your Links, Your Way</h2>
                  <p className="text-muted-foreground">
                    Create custom short links that reflect your brand and are easy to remember.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="w-full py-12 md:py-24 lg:py-32 bg-muted">
        <div className="w-full px-4 md:px-6">
          <div className="flex flex-col items-center justify-center space-y-4 text-center">
            <div className="space-y-2">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">Features</h2>
              <p className="max-w-[900px] text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Everything you need to manage and track your links
              </p>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-6 py-12 md:grid-cols-3">
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <LinkIcon className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Custom Short Links</h3>
              <p className="text-center text-muted-foreground">
                Create memorable, branded short links that are easy to share.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <BarChart className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Detailed Analytics</h3>
              <p className="text-center text-muted-foreground">
                Track clicks, referrers, and other metrics to optimize your links.
              </p>
            </div>
            <div className="flex flex-col items-center space-y-2 rounded-lg border p-6 shadow-sm">
              <Shield className="h-12 w-12 text-primary" />
              <h3 className="text-xl font-bold">Secure & Reliable</h3>
              <p className="text-center text-muted-foreground">
                Your links are always available and protected with our secure infrastructure.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
