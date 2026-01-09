export type ViewType = 'dashboard' | 'ad-manager' | 'add-entry' | 'data-sheet' | 'summary-report' | 'user-management' | 'ai-chat' | 'ai-agent' | 'orders' | 'salary-sheet' | 'invoice-importer';

export interface AuthUser {
  id: string;
  username: string;
  token: string;
  role: 'admin' | 'user';
  permissions: string[];
  isActive?: boolean;
}

export interface UserAccount {
  id: string;
  username: string;
  role: 'admin' | 'user';
  permissions: string[];
  password?: string;
  isActive?: boolean;
}

export interface ProductEntry {
  id: string;
  name: string;
  quantity: number;
  salePrice: number;
  buyPrice: number;
}

export interface DailyCost {
  id: string;
  date: string;
  pageName: string;
  dollar: number;
  rate: number;
  totalAdCost: number;
  salary: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

export interface AgentTask {
  id: string;
  name: string;
  description: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  result?: any;
}

export interface Order {
  id: string;
  invoice: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  product: {
    name: string;
    sku: string;
    image?: string;
  };
  total: {
    amount: number;
    paid: number;
    due: number;
  };
  status: string;
  createdAt: string;
  createdBy: string;
  approvedBy?: string;
  isPrinted: boolean;
  courier?: string;
  comment?: string;
  activities: string[];
}

export interface OrderSummary {
  new: number;
  pending: number;
  wfa: number;
  approved: number;
  packaging: number;
  shipment: number;
  partial_delivered: number;
  delivered: number;
  return_pending: number;
  return: number;
  cancel: number;
  incomplete: number;
  all: number;
}

export interface OrderBatch {
  id: string;
  date: string;
  pageName: string;
  products: ProductEntry[];
  sharedCosts: {
    dollar: number;
    rate: number;
    adCost: number;
    salary: number;
    returnExpected: number;
  };
  officeCosts: {
    totalOrders: number;
    mngSalary: number;
    officeCost: number;
    bonus: number;
    manualAdjust: number;
  };
  logistics: {
    deliveryCharge: number;
    packingCost: number;
    codPercentage: number;
  };
}