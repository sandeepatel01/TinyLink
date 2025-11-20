import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface HealthStatus {
  ok: boolean;
  version: string;
  database: string;
  timestamp: string;
  environment: string;
  error?: string;
}

async function getHealthStatus(): Promise<HealthStatus> {
  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
      }/api/healthz`,
      {
        next: { revalidate: 30 }, // 30 seconds cache
      }
    );

    if (!response.ok) {
      throw new Error("Health check failed");
    }

    return await response.json();
  } catch (error) {
    return {
      ok: false,
      version: "1.0",
      database: "disconnected",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      error: "Failed to fetch health status",
    };
  }
}

export default async function HealthPage() {
  const healthStatus = await getHealthStatus();

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "connected":
      case "healthy":
        return "bg-green-100 text-green-800 border-green-200";
      case "disconnected":
      case "unhealthy":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "connected":
      case "healthy":
        return "🟢";
      case "disconnected":
      case "unhealthy":
        return "🔴";
      default:
        return "🟡";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            System Health
          </h1>
          <p className="text-lg text-gray-600">
            Real-time status of TinyLink services
          </p>
        </div>

        {/* Main Status Card */}
        <Card className="mb-6">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl flex items-center justify-center gap-2">
              Overall System Status
              <Badge
                variant={healthStatus.ok ? "default" : "destructive"}
                className="text-sm"
              >
                {healthStatus.ok ? "OPERATIONAL" : "DEGRADED"}
              </Badge>
            </CardTitle>
            <CardDescription>
              Last checked: {new Date(healthStatus.timestamp).toLocaleString()}
            </CardDescription>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Database</span>
                <Badge className={getStatusColor(healthStatus.database)}>
                  {getStatusIcon(healthStatus.database)}{" "}
                  {healthStatus.database.toUpperCase()}
                </Badge>
              </CardTitle>
              <CardDescription>PostgreSQL connection status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Provider:</span>
                  <span className="font-medium">Neon PostgreSQL</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span
                    className={`font-medium ${
                      healthStatus.database === "connected"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {healthStatus.database}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Application</span>
                <Badge
                  className={
                    healthStatus.ok
                      ? "bg-green-100 text-green-800 border-green-200"
                      : "bg-red-100 text-red-800 border-red-200"
                  }
                >
                  {healthStatus.ok ? "🟢 HEALTHY" : "🔴 UNHEALTHY"}
                </Badge>
              </CardTitle>
              <CardDescription>Next.js application server</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Environment:</span>
                  <span className="font-medium capitalize">
                    {healthStatus.environment}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Version:</span>
                  <span className="font-medium">{healthStatus.version}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>System Information</CardTitle>
            <CardDescription>
              Technical details and configuration
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-gray-700 mb-2">
                  Runtime Information
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Node.js:</span>
                    <span className="font-mono">v{process.version}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Platform:</span>
                    <span className="font-mono">{process.platform}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Architecture:</span>
                    <span className="font-mono">{process.arch}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-700 mb-2">
                  Application URLs
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Dashboard:</span>
                    <Link
                      href="/"
                      className="text-blue-600 hover:underline font-mono"
                    >
                      /
                    </Link>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Health:</span>
                    <a
                      href="/api/healthz"
                      className="text-blue-600 hover:underline font-mono"
                    >
                      /api/healthz
                    </a>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Docs:</span>
                    <span className="text-gray-400 font-mono">/api/links</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {healthStatus.error && (
          <Card className="mt-6 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                ⚠️ System Error
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-red-600">{healthStatus.error}</p>
              <p className="text-red-500 text-sm mt-2">
                Please check your database connection and environment variables.
              </p>
            </CardContent>
          </Card>
        )}

        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
          >
            Refresh Status
          </button>
        </div>

        <div className="text-center mt-8 text-gray-500 text-sm">
          <p>Health checks are performed automatically every 30 seconds</p>
          <p className="mt-1">
            TinyLink v{healthStatus.version} • {healthStatus.environment}
          </p>
        </div>
      </div>
    </div>
  );
}
