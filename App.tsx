import React, { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { 
  LayoutDashboard, Megaphone, PlusCircle, Table, BarChart3, Users, 
  LogOut, DollarSign, TrendingUp, Package, Bot, AlertTriangle, 
  CheckCircle2, Loader2, ShieldCheck, Link, Globe, Key, Lock, User,
  Plus, RotateCcw, Shield, Trash2, Calendar, ChevronRight, Settings, Info, List,
  Printer, Save, Search, FileText, Send, Sparkles, Terminal, Code, Cpu, Eye, UserPlus, Fingerprint,
  TrendingDown, ShoppingCart, Percent, Trash, History, ExternalLink, X, Edit, Filter, Download,
  Wallet, FileUp, UserCheck, UserX, Zap
} from 'lucide-react';
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area
} from 'recharts';
import { GoogleGenAI } from "@google/genai";
import { ViewType, AuthUser, UserAccount, ProductEntry, OrderBatch, DailyCost, ChatMessage, AgentTask } from './types';
import OrdersPage from './OrdersPage';
import UserManagementPage from './UserManagementPage';
import InvoiceImporter from './InvoiceImporter';
import TrendingProductsHub from './TrendingProductsHub';

export const PERMISSIONS = [
  { id: 'view_dashboard', label: 'View Dashboard' },
  { id: 'ad_cost_manager', label: 'Ad & Cost Manager' },
  { id: 'add_entry', label: 'Ad Entry (Add Data)' },
  { id: 'view_data_sheet', label: 'View Data Sheet' },
  { id: 'view_summary', label: 'View Summary Report' },
  { id: 'admin_users', label: 'Admin (Manage Users)' }
];

// Shared Storage Helpers
const SHARED_STORAGE_KEY = 'ps_page_daily_cost_v1';
const USERS_STORAGE_KEY = 'ps_system_users_v1';

const saveSharedCost = (date: string, pageName: string, data: { dollar: number, rate: number, salary: number }) => {
  try {
    const storage = JSON.parse(localStorage.getItem(SHARED_STORAGE_KEY) || '{}');
    storage[`${date}::${pageName}`] = data;
    localStorage.setItem(SHARED_STORAGE_KEY, JSON.stringify(storage));
  } catch (e) { console.error('Shared storage error', e); }
};

const getSharedCost = (date: string, pageName: string) => {
  try {
    const storage = JSON.parse(localStorage.getItem(SHARED_STORAGE_KEY) || '{}');
    return storage[`${date}::${pageName}`] || null;
  } catch (e) { return null; }
};

