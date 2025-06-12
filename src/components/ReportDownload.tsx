import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { getAllCustomers } from "@/services/customerService";
import { Customer } from "@/types/customer";

type ReportType = "daily" | "weekly" | "monthly" | "yearly" | "custom";
type CustomerFilter = "all" | "prestige" | "premier";

interface ReportDownloadProps {
  membershipFilter?: string;
}

const ReportDownload = ({ membershipFilter = "all" }: ReportDownloadProps) => {
  const [reportType, setReportType] = useState<ReportType>("daily");
  const [customerTypeFilter, setCustomerTypeFilter] = useState<CustomerFilter>(membershipFilter as CustomerFilter);
  const [fromDate, setFromDate] = useState<Date>();
  const [toDate, setToDate] = useState<Date>();
  const [loading, setLoading] = useState(false);

  const getDateRange = (type: ReportType): { from: Date; to: Date } => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    switch (type) {
      case "daily":
        return { from: today, to: today };
      case "weekly":
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        return { from: weekStart, to: weekEnd };
      case "monthly":
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        return { from: monthStart, to: monthEnd };
      case "yearly":
        const yearStart = new Date(today.getFullYear(), 0, 1);
        const yearEnd = new Date(today.getFullYear(), 11, 31);
        return { from: yearStart, to: yearEnd };
      default:
        return { from: fromDate || today, to: toDate || today };
    }
  };

  const filterCustomersByDate = (customers: Customer[], from: Date, to: Date): Customer[] => {
    return customers.filter(customer => {
      const createdDate = new Date(customer.createdAt);
      const customerDate = new Date(createdDate.getFullYear(), createdDate.getMonth(), createdDate.getDate());
      return customerDate >= from && customerDate <= to;
    });
  };

  const filterCustomersByType = (customers: Customer[]): Customer[] => {
    if (customerTypeFilter === "all") return customers;
    return customers.filter(customer => customer.membershipType === customerTypeFilter);
  };

  const formatAsText = (field: any): string => {
    if (field === null || field === undefined) {
      return '=""';
    }
    
    // Convert to string and preserve original formatting
    const stringValue = String(field);
    
    // Force Excel to treat as text by prefixing with = and wrapping in quotes
    // This preserves leading zeros, plus signs, and special formatting
    const textValue = `="${stringValue.replace(/"/g, '""')}"`;
    
    return textValue;
  };

  const generateCSV = (customers: Customer[]): string => {
    console.log('Generating CSV for customers:', customers.length);
    
    const headers = [
      "Membership Number",
      "First Name",
      "Last Name",
      "Email",
      "Phone",
      "Membership Type",
      "Visits Remaining",
      "Expiry Date",
      "Created Date"
    ];

    const rows = customers.map(customer => {
      console.log('Processing customer phone:', customer.phone);
      return [
        formatAsText(customer.membershipNumber),
        formatAsText(customer.firstName),
        formatAsText(customer.lastName),
        formatAsText(customer.email),
        formatAsText(customer.phone),
        formatAsText(customer.membershipType),
        formatAsText(customer.visits?.toString() || "0"),
        formatAsText(format(new Date(customer.expiryDate), "dd/MM/yyyy")),
        formatAsText(format(new Date(customer.createdAt), "dd/MM/yyyy HH:mm:ss"))
      ];
    });

    // Format headers as text too
    const csvContent = [headers.map(formatAsText), ...rows]
      .map(row => row.join(","))
      .join("\n");

    return csvContent;
  };

  const downloadReport = async () => {
    setLoading(true);
    try {
      const allCustomers = await getAllCustomers(true);
      console.log('Fetched customers from API:', allCustomers.slice(0, 2)); // Log first 2 customers for debugging
      
      const { from, to } = getDateRange(reportType);
      
      let filteredCustomers = reportType === "custom" && fromDate && toDate
        ? filterCustomersByDate(allCustomers, fromDate, toDate)
        : filterCustomersByDate(allCustomers, from, to);

      filteredCustomers = filterCustomersByType(filteredCustomers);

      const csvContent = generateCSV(filteredCustomers);
      
      // Create and download the file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      
      const reportName = reportType === "custom" && fromDate && toDate
        ? `customers-report-${customerTypeFilter}-${format(fromDate, "dd-MM-yyyy")}-to-${format(toDate, "dd-MM-yyyy")}`
        : `customers-report-${customerTypeFilter}-${reportType}-${format(new Date(), "dd-MM-yyyy")}`;
      
      link.setAttribute("download", `${reportName}.csv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log(`Downloaded ${filteredCustomers.length} customer records`);
    } catch (error) {
      console.error("Error generating report:", error);
    } finally {
      setLoading(false);
    }
  };

  const isCustomDateValid = reportType !== "custom" || (fromDate && toDate && fromDate <= toDate);

  return (
    <div className="lounge-card">
      <h2 className="text-xl font-semibold text-primary mb-4">Download Customer Reports</h2>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Customer Type
          </label>
          <Select value={customerTypeFilter} onValueChange={(value: CustomerFilter) => setCustomerTypeFilter(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select customer type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Members</SelectItem>
              <SelectItem value="prestige">Prestige Members</SelectItem>
              <SelectItem value="premier">Premier Members</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Report Type
          </label>
          <Select value={reportType} onValueChange={(value: ReportType) => setReportType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select report type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Daily Report</SelectItem>
              <SelectItem value="weekly">Weekly Report</SelectItem>
              <SelectItem value="monthly">Monthly Report</SelectItem>
              <SelectItem value="yearly">Yearly Report</SelectItem>
              <SelectItem value="custom">Custom Date Range</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {reportType === "custom" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                From Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !fromDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {fromDate ? format(fromDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={fromDate}
                    onSelect={setFromDate}
                    initialFocus
                    className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                To Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !toDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {toDate ? format(toDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={toDate}
                    onSelect={setToDate}
                    initialFocus
                    className="pointer-events-auto"
                    disabled={(date) => fromDate ? date < fromDate : false}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        )}

        <Button
          onClick={downloadReport}
          disabled={loading || !isCustomDateValid}
          className="w-full flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          {loading ? "Generating Report..." : "Download Report"}
        </Button>

        {reportType !== "custom" && (
          <p className="text-sm text-gray-600">
            This will download a CSV file with {customerTypeFilter === "all" ? "all customers" : `${customerTypeFilter} customers`} created in the selected time period.
          </p>
        )}
        
        {reportType === "custom" && !isCustomDateValid && (
          <p className="text-sm text-red-600">
            Please select valid from and to dates. The from date should be earlier than or equal to the to date.
          </p>
        )}
      </div>
    </div>
  );
};

export default ReportDownload;