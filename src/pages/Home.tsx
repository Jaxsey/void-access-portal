import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Key, Shield, Zap, MessageCircle } from "lucide-react";
import { getDailyKey, type DailyKey } from "@/lib/supabase";

const Home = () => {
  const navigate = useNavigate();
  const [dailyKey, setDailyKey] = useState<DailyKey | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDailyKey();
  }, []);

  const loadDailyKey = async () => {
    try {
      const key = await getDailyKey();
      setDailyKey(key);
    } catch (error) {
      console.error('Error loading daily key:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGetKey = () => {
    if (dailyKey) {
      navigate(`/${dailyKey.url_path}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full space-y-8 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-full bg-gradient-primary animate-pulse-glow">
              <Key className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-5xl font-bold gradient-text animate-float">
            Static Macro
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Advanced macro access key system. Get your authentication key to unlock premium macro features and automation tools.
          </p>
        </div>

        {/* Main Card */}
        <Card className="glass-card border-primary/30 shadow-2xl animate-slide-up">
          <CardContent className="p-8 space-y-6">
            {/* Features Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center space-y-2">
                <div className="p-3 rounded-lg bg-primary/20 w-fit mx-auto">
                  <Shield className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Secure Access</h3>
                <p className="text-sm text-muted-foreground">
                  Protected macro authentication
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="p-3 rounded-lg bg-primary/20 w-fit mx-auto">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Instant Access</h3>
                <p className="text-sm text-muted-foreground">
                  Immediate macro activation
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="p-3 rounded-lg bg-primary/20 w-fit mx-auto">
                  <Key className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Daily Keys</h3>
                <p className="text-sm text-muted-foreground">
                  Fresh keys every 24 hours
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
                <Button
                  onClick={handleGetKey}
                  size="lg"
                  className="bg-gradient-primary hover:scale-105 transition-all duration-300 text-lg px-8 py-6 shadow-lg hover:shadow-primary/30"
                  disabled={loading || !dailyKey}
                >
                  <Key className="w-5 h-5 mr-2" />
                  {loading ? "Loading..." : "Get Your License Key"}
                </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Valid for 24 hours • Updates daily
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Card className="glass-card border-primary/20">
          <CardContent className="p-6 text-center space-y-4">
            <h3 className="text-lg font-semibold">About Static Macro</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              No account registration required. Simply get your daily authentication key to access premium macro functionality. 
              Perfect for automation enthusiasts and power users who need reliable macro tools.
            </p>
            <div className="flex items-center justify-center gap-4 pt-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open("https://discord.gg/your-discord", "_blank")}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Join Discord
              </Button>
              <Button 
                variant="ghost"
                size="sm" 
                onClick={() => navigate("/admin")}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                Admin Portal
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Home;