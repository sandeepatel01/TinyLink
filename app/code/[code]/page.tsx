"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface LinkStats {
  id: string;
  code: string;
  url: string;
  shortUrl: string;
  clicks: number;
  lastClicked: string | null;
  createdAt: string;
}

export default function StatsPage() {
  const params = useParams();
  const router = useRouter();
  const [stats, setStats] = useState<LinkStats | null>(null);
  const [loading, setLoading] = useState(true);

  const code = params.code as string;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/links/${code}`);
        const result = await response.json();

        if (result.success) {
          setStats(result.data);
        } else {
          console.log("Link not found");
          router.push("/");
        }
      } catch (error) {
        console.log("Failed to fetch link statistics", error);
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    if (code) {
      fetchStats();
    }
  }, [code, router]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    console.log("Link copied to clipboard");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6">
            <p className="text-gray-500">Link not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <Button variant="outline" onClick={() => router.push("/")}>
              ← Back to Dashboard
            </Button>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Link Statistics</h1>
        </div>

        {/* Link Info Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Link Information</CardTitle>
            <CardDescription>
              Details and analytics for your shortened URL
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Short Code
                </label>
                <div className="flex items-center space-x-2 mt-1">
                  <code className="bg-gray-100 px-3 py-2 rounded text-sm font-mono">
                    {stats.code}
                  </code>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(stats.shortUrl)}
                  >
                    Copy
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Total Clicks
                </label>
                <div className="text-2xl font-bold text-gray-900 mt-1">
                  {stats.clicks}
                </div>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">
                Destination URL
              </label>
              <div className="mt-1 p-3 bg-gray-50 rounded border break-all">
                {stats.url}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Created
                </label>
                <div className="mt-1 text-gray-900">
                  {formatDate(stats.createdAt)}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Last Clicked
                </label>
                <div className="mt-1 text-gray-900">
                  {stats.lastClicked ? formatDate(stats.lastClicked) : "Never"}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Analytics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Click Through Rate</span>
                  <span className="font-semibold">
                    {stats.clicks > 0 ? "Active" : "No clicks yet"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status</span>
                  <span className="font-semibold text-green-600">Active</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                className="w-full"
                onClick={() => window.open(stats.shortUrl, "_blank")}
              >
                Test Redirect
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => copyToClipboard(stats.url)}
              >
                Copy Original URL
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
