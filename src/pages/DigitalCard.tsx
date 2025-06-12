import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Customer } from "@/types/customer";
import { getCustomerById, getQRCodeValue } from "@/services/customerService";
import { ArrowLeft, Crown, Download } from "lucide-react";
import QRCode from "@/components/QRCode";
import { toast } from "sonner";
import html2canvas from "html2canvas";

const DigitalCard = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [qrValue, setQrValue] = useState("");
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      const loadCustomer = async () => {
        try {
          const customerData = await getCustomerById(id);
          if (customerData) {
            setCustomer(customerData);
            const qrCodeValue = await getQRCodeValue(id);
            console.log("Generated QR code value:", qrCodeValue);
            setQrValue(qrCodeValue);
          } else {
            toast.error("Customer not found");
            navigate("/customers");
          }
        } catch (error) {
          console.error('Error loading customer:', error);
          toast.error("Failed to load customer");
          navigate("/customers");
        } finally {
          setLoading(false);
        }
      };

      loadCustomer();
    }
  }, [id, navigate]);

  const getMembershipIcon = () => {
    switch (customer?.membershipType) {
      case "prestige":
        return <div className="w-6 h-6 rounded-full bg-purple-500" />;
      case "premier":
        return <Crown className="w-6 h-6 text-blue-400" />;
      default:
        return null;
    }
  };

  const downloadCard = async () => {
    if (!cardRef.current || !customer) return;
    
    try {
      setIsDownloading(true);
      toast.info("Preparing download...");
      
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: "transparent",
        scale: 3,
        logging: false,
        useCORS: true,
        allowTaint: true,
        foreignObjectRendering: false,
        removeContainer: true
      });
      
      const imageData = canvas.toDataURL("image/png", 1.0);
      
      const link = document.createElement("a");
      link.href = imageData;
      link.download = `${customer.lastName}-${customer.firstName}-membership-card.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("Card downloaded successfully");
    } catch (error) {
      console.error("Error downloading card:", error);
      toast.error("Failed to download card");
    } finally {
      setIsDownloading(false);
    }
  };

  const getCardBackground = () => {
    return "linear-gradient(135deg, #112369 0%, #8dc63f 100%)";
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          className="mr-4"
          onClick={() => navigate("/customers")}
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Back
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-primary">Digital Membership Card</h1>
          <p className="text-gray-500">
            {customer
              ? `${customer.firstName} ${customer.lastName}'s membership card`
              : "Loading..."}
          </p>
        </div>
      </div>

      {customer ? (
        <div className="flex flex-col items-center space-y-8">
          {/* Digital Membership Card */}
          <div className="w-full max-w-sm mx-auto">
            <div 
              ref={cardRef} 
              className="relative p-6 text-white rounded-2xl shadow-2xl"
              style={{ 
                background: getCardBackground(),
                aspectRatio: "85.6/53.98",
                minHeight: "320px"
              }}
            >
              {/* Header with FCB logo and membership type */}
              <div className="flex justify-between items-start mb-6">
                <div className="flex flex-col">
                  {/* FCB Logo */}
                  <img 
                    src="/lovable-uploads/64c08de1-a716-4cbf-8f71-c2901829c4a7.png"
                    alt="First Capital Bank"
                    className="h-8 w-auto object-contain mb-2"
                  />
                  <div className="text-xs opacity-90 uppercase tracking-wider font-medium">
                    Premium Lounge
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getMembershipIcon()}
                  <span className="text-xs uppercase bg-white/25 backdrop-blur-sm px-3 py-1 rounded-full font-semibold tracking-wide">
                    {customer.membershipType}
                  </span>
                </div>
              </div>

              {/* Customer name section */}
              <div className="mb-8">
                <div className="text-2xl font-bold tracking-wide leading-tight">
                  {customer.firstName} {customer.lastName}
                </div>
                <div className="text-sm opacity-80 mt-1 font-mono tracking-wider">
                  {customer.membershipNumber}
                </div>
              </div>

              {/* Card details grid */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div>
                  <div className="text-xs opacity-75 uppercase tracking-wide mb-1">Member Since</div>
                  <div className="text-sm font-semibold">
                    {new Date(customer.createdAt).toLocaleDateString('en-US', { 
                      day: 'numeric',
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
                <div>
                  <div className="text-xs opacity-75 uppercase tracking-wide mb-1">Valid Until</div>
                  <div className="text-sm font-semibold">
                    {new Date(customer.expiryDate).toLocaleDateString('en-US', { 
                      day: 'numeric',
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom section with QR code */}
              <div className="flex justify-end items-end">
                {/* Compact QR Code */}
                <div className="bg-white p-2 rounded-lg shadow-lg">
                  <QRCode value={qrValue} size={40} />
                </div>
              </div>
            </div>
          </div>

          {/* Download Button - Moved with left margin */}
          <div className="w-full max-w-sm mx-auto" style={{ marginLeft: '35%' }}>
            <Button 
              className="w-full" 
              onClick={downloadCard} 
              disabled={isDownloading}
              size="lg"
            >
              <Download className="h-4 w-4 mr-2" /> 
              {isDownloading ? "Processing..." : "Download Card"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="text-center p-8">
          <div className="text-lg text-gray-500">Loading...</div>
        </div>
      )}
    </Layout>
  );
};

export default DigitalCard;
