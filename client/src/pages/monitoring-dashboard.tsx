// Production monitoring dashboard for admins
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, Activity, Users, Database, Server, Cpu, CheckCircle, XCircle, Clock, Bot, Play, Square, RotateCcw } from "lucide-react";
import MonitoringService from "@/lib/monitoring";
import { apiRequest } from "@/lib/queryClient";

interface HealthStatus {
  status: string;
  timestamp: string;
  uptime: number;
  memory: any;
  services: any;
  version: string;
  environment: string;
}

interface Metrics {
  timestamp: string;
  uptime: number;
  memory: any;
  cpu: any;
  activeConnections: number;
  requestCount: number;
  averageResponseTime: number;
}

interface SchedulerStatus {
  enabled: boolean;
  nextRunAt: string | null;
  lastRunAt: string | null;
  currentCategory: string | null;
  stats: {
    totalRuns: number;
    totalQuestionsGenerated: number;
    lastError?: string;
  };
  minutesUntilNext: number | null;
  uptime: number;
  serverTime: string;
  environment: string;
}

export default function MonitoringDashboard() {
  const [healthStatus, setHealthStatus] = useState<HealthStatus | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [errors, setErrors] = useState<any[]>([]);
  const [schedulerStatus, setSchedulerStatus] = useState<SchedulerStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [schedulerLoading, setSchedulerLoading] = useState(false);

  const monitoring = MonitoringService.getInstance();

  useEffect(() => {
    fetchHealthStatus();
    fetchMetrics();
    fetchRecentErrors();
    fetchSchedulerStatus();
    
    // Set up real-time updates
    const interval = setInterval(() => {
      fetchHealthStatus();
      fetchMetrics();
      fetchSchedulerStatus();
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchHealthStatus = async () => {
    try {
      const response = await fetch('/health');
      const data = await response.json();
      setHealthStatus(data);
    } catch (error) {
      console.error('Failed to fetch health status:', error);
    }
  };

  const fetchMetrics = async () => {
    try {
      const response = await fetch('/api/metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Failed to fetch metrics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentErrors = () => {
    // Get errors from monitoring service
    const errorList = monitoring.errors || [];
    const cutoff = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
    const recentErrors = errorList.filter(error => error.timestamp > cutoff).slice(-50);
    setErrors(recentErrors);
  };

  const fetchSchedulerStatus = async () => {
    try {
      const response = await apiRequest('/api/admin/scheduler/status');
      if (response.success) {
        setSchedulerStatus(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch scheduler status:', error);
    }
  };

  const handleSchedulerControl = async (action: 'start' | 'stop') => {
    setSchedulerLoading(true);
    try {
      const response = await apiRequest(`/api/admin/scheduler/${action}`, {
        method: 'POST'
      });
      if (response.success) {
        await fetchSchedulerStatus(); // Refresh status
        monitoring.logSuccess(`Scheduler ${action}ed successfully`);
      } else {
        monitoring.logError(new Error(response.message || `Failed to ${action} scheduler`));
      }
    } catch (error) {
      console.error(`Scheduler ${action} error:`, error);
      monitoring.logError(error as Error);
    } finally {
      setSchedulerLoading(false);
    }
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${minutes}m`;
  };

  const formatBytes = (bytes: number) => {
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'critical': return <XCircle className="w-4 h-4 text-red-600" />;
      default: return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading monitoring data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">BilgiBite Monitoring Dashboard</h1>
          <p className="text-muted-foreground">Real-time application health and performance monitoring</p>
        </div>
        <Badge variant={healthStatus?.status === 'healthy' ? 'default' : 'destructive'} className="text-lg px-4 py-2">
          {healthStatus?.status || 'Unknown'}
        </Badge>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getStatusIcon(healthStatus?.status || 'unknown')}
              <div className="text-2xl font-bold">{healthStatus?.status || 'Unknown'}</div>
            </div>
            <p className="text-xs text-muted-foreground">
              Uptime: {healthStatus ? formatUptime(healthStatus.uptime) : 'N/A'}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics ? formatBytes(metrics.memory.used) : 'N/A'}
            </div>
            <Progress 
              value={metrics ? (metrics.memory.used / metrics.memory.total) * 100 : 0} 
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground">
              of {metrics ? formatBytes(metrics.memory.total) : 'N/A'} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Count</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{errors.length}</div>
            <p className="text-xs text-muted-foreground">
              Last 24 hours
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Version</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{healthStatus?.version || 'N/A'}</div>
            <p className="text-xs text-muted-foreground">
              Environment: {healthStatus?.environment || 'N/A'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="health" className="space-y-4">
        <TabsList>
          <TabsTrigger value="health">Health Status</TabsTrigger>
          <TabsTrigger value="metrics">Performance Metrics</TabsTrigger>
          <TabsTrigger value="errors">Error Logs</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Health Overview</CardTitle>
              <CardDescription>
                Current system status and vital signs
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {healthStatus && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <h4 className="font-medium">Server Information</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Status:</span>
                        <span className={getStatusColor(healthStatus.status)}>
                          {healthStatus.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Uptime:</span>
                        <span>{formatUptime(healthStatus.uptime)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Version:</span>
                        <span>{healthStatus.version}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Environment:</span>
                        <span>{healthStatus.environment}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Memory Usage</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>RSS:</span>
                        <span>{formatBytes(healthStatus.memory.rss)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Heap Used:</span>
                        <span>{formatBytes(healthStatus.memory.heapUsed)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Heap Total:</span>
                        <span>{formatBytes(healthStatus.memory.heapTotal)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>External:</span>
                        <span>{formatBytes(healthStatus.memory.external)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>
                Real-time application performance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              {metrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded">
                    <Cpu className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                    <div className="text-2xl font-bold">
                      {(metrics.cpu.user / 1000).toFixed(2)}ms
                    </div>
                    <div className="text-sm text-muted-foreground">CPU User Time</div>
                  </div>

                  <div className="text-center p-4 border rounded">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-green-600" />
                    <div className="text-2xl font-bold">
                      {metrics.averageResponseTime}ms
                    </div>
                    <div className="text-sm text-muted-foreground">Avg Response Time</div>
                  </div>

                  <div className="text-center p-4 border rounded">
                    <Activity className="w-8 h-8 mx-auto mb-2 text-purple-600" />
                    <div className="text-2xl font-bold">
                      {metrics.activeConnections}
                    </div>
                    <div className="text-sm text-muted-foreground">Active Connections</div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="errors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Errors</CardTitle>
              <CardDescription>
                Application errors and monitoring alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {errors.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-600" />
                    <p>No errors recorded in the last 24 hours</p>
                  </div>
                ) : (
                  errors.map((error, index) => (
                    <div key={index} className="p-3 border rounded-lg space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant={error.severity === 'critical' ? 'destructive' : 'secondary'}>
                          {error.severity}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          {new Date(error.timestamp).toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm">
                        <div className="font-medium">{error.message}</div>
                        <div className="text-muted-foreground">URL: {error.url}</div>
                        {error.context && (
                          <div className="text-muted-foreground">Context: {error.context}</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Service Status</CardTitle>
              <CardDescription>
                Status of external services and dependencies
              </CardDescription>
            </CardHeader>
            <CardContent>
              {healthStatus?.services && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {Object.entries(healthStatus.services).map(([service, status]) => (
                    <div key={service} className="flex items-center justify-between p-3 border rounded">
                      <div className="flex items-center space-x-2">
                        <Database className="w-4 h-4" />
                        <span className="capitalize">{service.replace('_', ' ')}</span>
                      </div>
                      <Badge variant={status === 'healthy' ? 'default' : 'destructive'}>
                        {status as string}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleString()}
        </p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Refresh Data
        </Button>
      </div>
    </div>
  );
}