
import { useState, useEffect } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { getCustomerByMembershipNumber, getCustomerById, decrementVisits } from "@/services/customerService";
import { Customer } from "@/types/customer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Check, X, Calendar, Hash } from "lucide-react";

const VerifyAccess = () => {
  const [searchParams] = useSearchParams();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessGranted, setAccessGranted] = useState<boolean | null>(null);
  
  const membershipNumber = searchParams.get("membershipNumber");
  const customerId = searchParams.get("customerId");
  const errorParam = searchParams.get("error");
  
  useEffect(() => {
    console.log("Loading customer with membership number:", membershipNumber);
    console.log("Loading customer with ID:", customerId);
    console.log("Error param:", errorParam);
    
    const loadCustomer = async () => {
      try {
        if (errorParam === "customer_not_found") {
          setError("Customer not found in the system");
          setLoading(false);
          return;
        }
        
        if (!membershipNumber && !customerId) {
          setError("No customer identifier provided");
          setLoading(false);
          return;
        }
        
        let foundCustomer: Customer | undefined;
        
        if (customerId) {
          foundCustomer = await getCustomerById(customerId);
        } else if (membershipNumber) {
          foundCustomer = await getCustomerByMembershipNumber(membershipNumber);
        }
        
        console.log("Found customer:", foundCustomer);
        
        if (!foundCustomer) {
          console.error(`Customer not found with identifier: ${customerId || membershipNumber}`);
          setError("Invalid customer identifier");
          setLoading(false);
          return;
        }
        
        setCustomer(foundCustomer);
        setLoading(false);
      } catch (error) {
        console.error('Error loading customer:', error);
        setError("Failed to load customer data");
        setLoading(false);
      }
    };
    
    loadCustomer();
  }, [membershipNumber, customerId, errorParam]);
  
  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date();
  };
  
  const handleAllow = async () => {
    if (!customer) return;
    
    if (customer.visits <= 0) {
      toast.error("No visits remaining");
      return;
    }
    
    try {
      const updated = await decrementVisits(customer.id);
      if (updated) {
        setCustomer(updated);
        setAccessGranted(true);
        toast.success("Access granted, visit recorded");
      }
    } catch (error) {
      console.error('Error decrementing visits:', error);
      toast.error("Failed to record visit");
    }
  };
  
  const handleDeny = () => {
    setAccessGranted(false);
    toast.info("Access denied");
  };
  
  const getMembershipColor = (type: string) => {
    switch (type) {
      case "gold":
        return "bg-yellow-500";
      case "platinum":
        return "bg-gray-500";
      case "diamond":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex justify-center">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <div className="text-center mt-4">Loading customer data...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md border-red-200">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertTitle>Verification Failed</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!customer) {
    return null;
  }

  const expired = isExpired(customer.expiryDate);
  const noVisitsLeft = customer.visits <= 0;
  const canAccess = !expired && !noVisitsLeft;

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <div 
          className={`h-16 rounded-t-md bg-gradient-to-r from-[#112369] to-[#8dc63f] flex items-center justify-between px-6`}
        >
          <div className="text-white font-bold text-lg">FCB AirLounge Access</div>
          <Badge className={`${getMembershipColor(customer.membershipType)} uppercase text-white`}>
            {customer.membershipType}
          </Badge>
        </div>
        
        <CardHeader>
          <CardTitle className="text-2xl">{customer.firstName} {customer.lastName}</CardTitle>
          <CardDescription>Membership #{customer.membershipNumber}</CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {accessGranted !== null && (
            <Alert variant={accessGranted ? "default" : "destructive"} className="border border-l-4">
              {accessGranted ? (
                <>
                  <Check className="h-4 w-4" />
                  <AlertTitle>Access Granted</AlertTitle>
                  <AlertDescription>Enjoy your visit to the lounge</AlertDescription>
                </>
              ) : (
                <>
                  <X className="h-4 w-4" />
                  <AlertTitle>Access Denied</AlertTitle>
                  <AlertDescription>Customer access has been declined</AlertDescription>
                </>
              )}
            </Alert>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Expires:</span>
              <span className={`text-sm font-medium ${expired ? "text-red-500" : ""}`}>
                {new Date(customer.expiryDate).toLocaleDateString()}
              </span>
              {expired && <Badge variant="destructive" className="ml-1">Expired</Badge>}
            </div>
            
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Visits left:</span>
              <span className="text-sm font-medium">
                {customer.visits}
              </span>
              {noVisitsLeft && <Badge variant="destructive" className="ml-1">None</Badge>}
            </div>
          </div>
          
          {expired && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertTitle>Membership Expired</AlertTitle>
              <AlertDescription>
                This membership expired on {new Date(customer.expiryDate).toLocaleDateString()}.
                Please renew your membership to continue using the lounge.
              </AlertDescription>
            </Alert>
          )}
          
          {!expired && customer.visits === 0 && (
            <Alert variant="destructive">
              <X className="h-4 w-4" />
              <AlertTitle>No Visits Remaining</AlertTitle>
              <AlertDescription>
                This membership has no visits remaining.
                Please purchase additional visits to continue using the lounge.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        
        <CardFooter className="gap-2">
          {accessGranted === null && (
            <>
              {canAccess && (
                <Button onClick={handleAllow} className="flex-1 bg-[#8dc63f] hover:bg-[#7ab234]">
                  <Check className="mr-2 h-4 w-4" /> Allow Access
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleDeny} 
                className="flex-1"
              >
                <X className="mr-2 h-4 w-4" /> Deny Access
              </Button>
            </>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default VerifyAccess;
