
import React from "react";
import Layout from "../components/Layout";
import ArchitectureDiagram from "../components/ArchitectureDiagram";

const ArchitecturePage = () => {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">System Architecture</h1>
          <p className="text-gray-500">
            This diagram shows the current architecture and recommended production architecture for FCB AirLounge application.
          </p>
        </div>
        
        <ArchitectureDiagram />
        
        <div className="space-y-4 mt-8">
          <h2 className="text-2xl font-bold">Current Architecture Components</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>React UI Components</strong>: Dashboard, CustomerList, CustomerForm, VerifyAccess, DigitalCard</li>
            <li><strong>React Router</strong>: Client-side navigation between different views</li>
            <li><strong>Client-Side State</strong>: React useState hooks for component-level state</li>
            <li><strong>Data Persistence</strong>: localStorage for data persistence through customerService.ts</li>
            <li><strong>Static File Hosting</strong>: Serves the compiled application bundle</li>
          </ul>
          
          <h2 className="text-2xl font-bold mt-4">Production Architecture Extension</h2>
          <ul className="list-disc pl-5 space-y-2">
            <li><strong>API Gateway</strong>: Request routing, authentication, and rate limiting</li>
            <li><strong>Backend Services</strong>: Customer, Membership, and Authentication services</li>
            <li><strong>Database Layer</strong>: Relational database for structured data (Customers, Visits, MembershipPlans)</li>
            <li><strong>Enhanced Client</strong>: React Query for server state management, JWT authentication</li>
          </ul>
        </div>
      </div>
    </Layout>
  );
};

export default ArchitecturePage;