const MasterModal = ({ 
  title, 
  items, 
  type, 
  isOpen, 
  onClose,
  newItemName,
  setNewItemName,
  newItemRate,
  setNewItemRate,
  handleAddItem,
  handleDeleteItem,
  startEditingMaster,
  editingMasterName,
  setEditingMasterName
}: { 
  title: string, 
  items: any[], 
  type: 'page' | 'product', 
  isOpen: boolean, 
  onClose: () => void,
  newItemName: string,
  setNewItemName: (v: string) => void,
  newItemRate: string,
  setNewItemRate: (v: string) => void,
  handleAddItem: (type: 'page' | 'product') => void,
  handleDeleteItem: (type: 'page' | 'product', name: string) => void,
  startEditingMaster: (item: any) => void,
  editingMasterName: string | null,
  setEditingMasterName: (v: string | null) => void
}) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300">
        <div className="flex justify-between items-center mb-8">
          <h3 className="text-xl font-black text-slate-800 tracking-tight">{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>
        
        <div className="space-y-4 mb-8">
          <div className={`flex ${type === 'product' ? 'flex-col' : ''} gap-2`}>
            <input 
              type="text" 
              placeholder={`Item name...`}
              className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-sm"
              value={newItemName}
              onChange={e => setNewItemName(e.target.value)}
            />
            {type === 'product' && (
              <input 
                type="number" 
                placeholder="Default Rate (TK)"
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 font-bold text-sm"
                value={newItemRate}
                onChange={e => setNewItemRate(e.target.value)}
              />
            )}
            <div className="flex gap-2">
              <button 
                onClick={() => handleAddItem(type)}
                className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
              >
                {editingMasterName ? 'Update' : 'Add'} {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
              {editingMasterName && (
                <button 
                  onClick={() => { setEditingMasterName(null); setNewItemName(''); setNewItemRate(''); }}
                  className="px-4 py-3 bg-slate-100 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="max-h-[300px] overflow-y-auto space-y-2 pr-2 custom-scrollbar">
          {items.map(item => {
            const itemName = typeof item === 'string' ? item : item.name;
            const itemLabel = typeof item === 'string' ? item : `${item.name} (৳${item.rate})`;
            return (
              <div key={itemName} className="flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl group hover:border-indigo-200 transition-all">
                <span className="font-bold text-sm text-slate-700">{itemLabel}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <button 
                    onClick={() => startEditingMaster(item)}
                    className="p-2 text-slate-300 hover:text-indigo-500 transition-colors"
                  >
                    <Edit size={16} />
                  </button>
                  <button 
                    onClick={() => handleDeleteItem(type, itemName)}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <p className="text-center py-8 text-slate-400 font-bold italic text-xs">No {type}s added yet.</p>
          )}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loginLoading, setLoginLoading] = useState(false);
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [managedPages, setManagedPages] = useState<string[]>(['Page A', 'Page B', 'Page C']);
  const [managedProducts, setManagedProducts] = useState<{name: string, rate: number}[]>([]);
  const [isPageModalOpen, setIsPageModalOpen] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemRate, setNewItemRate] = useState<string>('');
  const [editingMasterName, setEditingMasterName] = useState<string | null>(null);
  const [entries, setEntries] = useState<OrderBatch[]>([]);
  const [dailyCosts, setDailyCosts] = useState<DailyCost[]>([
    { id: '1', date: '2025-12-11', pageName: 'Page A', dollar: 2, rate: 2, totalAdCost: 4.00, salary: 2.00 },
    { id: '2', date: '2025-12-02', pageName: 'Page A', dollar: 5, rate: 5, totalAdCost: 25.01, salary: 0.00 },
    { id: '3', date: '2025-12-02', pageName: 'Page B', dollar: 50, rate: 126, totalAdCost: 6300.00, salary: 800.00 }
  ]);
  const [users, setUsers] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem(USERS_STORAGE_KEY);
    if (saved) return JSON.parse(saved);
    return [
      { id: 'u1', username: 'admin', password: '1234', role: 'admin', permissions: PERMISSIONS.map(p => p.id), isActive: true },
      { id: 'u2', username: 'manager_rahim', password: '1234', role: 'user', permissions: ['view_dashboard', 'view_data_sheet'], isActive: true },
      { id: 'u3', username: 'entry_operator', password: '1234', role: 'user', permissions: ['add_entry'], isActive: true }
    ];
  });

  useEffect(() => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }, [users]);

  const [adFilter, setAdFilter] = useState({ q: '', date: '' });
  const [sheetDateFilter, setSheetDateFilter] = useState('');
  const [summaryTab, setSummaryTab] = useState<'matrix' | 'category'>('matrix');
  const [sumMonthFilter, setSumMonthFilter] = useState('');
  const [sumDayFilter, setSumDayFilter] = useState('');
  const [salaryConfigs, setSalaryConfigs] = useState<Record<string, { id: string, name: string, monthly: number }[]>>(() => {
    const saved = localStorage.getItem('ps_salary_configs');
    return saved ? JSON.parse(saved) : {
      'Page A': [{ id: '1', name: 'Limon', monthly: 15000 }],
      'Page B': [],
      'Page C': [{ id: '2', name: 'Chiku', monthly: 20000 }, { id: '3', name: 'Jibon', monthly: 16000 }]
    };
  });
  const [salForm, setSalForm] = useState({ page: '', mod: '', monthly: 0 });
  const [salError, setSalError] = useState('');
  const [customMods, setCustomMods] = useState<{id: string, name: string}[]>(() => {
    const saved = localStorage.getItem('ps_moderators_v1');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((m: any) => typeof m === 'string' ? { id: m, name: m } : m);
    }
    return [];
  });
  const [attendance, setAttendance] = useState<Record<string, boolean>>(() => {
    const saved = localStorage.getItem('ps_attendance_v1');
    return saved ? JSON.parse(saved) : {};
  });

  const allModeratorNames = useMemo(() => {
    const baseNames = users.map(u => u.username);
    const customNames = customMods.map(m => m.name);
    return Array.from(new Set([...baseNames, ...customNames]));
  }, [users, customMods]);

  const [batchForm, setBatchForm] = useState<Omit<OrderBatch, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    pageName: 'Page A',
    products: [{ id: '1', name: '', quantity: 0, salePrice: 0, buyPrice: 0 }],
    sharedCosts: { dollar: 0, rate: 0, adCost: 0, salary: 0, returnExpected: 20 },
    officeCosts: { totalOrders: 0, mngSalary: 0, officeCost: 0, bonus: 0, manualAdjust: 0 },
    logistics: { deliveryCharge: 120, packingCost: 10, codPercentage: 1 }
  });

  const currentBatchQty = useMemo(() => {
    return batchForm.products.reduce((sum: number, p) => sum + (Number(p.quantity) || 0), 0);
  }, [batchForm.products]);

  const currentAdCostH = useMemo(() => {
    return (Number(batchForm.sharedCosts.dollar) || 0) * (Number(batchForm.sharedCosts.rate) || 0);
  }, [batchForm.sharedCosts.dollar, batchForm.sharedCosts.rate]);

  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [adForm, setAdForm] = useState({
    date: new Date().toISOString().split('T')[0],
    pageName: '',
    dollar: 0,
    rate: 0,
    salary: 0
  });

  const liveTotalAdCost = useMemo(() => {
    return (Number(adForm.dollar) || 0) * (Number(adForm.rate) || 0);
  }, [adForm.dollar, adForm.rate]);

  const filteredAdCosts = useMemo(() => {
    return dailyCosts.filter(cost => {
      const matchesSearch = cost.pageName.toLowerCase().includes(adFilter.q.toLowerCase());
      const matchesDate = adFilter.date ? cost.date === adFilter.date : true;
      return matchesSearch && matchesDate;
    });
  }, [dailyCosts, adFilter]);

  const adCostTotals = useMemo(() => {
    return filteredAdCosts.reduce((acc: { adCost: number; salary: number }, curr) => ({
      adCost: acc.adCost + curr.totalAdCost,
      salary: acc.salary + curr.salary
    }), { adCost: 0, salary: 0 });
  }, [filteredAdCosts]);

  const flattenedSheetRows = useMemo(() => {
    const dateFilteredEntries = sheetDateFilter 
      ? entries.filter(e => e.date === sheetDateFilter) 
      : entries;

    const dailyTotalOrdersMap: Record<string, number> = {};
    dateFilteredEntries.forEach(e => {
      const batchQty = e.products.reduce((acc: number, p) => acc + (Number(p.quantity) || 0), 0);
      dailyTotalOrdersMap[e.date] = (dailyTotalOrdersMap[e.date] || 0) + batchQty;
    });

    const rows: any[] = [];
    dateFilteredEntries.forEach(batch => {
      const batchQty = batch.products.reduce((acc: number, p) => acc + (Number(p.quantity) || 0), 0);
      const dayTotalOrders = dailyTotalOrdersMap[batch.date] || batchQty;

      batch.products.forEach(product => {
        const qty = Number(product.quantity) || 0;
        if (qty === 0) return;

        const unitBatchAd = batchQty > 0 ? (batch.sharedCosts.dollar * batch.sharedCosts.rate) / batchQty : 0;
        const unitBatchSalary = batchQty > 0 ? batch.sharedCosts.salary / batchQty : 0;
        const unitMngSalary = dayTotalOrders > 0 ? batch.officeCosts.mngSalary / dayTotalOrders : 0;
        const unitOfficeCost = dayTotalOrders > 0 ? batch.officeCosts.officeCost / dayTotalOrders : 0;
        const unitBonus = dayTotalOrders > 0 ? batch.officeCosts.bonus / dayTotalOrders : 0;
        const unitCOD = (product.salePrice * batch.logistics.codPercentage) / 100;
        const unitReturn = (product.salePrice * batch.sharedCosts.returnExpected) / 100;
        const totalUnitCost = product.buyPrice + unitBatchAd + unitBatchSalary + unitMngSalary + unitOfficeCost + unitBonus + unitCOD + unitReturn + batch.logistics.deliveryCharge + batch.logistics.packingCost;
        const unitProfit = product.salePrice - totalUnitCost;

        rows.push({
          date: batch.date,
          page: batch.pageName,
          product: product.name,
          buyPrice: product.buyPrice,
          dollar: batch.sharedCosts.dollar,
          rate: batch.sharedCosts.rate,
          calculatedDollar: unitBatchAd,
          pageSalary: unitBatchSalary,
          mngSalary: unitMngSalary,
          bonus: unitBonus,
          officeCost: unitOfficeCost,
          cod: unitCOD,
          returnCost: unitReturn,
          delivery: batch.logistics.deliveryCharge,
          packing: batch.logistics.packingCost,
          total: product.salePrice,
          profit: unitProfit,
          qty: qty
        });
      });
    });
    return rows;
  }, [entries, sheetDateFilter]);

  const dashboardStats = useMemo(() => {
    const totalAdCost = dailyCosts.reduce((acc: number, curr) => acc + curr.totalAdCost, 0);
    const totalProfit = entries.reduce((acc: number, entry) => {
      const entryProfit = entry.products.reduce((pAcc: number, p) => pAcc + ((p.salePrice - p.buyPrice) * (Number(p.quantity) || 0)), 0);
      return acc + entryProfit;
    }, 0);
    const totalOrders = entries.reduce((acc: number, entry) => {
      const entryOrders = entry.products.reduce((pAcc: number, p) => pAcc + (Number(p.quantity) || 0), 0);
      return acc + entryOrders;
    }, 0);
    return { totalProfit, totalAdCost, totalOrders };
  }, [entries, dailyCosts]);

  const summaryData = useMemo(() => {
    const filteredEntries = entries.filter(e => {
      if (sumDayFilter) return e.date === sumDayFilter;
      if (sumMonthFilter) return e.date.startsWith(sumMonthFilter);
      return true;
    });

    const dates = Array.from(new Set(filteredEntries.map(e => e.date))).sort();
    const pages = Array.from(new Set(filteredEntries.map(e => e.pageName))).sort();
    const matrix: Record<string, Record<string, number>> = {};
    pages.forEach((p: string) => {
      matrix[p] = {};
      dates.forEach((d: string) => {
        const pageDayEntries = filteredEntries.filter(e => e.pageName === p && e.date === d);
        let dayProfit = 0;
        pageDayEntries.forEach(batch => {
          const batchQty = batch.products.reduce((acc: number, prod) => acc + (Number(prod.quantity) || 0), 0);
          batch.products.forEach(prod => {
            const qty = Number(prod.quantity) || 0;
            const unitBatchAd = batchQty > 0 ? (batch.sharedCosts.dollar * batch.sharedCosts.rate) / batchQty : 0;
            const unitBatchSalary = batchQty > 0 ? batch.sharedCosts.salary / batchQty : 0;
            const unitCOD = (prod.salePrice * batch.logistics.codPercentage) / 100;
            const unitReturn = (prod.salePrice * batch.sharedCosts.returnExpected) / 100;
            const totalUnitCost = prod.buyPrice + unitBatchAd + unitBatchSalary + unitCOD + unitReturn + batch.logistics.deliveryCharge + batch.logistics.packingCost;
            dayProfit += (prod.salePrice - totalUnitCost) * qty;
          });
        });
        (matrix[p] as Record<string, number>)[d] = dayProfit;
      });
    });

    const breakdown: Record<string, Record<string, number>> = {};
    const categories = [
      'TOTAL MAILER DAM', 'TOTAL DOLLAR', 'TOTAL SALARY', 'BONUS', 'OFFICE COST', 
      'COD', 'RETURN COST', 'DELIVERY CHARGE', 'PACKING COST', 'TOTAL COST', 
      'TOTAL ORDER', 'TOTAL DELIVERED AMOUNT', 'NET PROFIT', 'TOTAL RETURN TK', 'RETURN PICH'
    ];

    categories.forEach((cat: string) => {
      breakdown[cat] = {};
      dates.forEach((d: string) => {
        const dayEntries = filteredEntries.filter(e => e.date === d);
        let val = 0;
        dayEntries.forEach(batch => {
          const batchQty = batch.products.reduce((acc, prod) => acc + (Number(prod.quantity) || 0), 0);
          switch(cat) {
            case 'TOTAL MAILER DAM': val += batch.products.reduce((acc, p) => acc + (p.buyPrice * p.quantity), 0); break;
            case 'TOTAL DOLLAR': val += (batch.sharedCosts.dollar * batch.sharedCosts.rate); break;
            case 'TOTAL SALARY': val += batch.sharedCosts.salary; break;
            case 'BONUS': val += batch.officeCosts.bonus; break;
            case 'OFFICE COST': val += batch.officeCosts.officeCost; break;
            case 'COD': val += batch.products.reduce((acc, p) => acc + ((p.salePrice * batch.logistics.codPercentage / 100) * p.quantity), 0); break;
            case 'RETURN COST': val += batch.products.reduce((acc, p) => acc + ((p.salePrice * batch.sharedCosts.returnExpected / 100) * p.quantity), 0); break;
            case 'DELIVERY CHARGE': val += (batch.logistics.deliveryCharge * batchQty); break;
            case 'PACKING COST': val += (batch.logistics.packingCost * batchQty); break;
            case 'TOTAL ORDER': val += batchQty; break;
            case 'TOTAL DELIVERED AMOUNT': val += batch.products.reduce((acc, p) => acc + (p.salePrice * p.quantity), 0); break;
          }
        });
        if (cat === 'TOTAL COST') {
          val = (breakdown['TOTAL MAILER DAM'][d] || 0) + (breakdown['TOTAL DOLLAR'][d] || 0) + (breakdown['TOTAL SALARY'][d] || 0) + (breakdown['BONUS'][d] || 0) + (breakdown['OFFICE COST'][d] || 0) + (breakdown['COD'][d] || 0) + (breakdown['RETURN COST'][d] || 0) + (breakdown['DELIVERY CHARGE'][d] || 0) + (breakdown['PACKING COST'][d] || 0);
        } else if (cat === 'NET PROFIT') {
          val = (breakdown['TOTAL DELIVERED AMOUNT'][d] || 0) - (breakdown['TOTAL COST'][d] || 0);
        } else if (cat === 'TOTAL RETURN TK') {
          val = breakdown['RETURN COST'][d] || 0;
        } else if (cat === 'RETURN PICH') {
          val = dayEntries.reduce((acc, batch) => acc + batch.products.reduce((pAcc, p) => pAcc + (p.quantity * batch.sharedCosts.returnExpected / 100), 0), 0);
        }
        (breakdown[cat] as Record<string, number>)[d] = val;
      });
    });
    return { dates, pages, matrix, breakdown };
  }, [entries, sumMonthFilter, sumDayFilter]);

  const totalSummaryProfit = useMemo(() => {
    return Object.values(summaryData.matrix).reduce((acc: number, pageRow) => 
      acc + Object.values(pageRow as Record<string, number>).reduce((pAcc: number, val: number) => pAcc + val, 0)
    , 0);
  }, [summaryData]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const usernameInput = credentials.username.trim().toLowerCase();
    const matchedUser = users.find(u => u.username.toLowerCase() === usernameInput);
    if (matchedUser && credentials.password === (matchedUser.password || '1234')) {
      if (matchedUser.isActive === false) {
        alert('Your account is deactivated.');
        setLoginLoading(false);
        return;
      }
      setUser({ ...matchedUser, token: 'jwt-secure-token' });
    } else {
      alert('Invalid credentials');
    }
    setLoginLoading(false);
  };

  const handleAddBatch = () => {
    if (currentBatchQty === 0) return alert('Batch orders cannot be zero');
    const newBatch: OrderBatch = { 
      ...batchForm, 
      id: Date.now().toString(),
      sharedCosts: { ...batchForm.sharedCosts, adCost: currentAdCostH },
      officeCosts: { ...batchForm.officeCosts, totalOrders: currentBatchQty }
    };
    setEntries(prev => [newBatch, ...prev]);
    alert('Batch added to sheet successfully!');
    setBatchForm(prev => ({
      ...prev,
      products: [{ id: '1', name: '', quantity: 0, salePrice: 0, buyPrice: 0 }]
    }));
  };

  const handleSaveAdCost = () => {
    if (!adForm.pageName) return alert('Select a page');
    const totalAdCost = liveTotalAdCost;
    if (editingCostId) {
      setDailyCosts(prev => prev.map(c => c.id === editingCostId ? { ...adForm, id: c.id, totalAdCost } : c));
      alert('Ad cost updated!');
      setEditingCostId(null);
    } else {
      const newCost: DailyCost = { ...adForm, id: Date.now().toString(), totalAdCost };
      setDailyCosts(prev => [newCost, ...prev]);
      alert('Ad cost saved!');
    }
    saveSharedCost(adForm.date, adForm.pageName, {
      dollar: adForm.dollar,
      rate: adForm.rate,
      salary: adForm.salary
    });
    setAdForm({ date: new Date().toISOString().split('T')[0], pageName: '', dollar: 0, rate: 0, salary: 0 });
  };

  const startEditCost = (cost: DailyCost) => {
    setEditingCostId(cost.id);
    setAdForm({ date: cost.date, pageName: cost.pageName, dollar: cost.dollar, rate: cost.rate, salary: cost.salary });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cancelEditCost = () => {
    setEditingCostId(null);
    setAdForm({ date: new Date().toISOString().split('T')[0], pageName: '', dollar: 0, rate: 0, salary: 0 });
  };

  const deleteCost = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    setDailyCosts(prev => prev.filter(c => c.id !== id));
  };

  const handleLogout = () => { setUser(null); setCurrentView('dashboard'); };

  const handleAddItem = (type: 'page' | 'product') => {
    const trimmedName = newItemName.trim();
    if (!trimmedName) return;
    if (editingMasterName) {
      if (type === 'page') setManagedPages(prev => prev.map(p => p === editingMasterName ? trimmedName : p));
      else setManagedProducts(prev => prev.map(p => p.name === editingMasterName ? { name: trimmedName, rate: Number(newItemRate) || 0 } : p));
      setEditingMasterName(null);
    } else {
      if (type === 'page') {
        if (managedPages.includes(trimmedName)) return alert('Page exists');
        setManagedPages(prev => [...prev, trimmedName]);
      } else {
        if (managedProducts.some(p => p.name === trimmedName)) return alert('Product exists');
        setManagedProducts(prev => [...prev, { name: trimmedName, rate: Number(newItemRate) || 0 }]);
      }
    }
    setNewItemName('');
    setNewItemRate('');
  };

  const startEditingMaster = (item: any) => {
    const name = typeof item === 'string' ? item : item.name;
    const rate = typeof item === 'string' ? '' : item.rate.toString();
    setNewItemName(name);
    setNewItemRate(rate);
    setEditingMasterName(name);
  };

  const handleDeleteItem = (type: 'page' | 'product', name: string) => {
    if (!confirm(`Remove ${name}?`)) return;
    if (type === 'page') setManagedPages(prev => prev.filter(p => p !== name));
    else setManagedProducts(prev => prev.filter(p => p.name !== name));
  };

  const closeMasterModal = () => {
    setIsPageModalOpen(false); setIsProductModalOpen(false);
    setEditingMasterName(null); setNewItemName(''); setNewItemRate('');
  };

  const handleAssignModerator = () => {
    if (!salForm.page || !salForm.mod || salForm.monthly <= 0) {
      setSalError('Please fill all fields.');
      return;
    }
    setSalError('');
    const newConfigs = { ...salaryConfigs };
    if (!newConfigs[salForm.page]) newConfigs[salForm.page] = [];
    newConfigs[salForm.page].push({ id: Date.now().toString(), name: salForm.mod, monthly: Number(salForm.monthly) });
    setSalaryConfigs(newConfigs);
    localStorage.setItem('ps_salary_configs', JSON.stringify(newConfigs));
    setSalForm({ page: '', mod: '', monthly: 0 });
  };

  const toggleAttendance = (page: string, modId: string) => {
    if (!sumDayFilter) return;
    const key = `${sumDayFilter}::${page}::${modId}`;
    const newAtt = { ...attendance };
    newAtt[key] = attendance[key] === false ? true : false;
    setAttendance(newAtt);
    localStorage.setItem('ps_attendance_v1', JSON.stringify(newAtt));
  };

  const addNewModerator = () => {
    const name = prompt("Enter new moderator name:");
    if (name && name.trim()) {
      const trimmed = name.trim();
      if (!allModeratorNames.includes(trimmed)) {
        const newMod = { id: `m${Date.now()}`, name: trimmed };
        const newCustom = [...customMods, newMod];
        setCustomMods(newCustom);
        localStorage.setItem('ps_moderators_v1', JSON.stringify(newCustom));
      } else {
        alert("Moderator already exists.");
      }
    }
  };

  useEffect(() => {
    if (currentView === 'add-entry' && batchForm.date && batchForm.pageName) {
      const saved = getSharedCost(batchForm.date, batchForm.pageName);
      if (saved) {
        setBatchForm(prev => {
          if (prev.sharedCosts.dollar !== 0 || prev.sharedCosts.rate !== 0) return prev;
          return {
            ...prev,
            sharedCosts: { ...prev.sharedCosts, dollar: saved.dollar, rate: saved.rate, salary: saved.salary }
          };
        });
      }
    }
  }, [batchForm.date, batchForm.pageName, currentView]);

  const SidebarItem = ({ active, onClick, icon, label, disabled }: any) => (
    <button disabled={disabled} onClick={onClick} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group relative ${disabled ? 'opacity-30 cursor-not-allowed' : active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}`}>
      <div className={`${active ? 'text-white' : 'text-slate-400 group-hover:text-indigo-500'} transition-colors`}>{icon}</div>
      <span className="font-bold text-sm tracking-tight">{label}</span>
    </button>
  );

  const MetricCard = ({ label, value, icon, color }: any) => (
    <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm">
      <div className="flex justify-between items-start mb-4">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
        <div className={`p-2.5 rounded-xl ${color}`}>{icon}</div>
      </div>
      <h4 className="text-2xl font-black text-slate-900 tracking-tight">{value}</h4>
    </div>
  );

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6 bg-[radial-gradient(circle_at_top_left,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black">
        <div className="w-full max-w-md bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[2.5rem] shadow-2xl">
          <div className="text-center mb-10 text-white">
            <div className="inline-flex p-4 bg-indigo-50/20 rounded-3xl text-indigo-400 mb-4 ring-1 ring-indigo-500/50"><ShieldCheck size={40} /></div>
            <h1 className="text-3xl font-black tracking-tight mb-2">Profit Suite</h1>
            <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">Enterprise Login</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Username</label><div className="relative"><User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input type="text" required value={credentials.username} onChange={e => setCredentials({...credentials, username: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all" placeholder="admin" /></div></div>
            <div className="space-y-2"><label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</label><div className="relative"><Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} /><input type="password" required value={credentials.password} onChange={e => setCredentials({...credentials, password: e.target.value})} className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-white transition-all" placeholder="••••••••" /></div></div>
            <button type="submit" disabled={loginLoading} className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black flex items-center justify-center gap-2 transition-all">{loginLoading ? <Loader2 size={24} className="animate-spin" /> : 'Sign In'}</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#f1f5f9] text-slate-900 font-sans">
      <MasterModal isOpen={isPageModalOpen} onClose={closeMasterModal} title="Manage Pages" items={managedPages} type="page" newItemName={newItemName} setNewItemName={setNewItemName} newItemRate={newItemRate} setNewItemRate={setNewItemRate} handleAddItem={handleAddItem} handleDeleteItem={handleDeleteItem} startEditingMaster={startEditingMaster} editingMasterName={editingMasterName} setEditingMasterName={setEditingMasterName} />
      <MasterModal isOpen={isProductModalOpen} onClose={closeMasterModal} title="Manage Products" items={managedProducts} type="product" newItemName={newItemName} setNewItemName={setNewItemName} newItemRate={newItemRate} setNewItemRate={setNewItemRate} handleAddItem={handleAddItem} handleDeleteItem={handleDeleteItem} startEditingMaster={startEditingMaster} editingMasterName={editingMasterName} setEditingMasterName={setEditingMasterName} />
      
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col p-6 sticky top-0 h-screen overflow-y-auto z-50 print:hidden">
        <div className="mb-8 flex items-center gap-3"><div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100"><TrendingUp size={20} /></div><div><h1 className="text-lg font-black text-slate-800 leading-none">ProfitSuite</h1><p className="text-[9px] text-indigo-500 uppercase font-black tracking-widest mt-1">Enterprise</p></div></div>
        <nav className="flex-1 space-y-1">
          <SidebarItem active={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <SidebarItem active={currentView === 'trending-hub'} onClick={() => setCurrentView('trending-hub')} icon={<Zap size={18} />} label="AI Trending Hub" />
          <SidebarItem active={currentView === 'orders'} onClick={() => setCurrentView('orders')} icon={<ShoppingCart size={18} />} label="Orders Manage" />
          <SidebarItem active={currentView === 'ad-manager'} onClick={() => setCurrentView('ad-manager')} icon={<Megaphone size={18} />} label="Ad & Cost Manager" />
          <SidebarItem active={currentView === 'add-entry'} onClick={() => setCurrentView('add-entry')} icon={<PlusCircle size={18} />} label="Add Data Entry" />
          <SidebarItem active={currentView === 'invoice-importer'} onClick={() => setCurrentView('invoice-importer')} icon={<FileUp size={18} />} label="Invoice Importer" />
          <SidebarItem active={currentView === 'data-sheet'} onClick={() => setCurrentView('data-sheet')} icon={<Table size={18} />} label="Data Sheet" />
          <SidebarItem active={currentView === 'summary-report'} onClick={() => setCurrentView('summary-report')} icon={<BarChart3 size={18} />} label="Summary Report" />
          <SidebarItem active={currentView === 'salary-sheet'} onClick={() => setCurrentView('salary-sheet')} icon={<Wallet size={18} />} label="Salary Sheet" />
          <SidebarItem active={currentView === 'user-management'} onClick={() => setCurrentView('user-management')} icon={<Users size={18} />} label="User Access" />
        </nav>
        <div className="mt-auto pt-6 border-t border-slate-100 text-xs font-bold"><button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 text-rose-500 hover:bg-rose-50 rounded-xl transition-all"><LogOut size={16} /> Sign Out</button></div>
      </aside>

      <main className="flex-1 p-10 overflow-y-auto bg-slate-50/30 print:p-0 print:bg-white">
        {currentView === 'invoice-importer' ? (
          <InvoiceImporter setEntries={setEntries} managedPages={managedPages} />
        ) : currentView === 'trending-hub' ? (
          <TrendingProductsHub />
        ) : currentView === 'user-management' ? (
          <UserManagementPage loggedInUser={user} sharedUsers={users} setSharedUsers={setUsers} />
        ) : currentView === 'ad-manager' ? (
          <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-8">
            <header>
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Ad & Cost Manager</h2>
              <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Track and sync daily ad spends</p>
            </header>
            <div className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
              <FormInput label="Date" type="date" value={adForm.date} onChange={(e: any) => setAdForm({...adForm, date: e.target.value})} />
              <FormSelect label="Page" options={managedPages} value={adForm.pageName} onChange={(e: any) => setAdForm({...adForm, pageName: e.target.value})} />
              <FormInput label="Dollar ($)" type="number" value={adForm.dollar || ''} onChange={(e: any) => setAdForm({...adForm, dollar: Number(e.target.value)})} />
              <FormInput label="Rate" type="number" value={adForm.rate || ''} onChange={(e: any) => setAdForm({...adForm, rate: Number(e.target.value)})} />
              <FormInput label="Salary" type="number" value={adForm.salary || ''} onChange={(e: any) => setAdForm({...adForm, salary: Number(e.target.value)})} />
              <div className="md:col-span-5 flex justify-between items-center mt-4">
                <div className="text-sm font-bold text-indigo-600">Total Calculation: ৳{liveTotalAdCost.toFixed(2)}</div>
                <div className="flex gap-2">
                  {editingCostId && <button onClick={cancelEditCost} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl font-black text-sm hover:bg-slate-200 transition-all">Cancel</button>}
                  <button onClick={handleSaveAdCost} className="px-8 py-3 bg-indigo-600 text-white rounded-xl font-black text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 flex items-center gap-2"><Save size={18} /> {editingCostId ? 'Update Ad Cost' : 'Save Ad Cost'}</button>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="px-6 py-4">Date</th><th className="px-6 py-4">Page</th><th className="px-6 py-4">Dollar ($)</th><th className="px-6 py-4">Rate</th><th className="px-6 py-4">Salary</th><th className="px-6 py-4">Total Cost</th><th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-bold text-slate-700">
                  {filteredAdCosts.map(cost => (
                    <tr key={cost.id} className="hover:bg-slate-50/50">
                      <td className="px-6 py-4">{cost.date}</td><td className="px-6 py-4">{cost.pageName}</td><td className="px-6 py-4">${cost.dollar}</td><td className="px-6 py-4">{cost.rate}</td><td className="px-6 py-4">৳{cost.salary}</td><td className="px-6 py-4 text-indigo-600">৳{cost.totalAdCost.toFixed(2)}</td>
                      <td className="px-6 py-4 text-right flex justify-end gap-2">
                        <button onClick={() => startEditCost(cost)} className="p-2 text-slate-300 hover:text-indigo-500"><Edit size={16}/></button>
                        <button onClick={() => deleteCost(cost.id)} className="p-2 text-slate-300 hover:text-rose-500"><Trash2 size={16}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : currentView === 'add-entry' ? (
          <div className="animate-in fade-in duration-500 max-w-7xl mx-auto space-y-8">
            <header className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Daily Data Entry</h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Main input for data sheet</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setIsPageModalOpen(true)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2"><Settings size={14}/> Pages</button>
                <button onClick={() => setIsProductModalOpen(true)} className="px-4 py-2 bg-white border border-slate-200 rounded-xl font-bold text-xs hover:bg-slate-50 transition-all flex items-center gap-2"><Settings size={14}/> Products</button>
              </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Date" type="date" value={batchForm.date} onChange={(e: any) => setBatchForm({...batchForm, date: e.target.value})} />
                    <FormSelect label="Page Name" options={managedPages} value={batchForm.pageName} onChange={(e: any) => setBatchForm({...batchForm, pageName: e.target.value})} />
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center"><h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Products Breakdown</h3><button onClick={() => setBatchForm({...batchForm, products: [...batchForm.products, { id: Date.now().toString(), name: '', quantity: 0, salePrice: 0, buyPrice: 0 }]})} className="text-indigo-600 font-bold text-xs flex items-center gap-1 hover:underline"><Plus size={14}/> Add Product</button></div>
                    {batchForm.products.map((p, idx) => (
                      <div key={p.id} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100 relative group">
                        <FormSelect label="Product Name" options={managedProducts.map(mp => mp.name)} value={p.name} onChange={(e: any) => {
                          const name = e.target.value;
                          const mp = managedProducts.find(m => m.name === name);
                          const updated = [...batchForm.products];
                          updated[idx] = { ...updated[idx], name, buyPrice: mp?.rate || 0 };
                          setBatchForm({...batchForm, products: updated});
                        }} />
                        <FormInput label="Quantity" type="number" value={p.quantity || ''} onChange={(e: any) => {
                          const updated = [...batchForm.products];
                          updated[idx].quantity = Number(e.target.value);
                          setBatchForm({...batchForm, products: updated});
                        }} />
                        <FormInput label="Sale Price (Unit)" type="number" value={p.salePrice || ''} onChange={(e: any) => {
                          const updated = [...batchForm.products];
                          updated[idx].salePrice = Number(e.target.value);
                          setBatchForm({...batchForm, products: updated});
                        }} />
                        <FormInput label="Buy Price (Unit)" type="number" value={p.buyPrice || ''} onChange={(e: any) => {
                          const updated = [...batchForm.products];
                          updated[idx].buyPrice = Number(e.target.value);
                          setBatchForm({...batchForm, products: updated});
                        }} />
                        {batchForm.products.length > 1 && <button onClick={() => setBatchForm({...batchForm, products: batchForm.products.filter(x => x.id !== p.id)})} className="absolute -right-2 -top-2 w-6 h-6 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12}/></button>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Shared & Fixed Costs</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Dollar ($)" type="number" value={batchForm.sharedCosts.dollar || ''} onChange={(e: any) => setBatchForm({...batchForm, sharedCosts: {...batchForm.sharedCosts, dollar: Number(e.target.value)}})} />
                    <FormInput label="Rate" type="number" value={batchForm.sharedCosts.rate || ''} onChange={(e: any) => setBatchForm({...batchForm, sharedCosts: {...batchForm.sharedCosts, rate: Number(e.target.value)}})} />
                    <FormInput label="Page Salary" type="number" value={batchForm.sharedCosts.salary || ''} onChange={(e: any) => setBatchForm({...batchForm, sharedCosts: {...batchForm.sharedCosts, salary: Number(e.target.value)}})} />
                    <FormInput label="Return Expected %" type="number" value={batchForm.sharedCosts.returnExpected || ''} onChange={(e: any) => setBatchForm({...batchForm, sharedCosts: {...batchForm.sharedCosts, returnExpected: Number(e.target.value)}})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Mng Salary" type="number" value={batchForm.officeCosts.mngSalary || ''} onChange={(e: any) => setBatchForm({...batchForm, officeCosts: {...batchForm.officeCosts, mngSalary: Number(e.target.value)}})} />
                    <FormInput label="Office Cost" type="number" value={batchForm.officeCosts.officeCost || ''} onChange={(e: any) => setBatchForm({...batchForm, officeCosts: {...batchForm.officeCosts, officeCost: Number(e.target.value)}})} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput label="Deliv Charge" type="number" value={batchForm.logistics.deliveryCharge || ''} onChange={(e: any) => setBatchForm({...batchForm, logistics: {...batchForm.logistics, deliveryCharge: Number(e.target.value)}})} />
                    <FormInput label="Packing Cost" type="number" value={batchForm.logistics.packingCost || ''} onChange={(e: any) => setBatchForm({...batchForm, logistics: {...batchForm.logistics, packingCost: Number(e.target.value)}})} />
                  </div>
                  <button onClick={handleAddBatch} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center justify-center gap-2"><PlusCircle size={20}/> Push to Data Sheet</button>
                </div>
              </div>
            </div>
          </div>
        ) : currentView === 'salary-sheet' ? (
          <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
              <div>
                <h2 className="text-2xl font-black text-[#1e293b] tracking-tight">Salary Sheet Management</h2>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Moderator payroll and efficiency matrix</p>
              </div>
              <div className="flex gap-4 items-center">
                <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Month:</span>
                  <input type="month" className="bg-transparent outline-none font-bold text-sm" value={sumMonthFilter} onChange={e => { setSumMonthFilter(e.target.value); setSumDayFilter(''); }} />
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-white border border-slate-200 rounded-xl shadow-sm">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Day:</span>
                  <input type="date" className="bg-transparent outline-none font-bold text-sm" value={sumDayFilter} onChange={e => { setSumDayFilter(e.target.value); setSumMonthFilter(''); }} />
                </div>
                <button onClick={() => window.print()} className="flex items-center gap-2 px-6 py-2.5 bg-[#1e293b] text-white rounded-xl font-black text-sm hover:bg-black transition-all shadow-md">
                   <Download size={18} /> Export PDF
                </button>
              </div>
            </header>

            <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4 items-end bg-white p-6 rounded-2xl border border-slate-200 shadow-sm print:hidden">
              <FormSelect 
                label="Select Page" 
                options={managedPages} 
                value={salForm.page} 
                onChange={(e: any) => setSalForm({...salForm, page: e.target.value})} 
              />
              <div className="flex flex-col gap-2 w-full">
                <div className="flex justify-between items-center">
                   <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Select Moderator</label>
                   <button onClick={addNewModerator} className="text-[9px] font-black text-indigo-600 hover:underline uppercase">+ Add Moderator</button>
                </div>
                <select className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 font-bold text-sm transition-all text-slate-800 cursor-pointer" value={salForm.mod} onChange={(e: any) => setSalForm({...salForm, mod: e.target.value})}>
                  <option value="">Select...</option>
                  {allModeratorNames.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
              <FormInput 
                label="Monthly Salary (TK)" 
                type="number" 
                value={salForm.monthly || ''} 
                onChange={(e: any) => setSalForm({...salForm, monthly: Number(e.target.value)})} 
              />
              <div className="flex flex-col gap-2">
                {salError && <span className="text-[10px] text-rose-500 font-bold ml-1">{salError}</span>}
                <button 
                  onClick={handleAssignModerator}
                  className="w-full py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
                >
                  <Plus size={16} /> Assign Moderator
                </button>
              </div>
            </div>

            <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-hidden">
               <table className="w-full text-left border-collapse">
                  <thead className="bg-[#00e676] text-slate-900 font-black uppercase text-[11px] tracking-wider">
                     <tr>
                        <th className="px-4 py-4 border-r border-slate-300/30 w-16 text-center">s/n</th>
                        <th className="px-4 py-4 border-r border-slate-300/30">page name</th>
                        <th className="px-4 py-4 border-r border-slate-300/30">MODERATOR SALLARY</th>
                        <th className="px-4 py-4 border-r border-slate-300/30 text-center">AMOUNT MONTHLY</th>
                        <th className="px-4 py-4 border-r border-slate-300/30 text-center">DAILY</th>
                        <th className="px-4 py-4 border-r border-slate-300/30 text-center bg-[#fbc02d]">salary</th>
                        <th className="px-4 py-4 border-r border-slate-300/30 text-center bg-[#5c6bc0] text-white">total order</th>
                        <th className="px-4 py-4 text-center bg-[#fbc02d]">Sarary Avarage</th>
                     </tr>
                  </thead>
                  <tbody className="font-bold text-[13px] text-slate-800">
                    {managedPages.map((page, pIdx) => {
                      const moderators = salaryConfigs[page] || [];
                      const pageOrders = entries.filter(e => {
                        const matchesPage = e.pageName === page;
                        const matchesTime = sumDayFilter ? e.date === sumDayFilter : (sumMonthFilter ? e.date.startsWith(sumMonthFilter) : true);
                        return matchesPage && matchesTime;
                      }).reduce((acc: number, e) => acc + e.products.reduce((pAcc: number, p) => pAcc + (Number(p.quantity) || 0), 0), 0);
                      
                      const totalDailySalary = moderators.reduce((acc, m) => {
                         const isAbsent = sumDayFilter && attendance[`${sumDayFilter}::${page}::${m.id}`] === false;
                         return acc + (isAbsent ? 0 : (Number(m.monthly) / 30));
                      }, 0);
                      
                      const salaryAvg = pageOrders > 0 ? (totalDailySalary / pageOrders) : 0;
                      const rowColor = pIdx % 3 === 0 ? 'bg-[#bbdefb]' : (pIdx % 3 === 1 ? 'bg-[#fce4ec]' : 'bg-[#e8f5e9]');

                      return (
                        <React.Fragment key={page}>
                          {moderators.length === 0 ? (
                            <tr className={rowColor}>
                              <td className="px-4 py-3 border-r border-slate-200 text-center">{pIdx + 1}</td>
                              <td className="px-4 py-3 border-r border-slate-200 font-black">{page}</td>
                              <td className="px-4 py-3 border-r border-slate-200 italic opacity-50">No moderators assigned</td>
                              <td className="px-4 py-3 border-r border-slate-200 text-center">0</td>
                              <td className="px-4 py-3 border-r border-slate-200 text-center">0</td>
                              <td className="px-4 py-3 border-r border-slate-200 text-center bg-white/30">0</td>
                              <td className="px-4 py-3 border-r border-slate-200 text-center bg-[#bbdefb]">{pageOrders}</td>
                              <td className="px-4 py-3 text-center bg-white/30">0</td>
                            </tr>
                          ) : (
                            moderators.map((m, mIdx) => {
                              const isAbsent = sumDayFilter && attendance[`${sumDayFilter}::${page}::${m.id}`] === false;
                              const mDailySal = isAbsent ? 0 : (Number(m.monthly) / 30);
                              return (
                                <tr key={`${page}_${m.id}`} className={`${rowColor} ${isAbsent ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                                  {mIdx === 0 && <td rowSpan={moderators.length} className="px-4 py-3 border-r border-slate-300/30 text-center align-middle">{pIdx + 1}</td>}
                                  {mIdx === 0 && <td rowSpan={moderators.length} className="px-4 py-3 border-r border-slate-300/30 font-black align-middle uppercase tracking-tight">{page}</td>}
                                  <td className="px-4 py-3 border-r border-slate-300/30 flex items-center justify-between group">
                                    <div className="flex items-center gap-2">
                                       <input className="bg-transparent border-none outline-none font-black" value={m.name} readOnly />
                                      {sumDayFilter && (
                                        <button onClick={() => toggleAttendance(page, m.id)} className={`px-2 py-0.5 rounded text-[9px] font-black uppercase flex items-center gap-1 transition-all ${isAbsent ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'}`}>
                                          {isAbsent ? <><UserX size={10}/> Absent</> : <><UserCheck size={10}/> Present</>}
                                        </button>
                                      )}
                                    </div>
                                    <button 
                                      className="opacity-0 group-hover:opacity-100 transition-opacity text-rose-500 p-1"
                                      onClick={() => {
                                        if (confirm(`Delete moderator "${m.name}"?`)) {
                                          const newConf = {...salaryConfigs};
                                          newConf[page] = newConf[page].filter(x => x.id !== m.id);
                                          setSalaryConfigs(newConf);
                                          localStorage.setItem('ps_salary_configs', JSON.stringify(newConf));
                                        }
                                      }}
                                    >
                                      <Trash size={12} />
                                    </button>
                                  </td>
                                  <td className="px-4 py-3 border-r border-slate-300/30 text-center">{m.monthly}</td>
                                  <td className={`px-4 py-3 border-r border-slate-300/30 text-center ${isAbsent ? 'text-rose-600 line-through' : ''}`}>{mDailySal.toFixed(2)}</td>
                                  {mIdx === 0 && <td rowSpan={moderators.length} className="px-4 py-3 border-r border-slate-300/30 text-center bg-white/20 align-middle">{(totalDailySalary).toFixed(2)}</td>}
                                  {mIdx === 0 && <td rowSpan={moderators.length} className="px-4 py-3 border-r border-slate-300/30 text-center bg-[#bbdefb] align-middle">{pageOrders}</td>}
                                  {mIdx === 0 && <td rowSpan={moderators.length} className="px-4 py-3 text-center bg-white/20 align-middle">{(salaryAvg).toFixed(4)}</td>}
                                </tr>
                              );
                            })
                          )}
                        </React.Fragment>
                      );
                    })}
                    <tr className="bg-[#00e676] text-slate-900 border-t-2 border-slate-400 font-black">
                      <td colSpan={3} className="px-4 py-3 text-right">TOTALS</td>
                      <td className="px-4 py-3 text-center">{managedPages.reduce((acc, p) => acc + (salaryConfigs[p] || []).reduce((mAcc, m) => mAcc + Number(m.monthly), 0), 0).toFixed(0)}</td>
                      <td className="px-4 py-3 text-center">...</td>
                      <td className="px-4 py-3 text-center">...</td>
                      <td className="px-4 py-3 text-center">{managedPages.reduce((acc, p) => acc + entries.filter(e => e.pageName === p).length, 0)}</td>
                      <td></td>
                    </tr>
                  </tbody>
               </table>
            </div>
          </div>
        ) : currentView === 'summary-report' ? (
          <div className="animate-in fade-in duration-500 max-w-7xl mx-auto">
            <header className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 print:hidden">
              <div>
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Summary Report</h2>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Monthly breakdown and daily profit analysis</p>
              </div>
            </header>
            <div className="bg-white p-6 rounded-[1.5rem] border border-slate-200 shadow-sm space-y-8">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between print:hidden">
                <div className="flex p-1 bg-slate-100 rounded-2xl gap-1">
                  <button onClick={() => setSummaryTab('matrix')} className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${summaryTab === 'matrix' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}><BarChart3 size={16} /> Matrix</button>
                  <button onClick={() => setSummaryTab('category')} className={`px-5 py-2.5 rounded-xl font-black text-xs transition-all flex items-center gap-2 ${summaryTab === 'category' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-200'}`}><List size={16} /> Category</button>
                </div>
                <div className="flex flex-wrap gap-4 items-center">
                  <input type="month" className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" value={sumMonthFilter} onChange={e => { setSumMonthFilter(e.target.value); setSumDayFilter(''); }} />
                  <input type="date" className="px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-sm" value={sumDayFilter} onChange={e => { setSumDayFilter(e.target.value); setSumMonthFilter(''); }} />
                  <button onClick={() => window.print()} className="px-5 py-2 bg-slate-900 text-white rounded-xl font-black text-xs"><Printer size={16}/></button>
                </div>
              </div>
              {summaryTab === 'matrix' ? (
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-widest border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-4">Page Name</th>
                        {summaryData.dates.map(d => <th key={d} className="px-5 py-4 text-center">{d}</th>)}
                        <th className="px-5 py-4 text-right bg-amber-50">TOTAL</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold">
                      {summaryData.pages.map(page => {
                        const pageTotal = Object.values(summaryData.matrix[page] as Record<string, number>).reduce((a: number, b: number) => a + b, 0);
                        return (
                          <tr key={page}>
                            <td className="px-5 py-4 font-black">{page}</td>
                            {summaryData.dates.map(d => (
                              <td key={d} className="px-5 py-4 text-center">{(summaryData.matrix[page][d] || 0).toLocaleString()}</td>
                            ))}
                            <td className="px-5 py-4 text-right font-black text-indigo-600 bg-indigo-50/20">৳{pageTotal.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-slate-100">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead className="bg-slate-50 text-slate-400 font-black uppercase text-[10px] tracking-widest border-b border-slate-200">
                      <tr><th className="px-5 py-4">Category</th>{summaryData.dates.map(d => <th key={d} className="px-5 py-4 text-center">{d}</th>)}<th className="px-5 py-4 text-right bg-slate-100">TOTAL</th></tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-bold">
                      {Object.keys(summaryData.breakdown).map(cat => {
                        const rowTotal = Object.values(summaryData.breakdown[cat] as Record<string, number>).reduce((a, b) => a + b, 0);
                        return (
                          <tr key={cat}>
                            <td className="px-5 py-4 font-black text-slate-800">{cat}</td>
                            {summaryData.dates.map(d => <td key={d} className="px-5 py-4 text-center">{summaryData.breakdown[cat][d].toLocaleString()}</td>)}
                            <td className="px-5 py-4 text-right font-black bg-slate-50">{rowTotal.toLocaleString()}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : currentView === 'data-sheet' ? (
          <div className="animate-in fade-in duration-500 max-w-[1400px] mx-auto space-y-8">
            <header className="flex flex-col md:flex-row justify-between items-center print:hidden">
              <div><h2 className="text-2xl font-black text-slate-800 tracking-tight">Main Calculation Sheet</h2><p className="text-slate-500 font-bold text-xs uppercase tracking-widest">Global view of all pushed entries</p></div>
              <div className="flex gap-4 items-center">
                <input type="date" className="px-4 py-2.5 bg-white border border-slate-200 rounded-xl font-bold text-sm shadow-sm" value={sheetDateFilter} onChange={e => setSheetDateFilter(e.target.value)} />
                <button onClick={() => window.print()} className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-black text-sm"><Download size={18} /> Download PDF</button>
              </div>
            </header>
            <div className="bg-white rounded-[1.5rem] border border-slate-200 shadow-sm overflow-x-auto print:border-none">
              <table className="w-full text-left border-collapse text-[10px]">
                <thead className="bg-slate-50 text-slate-500 font-black uppercase tracking-wider border-b">
                  <tr>
                    <th className="px-4 py-4 border-r">Date</th><th className="px-4 py-4 border-r">Page</th><th className="px-4 py-4 border-r">Product</th><th className="px-4 py-4 border-r text-center">Mailer Dam</th><th className="px-4 py-4 border-r text-center">$</th><th className="px-4 py-4 border-r text-center">Rate</th><th className="px-4 py-4 border-r text-center">Dollar (TK)</th><th className="px-4 py-4 border-r text-center">Salary</th><th className="px-4 py-4 border-r text-center">Mng Sal</th><th className="px-4 py-4 border-r text-center">Office</th><th className="px-4 py-4 border-r text-center">COD</th><th className="px-4 py-4 border-r text-center">Return</th><th className="px-4 py-4 border-r text-center">Profit</th><th className="px-4 py-4 text-center">Total (Sale)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-bold text-slate-700">
                  {flattenedSheetRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="px-4 py-3 border-r">{row.date}</td><td className="px-4 py-3 border-r">{row.page}</td><td className="px-4 py-3 border-r">{row.product} (x{row.qty})</td><td className="px-4 py-3 border-r text-right">{row.buyPrice.toFixed(2)}</td><td className="px-4 py-3 border-r text-center text-emerald-600">${row.dollar}</td><td className="px-4 py-3 border-r text-center">{row.rate}</td><td className="px-4 py-3 border-r text-right">{row.calculatedDollar.toFixed(2)}</td><td className="px-4 py-3 border-r text-right">{row.pageSalary.toFixed(2)}</td><td className="px-4 py-3 border-r text-right">{row.mngSalary.toFixed(2)}</td><td className="px-4 py-3 border-r text-right">{row.officeCost.toFixed(2)}</td><td className="px-4 py-3 border-r text-right">{row.cod.toFixed(2)}</td><td className="px-4 py-3 border-r text-right text-rose-500">{row.returnCost.toFixed(2)}</td><td className={`px-4 py-3 border-r text-right font-black ${row.profit >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{row.profit.toFixed(2)}</td><td className="px-4 py-3 text-right font-black text-indigo-700">{row.total.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : currentView === 'dashboard' ? (
          <div className="max-w-7xl mx-auto animate-in fade-in duration-500 space-y-10">
            <header><h2 className="text-3xl font-black text-slate-800 tracking-tight">Executive Dashboard</h2><p className="text-slate-500 font-medium">Global Profit & Sales overview</p></header>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <MetricCard label="Total Profits" value={`৳${dashboardStats.totalProfit.toLocaleString()}`} icon={<DollarSign className="text-emerald-500" />} color="bg-emerald-50" />
              <MetricCard label="Ad Spend" value={`৳${dashboardStats.totalAdCost.toLocaleString()}`} icon={<Megaphone className="text-blue-500" />} color="bg-blue-50" />
              <MetricCard label="Total Units" value={dashboardStats.totalOrders.toString()} icon={<Package className="text-indigo-500" />} color="bg-indigo-50" />
              <MetricCard label="Efficiency" value={dashboardStats.totalAdCost > 0 ? `${((dashboardStats.totalProfit / dashboardStats.totalAdCost) * 100).toFixed(0)}%` : '0%'} icon={<TrendingUp className="text-amber-500" />} color="bg-amber-50" />
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm h-96">
              <h3 className="text-sm font-black uppercase text-slate-400 mb-8">Profit Trend (Recent Entries)</h3>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={flattenedSheetRows.slice(-10)}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" hide />
                  <YAxis hide />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="profit" stroke="#4f46e5" fillOpacity={1} fill="url(#colorProfit)" />
                  <defs><linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/><stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/></linearGradient></defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : currentView === 'orders' ? (
          <OrdersPage user_id={user.username} />
        ) : (
          <div className="flex items-center justify-center h-full opacity-50 grayscale select-none"><div className="text-center"><Settings size={48} className="mx-auto mb-4 animate-spin-slow" /><p className="text-xs font-black uppercase tracking-[0.3em]">Module Not Found</p></div></div>
        )}
      </main>
    </div>
  );
};

export const FormInput = ({ label, dark, ...props }: any) => (
  <div className="flex flex-col gap-2 w-full"><label className={`text-[10px] font-black uppercase tracking-widest ml-1 ${dark ? 'text-indigo-200' : 'text-slate-400'}`}>{label}</label><input {...props} className={`w-full px-5 py-3.5 rounded-2xl outline-none focus:ring-4 font-bold text-sm transition-all border ${dark ? 'bg-indigo-500 border-indigo-400 text-white placeholder:text-indigo-300 focus:ring-indigo-400/30' : 'bg-slate-50 border-slate-100 text-slate-800 focus:ring-indigo-50 focus:border-indigo-200'}`} /></div>
);

export const FormSelect = ({ label, options, ...props }: any) => (
  <div className="flex flex-col gap-2 w-full"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label><select {...props} className="w-full px-5 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 font-bold text-sm transition-all text-slate-800 cursor-pointer"><option value="">Select...</option>{options.map((o: any) => <option key={o} value={o}>{o}</option>)}</select></div>
);

export default App;