import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  GraduationCap, 
  TrendingUp, 
  Video, 
  Brain, 
  BarChart3,
  Settings,
  Shield,
  Globe,
  Zap
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useQuery } from '@tanstack/react-query';

interface OrganizationMetrics {
  totalUsers: number;
  activeUsers: number;
  totalCourses: number;
  completionRate: number;
  engagementScore: number;
  aiInteractions: number;
}

interface AIInsights {
  adaptiveLearningActive: number;
  predictiveAnalytics: number;
  contentGenerated: number;
  performanceImprovements: number;
}

export default function EnterpriseDashboard() {
  const [selectedOrg, setSelectedOrg] = useState('demo-org-123');
  
  const { data: metrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['/api/analytics/dashboard', selectedOrg],
    queryFn: () => apiRequest('GET', `/api/analytics/dashboard/${selectedOrg}?startDate=${new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()}&endDate=${new Date().toISOString()}`).then(res => res.json())
  });

  const { data: orgConfig } = useQuery({
    queryKey: ['/api/enterprise/organizations', selectedOrg, 'config'],
    queryFn: () => apiRequest('GET', `/api/enterprise/organizations/${selectedOrg}/config`).then(res => res.json())
  });

  const { data: systemHealth } = useQuery({
    queryKey: ['/api/system/health'],
    queryFn: () => apiRequest('GET', '/api/system/health').then(res => res.json()),
    refetchInterval: 30000 // Refresh every 30 seconds
  });

  const mockMetrics: OrganizationMetrics = {
    totalUsers: 2847,
    activeUsers: 1923,
    totalCourses: 156,
    completionRate: 87.3,
    engagementScore: 94.2,
    aiInteractions: 15742
  };

  const mockAIInsights: AIInsights = {
    adaptiveLearningActive: 1456,
    predictiveAnalytics: 892,
    contentGenerated: 234,
    performanceImprovements: 67.8
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Enterprise Command Center
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              AI-Powered Educational Analytics & Management Platform
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
            <Badge variant="outline" className="px-4 py-2">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
              {systemHealth?.status || 'System Healthy'}
            </Badge>
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Organization Settings
            </Button>
          </div>
        </div>

        {/* Key Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                  <p className="text-3xl font-bold">{mockMetrics.totalUsers.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">+12% from last month</p>
                </div>
                <Users className="w-8 h-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Active Learners</p>
                  <p className="text-3xl font-bold">{mockMetrics.activeUsers.toLocaleString()}</p>
                  <p className="text-sm text-green-600 mt-1">
                    {((mockMetrics.activeUsers / mockMetrics.totalUsers) * 100).toFixed(1)}% engagement
                  </p>
                </div>
                <GraduationCap className="w-8 h-8 text-purple-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">AI Interactions</p>
                  <p className="text-3xl font-bold">{mockMetrics.aiInteractions.toLocaleString()}</p>
                  <p className="text-sm text-blue-600 mt-1">+45% AI utilization</p>
                </div>
                <Brain className="w-8 h-8 text-indigo-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Course Completion</p>
                  <p className="text-3xl font-bold">{mockMetrics.completionRate}%</p>
                  <p className="text-sm text-green-600 mt-1">Above industry avg</p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Advanced Features Dashboard */}
        <Tabs defaultValue="ai-insights" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="ai-insights">AI Insights</TabsTrigger>
            <TabsTrigger value="video-analytics">Video Analytics</TabsTrigger>
            <TabsTrigger value="teacher-tools">Teacher Tools</TabsTrigger>
            <TabsTrigger value="enterprise-features">Enterprise</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="ai-insights" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Brain className="w-5 h-5 mr-2 text-purple-500" />
                  AI-Powered Learning Intelligence
                </CardTitle>
                <CardDescription>
                  Advanced machine learning insights and adaptive learning analytics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">{mockAIInsights.adaptiveLearningActive}</div>
                    <div className="text-sm text-muted-foreground">Students in Adaptive Mode</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{mockAIInsights.predictiveAnalytics}</div>
                    <div className="text-sm text-muted-foreground">Predictive Models Active</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{mockAIInsights.contentGenerated}</div>
                    <div className="text-sm text-muted-foreground">AI-Generated Questions</div>
                  </div>
                  <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{mockAIInsights.performanceImprovements}%</div>
                    <div className="text-sm text-muted-foreground">Performance Improvement</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Adaptive Learning Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">Difficulty Adaptation</span>
                            <span className="text-sm font-medium">94%</span>
                          </div>
                          <Progress value={94} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">Content Personalization</span>
                            <span className="text-sm font-medium">87%</span>
                          </div>
                          <Progress value={87} className="h-2" />
                        </div>
                        <div>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm">Learning Path Optimization</span>
                            <span className="text-sm font-medium">91%</span>
                          </div>
                          <Progress value={91} className="h-2" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Predictive Analytics</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <div>
                            <div className="font-medium text-green-800 dark:text-green-200">High Success Probability</div>
                            <div className="text-sm text-green-600 dark:text-green-400">1,234 students</div>
                          </div>
                          <div className="text-2xl font-bold text-green-600">89%</div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                          <div>
                            <div className="font-medium text-yellow-800 dark:text-yellow-200">At Risk Students</div>
                            <div className="text-sm text-yellow-600 dark:text-yellow-400">156 students</div>
                          </div>
                          <div className="text-2xl font-bold text-yellow-600">5.5%</div>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <div>
                            <div className="font-medium text-blue-800 dark:text-blue-200">Intervention Needed</div>
                            <div className="text-sm text-blue-600 dark:text-blue-400">42 students</div>
                          </div>
                          <div className="text-2xl font-bold text-blue-600">1.5%</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="video-analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Video className="w-5 h-5 mr-2 text-blue-500" />
                  Advanced Video Learning Analytics
                </CardTitle>
                <CardDescription>
                  Interactive video content performance and engagement insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-lg">
                    <Video className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-2xl font-bold">1,247</div>
                    <div className="text-sm text-muted-foreground">Interactive Videos</div>
                    <div className="text-sm text-blue-600 mt-1">+23% this month</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-lg">
                    <BarChart3 className="w-8 h-8 mx-auto mb-2 text-purple-500" />
                    <div className="text-2xl font-bold">87.3%</div>
                    <div className="text-sm text-muted-foreground">Engagement Rate</div>
                    <div className="text-sm text-purple-600 mt-1">Above benchmark</div>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <Zap className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <div className="text-2xl font-bold">45.2k</div>
                    <div className="text-sm text-muted-foreground">Total Watch Hours</div>
                    <div className="text-sm text-green-600 mt-1">+34% growth</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teacher-tools" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <GraduationCap className="w-5 h-5 mr-2 text-green-500" />
                  Teacher Dashboard & Tools
                </CardTitle>
                <CardDescription>
                  Comprehensive instructor tools and student management
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Active Teachers</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span>Total Registered</span>
                        <Badge variant="secondary">847</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span>Active This Month</span>
                        <Badge variant="secondary">623</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span>Premium Users</span>
                        <Badge variant="secondary">387</Badge>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h3 className="font-semibold">Content Creation</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span>Custom Quizzes Created</span>
                        <Badge variant="secondary">2,341</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span>AI-Generated Questions</span>
                        <Badge variant="secondary">15,742</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <span>Lesson Plans</span>
                        <Badge variant="secondary">1,156</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="enterprise-features" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="w-5 h-5 mr-2 text-red-500" />
                  Enterprise Security & Compliance
                </CardTitle>
                <CardDescription>
                  Advanced security features and compliance monitoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-gradient-to-br from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-lg">
                    <Shield className="w-8 h-8 mx-auto mb-2 text-red-500" />
                    <div className="text-lg font-bold">Enterprise</div>
                    <div className="text-sm text-muted-foreground">Security Level</div>
                    <Badge className="mt-2">SOC 2 Compliant</Badge>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 rounded-lg">
                    <Globe className="w-8 h-8 mx-auto mb-2 text-blue-500" />
                    <div className="text-lg font-bold">Multi-Tenant</div>
                    <div className="text-sm text-muted-foreground">Architecture</div>
                    <Badge className="mt-2">42 Organizations</Badge>
                  </div>
                  <div className="text-center p-6 bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
                    <Settings className="w-8 h-8 mx-auto mb-2 text-green-500" />
                    <div className="text-lg font-bold">SSO</div>
                    <div className="text-sm text-muted-foreground">Integration</div>
                    <Badge className="mt-2">12 Providers</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
                  System Performance & Scaling
                </CardTitle>
                <CardDescription>
                  Real-time performance metrics and system health
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">99.9%</div>
                    <div className="text-sm text-muted-foreground">Uptime</div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">23ms</div>
                    <div className="text-sm text-muted-foreground">Avg Response</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">2.3M</div>
                    <div className="text-sm text-muted-foreground">Daily Requests</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">98.7%</div>
                    <div className="text-sm text-muted-foreground">Success Rate</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}