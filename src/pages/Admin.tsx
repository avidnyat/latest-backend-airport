import { useState, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import UserManagement from "@/components/UserManagement";

const Admin = () => {
  const navigate = useNavigate();
  const { signIn, user, signOut, isAdmin, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleAdminSignIn = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    console.log('Form submitted, attempting sign in for:', email);

    try {
      await signIn(email, password);
      console.log('Sign in successful');
      toast.success("Signed in successfully!");
      setLoading(false);
      // Navigation will be handled automatically based on user role
    } catch (err: any) {
      console.error('Sign in error:', err);
      toast.error(err.message || 'Failed to sign in');
      setLoading(false);
    }
  }, [signIn]);

  const handleGoToSignIn = useCallback(async () => {
    await signOut();
    navigate("/admin");
  }, [signOut, navigate]);

  const isLoading = loading || authLoading;

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

  if (user) {
    // Check if user is admin
    if (!isAdmin()) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-red-600">Access Denied</CardTitle>
              <CardDescription>
                You don't have privileges to access this page.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button 
                  onClick={handleGoToSignIn}
                  className="w-full"
                >
                  Go to SignIn page
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <img 
              src="/lovable-uploads/64c08de1-a716-4cbf-8f71-c2901829c4a7.png"
              alt="First Capital Bank"
              className="h-12 w-auto mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-primary">
              FCB AirLounge Portal
            </h1>
            <p className="text-gray-600">
              Administrator Dashboard
            </p>
          </div>

          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="text-lg font-semibold">Welcome, {user.full_name || user.email}</h2>
              <p className="text-sm text-gray-600">Role: Administrator</p>
            </div>
            <div className="space-x-4">
              <Link to="/dashboard">
                <Button className="bg-primary hover:bg-primary/90">
                  Go to Dashboard
                </Button>
              </Link>
              <Button 
                onClick={signOut}
                variant="outline"
              >
                Sign Out
              </Button>
            </div>
          </div>

          <UserManagement />
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
            FCB AirLounge
          </h1>
          <p className="text-gray-600">
            Portal
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your credentials
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleAdminSignIn} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="user@fcb.com"
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
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <Button 
            variant="link" 
            onClick={() => navigate('/')}
            className="text-sm"
          >
            ← Back to Staff Portal
          </Button>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex justify-center space-x-2">
            <div className="h-3 w-3 rounded-full bg-[#112369]"></div>
            <div className="h-3 w-3 rounded-full bg-[#8dc63f]"></div>
          </div>
          <p className="text-xs text-gray-500 mt-2 text-center">
            First Capital Bank
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;
