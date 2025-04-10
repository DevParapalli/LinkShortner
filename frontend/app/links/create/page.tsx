"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Switch } from "@/components/ui/switch"
import { Loader2, LinkIcon, Calendar } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { urlsApi } from "@/lib/api-client"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"

export default function CreateLinkPage() {
  const [originalUrl, setOriginalUrl] = useState("")
  const [customAlias, setCustomAlias] = useState("")
  const [useCustomAlias, setUseCustomAlias] = useState(false)
  const [useExpiration, setUseExpiration] = useState(false)
  const [expirationDate, setExpirationDate] = useState<Date | undefined>(undefined)
  const [isLoading, setIsLoading] = useState(false)
  const [generatedLink, setGeneratedLink] = useState<string | null>(null)
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

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
        setIsLoading(false)
        return
      }

      // Prepare request data
      const requestData = {
        originalUrl,
        ...(useCustomAlias && customAlias ? { customAlias } : {}),
        ...(useExpiration && expirationDate ? { expiresAt: expirationDate.toISOString() } : {}),
      }

      // Create the URL
      const response = await urlsApi.createUrl(requestData)
      console.log("Response from API:", response)
      if (response.success && response.data) {
        const baseUrl = 'ls.parapalli.dev'
        const shortCode = response.data.customAlias || response.data.shortCode
        const fullShortUrl = `${baseUrl}/${shortCode}`

        setGeneratedLink(fullShortUrl)

        toast({
          title: "Link created",
          description: "Your short link has been created successfully.",
        })

        // Optionally redirect to dashboard after a delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        toast({
          title: "Error creating link",
          description: response.message || "Failed to create link. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to create URL:", error)
      toast({
        title: "Error creating link",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink)
      toast({
        title: "Copied to clipboard",
        description: "The link has been copied to your clipboard.",
      })
    }
  }

  const goToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="w-full py-10">
      <div className="flex items-center justify-between mb-8">
        <div className="flex flex-col space-y-2 items-center w-full">
          <h1 className="text-3xl font-bold tracking-tight">Create Link</h1>
          <p className="text-muted-foreground">Create a new shortened link</p>
        </div>
      </div>

      <div className="mx-auto max-w-2xl">
        <Tabs defaultValue="create">
          {/* <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="create">Create Link</TabsTrigger>
            <TabsTrigger value="bulk" disabled>
              Bulk Create (WIP)
            </TabsTrigger>
          </TabsList> */}
          <TabsContent value="create">
            <Card>
              <form onSubmit={handleSubmit}>
                <CardHeader>
                  <CardTitle>Create a new short link</CardTitle>
                  <CardDescription>Enter a long URL to create a shortened, easy-to-share link</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="original-url">Original URL</Label>
                    <Input
                      id="original-url"
                      placeholder="https://example.com/very/long/url/that/needs/shortening"
                      value={originalUrl}
                      onChange={(e) => setOriginalUrl(e.target.value)}
                      required
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Switch id="custom-alias" checked={useCustomAlias} onCheckedChange={setUseCustomAlias} />
                    <Label htmlFor="custom-alias">Use custom alias</Label>
                  </div>

                  {useCustomAlias && (
                    <div className="space-y-2">
                      <Label htmlFor="custom-alias-input">Custom Alias</Label>
                      <div className="flex items-center space-x-2">
                        <div className="flex-shrink-0 text-muted-foreground">ls.parapalli.dev/</div>
                        <Input
                          id="custom-alias-input"
                          placeholder="my-custom-link"
                          value={customAlias}
                          onChange={(e) => setCustomAlias(e.target.value)}
                          className="flex-1"
                        />
                      </div>
                    </div>
                  )}

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

                  {generatedLink && (
                    <div className="rounded-lg border p-4 mt-4">
                      <div className="space-y-2">
                        <Label>Your shortened link</Label>
                        <div className="flex items-center space-x-2">
                          <Input value={generatedLink} readOnly className="flex-1" />
                          <Button type="button" variant="outline" onClick={copyToClipboard}>
                            Copy
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button type="button" variant="outline" onClick={goToDashboard}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isLoading || !originalUrl}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="mr-2 h-4 w-4" />
                        Create Link
                      </>
                    )}
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
