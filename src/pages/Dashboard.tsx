
import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/StatsCard";
import { getCustomersStats } from "@/services/customerService";
import { Users, Crown, Timer, CreditCard, Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface StatsData {
  total: number;
  prestige: number;
  premier: number;
  expiringSoon: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    total: 0,
    prestige: 0,
    premier: 0,
    expiringSoon: 0
  });
  const [loading, setLoading] = useState(true);

  const loadStats = useCallback(async () => {
    try {
      const statsData = await getCustomersStats();
      setStats(statsData);
    } catch (error) {
      console.error('Error loading stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const handleStatsCardClick = useCallback((filter: string) => {
    navigate(`/customers?filter=${filter}`);
  }, [navigate]);

  const isAdminUser = useMemo(() => isAdmin(), [isAdmin]);

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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Dashboard</h1>
          <p className="text-gray-500">Manage your premium lounge members</p>
        </div>
        <div className="flex gap-3">
          <Button 
            className="bg-secondary hover:bg-secondary/90"
            onClick={() => navigate("/customers/new")}
          >
            Add New Customer
          </Button>
          {isAdminUser && (
            <Button 
              variant="outline"
              onClick={() => navigate("/admin")}
              className="flex items-center gap-2"
            >
              <Settings className="h-4 w-4" />
              User Management
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-8">
        <div onClick={() => handleStatsCardClick('all')} className="cursor-pointer">
          <StatsCard 
            title="Total Members" 
            value={stats.total} 
            icon={<Users />} 
          />
        </div>
        <div onClick={() => handleStatsCardClick('prestige')} className="cursor-pointer">
          <StatsCard 
            title="Prestige Members" 
            value={stats.prestige} 
            icon={<Crown />}
            className="border-l-4 border-purple-400"
          />
        </div>
        <div onClick={() => handleStatsCardClick('premier')} className="cursor-pointer">
          <StatsCard 
            title="Premier Members" 
            value={stats.premier} 
            icon={<CreditCard />}
            className="border-l-4 border-blue-400"
          />
        </div>
        <div onClick={() => handleStatsCardClick('expiring')} className="cursor-pointer">
          <StatsCard 
            title="Expiring Soon" 
            value={stats.expiringSoon} 
            icon={<Timer />}
            className="border-l-4 border-red-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="lounge-card">
          <h2 className="text-xl font-semibold text-primary mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
            <Button
              variant="outline" 
              className="justify-start"
              onClick={() => navigate("/customers")}
            >
              <Users className="mr-2 h-4 w-4" /> View All Customers
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => navigate("/customers/new")}
            >
              <Users className="mr-2 h-4 w-4" /> Add New Customer
            </Button>
          </div>
        </div>

        <div className="lounge-card">
          <h2 className="text-xl font-semibold text-primary mb-4">About FCB Airport Lounge</h2>
          <p className="text-gray-600">
            Welcome to the FCB AirLounge management portal. Here you can manage all your premium members, 
            create digital membership cards, and keep track of your customers' information.
          </p>
          <div className="flex space-x-2 mt-4">
            <div className="h-6 w-6 rounded-full bg-[#112369]"></div>
            <div className="h-6 w-6 rounded-full bg-[#8dc63f]"></div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;
