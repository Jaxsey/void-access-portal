import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, Users, Key, Activity, Settings, LogOut, RefreshCw, Crown, UserCog, Database, Monitor } from "lucide-react";
import { adminLogin, getAdminStats, validateAdminSession, adminLogout, regenerateDailyKey, generatePremiumKey, generateAdminKey, type AdminStats } from "@/lib/supabase";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [authToken, setAuthToken] = useState<string | null>(null);

  useEffect(() => {
    // Check for existing session and validate it
    const token = localStorage.getItem('adminToken');
    if (token) {
      validateSession(token);
    }
  }, []);

  const validateSession = async (token: string) => {
    try {
      const result = await validateAdminSession(token);
      if (result.valid) {
        setAuthToken(token);
        setIsLoggedIn(true);
        loadStats(token);
      } else {
        // Invalid session, remove token
        localStorage.removeItem('adminToken');
        setIsLoggedIn(false);
        setAuthToken(null);
      }
    } catch (error) {
      console.error('Session validation failed:', error);
      localStorage.removeItem('adminToken');
      setIsLoggedIn(false);
      setAuthToken(null);
    }
  };

  const loadStats = async (token?: string) => {
    const currentToken = token || authToken;
    if (!currentToken) return;
    
    setLoadingStats(true);
    try {
      const adminStats = await getAdminStats(currentToken);
      setStats(adminStats);
    } catch (error) {
      console.error('Error loading stats:', error);
      if (error.message?.includes('Invalid or expired session')) {
        handleLogout();
      }
    } finally {
      setLoadingStats(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await adminLogin(username, password);
      if (result.success) {
        localStorage.setItem('adminToken', result.token);
        setAuthToken(result.token);
        setIsLoggedIn(true);
        loadStats(result.token);
        toast({
          title: "Login Successful",
          description: "Welcome to the admin panel.",
        });
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Invalid username or password.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    if (authToken) {
      try {
        await adminLogout(authToken);
      } catch (error) {
        console.error('Logout API error:', error);
      }
    }
    
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setAuthToken(null);
    setUsername("");
    setPassword("");
    setStats(null);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
  };

  const handleRefreshStats = () => {
    loadStats();
  };

  const handleRegenerateDailyKey = async () => {
    if (!authToken) return;
    
    try {
      const result = await regenerateDailyKey(authToken);
      if (result.success) {
        toast({
          title: "Daily Key Regenerated",
          description: `New key: ${result.key.license_key}`,
        });
        loadStats(); // Refresh stats to show the new key
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to regenerate daily key.",
        variant: "destructive",
      });
    }
  };

  const handleGeneratePremiumKey = async () => {
    if (!authToken) return;
    
    try {
      const result = await generatePremiumKey(authToken);
      if (result.success) {
        toast({
          title: "Premium Key Generated",
          description: `New 30-day key: ${result.key.license_key}`,
        });
        loadStats(); // Refresh stats to show the new key
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate premium key.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateAdminKey = async () => {
    if (!authToken) return;
    
    try {
      const result = await generateAdminKey(authToken);
      if (result.success) {
        toast({
          title: "Admin Key Generated",
          description: `New lifetime key: ${result.key.license_key}`,
        });
        loadStats(); // Refresh stats to show the new key
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate admin key.",
        variant: "destructive",
      });
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-6 animate-fade-in">
          {/* Header */}
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="hover:bg-secondary/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5 text-primary" />
              <h1 className="text-xl font-semibold">Admin Login</h1>
            </div>
          </div>

          {/* Login Card */}
          <Card className="glass-card border-primary/30 shadow-2xl animate-slide-up">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl gradient-text">Admin Access</CardTitle>
              <p className="text-muted-foreground">
                Login to access the admin panel
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="bg-input/50 border-border/50 focus:border-primary"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="bg-input/50 border-border/50 focus:border-primary"
                  />
                </div>
                
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-primary hover:scale-105 transition-all duration-300"
                  disabled={isLoading}
                >
                  <Shield className="w-4 h-4 mr-2" />
                  {isLoading ? "Logging in..." : "Login to Admin Panel"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4">
      <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="hover:bg-secondary/50"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Home
            </Button>
            <div className="flex items-center space-x-2">
              <Shield className="w-6 h-6 text-primary" />
              <h1 className="text-2xl font-bold gradient-text">Admin Dashboard</h1>
            </div>
          </div>
          
          <Button
            variant="outline"
            onClick={handleLogout}
            className="border-destructive/50 hover:bg-destructive/10"
          >
            Logout
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="glass-card border-primary/30 animate-slide-up">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-primary/20">
                  <Users className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {loadingStats ? "..." : stats?.totalAccess || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Access</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30 animate-slide-up delay-100">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-success/20">
                  <Key className="w-6 h-6 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {loadingStats ? "..." : stats?.dailyKeys?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Daily Keys</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30 animate-slide-up delay-150">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-warning/20">
                  <Crown className="w-6 h-6 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {loadingStats ? "..." : stats?.premiumKeys?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Premium Keys</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30 animate-slide-up delay-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-destructive/20">
                  <UserCog className="w-6 h-6 text-destructive" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {loadingStats ? "..." : stats?.adminKeys?.length || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Admin Keys</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30 animate-slide-up delay-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-accent/20">
                  <Activity className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">
                    {loadingStats ? "..." : stats?.todayAccess || 0}
                  </p>
                  <p className="text-sm text-muted-foreground">Today's Access</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Key Generation Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="glass-card border-primary/30 animate-slide-up">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                <RefreshCw className="w-5 h-5 mr-2" />
                Daily Key
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Generate a new daily key (24h expiry).
              </p>
              <Button 
                onClick={handleRegenerateDailyKey}
                className="w-full"
                variant="outline"
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Generate Daily Key
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30 animate-slide-up delay-100">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                <Crown className="w-5 h-5 mr-2" />
                Premium Key
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Generate a new premium key (30 days).
              </p>
              <Button 
                onClick={handleGeneratePremiumKey}
                className="w-full"
                variant="outline"
              >
                <Crown className="mr-2 h-4 w-4" />
                Generate Premium Key
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30 animate-slide-up delay-200">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                <UserCog className="w-5 h-5 mr-2" />
                Admin Key
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Generate a new admin key (lifetime).
              </p>
              <Button 
                onClick={handleGenerateAdminKey}
                className="w-full"
                variant="outline"
              >
                <UserCog className="mr-2 h-4 w-4" />
                Generate Admin Key
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* System Management */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="glass-card border-primary/30 animate-slide-up">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                <Database className="w-5 h-5 mr-2" />
                Database Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Database cleanup and maintenance operations.
              </p>
              <Button 
                className="w-full"
                variant="outline"
                disabled
              >
                <Database className="mr-2 h-4 w-4" />
                Clean Expired Keys
              </Button>
              <Button 
                className="w-full"
                variant="outline"
                disabled
              >
                <Monitor className="mr-2 h-4 w-4" />
                System Health Check
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30 animate-slide-up delay-100">
            <CardHeader>
              <CardTitle className="text-primary flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                System Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                Configure system-wide settings and preferences.
              </p>
              <Button 
                className="w-full"
                variant="outline"
                disabled
              >
                <Settings className="mr-2 h-4 w-4" />
                Rate Limiting
              </Button>
              <Button 
                className="w-full"
                variant="outline"
                disabled
              >
                <Shield className="mr-2 h-4 w-4" />
                Security Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Key Management Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="glass-card border-primary/30 animate-slide-up delay-400">
            <CardHeader>
              <CardTitle className="text-primary">Daily Keys History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {loadingStats ? (
                  <div className="text-center text-muted-foreground">Loading...</div>
                ) : stats?.dailyKeys?.length ? (
                  stats.dailyKeys.slice(0, 10).map((key, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-background/50 rounded">
                      <span className="text-sm font-mono">{key.license_key}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(key.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">No keys found</div>
                )}
              </div>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleRefreshStats}
                disabled={loadingStats}
              >
                <Key className="mr-2 h-4 w-4" />
                Refresh Keys
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30 animate-slide-up delay-500">
            <CardHeader>
              <CardTitle className="text-primary">Premium Keys (30-day)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {loadingStats ? (
                  <div className="text-center text-muted-foreground">Loading...</div>
                ) : stats?.premiumKeys?.length ? (
                  stats.premiumKeys.slice(0, 10).map((key, index) => (
                    <div key={index} className="flex flex-col p-2 bg-background/50 rounded">
                      <span className="text-sm font-mono">{key.license_key}</span>
                      <span className="text-xs text-muted-foreground">
                        Expires: {new Date(key.expires_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">No premium keys found</div>
                )}
              </div>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleRefreshStats}
                disabled={loadingStats}
              >
                <Crown className="mr-2 h-4 w-4" />
                Refresh Premium Keys
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30 animate-slide-up delay-600">
            <CardHeader>
              <CardTitle className="text-primary">Admin Keys (Lifetime)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {loadingStats ? (
                  <div className="text-center text-muted-foreground">Loading...</div>
                ) : stats?.adminKeys?.length ? (
                  stats.adminKeys.slice(0, 10).map((key, index) => (
                    <div key={index} className="flex flex-col p-2 bg-background/50 rounded">
                      <span className="text-sm font-mono">{key.license_key}</span>
                      <span className="text-xs text-muted-foreground">
                        Created: {new Date(key.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">No admin keys found</div>
                )}
              </div>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleRefreshStats}
                disabled={loadingStats}
              >
                <UserCog className="mr-2 h-4 w-4" />
                Refresh Admin Keys
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Access Logs */}
        <div className="grid grid-cols-1 gap-6">
          <Card className="glass-card border-primary/30 animate-slide-up delay-700">
            <CardHeader>
              <CardTitle className="text-primary">Recent Access Logs</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {loadingStats ? (
                  <div className="text-center text-muted-foreground">Loading...</div>
                ) : stats?.recentAccesses?.length ? (
                  stats.recentAccesses.map((access, index) => (
                    <div key={index} className="flex justify-between items-center p-2 bg-background/50 rounded">
                      <span className="text-sm">{access.ip_address || 'Unknown IP'}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(access.accessed_at).toLocaleString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-muted-foreground">No access logs found</div>
                )}
              </div>
              <Button 
                className="w-full justify-start" 
                variant="outline"
                onClick={handleRefreshStats}
                disabled={loadingStats}
              >
                <Activity className="mr-2 h-4 w-4" />
                Refresh Logs
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;