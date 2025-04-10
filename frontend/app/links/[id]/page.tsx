"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Copy, ExternalLink } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { analyticsApi, type UrlAnalytics } from "@/lib/api-client"
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Legend, ResponsiveContainer, BarChart, Bar } from "recharts"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

export default function LinkDetailsPage() {
  const [analytics, setAnalytics] = useState<UrlAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()
  const id = params.id as string

  useEffect(() => {
    // Fetch link analytics
    const fetchAnalytics = async () => {
      try {
        setIsLoading(true)
        const response = await analyticsApi.getUrlAnalytics(id)

        if (response.success && response.data) {
          setAnalytics(response.data)
        } else {
          toast({
            title: "Error",
            description: response.message || "Failed to load link analytics. Please try again.",
            variant: "destructive",
          })
        }
      } catch (error) {
        console.error("Failed to fetch link analytics:", error)
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [id, toast])

  const copyToClipboard = (shortCode: string) => {
    const baseUrl = window.location.origin
    const fullUrl = `${baseUrl}/${shortCode}`
    navigator.clipboard.writeText(fullUrl)
    toast({
      title: "Copied to clipboard",
      description: "The link has been copied to your clipboard.",
    })
  }

  const goToDashboard = () => {
    router.push("/dashboard")
  }

  return (
    <div className="w-full py-10">
      <div className="flex items-center mb-8">
        <Button variant="ghost" size="icon" onClick={goToDashboard} className="mr-4">
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Back to dashboard</span>
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Link Analytics</h1>
          <p className="text-muted-foreground">View detailed analytics for your link</p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-[200px] w-full" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
            <Skeleton className="h-[100px] w-full" />
          </div>
          <Skeleton className="h-[300px] w-full" />
        </div>
      ) : analytics ? (
        <>
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Link Information</CardTitle>
              <CardDescription>Details about your shortened link</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Short URL</h3>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium">
                      {window.location.origin}/{analytics.url.customAlias || analytics.url.shortCode}
                    </p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(analytics.url.customAlias || analytics.url.shortCode)}
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a
                        href={`${window.location.origin}/${analytics.url.customAlias || analytics.url.shortCode}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Open</span>
                      </a>
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Original URL</h3>
                  <div className="flex items-center space-x-2">
                    <p className="font-medium truncate max-w-[300px]">{analytics.url.originalUrl}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => copyToClipboard(analytics.url.originalUrl)}
                    >
                      <Copy className="h-4 w-4" />
                      <span className="sr-only">Copy</span>
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                      <a href={analytics.url.originalUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                        <span className="sr-only">Open</span>
                      </a>
                    </Button>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Created</h3>
                  <p className="font-medium">{new Date(analytics.url.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Total Clicks</h3>
                  <p className="font-medium">{analytics.url.clicks}</p>
                </div>
                {analytics.url.expiresAt && (
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Expires</h3>
                    <p className="font-medium">{new Date(analytics.url.expiresAt).toLocaleDateString()}</p>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <p className="font-medium">{analytics.url.active ? "Active" : "Inactive"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="overview" className="mb-8">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="devices">Devices & Browsers</TabsTrigger>
              <TabsTrigger value="locations">Locations</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>Clicks Over Time</CardTitle>
                  <CardDescription>View how your link has performed over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ChartContainer
                      config={{
                        clicks: {
                          label: "Clicks",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={analytics.clicksByDate} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis
                            dataKey="date"
                            tickFormatter={(value) =>
                              new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
                            }
                          />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Line
                            type="monotone"
                            dataKey="count"
                            name="Clicks"
                            stroke="var(--color-clicks)"
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="devices">
              <Card>
                <CardHeader>
                  <CardTitle>Devices & Browsers</CardTitle>
                  <CardDescription>See what devices and browsers your visitors are using</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-8 md:grid-cols-2">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Devices</h3>
                      <div className="h-[300px]">
                        <ChartContainer
                          config={{
                            devices: {
                              label: "Devices",
                              color: "hsl(var(--chart-1))",
                            },
                          }}
                          className="h-[300px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={analytics.clicksByDevice}
                              layout="vertical"
                              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis type="category" dataKey="deviceType" />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Legend />
                              <Bar dataKey="count" name="Clicks" fill="var(--color-devices)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium mb-4">Browsers</h3>
                      <div className="h-[300px]">
                        <ChartContainer
                          config={{
                            browsers: {
                              label: "Browsers",
                              color: "hsl(var(--chart-2))",
                            },
                          }}
                          className="h-[300px]"
                        >
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                              data={analytics.clicksByBrowser}
                              layout="vertical"
                              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
                            >
                              <CartesianGrid strokeDasharray="3 3" />
                              <XAxis type="number" />
                              <YAxis type="category" dataKey="browser" />
                              <ChartTooltip content={<ChartTooltipContent />} />
                              <Legend />
                              <Bar dataKey="count" name="Clicks" fill="var(--color-browsers)" />
                            </BarChart>
                          </ResponsiveContainer>
                        </ChartContainer>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="locations">
              <Card>
                <CardHeader>
                  <CardTitle>Geographic Distribution</CardTitle>
                  <CardDescription>See where your visitors are located</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px] w-full">
                    <ChartContainer
                      config={{
                        countries: {
                          label: "Countries",
                          color: "hsl(var(--chart-1))",
                        },
                      }}
                      className="h-[300px]"
                    >
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={analytics.clicksByCountry} margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" />
                          <YAxis type="category" dataKey="country" />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Legend />
                          <Bar dataKey="count" name="Clicks" fill="var(--color-countries)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between">
            <Button variant="outline" onClick={goToDashboard}>
              Back to Dashboard
            </Button>
            <Link href={`/links/${id}/edit`}>
              <Button>Edit Link</Button>
            </Link>
          </div>
        </>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-muted-foreground mb-4">Link not found</p>
            <Button onClick={goToDashboard}>Back to Dashboard</Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
