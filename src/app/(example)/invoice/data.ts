// Invoice data interface
export interface InvoiceData {
  id: string;
  invoice: string;
  name: string;
  category: string;
  status: "Paid" | "Unpaid" | "Pending" | "Cancelled";
  price: string;
  date: string;
  avatar?: string;
}

// Mock data
export const mockInvoices: InvoiceData[] = [
  {
    id: "1",
    invoice: "INV-001",
    name: "Emma Thompson",
    category: "Marketing",
    status: "Paid",
    price: "$980.00",
    date: "10 oct 2025, 11:00 pm",
  },
  {
    id: "2",
    invoice: "INV-002",
    name: "Michael Chen",
    category: "Development",
    status: "Unpaid",
    price: "$8,650.00",
    date: "10 oct 2025, 10:50 pm",
  },
  {
    id: "3",
    invoice: "INV-003",
    name: "Sarah Johnson",
    category: "Design",
    status: "Pending",
    price: "$2,450.00",
    date: "10 oct 2025, 10:25 pm",
  },
  {
    id: "4",
    invoice: "INV-004",
    name: "David Williams",
    category: "Consulting",
    status: "Paid",
    price: "$1,250.00",
    date: "10 oct 2025, 10:10 pm",
  },
  {
    id: "5",
    invoice: "INV-005",
    name: "Lisa Anderson",
    category: "Marketing",
    status: "Cancelled",
    price: "$3,200.00",
    date: "10 oct 2025, 9:45 pm",
  },
  {
    id: "6",
    invoice: "INV-006",
    name: "James Wilson",
    category: "Development",
    status: "Paid",
    price: "$5,800.00",
    date: "10 oct 2025, 9:30 pm",
  },
  {
    id: "7",
    invoice: "INV-007",
    name: "Jennifer Brown",
    category: "Support",
    status: "Unpaid",
    price: "$450.00",
    date: "10 oct 2025, 9:15 pm",
  },
];

// Category icons mapping
export const getCategoryIcon = (category: string) => {
  const icons: { [key: string]: string } = {
    Marketing: "📱",
    Development: "💻",
    Design: "🎨",
    Consulting: "💼",
    Support: "🎧",
  };
  return icons[category] || "📄";
};

// Status chip colors
export const getStatusConfig = (status: string) => {
  const configs: { [key: string]: { color: string; bgcolor: string } } = {
    Paid: { color: "#00695C", bgcolor: "#E8F5E9" },
    Unpaid: { color: "#D32F2F", bgcolor: "#FFEBEE" },
    Pending: { color: "#F57C00", bgcolor: "#FFF3E0" },
    Cancelled: { color: "#616161", bgcolor: "#F5F5F5" },
  };
  return configs[status] || { color: "#757575", bgcolor: "#FAFAFA" };
};
