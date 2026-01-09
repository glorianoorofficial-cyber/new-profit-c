
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, Search, Download, List, RefreshCw, 
  ChevronRight, Info, Package, Truck, 
  CheckCircle, XCircle, Clock, AlertCircle,
  PackageCheck, HelpCircle, Layers, History, 
  MessageSquare, Settings, Eye, Filter, MoreVertical,
  Calendar, ShoppingBag, ArrowRightLeft, UserCheck, ShieldCheck
} from 'lucide-react';
import { Order, OrderSummary } from './types';

const N8N_BASE_URL = 'https://primary-n8n.your-instance.com'; // User update this
const SECRET_HEADER = 'X-APP-SECRET';
const SECRET_VALUE = process.env.API_KEY || 'enterprise-secret-key';

interface OrdersPageProps {
  user_id: string;
}

const OrdersPage: React.FC<OrdersPageProps> = ({ user_id }) => {
  // State
  const [summary, setSummary] = useState<OrderSummary>({
    new: 0, pending: 0, wfa: 0, approved: 0, packaging: 0, shipment: 0, partial_delivered: 0,
    delivered: 0, return_pending: 0, return: 0, cancel: 0, incomplete: 0, all: 0
  });
  const [orders, setOrders] = useState<Order[]>([]);
  const [totalRows, setTotalRows] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const [filters, setFilters] = useState({
    status: 'all',
    shop: '',
    courier: '',
    type: 'all',
    q: '',
    date_from: '',
    date_to: '',
    page: 1,
    pageSize: 30
  });

  // API Call Helpers
  const n8nCall = async (endpoint: string, body: any) => {
    try {
      const response = await fetch(`${N8N_BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          [SECRET_HEADER]: SECRET_VALUE
        },
        body: JSON.stringify(body)
      });
      if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
      return await response.json();
    } catch (err) {
      console.error(`API Call failed to ${endpoint}:`, err);
      return null;
    }
  };

  const fetchSummary = useCallback(async () => {
    const data = await n8nCall('/webhook/orders/summary', { user_id, source: 'orders_page' });
    if (data) {
      setSummary(data);
    } else {
      // Mock data matching screenshot values for preview if server fails
      setSummary({
        new: 0, pending: 105, wfa: 0, approved: 0, packaging: 10, shipment: 156,
        partial_delivered: 3, delivered: 22945, return_pending: 52, return: 3480,
        cancel: 4507, incomplete: 69, all: 31327
      });
    }
  }, [user_id]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    const data = await n8nCall('/webhook/orders/list', { filters });
    if (data && data.rows) {
      setOrders(data.rows);
      setTotalRows(data.total);
    } else {
      // Mock rows for preview
      setOrders([
        {
          id: '1',
          invoice: '198342',
          customer: { name: 'সাকিব', phone: '01752860028', address: 'জেলা: গাজীপুর, থানা: জয়দেবপুর, গাজীপুর।' },
          product: { name: 'Beaute Glutathione Capsule 500mg - 30 Capsules', sku: '3447', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&q=80' },
          total: { amount: 1000, paid: 0, due: 1000 },
          status: 'Packaging',
          createdAt: '2026-01-06 07:51 PM',
          createdBy: 'Taniya',
          approvedBy: 'Admin || Taniya',
          isPrinted: true,
          activities: ['Packaging'],
          comment: ''
        },
        {
          id: '2',
          invoice: '198331',
          customer: { name: 'রুনা ইসলাম', phone: '01537686206', address: 'জেলা: রাঙ্গামাটি, থানা: কোতোয়ালি ঠিকানা: রাঙ্গামাটি' },
          product: { name: 'Beaute Glutathione Capsule 500mg - 30 Capsules', sku: '1430', image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=100&q=80' },
          total: { amount: 700, paid: 0, due: 700 },
          status: 'Packaging',
          createdAt: '2026-01-06 06:53 PM',
          createdBy: 'Taniya',
          approvedBy: 'Admin || Taniya',
          isPrinted: true,
          courier: 'steadfast',
          activities: ['Packaging'],
          comment: ''
        }
      ]);
    }
    setLoading(false);
  }, [filters]);

  const handleAction = async (action: string, payload: any = {}) => {
    if (selectedIds.length === 0 && action !== 'add_order') {
      alert("Please select orders first.");
      return;
    }
    const data = await n8nCall('/webhook/orders/action', { action, selected_ids: selectedIds, payload });
    if (data && data.status === 'success') {
      alert(data.message || "Action completed!");
      loadAll();
    }
  };

  const loadAll = () => {
    fetchSummary();
    fetchList();
  };

  useEffect(() => {
    loadAll();
  }, [fetchSummary, fetchList]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) setSelectedIds(orders.map(o => o.id));
    else setSelectedIds([]);
  };

  const toggleSelectOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  return (
    <div className="orders-premium-view space-y-6">
      <style>{`
        .orders-premium-view {
          --glass-bg: rgba(255, 255, 255, 0.7);
          --glass-border: rgba(255, 255, 255, 0.3);
          --premium-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05), 0 4px 6px -2px rgba(0, 0, 0, 0.02);
          --depth-shadow: 4px 4px 10px rgba(0,0,0,0.05), inset 1px 1px 3px rgba(255,255,255,0.8);
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
          gap: 16px;
        }

        .summary-card-3d {
          background: white;
          border: 1px solid #f1f5f9;
          border-radius: 6px;
          padding: 1.25rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
          box-shadow: var(--depth-shadow);
          cursor: pointer;
          position: relative;
          overflow: hidden;
        }

        .summary-card-3d:hover {
          transform: translateY(-5px);
          box-shadow: 0 15px 30px -10px rgba(0, 0, 0, 0.1);
          border-color: #6366f1;
        }

        .summary-card-3d.active {
          border: 1px dashed #6366f1;
          background: #f8faff;
        }

        .summary-card-3d h4 {
          font-size: 28px;
          font-weight: 900;
          color: #0f172a;
          line-height: 1;
        }

        .summary-card-3d p {
          font-size: 13px;
          font-weight: 700;
          color: #64748b;
          margin-top: 4px;
        }

        .summary-card-3d .icon-box {
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8fafc;
          border-radius: 12px;
          box-shadow: inset 1px 1px 4px rgba(0,0,0,0.05);
        }

        .table-section-glass {
          background: white;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          box-shadow: var(--premium-shadow);
          overflow: hidden;
        }

        .sticky-table-header th {
          background: #efefef;
          color: #1e293b;
          font-weight: 900;
          font-size: 14px;
          padding: 14px 16px;
          text-align: left;
          position: sticky;
          top: 0;
          z-index: 10;
        }

        .premium-table td {
          padding: 16px;
          border-bottom: 1px solid #f1f5f9;
          vertical-align: top;
          font-size: 13px;
        }

        .row-hover:hover {
          background: #f9fafb;
        }

        .filter-pill {
          height: 38px;
          border-radius: 6px;
          border: 1px solid #cbd5e1;
          padding: 0 12px;
          font-size: 13px;
          font-weight: 600;
          outline: none;
          background: white;
          transition: border-color 0.2s;
        }

        .filter-pill:focus {
          border-color: #6366f1;
        }

        .btn-3d {
          height: 38px;
          padding: 0 16px;
          border-radius: 6px;
          font-size: 13px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: all 0.2s;
          box-shadow: 0 2px 0 rgba(0,0,0,0.05);
        }

        .btn-3d-teal { background: #14b8a6; color: white; }
        .btn-3d-teal:hover { background: #0d9488; transform: translateY(-1px); }
        .btn-3d-dark { background: #0f172a; color: white; }
        .btn-3d-dark:hover { background: #000; }

        .status-badge {
          padding: 2px 10px;
          border-radius: 4px;
          font-size: 11px;
          font-weight: 900;
          text-transform: uppercase;
        }

        .status-badge.packaging { background: #fee2e2; color: #ef4444; }
        .status-badge.printed { background: #dcfce7; color: #15803d; }

        .line-divider {
          flex: 1;
          height: 1px;
          background: #000;
          margin: 0 20px;
        }

        .search-container {
          position: relative;
          flex: 1;
          min-width: 250px;
        }

        .search-container .icon {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #94a3b8;
        }

        .search-container input {
          padding-left: 36px;
        }
      `}</style>

      {/* Top Summary Cards */}
      <div className="summary-grid">
        <SummaryCard label="New" count={summary.new} active={filters.status === 'new'} onClick={() => setFilters({...filters, status: 'new'})} icon={<Clock className="text-blue-500" />} />
        <SummaryCard label="Pending" count={summary.pending} active={filters.status === 'pending'} onClick={() => setFilters({...filters, status: 'pending'})} icon={<AlertCircle className="text-orange-500" />} />
        <SummaryCard label="Waiting for Approval (WFA)" count={summary.wfa} active={filters.status === 'wfa'} onClick={() => setFilters({...filters, status: 'wfa'})} icon={<UserCheck className="text-rose-500" />} />
        <SummaryCard label="Approved" count={summary.approved} active={filters.status === 'approved'} onClick={() => setFilters({...filters, status: 'approved'})} icon={<CheckCircle className="text-emerald-500" />} />
        
        <SummaryCard label="Packaging" count={summary.packaging} active={filters.status === 'packaging'} onClick={() => setFilters({...filters, status: 'packaging'})} icon={<PackageCheck className="text-sky-500" />} />
        <SummaryCard label="Shipment" count={summary.shipment} active={filters.status === 'shipment'} onClick={() => setFilters({...filters, status: 'shipment'})} icon={<Truck className="text-blue-600" />} />
        <SummaryCard label="Partial Delivered" count={summary.partial_delivered} active={filters.status === 'partial'} onClick={() => setFilters({...filters, status: 'partial'})} icon={<Package className="text-amber-500" />} />
        <SummaryCard label="Delivered" count={summary.delivered} active={filters.status === 'delivered'} onClick={() => setFilters({...filters, status: 'delivered'})} icon={<CheckCircle className="text-teal-600" />} />
        
        <SummaryCard label="Return Pending" count={summary.return_pending} active={filters.status === 'return_pending'} onClick={() => setFilters({...filters, status: 'return_pending'})} icon={<RefreshCw className="text-pink-500" />} />
        <SummaryCard label="Return" count={summary.return} active={filters.status === 'return'} onClick={() => setFilters({...filters, status: 'return'})} icon={<RefreshCw className="text-slate-500" />} />
        <SummaryCard label="Cancel" count={summary.cancel} active={filters.status === 'cancel'} onClick={() => setFilters({...filters, status: 'cancel'})} icon={<XCircle className="text-rose-600" />} />
        <SummaryCard label="Incomplete" count={summary.incomplete} active={filters.status === 'incomplete'} onClick={() => setFilters({...filters, status: 'incomplete'})} icon={<Layers className="text-slate-400" />} />
        
        <SummaryCard label="All" count={summary.all} active={filters.status === 'all'} onClick={() => setFilters({...filters, status: 'all'})} icon={<Layers className="text-indigo-500" />} isTotal />
      </div>

      {/* Filter and Table Section */}
      <div className="table-section-glass">
        {/* Upper Action Bar */}
        <div className="p-4 border-b flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-4">
            <select className="filter-pill" style={{minWidth: '180px'}}>
              <option>Select Action</option>
              <option>Approve Selected</option>
              <option>Cancel Selected</option>
            </select>
            <button className="btn-3d btn-3d-teal" onClick={() => handleAction('add_order')}>
              <Plus size={18} /> Add New Order
            </button>
          </div>
          
          <div className="flex items-center flex-1">
            <div className="line-divider"></div>
            <span className="text-[14px] font-black text-slate-400 uppercase tracking-[0.4em]">Orders</span>
            <div className="line-divider"></div>
          </div>

          <div className="flex gap-2">
            <button className="btn-3d btn-3d-teal" onClick={() => handleAction('export_for_courier')}>
              <Download size={16} /> Export For Courier
            </button>
            <button className="btn-3d btn-3d-teal" onClick={() => handleAction('picklist')}>
              <List size={16} /> PickList
            </button>
          </div>
        </div>

        {/* Lower Filter Bar */}
        <div className="p-4 bg-slate-50/50 flex flex-wrap gap-4 items-center">
          <select className="filter-pill" value={filters.type} onChange={e => setFilters({...filters, type: e.target.value})}>
            <option value="all">All type</option>
            <option value="retail">Retail</option>
            <option value="wholesale">Wholesale</option>
          </select>
          <select className="filter-pill" value={filters.shop} onChange={e => setFilters({...filters, shop: e.target.value})}>
            <option value="">select shop</option>
            <option value="shop1">Main Shop</option>
            <option value="shop2">FB Page</option>
          </select>
          <div className="search-container">
            <Search className="icon" size={16} />
            <input 
              type="text" 
              className="filter-pill w-full" 
              placeholder="Enter Invoice, customer phone" 
              value={filters.q}
              onChange={e => setFilters({...filters, q: e.target.value})}
            />
          </div>
          <div className="flex items-center gap-2">
            <input type="date" className="filter-pill" value={filters.date_from} onChange={e => setFilters({...filters, date_from: e.target.value})} />
            <input type="date" className="filter-pill" value={filters.date_to} onChange={e => setFilters({...filters, date_to: e.target.value})} />
          </div>
          <select className="filter-pill" value={filters.courier} onChange={e => setFilters({...filters, courier: e.target.value})}>
            <option value="">Select Courier</option>
            <option value="steadfast">Steadfast</option>
            <option value="redx">RedX</option>
            <option value="pathao">Pathao</option>
          </select>
          <select className="filter-pill w-20" value={filters.pageSize} onChange={e => setFilters({...filters, pageSize: Number(e.target.value)})}>
            <option value="10">10</option>
            <option value="30">30</option>
            <option value="50">50</option>
          </select>
          <button className="btn-3d btn-3d-dark w-12 justify-center p-0" onClick={loadAll}>
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        {/* Orders Table */}
        <div className="overflow-x-auto">
          <table className="premium-table w-full">
            <thead className="sticky-table-header">
              <tr>
                <th className="w-12 text-center">
                  <input type="checkbox" onChange={e => toggleSelectAll(e.target.checked)} checked={selectedIds.length === orders.length && orders.length > 0} />
                </th>
                <th>Customer</th>
                <th>Product</th>
                <th>Invoice</th>
                <th>Total</th>
                <th>Activities</th>
                <th className="text-center">Action</th>
                <th>Courier</th>
                <th>Comment</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center">
                    <Loader2 className="animate-spin mx-auto text-indigo-500 mb-4" size={40} />
                    <p className="font-bold text-slate-400">Loading Order Clusters...</p>
                  </td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-20 text-center text-slate-400 italic">No orders found matching filters.</td>
                </tr>
              ) : orders.map(order => (
                <tr key={order.id} className="row-hover">
                  <td className="text-center pt-8">
                    <input type="checkbox" checked={selectedIds.includes(order.id)} onChange={() => toggleSelectOne(order.id)} />
                  </td>
                  <td>
                    <div className="font-bold text-slate-900 mb-1">{order.customer.name}</div>
                    <div className="text-indigo-600 font-bold flex items-center gap-1 text-[12px] mb-1">
                      {order.customer.phone} <Info size={12} className="cursor-help" />
                    </div>
                    <div className="text-[11px] text-slate-500 leading-relaxed max-w-[200px]">
                      {order.customer.address}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 bg-slate-100 rounded border border-slate-200 p-1 flex-shrink-0">
                        {order.product.image ? (
                          <img src={order.product.image} className="w-full h-full object-cover" />
                        ) : (
                          <ShoppingBag size={24} className="m-auto text-slate-300" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-[12px] font-black text-slate-700 leading-snug line-clamp-2 mb-1">{order.product.name}</div>
                        <div className="text-[11px] font-bold text-slate-400">{order.product.sku}</div>
                      </div>
                    </div>
                  </td>
                  <td className="font-bold text-slate-600 text-[12px]">{order.invoice}</td>
                  <td>
                    <div className="text-[12px] space-y-1">
                      <div className="font-black text-slate-800">Total: {order.total.amount}</div>
                      <div className="font-bold text-slate-400">Paid: {order.total.paid}</div>
                      <div className="font-bold text-rose-500">Due: {order.total.due}</div>
                    </div>
                  </td>
                  <td>
                    <div className="space-y-1.5 text-[11px] font-bold">
                      <div className="flex items-center gap-1">Status : <span className="status-badge packaging">{order.status}</span></div>
                      <div className="text-slate-400">Order Date : {order.createdAt}</div>
                      <div className="text-slate-400">Created By : Admin || {order.createdBy}</div>
                      <div className="text-slate-400">Approved By : {order.approvedBy || '---'}</div>
                    </div>
                  </td>
                  <td>
                    <div className="flex flex-col items-center gap-2">
                       <button className="px-4 py-1.5 bg-teal-500 text-white font-black rounded text-[11px] hover:bg-teal-600 transition-colors">-- = --</button>
                       {order.isPrinted && (
                         <span className="status-badge printed flex items-center gap-1"><CheckCircle size={10} /> Printed</span>
                       )}
                    </div>
                  </td>
                  <td>
                    <div className="flex items-center gap-2 text-slate-500 font-bold italic">
                      {order.courier || '---'} 
                      <button className="text-slate-300 hover:text-indigo-500"><Settings size={14} /></button>
                    </div>
                  </td>
                  <td>
                    <button className="text-slate-300 hover:text-indigo-500 transition-colors">
                       <MessageSquare size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Internal Subcomponents
const SummaryCard = ({ label, count, active, onClick, icon, isTotal }: any) => (
  <div className={`summary-card-3d ${active ? 'active' : ''}`} onClick={onClick}>
    <div className="space-y-1">
      <h4>{count.toLocaleString()}</h4>
      <p>{label}</p>
    </div>
    <div className="icon-box">
      {icon}
    </div>
    {isTotal && (
      <div className="absolute top-2 right-2 w-2 h-2 bg-indigo-500 rounded-full shadow-[0_0_10px_rgba(99,102,241,1)]"></div>
    )}
  </div>
);

const Loader2 = ({ className, size }: any) => <RefreshCw className={`${className}`} size={size} />;

export default OrdersPage;
