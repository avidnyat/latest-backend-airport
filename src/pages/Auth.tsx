import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const { signIn, isLoading: authLoading, user } = useAuth();
  const [loading, setLoading] = useState(false);

  console.log('Auth component rendered. User:', user?.email, 'Auth loading:', authLoading);

  // Handle redirect when user is authenticated
  useEffect(() => {
    if (user && !authLoading) {
      console.log('User is authenticated, redirecting to dashboard');
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const handleSignIn = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('Form submitted, attempting sign in for:', email);

    try {
      await signIn(email, password);
      console.log('Sign in successful, redirecting...');
      toast.success("Signed in successfully!");
      // Navigation will be handled by useEffect
    } catch (err: any) {
      console.error('Sign in error:', err);
      toast.error(err.message || 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  }, [signIn]);

  const isLoading = loading || authLoading;

  // Show loading state while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  // Don't render the form if user is already authenticated (prevents flash)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span>Redirecting to dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img 
            src="/lovable-uploads/64c08de1-a716-4cbf-8f71-c2901829c4a7.png"
            alt="First Capital Bank"
            className="h-12 w-auto mx-auto mb-4"
          />
          <h1 className="text-2xl font-bold text-primary">
            FCB AirLounge Staff Portal
          </h1>
          <p className="text-gray-600">
            Staff Access Portal
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Staff Sign In</CardTitle>
            <CardDescription>
              Enter your staff credentials provided by administrator
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="staff@fcb.com"
                  required
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  disabled={isLoading}
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="mt-4 p-3 bg-blue-50 rounded-md">
              <p className="text-sm text-blue-800">
                Don't have an account? Contact your administrator to create your staff account.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-[#112369]"></div>
            <div className="h-3 w-3 rounded-full bg-[#8dc63f]"></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            First Capital Bank
          </p>
          <div className="text-center mt-2">
            <a href="/admin" className="text-xs text-gray-400 hover:text-gray-600">
              Access
            </a>
            <span className="text-xs text-gray-300 mx-2">|</span>
            <a href="/verify" className="text-xs text-gray-400 hover:text-gray-600">
              Verify Access
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
