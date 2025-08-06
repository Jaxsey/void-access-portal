import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Key, AlertTriangle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const KeyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Simulated license key - in real app this would come from your Flask backend
  const licenseKey = "89F26 83DE7 80A1B 5C4D3";
  const formattedKey = licenseKey.replace(/\s/g, "");

  const handleCopyKey = async () => {
    try {
      await navigator.clipboard.writeText(formattedKey);
      setCopied(true);
      toast({
        title: "Success!",
        description: "License key copied to clipboard",
        duration: 2000,
      });
      
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy license key",
        variant: "destructive",
        duration: 2000,
      });
    }
  };

  const handleGetNewKey = () => {
    // In real app, this would trigger a new key generation from Flask backend
    toast({
      title: "New Key Generated",
      description: "Your new license key is ready",
      duration: 3000,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-lg w-full space-y-6 animate-fade-in">
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
            <Key className="w-5 h-5 text-primary" />
            <h1 className="text-xl font-semibold">Daily License Key</h1>
          </div>
        </div>

        {/* Main Key Card */}
        <Card className="glass-card border-primary/30 shadow-2xl animate-slide-up">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl gradient-text">Today's Key</CardTitle>
            <p className="text-muted-foreground">
              Valid for 24 hours • Updates daily
            </p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {/* License Key Display */}
            <div className="p-4 rounded-lg bg-success/10 border border-success/30">
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your License Key</p>
                <p className="text-2xl font-mono font-bold text-success tracking-wider">
                  {licenseKey}
                </p>
              </div>
            </div>

            {/* Warning Alert */}
            <div className="p-4 rounded-lg bg-warning/10 border border-warning/30 flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-warning mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                <p className="font-medium text-warning">Important:</p>
                <p className="text-sm text-warning/90">
                  This key expires in 24 hours! You'll need to get a new key tomorrow.
                </p>
              </div>
            </div>

            {/* Copy Button */}
            <Button
              onClick={handleCopyKey}
              size="lg"
              className="w-full bg-success hover:bg-success/90 transition-all duration-300"
              disabled={copied}
            >
              {copied ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-5 h-5 mr-2" />
                  Copy Daily Key
                </>
              )}
            </Button>

            {/* Additional Actions */}
            <div className="flex space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetNewKey}
                className="flex-1 border-primary/30 hover:bg-primary/10"
              >
                Generate New Key
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate("/admin")}
                className="flex-1 border-secondary/50 hover:bg-secondary/10"
              >
                Admin Panel
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Premium Options */}
        <Card className="glass-card border-accent/30 animate-slide-up delay-200">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 text-center">
              <div className="p-2 rounded-full bg-accent/20">
                <Key className="w-4 h-4 text-accent-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-accent-foreground">Premium Options Available</h3>
                <p className="text-sm text-muted-foreground">
                  Upgrade for extended validity and advanced features
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default KeyPage;