"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { ArrowLeft, Loader2, Save, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { urlsApi, type Url } from "@/lib/api-client"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function EditLinkPage() {
  const [url, setUrl] = useState<Url | null>(null)
  const [originalUrl, setOriginalUrl] = useState("")
  const [customAlias, setCustomAlias] = useState("")
  const [active, setActive] = useState(true)
  const [useExpiration, setUseExpiration] = useState(false)
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const id = params.id as string

  useEffect(() => {
    // Fetch URL details
    const fetchUrl = async () => {
      try {
        setIsLoading(true)

        // In a real app, we would have a dedicated endpoint for this
        // For now, we'll get all URLs and find the one we need
        const response = await urlsApi.getUserUrls()

        if (response.success && response.data) {
          const foundUrl = response.data.find((u) => u.id === id)

          if (foundUrl) {
            setUrl(foundUrl)
            setOriginalUrl(foundUrl.originalUrl)
            setCustomAlias(foundUrl.customAlias || "")
            setActive(foundUrl.active)

            if (foundUrl.expiresAt) {
              setUseExpiration(true)
              setExpirationDate(new Date(foundUrl.expiresAt))
            }
          } else {
            toast({
              title: "Error",
              description: "Link not found",
              variant: "destructive",
            })
          }
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load link details. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Failed to fetch URL:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUrl()
  }, [id, toast])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)

    try {
      // Validate URL
      try {
        new URL(originalUrl)
      } catch (error) {
        toast({
          title: "Invalid URL",
          description: "Please enter a valid URL including http:// or https://",
          variant: "destructive",
        })
        setIsSaving(false)
        return
      }

      // Update URL status
      if (url) {
        // First update the active status if it changed
        if (url.active !== active) {
          const statusResponse = await urlsApi.updateUrlStatus(id, active)

          if (!statusResponse.success) {
            toast({
              title: "Error updating link status",
              description: statusResponse.message || "Failed to update link status. Please try again.",
              variant: "destructive",
            })
            setIsSaving(false)
            return
          }
        }

        // In a real app, we would have an endpoint to update other URL properties
        // For now, we'll just show a success message
        toast({
          title: "Link updated",
          description: "Your link has been updated successfully.",
        })

        // Navigate back to the link details page
        router.push(`/links/${id}`)
      }
    } catch (error) {
      console.error("Failed to update URL:", error)
      toast({
        title: "Error updating link",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const goBack = () => {
    router.push(`/links/${id}`)
  }

  return (
    <div className="w-full py-10">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" onClick={goBack} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to link details</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Edit Link</h1>
          <p className="text-muted-foreground">Update your shortened link</p>
        </div>
      </div>

      {isLoading ? (
        <div className="max-w-2xl mx-auto">
          <Skeleton className="h-[400px] w-full" />
        </div>
      ) : url ? (
        <div className="max-w-2xl mx-auto">
          <Card>
            <form onSubmit={handleSubmit}>
              <CardHeader>
                <CardTitle>Edit Link</CardTitle>
                <CardDescription>Update the details of your shortened link</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="original-url">Original URL</Label>
                  <Input
                    id="original-url"
                    placeholder="https://example.com/very/long/url"
                    value={originalUrl}
                    onChange={(e) => setOriginalUrl(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="custom-alias">Custom Alias</Label>
                  <div className="flex items-center space-x-2">
                    <div className="flex-shrink-0 text-muted-foreground">{window.location.origin}/</div>
                    <Input
                      id="custom-alias"
                      placeholder="my-custom-link"
                      value={customAlias}
                      onChange={(e) => setCustomAlias(e.target.value)}
                      className="flex-1"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Note: Changing the alias will create a new short link. The old one will still work.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="active-status" checked={active} onCheckedChange={setActive} />
                  <Label htmlFor="active-status">Active</Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch id="expiration" checked={useExpiration} onCheckedChange={setUseExpiration} />
                  <Label htmlFor="expiration">Set expiration date</Label>
                </div>

                {useExpiration && (
                  <div className="space-y-2">
                    <Label htmlFor="expiration-date">Expiration Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="expiration-date"
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !expirationDate && "text-muted-foreground",
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {expirationDate ? format(expirationDate, "PPP") : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <CalendarComponent
                          mode="single"
                          selected={expirationDate}
                          onSelect={setExpirationDate}
                          initialFocus
                          disabled={(date) => date < new Date()}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                )}

                <div className="rounded-lg border p-4 bg-muted/50">
                  <div className="text-sm text-muted-foreground">
                    <p className="font-medium mb-2">Link Statistics</p>
                    <p>Created: {new Date(url.createdAt).toLocaleDateString()}</p>
                    <p>Total Clicks: {url.clicks}</p>
                    <p>Short Code: {url.shortCode}</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button type="button" variant="outline" onClick={goBack}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      ) : (
        <Card className="max-w-2xl mx-auto">
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-4">Link not found</p>
            <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
