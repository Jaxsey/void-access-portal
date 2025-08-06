import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { Key, Shield, Zap } from "lucide-react";

const Home = () => {
  const navigate = useNavigate();

  const handleGetKey = () => {
    navigate("/key");
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
            KeyMaster
          </h1>
          <p className="text-xl text-muted-foreground max-w-md mx-auto">
            Secure license key management system with premium features and enterprise-grade security
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
                <h3 className="font-semibold">Secure</h3>
                <p className="text-sm text-muted-foreground">
                  Military-grade encryption
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="p-3 rounded-lg bg-primary/20 w-fit mx-auto">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Fast</h3>
                <p className="text-sm text-muted-foreground">
                  Instant key generation
                </p>
              </div>
              <div className="text-center space-y-2">
                <div className="p-3 rounded-lg bg-primary/20 w-fit mx-auto">
                  <Key className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold">Reliable</h3>
                <p className="text-sm text-muted-foreground">
                  99.9% uptime guarantee
                </p>
              </div>
            </div>

            {/* CTA Button */}
            <div className="text-center">
              <Button
                onClick={handleGetKey}
                size="lg"
                className="bg-gradient-primary hover:scale-105 transition-all duration-300 text-lg px-8 py-6 shadow-lg hover:shadow-primary/30"
              >
                <Key className="w-5 h-5 mr-2" />
                Get Your License Key
              </Button>
              <p className="text-sm text-muted-foreground mt-4">
                Valid for 24 hours • Updates daily
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/admin")}
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            Admin Access
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Home;