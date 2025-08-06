import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Copy, RefreshCw, Shield, Clock, MessageCircle } from "lucide-react";
import { getDailyKey, type DailyKey } from "@/lib/supabase";

const DynamicKeyPage = () => {
  const navigate = useNavigate();
  const { keyId } = useParams();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dailyKey, setDailyKey] = useState<DailyKey | null>(null);
  const [keyNotFound, setKeyNotFound] = useState(false);

  useEffect(() => {
    loadDailyKey();
  }, []);

  const loadDailyKey = async () => {
    try {
      const key = await getDailyKey();
      if (key) {
        setDailyKey(key);
        // Check if current URL parameter matches the expected URL path
        const expectedPath = `key/${keyId}`;
        if (expectedPath !== key.url_path) {
          setKeyNotFound(true);
        }
      } else {
        setKeyNotFound(true);
      }
    } catch (error) {
      console.error('Error loading daily key:', error);
      setKeyNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyKey = async () => {
    if (!dailyKey) return;
    
    try {
      // Copy the raw license key without formatting
      await navigator.clipboard.writeText(dailyKey.license_key);
      setCopied(true);
      toast({
        title: "Key Copied!",
        description: "License key has been copied to your clipboard.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy key to clipboard.",
        variant: "destructive",
      });
    }
  };

  const handleDiscordClick = () => {
    window.open("https://discord.gg/your-server", "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (keyNotFound || !dailyKey) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-destructive/20 bg-destructive/5">
          <CardContent className="p-8 text-center">
            <Shield className="h-16 w-16 text-destructive mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2 text-destructive">Access Denied</h1>
            <p className="text-muted-foreground mb-6">
              This key URL is not valid or has expired. Please get today's key from the home page.
            </p>
            <Button onClick={() => navigate("/")} className="w-full">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formattedKey = dailyKey.license_key.match(/.{1,4}/g)?.join("-") || dailyKey.license_key;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate("/")}
            className="hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Daily License Key
          </h1>
          <div className="w-16" /> {/* Spacer for centering */}
        </div>

        <div className="max-w-2xl mx-auto space-y-6">
          {/* Key Display Card */}
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-8">
              <div className="text-center space-y-6">
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-primary flex items-center justify-center gap-2">
                    <Clock className="h-6 w-6" />
                    Today's Key
                  </h2>
                  <p className="text-muted-foreground">
                    Valid until midnight - Key expires daily at 00:00 UTC
                  </p>
                </div>

                <div className="bg-background/50 rounded-lg p-6 border border-primary/20">
                  <div className="font-mono text-lg tracking-wider break-all text-primary">
                    {formattedKey}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    onClick={handleCopyKey}
                    className="flex-1 bg-primary hover:bg-primary/90"
                    disabled={copied}
                  >
                    {copied ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Copied!
                      </>
                    ) : (
                      <>
                        <Copy className="mr-2 h-4 w-4" />
                        Copy Daily Key
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
                  <p className="text-sm text-amber-600 dark:text-amber-400">
                    ⚠️ This key expires at midnight and cannot be regenerated. Save it now!
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="border-primary/20 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold text-primary">Static Macro Access</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Use this daily key to authenticate with Static Macro. Each key is valid for 24 hours 
                  and provides secure access to all macro features. The key URL changes daily for 
                  enhanced security.
                </p>
                
                <div className="flex items-center justify-center gap-4 pt-4">
                  <Button 
                    variant="outline" 
                    onClick={handleDiscordClick}
                    className="border-primary/20 hover:bg-primary/10"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Join Discord
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DynamicKeyPage;