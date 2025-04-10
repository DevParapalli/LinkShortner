"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { urlsApi, type Url } from "@/lib/api-client"
import { ExternalLink, AlertCircle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export default function ShortUrlRedirectPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [url, setUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [clickData, setClickData] = useState<Record<string, any> | null>(null)
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()

  // Extract the short code from the slug
  const slug = Array.isArray(params.slug) ? params.slug.join("/") : params.slug

  useEffect(() => {
    const checkShortUrl = async () => {
      try {
        setIsLoading(true)

        // Collect information about the click
        const clickInfo = {
          timestamp: new Date().toISOString(),
          ipAddress: "127.0.0.1", // Simulated IP
          deviceType: getDeviceType(),
          browser: getBrowser(),
          operatingSystem: getOS(),
          country: "Unknown", // Would be determined server-side
          city: "Unknown", // Would be determined server-side
          referrer: document.referrer || "Direct",
        }

        setClickData(clickInfo)

        // Check if the short URL exists
        const response = await urlsApi.getUrlByShortCode(slug ?? "")
        console.log(response.data)
        if (response.success && response.data?.originalUrl) {
          setUrl(response.data.originalUrl)

          // The click is recorded by the server during the redirect request. 
          // This does not immediately redirect, to show the extracted user info.
          // window.location.href = response.data.url.originalUrl
        } else {
          setError(response.message || "Short URL not found")
        }
      } catch (error) {
        console.error("Failed to check short URL:", error)
        setError("An unexpected error occurred")
      } finally {
        setIsLoading(false)
      }
    }

    if (slug) {
      checkShortUrl()
    }
  }, [slug, toast])

  // Helper functions to get browser information
  function getBrowser() {
    const userAgent = navigator.userAgent

    if (userAgent.indexOf("Chrome") > -1) return "Chrome"
    if (userAgent.indexOf("Safari") > -1) return "Safari"
    if (userAgent.indexOf("Firefox") > -1) return "Firefox"
    if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) return "Internet Explorer"
    if (userAgent.indexOf("Edge") > -1) return "Edge"

    return "Unknown"
  }

  function getOS() {
    const userAgent = navigator.userAgent

    if (userAgent.indexOf("Windows") > -1) return "Windows"
    if (userAgent.indexOf("Mac") > -1) return "MacOS"
    if (userAgent.indexOf("Linux") > -1) return "Linux"
    if (userAgent.indexOf("Android") > -1) return "Android"
    if (userAgent.indexOf("iOS") > -1 || userAgent.indexOf("iPhone") > -1 || userAgent.indexOf("iPad") > -1)
      return "iOS"

    return "Unknown"
  }

  function getDeviceType() {
    const userAgent = navigator.userAgent

    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
      (userAgent.includes("Mobile") && userAgent.includes("Safari"))
    ) {
      return "Mobile"
    }

    if (/iPad|Tablet|PlayBook/i.test(userAgent)) {
      return "Tablet"
    }

    return "Desktop"
  }

  const handleRedirect = () => {
    if (url) {
      window.location.href = url
    }
  }

  const goToHome = () => {
    router.push("/")
  }

  if (isLoading) {
    return (
      <div className="w-full flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Redirecting...</CardTitle>
            <CardDescription>Checking short URL</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error || !url) {
    return (
      <div className="w-full flex h-screen items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle>Link Not Found</CardTitle>
            </div>
            <CardDescription>The short URL you're looking for doesn't exist</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              The link <span className="font-medium">{slug}</span> could not be found or has expired.
            </p>
            <Button onClick={goToHome} className="w-full">
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Redirect Detected</CardTitle>
          <CardDescription>
            You're being redirected to <span className="font-medium truncate block">{url}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg border p-4 bg-muted">
            <h3 className="font-medium mb-2">Click Information (Debug)</h3>
            <div className="space-y-1 text-sm">
              {clickData && (
                <>
                  <p>
                    <span className="font-medium">IP:</span> {clickData.ipAddress}
                  </p>
                  <p>
                    <span className="font-medium">Device:</span> {clickData.deviceType}
                  </p>
                  <p>
                    <span className="font-medium">Browser:</span> {clickData.browser}
                  </p>
                  <p>
                    <span className="font-medium">OS:</span> {clickData.operatingSystem}
                  </p>
                  <p>
                    <span className="font-medium">Referrer:</span> {clickData.referrer}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span> {new Date(clickData.timestamp).toLocaleString()}
                  </p>
                </>
              )}
            </div>
          </div>
          <Button onClick={handleRedirect} className="w-full">
            <ExternalLink className="mr-2 h-4 w-4" />
            Continue to Destination
          </Button>
          <p className="text-xs text-center text-muted-foreground">
            Note: This page has been artificially delayed for demonstration purposes. In a real application, you would be redirected immediately.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
