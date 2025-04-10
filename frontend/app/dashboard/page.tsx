"use client"

import { useState, useEffect } from "react"
import NextLink from "next/link"
import { useAuth } from "@/components/auth-provider"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Switch } from "@/components/ui/switch"
import { BarChart3, Copy, Edit, MoreHorizontal, Plus, Trash2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { type Url, urlsApi, analyticsApi, type UserAnalytics } from "@/lib/api-client"

export default function DashboardPage() {
  const [urls, setUrls] = useState<Url[]>([])
  const [analytics, setAnalytics] = useState<UserAnalytics | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    // Fetch URLs and analytics
    const fetchData = async () => {
      try {
        setIsLoading(true)

        // Fetch URLs
        const urlsResponse = await urlsApi.getUserUrls()
        if (urlsResponse.success && urlsResponse.data) {
          setUrls(urlsResponse.data)
        }

        // Fetch analytics
        const analyticsResponse = await analyticsApi.getUserAnalytics()
        if (analyticsResponse.success && analyticsResponse.data) {
          setAnalytics(analyticsResponse.data)
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [toast])

  const copyToClipboard = (shortCode: string) => {
    const baseUrl = window.location.origin
    const fullUrl = `${baseUrl}/${shortCode}`
    navigator.clipboard.writeText(fullUrl)
    toast({
      title: "Copied to clipboard",
      description: "The link has been copied to your clipboard.",
    })
  }

  const deleteUrl = async (id: string) => {
    try {
      const response = await urlsApi.deleteUrl(id)
      if (response.success) {
        setUrls(urls.filter((url) => url.id !== id))
        toast({
          title: "Link deleted",
          description: "The link has been deleted successfully.",
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to delete link. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to delete URL:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  const toggleUrlStatus = async (id: string, active: boolean) => {
    try {
      const response = await urlsApi.updateUrlStatus(id, active)
      if (response.success && response.data) {
        setUrls(urls.map((url) => (url.id === id ? response.data! : url)))
        toast({
          title: active ? "Link activated" : "Link deactivated",
          description: `The link has been ${active ? "activated" : "deactivated"} successfully.`,
        })
      } else {
        toast({
          title: "Error",
          description: response.message || "Failed to update link status. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to update URL status:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="w-full container mx-auto py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Manage and track your shortened links</p>
        </div>
        <NextLink href="/links/create">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Link
          </Button>
        </NextLink>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Links</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M13.5 3H12H8C6.34315 3 5 4.34315 5 6V18C5 19.6569 6.34315 21 8 21H16C17.6569 21 19 19.6569 19 18V8.625M13.5 3L19 8.625M13.5 3V8.625H19" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : analytics?.totalUrls || urls.length}
            </div>
            <div className="text-xs text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-4 w-24 mt-1" />
              ) : (
                `${analytics?.totalUrls || urls.length} active links`
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? <Skeleton className="h-8 w-16" /> : analytics?.totalClicks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? (
                <Skeleton className="h-4 w-24 mt-1" />
              ) : (
                `${analytics?.totalClicks || 0} total clicks across all links`
              )}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Clicks</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : analytics?.totalUrls ? (
                Math.round(analytics.totalClicks / analytics.totalUrls)
              ) : (
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? <Skeleton className="h-4 w-24 mt-1" /> : `Average clicks per link`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Performing</CardTitle>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              className="h-4 w-4 text-muted-foreground"
            >
              <path d="M16 18V6m-8 6v6M8 6v4" />
            </svg>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {isLoading ? (
                <Skeleton className="h-8 w-16" />
              ) : analytics?.topUrls && analytics.topUrls.length > 0 ? (
                analytics.topUrls[0].clicks
              ) : (
                0
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {isLoading ? <Skeleton className="h-4 w-24 mt-1" /> : `Clicks on your best link`}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Your Links</CardTitle>
          <CardDescription>View and manage all your shortened links</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : urls.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <p className="text-muted-foreground mb-4">You haven't created any links yet</p>
              <NextLink href="/links/create">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create your first link
                </Button>
              </NextLink>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Short URL</TableHead>
                  <TableHead>Original URL</TableHead>
                  <TableHead>Clicks</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {urls.map((url) => {
                  const baseUrl = window.location.origin
                  const fullShortUrl = `${baseUrl}/${url.customAlias || url.shortCode}`

                  return (
                    <TableRow key={url.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{url.customAlias || url.shortCode}</span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => copyToClipboard(url.customAlias || url.shortCode)}
                          >
                            <Copy className="h-3 w-3" />
                            <span className="sr-only">Copy</span>
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">{url.originalUrl}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{url.clicks}</Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={url.active}
                          onCheckedChange={(checked) => toggleUrlStatus(url.id, checked)}
                          aria-label={url.active ? "Active" : "Inactive"}
                        />
                      </TableCell>
                      <TableCell>{new Date(url.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => copyToClipboard(url.customAlias || url.shortCode)}>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy link
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <NextLink href={`/links/${url.id}`}>
                                <BarChart3 className="mr-2 h-4 w-4" />
                                View analytics
                              </NextLink>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <NextLink href={`/links/${url.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit link
                              </NextLink>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => deleteUrl(url.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete link
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
