
import React, { useRef } from "react";
import html2canvas from "html2canvas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";
import { toast } from "sonner";

const ArchitectureDiagram = () => {
  const diagramRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (!diagramRef.current) return;
    
    try {
      toast.info("Preparing download...");
      const canvas = await html2canvas(diagramRef.current, {
        backgroundColor: "#FFFFFF",
        scale: 2
      });
      
      const link = document.createElement("a");
      link.download = "fcb-airlounge-architecture.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      toast.success("Architecture diagram downloaded successfully!");
    } catch (error) {
      console.error("Error generating image:", error);
      toast.error("Failed to download diagram. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center w-full">
      <div className="flex justify-end w-full mb-4">
        <Button 
          onClick={handleDownload}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Download Diagram
        </Button>
      </div>
      
      <Card className="p-4 w-full border-2 border-gray-200" ref={diagramRef}>
        <div className="bg-white p-6 rounded-lg">
          <h2 className="text-2xl font-bold text-center mb-6">FCB AirLounge Architecture</h2>
          
          {/* Client Layer */}
          <div className="border-2 border-blue-500 rounded-lg p-4 mb-6 bg-blue-50">
            <div className="text-lg font-semibold text-center text-blue-700 mb-4">CLIENT (BROWSER)</div>
            
            <div className="flex flex-col md:flex-row justify-around gap-4 mb-4">
              <div className="border-2 border-blue-400 rounded p-3 bg-white flex-1">
                <div className="text-center font-medium">React UI Components</div>
              </div>
              
              <div className="border-2 border-blue-400 rounded p-3 bg-white flex-1">
                <div className="text-center font-medium">React Router</div>
              </div>
              
              <div className="border-2 border-blue-400 rounded p-3 bg-white flex-1">
                <div className="text-center font-medium">Client-Side State</div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row justify-around gap-4">
              <div className="border-2 border-blue-400 rounded p-3 bg-white flex-1">
                <div className="text-center font-medium">UI Library (shadcn/ui)</div>
              </div>
              
              <div className="border-2 border-blue-400 rounded p-3 bg-white flex-1">
                <div className="text-center font-medium">Data Persistence (localStorage)</div>
              </div>
            </div>
          </div>
          
          {/* Static File Hosting */}
          <div className="flex justify-center mb-4">
            <div className="w-2 h-12 bg-gray-400"></div>
          </div>
          
          <div className="border-2 border-green-500 rounded-lg p-4 bg-green-50 mb-8">
            <div className="text-lg font-semibold text-center text-green-700 mb-4">STATIC FILE HOSTING</div>
            
            <div className="flex flex-col md:flex-row justify-around gap-4">
              <div className="border-2 border-green-400 rounded p-3 bg-white flex-1">
                <div className="text-center font-medium">HTML</div>
              </div>
              
              <div className="border-2 border-green-400 rounded p-3 bg-white flex-1">
                <div className="text-center font-medium">CSS (Tailwind)</div>
              </div>
              
              <div className="border-2 border-green-400 rounded p-3 bg-white flex-1">
                <div className="text-center font-medium">JavaScript Bundle</div>
              </div>
            </div>
          </div>
          
          <h3 className="text-xl font-bold text-center my-6">Production Architecture (Recommended)</h3>
          
          {/* Production Client Layer */}
          <div className="border-2 border-blue-500 rounded-lg p-4 mb-6 bg-blue-50">
            <div className="text-lg font-semibold text-center text-blue-700 mb-4">ENHANCED CLIENT</div>
            
            <div className="flex flex-col md:flex-row justify-around gap-4">
              <div className="border-2 border-blue-400 rounded p-3 bg-white flex-1">
                <div className="text-center font-medium">React UI Components</div>
              </div>
              
              <div className="border-2 border-blue-400 rounded p-3 bg-white flex-1">
                <div className="text-center font-medium">React Router</div>
              </div>
              
              <div className="border-2 border-blue-400 rounded p-3 bg-white flex-1">
                <div className="text-center font-medium">React Query</div>
              </div>
            </div>
          </div>
          
          {/* API Gateway */}
          <div className="flex justify-center mb-4">
            <div className="w-2 h-12 bg-gray-400"></div>
          </div>
          
          <div className="border-2 border-purple-500 rounded-lg p-4 mb-6 bg-purple-50">
            <div className="text-lg font-semibold text-center text-purple-700">API GATEWAY</div>
          </div>
          
          {/* Backend Services */}
          <div className="flex justify-center mb-4">
            <div className="w-2 h-12 bg-gray-400"></div>
          </div>
          
          <div className="border-2 border-red-500 rounded-lg p-4 mb-6 bg-red-50">
            <div className="text-lg font-semibold text-center text-red-700 mb-4">BACKEND SERVICES</div>
            
            <div className="flex flex-col md:flex-row justify-around gap-4 mb-4">
              <div className="border-2 border-red-400 rounded p-3 bg-white flex-1">
                <div className="text-center font-medium">Customer Service</div>
              </div>
              
              <div className="border-2 border-red-400 rounded p-3 bg-white flex-1">
                <div className="text-center font-medium">Membership Service</div>
              </div>
              
              <div className="border-2 border-red-400 rounded p-3 bg-white flex-1">
                <div className="text-center font-medium">Authentication Service</div>
              </div>
            </div>
            
            <div className="flex justify-center my-4">
              <div className="w-2 h-12 bg-gray-400"></div>
            </div>
            
            <div className="border-2 border-orange-500 rounded-lg p-4 bg-orange-50">
              <div className="text-lg font-semibold text-center text-orange-700 mb-4">DATABASE LAYER</div>
              
              <div className="flex flex-col md:flex-row justify-around gap-4">
                <div className="border-2 border-orange-400 rounded p-3 bg-white flex-1">
                  <div className="text-center font-medium">Customers</div>
                </div>
                
                <div className="border-2 border-orange-400 rounded p-3 bg-white flex-1">
                  <div className="text-center font-medium">Visits</div>
                </div>
                
                <div className="border-2 border-orange-400 rounded p-3 bg-white flex-1">
                  <div className="text-center font-medium">Membership Plans</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="text-xs text-center text-gray-500 mt-4">
            FCB AirLounge Application Architecture © {new Date().getFullYear()}
          </div>
        </div>
      </Card>
    </div>
  );
};

export default ArchitectureDiagram;
