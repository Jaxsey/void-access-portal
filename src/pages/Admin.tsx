import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Shield, Users, Key, Activity, Settings, LogOut } from "lucide-react";
import { adminLogin, getAdminStats, type AdminStats } from "@/lib/supabase";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    // Check for existing session
    const token = localStorage.getItem('adminToken');
    if (token) {
      setIsLoggedIn(true);
      loadStats();
    }
  }, []);

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const adminStats = await getAdminStats();
      setStats(adminStats);
    } catch (error) {
      console.error('Error loading stats:', error);
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
        setIsLoggedIn(true);
        loadStats();
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

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
    setStats(null);
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    });
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
              
              <div className="mt-4 p-3 rounded-lg bg-muted/30 border border-border/30">
                <p className="text-xs text-muted-foreground">
                  Demo credentials: admin / admin123
                </p>
              </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

          <Card className="glass-card border-primary/30 animate-slide-up delay-200">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-warning/20">
                  <Activity className="w-6 h-6 text-warning" />
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

          <Card className="glass-card border-primary/30 animate-slide-up delay-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-accent/20">
                  <Activity className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">99.9%</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Management Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card border-primary/30 animate-slide-up delay-400">
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
                onClick={loadStats}
                disabled={loadingStats}
              >
                <Activity className="mr-2 h-4 w-4" />
                Refresh Logs
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30 animate-slide-up delay-500">
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
                onClick={loadStats}
                disabled={loadingStats}
              >
                <Key className="mr-2 h-4 w-4" />
                Refresh Keys
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Admin;