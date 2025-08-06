import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Users, Key, Settings, Activity, Database } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Admin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({
    username: "",
    password: "",
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple demo auth - in real app this would connect to your Flask backend
    if (credentials.username === "admin" && credentials.password === "admin123") {
      setIsLoggedIn(true);
      toast({
        title: "Login Successful",
        description: "Welcome to the admin panel",
        duration: 3000,
      });
    } else {
      toast({
        title: "Login Failed",
        description: "Invalid credentials",
        variant: "destructive",
        duration: 3000,
      });
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCredentials({ username: "", password: "" });
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
      duration: 2000,
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
                    value={credentials.username}
                    onChange={(e) =>
                      setCredentials({ ...credentials, username: e.target.value })
                    }
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
                    value={credentials.password}
                    onChange={(e) =>
                      setCredentials({ ...credentials, password: e.target.value })
                    }
                    required
                    className="bg-input/50 border-border/50 focus:border-primary"
                  />
                </div>
                
                <Button
                  type="submit"
                  size="lg"
                  className="w-full bg-gradient-primary hover:scale-105 transition-all duration-300"
                >
                  <Shield className="w-4 h-4 mr-2" />
                  Login to Admin Panel
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
                  <p className="text-2xl font-bold">1,234</p>
                  <p className="text-sm text-muted-foreground">Active Users</p>
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
                  <p className="text-2xl font-bold">5,678</p>
                  <p className="text-sm text-muted-foreground">Keys Generated</p>
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
                  <p className="text-2xl font-bold">99.9%</p>
                  <p className="text-sm text-muted-foreground">Uptime</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30 animate-slide-up delay-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="p-3 rounded-lg bg-accent/20">
                  <Database className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-2xl font-bold">342</p>
                  <p className="text-sm text-muted-foreground">DB Queries/min</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Admin Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="glass-card border-primary/30 animate-slide-up delay-400">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="w-5 h-5 text-primary" />
                <span>Key Management</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                Generate Bulk Keys
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Revoke License Keys
              </Button>
              <Button className="w-full justify-start" variant="outline">
                View Key Analytics
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Export Key Database
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary/30 animate-slide-up delay-500">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="w-5 h-5 text-primary" />
                <span>System Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button className="w-full justify-start" variant="outline">
                Configure Rate Limits
              </Button>
              <Button className="w-full justify-start" variant="outline">
                Manage User Permissions
              </Button>
              <Button className="w-full justify-start" variant="outline">
                System Maintenance
              </Button>
              <Button className="w-full justify-start" variant="outline">
                View Server Logs
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card className="glass-card border-primary/30 animate-slide-up delay-600">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="w-5 h-5 text-primary" />
              <span>Recent Activity</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { action: "New key generated", user: "user_1234", time: "2 minutes ago" },
                { action: "User registered", user: "user_1235", time: "5 minutes ago" },
                { action: "Key expired", user: "user_1233", time: "10 minutes ago" },
                { action: "Admin login", user: "admin", time: "15 minutes ago" },
              ].map((activity, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30"
                >
                  <div>
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">User: {activity.user}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Admin;