import React, { useState, useMemo } from 'react';
import { Search, Filter, Flame, TrendingUp, DollarSign, Users, Target, BarChart3, Clock, Share2, Info, Sparkles, Send, Mail, Globe, ChevronRight, X, Megaphone } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  image: string;
  category: string;
  country: string;
  trendReason: string; // Enriched with 📊 Trending Source Breakdown
  estPriceRange: string;
  targetCustomer: string; // Enriched with 📍 Customer Demand Insight
  fbAdAngle: string;
  profitPotential: 'Low' | 'Medium' | 'High';
  trendScore: number; // Precomputed via weighted formula
  updatedAt: string;
  isHot: boolean; // Precomputed via Score >= 85 & Growth rule
  isSponsored?: boolean;
}

const CATEGORIES = ['All', 'Gadget', 'Beauty & Skincare', 'Fashion', 'Home & Lifestyle', 'Health & Fitness'];
const COUNTRIES = ['Bangladesh', 'India', 'Global'];

/**
 * SAMPLE_PRODUCTS contains precomputed intelligence data.
 * The strings are formatted to provide insights inside the existing text fields.
 */
const SAMPLE_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Electric Portable Juicer (6 Blades)',
    image: 'https://images.unsplash.com/photo-1585238341267-1cfec2046a55?w=400&q=80',
    category: 'Gadget',
    country: 'Bangladesh',
    trendReason: '📊 Ads: High | TikTok: Viral (Primary) | FB Pages: Active. Home-health enthusiasts-দের মধ্যে ব্যাপক ক্রেজ দেখা যাচ্ছে।',
    estPriceRange: '৳850 - ৳1250',
    targetCustomer: '📍 Age: 22-45 | Gender: Unisex. কমেন্টে সাধারণত "Price?", "Inbox", "Delivery?" জিজ্ঞাসা করা হচ্ছে।',
    fbAdAngle: 'Fresh juice anytime, anywhere - No more excuse for unhealthy diet!',
    profitPotential: 'High',
    trendScore: 94,
    updatedAt: '2024-05-20',
    isHot: true
  },
  {
    id: '2',
    name: 'Snail Mucin Essence (Hydrating)',
    image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=400&q=80',
    category: 'Beauty & Skincare',
    country: 'Bangladesh',
    trendReason: '📊 Ads: Medium | Reels: Viral | FB Pages: Medium. K-Beauty search volume এবং organic demand বাড়ছে।',
    estPriceRange: '৳1400 - ৳1850',
    targetCustomer: '📍 Age: 18-35 | Gender: Female. ক্রেতারা পণ্যের "Originality" এবং "Skin Type" নিয়ে বেশি নিশ্চিত হতে চায়।',
    fbAdAngle: 'Get the Glass Skin Glow - Authenticity guaranteed from Korea.',
    profitPotential: 'Medium',
    trendScore: 88,
    updatedAt: '2024-05-22',
    isHot: true
  },
  {
    id: '3',
    name: 'Smart Neck Massager (EMS Pulse)',
    image: 'https://images.unsplash.com/photo-1591130901618-3f060a2d54c4?w=400&q=80',
    category: 'Gadget',
    country: 'Bangladesh',
    trendReason: '📊 Ads: High (Primary) | TikTok: Growing | FB Pages: Medium. ডিজিটাল স্ট্রেইন কমাতে কার্যকরী সলিউশন হিসেবে পপুলার।',
    estPriceRange: '৳1100 - ৳1500',
    targetCustomer: '📍 Age: 25-50 | Gender: All. ক্রেতারা "Warranty" এবং "Charge time" নিয়ে কমেন্ট করছে।',
    fbAdAngle: '15 Minutes to Instant Relief - Personal Spa in your pocket!',
    profitPotential: 'High',
    trendScore: 91,
    updatedAt: '2024-05-18',
    isHot: true
  },
  {
    id: '4',
    name: 'Cotton Linen Minimalist Kurti',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?w=400&q=80',
    category: 'Fashion',
    country: 'Bangladesh',
    trendReason: '📊 Ads: Low | Reels: Low | FB Pages: Active (Primary). গ্রুপগুলোতে অর্গানিক শেয়ারিং এবং সামার ডিমান্ড তুঙ্গে।',
    estPriceRange: '৳650 - ৳950',
    targetCustomer: '📍 Age: 16-40 | Gender: Female. ক্রেতারা "Size Chart" এবং "Color Availability" চেক করছে।',
    fbAdAngle: 'গরমের স্বস্তি আর আধুনিকতার মেলবন্ধন। পিওর লিনেন কালেকশন।',
    profitPotential: 'Medium',
    trendScore: 82,
    updatedAt: '2024-05-21',
    isHot: false
  }
];

const TrendingProductsHub: React.FC = () => {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [country, setCountry] = useState('Bangladesh');
  const [sortBy, setSortBy] = useState<'score' | 'potential' | 'newest'>('score');
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  const filteredProducts = useMemo(() => {
    let list = [...SAMPLE_PRODUCTS];
    if (search) list = list.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.trendReason.toLowerCase().includes(search.toLowerCase()));
    if (category !== 'All') list = list.filter(p => p.category === category);
    if (country) list = list.filter(p => p.country === country);

    list.sort((a, b) => {
      if (sortBy === 'score') return b.trendScore - a.trendScore;
      if (sortBy === 'newest') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      return 0;
    });

    return list;
  }, [search, category, country, sortBy]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles size={24} />
            </div>
            <h2 className="text-3xl font-black text-slate-800 tracking-tight">AI Trending Products Hub</h2>
          </div>
          <p className="text-slate-500 font-medium">Data-driven product insights for Facebook Marketers & Retailers.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsHowItWorksOpen(true)} className="px-6 py-3 bg-slate-50 text-slate-600 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all border border-slate-200 flex items-center gap-2">
            <Info size={18} /> How it works
          </button>
          <button className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 flex items-center gap-2">
            <Mail size={18} /> Subscribe List
          </button>
        </div>
      </header>

      {/* Filters Bar */}
      <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col lg:flex-row gap-6 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input 
            type="text" 
            placeholder="পণ্য বা কীওয়ার্ড লিখে সার্চ করুন..." 
            className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-50 focus:border-indigo-200 font-bold text-sm transition-all"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-4 w-full lg:w-auto">
          <div className="flex flex-col gap-1.5 min-w-[140px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Globe size={10}/> Country</label>
            <select value={country} onChange={e => setCountry(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100">
              {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><Filter size={10}/> Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100">
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div className="flex flex-col gap-1.5 min-w-[160px]">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 flex items-center gap-1"><BarChart3 size={10}/> Sort By</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value as any)} className="px-4 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm outline-none focus:ring-2 focus:ring-indigo-100">
              <option value="score">Trend Score</option>
              <option value="potential">Profit Potential</option>
              <option value="newest">Newest Added</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        {filteredProducts.map((p) => (
          <div key={p.id} className={`group relative bg-white rounded-[2.5rem] overflow-hidden border transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 ${p.isSponsored ? 'border-indigo-200' : 'border-slate-100 shadow-sm'}`}>
            {/* Image & Badges */}
            <div className="h-56 relative overflow-hidden">
              <img src={p.image} alt={p.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="absolute top-4 left-4 flex gap-2">
                {p.isHot && (
                  <span className="px-3 py-1.5 bg-rose-600 text-white rounded-full text-[10px] font-black uppercase flex items-center gap-1 shadow-lg ring-4 ring-rose-600/20">
                    <Flame size={12} fill="currentColor" /> Hot 🔥
                  </span>
                )}
                {p.isSponsored && (
                  <span className="px-3 py-1.5 bg-indigo-600 text-white rounded-full text-[10px] font-black uppercase shadow-lg">Sponsored</span>
                )}
              </div>

              <div className="absolute bottom-4 left-4 right-4 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                <button className="w-full py-2.5 bg-white/20 backdrop-blur-md text-white rounded-xl font-black text-xs hover:bg-white/40 transition-all flex items-center justify-center gap-2">
                   View Full Insights <ChevronRight size={14} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-5">
              <div>
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{p.category}</span>
                <h3 className="text-xl font-black text-slate-800 leading-tight mt-1">{p.name}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 border-y border-slate-50 py-4">
                <div className="space-y-1">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Est. Sale Price</p>
                  <p className="text-sm font-black text-emerald-600">{p.estPriceRange}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Profit Potential</p>
                  <span className={`text-[10px] font-black px-2 py-1 rounded-lg ${
                    p.profitPotential === 'High' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                  }`}>{p.profitPotential}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-800 flex items-center gap-1 uppercase tracking-widest"><TrendingUp size={12} /> Why it's trending</p>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{p.trendReason}</p>
                </div>
                
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-slate-800 flex items-center gap-1 uppercase tracking-widest"><Target size={12} /> Target Customer</p>
                  <p className="text-xs text-slate-500 font-medium">{p.targetCustomer}</p>
                </div>

                <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                   <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Megaphone size={10} /> FB Ad Angle</p>
                   <p className="text-[11px] font-bold text-indigo-900 leading-snug">"{p.fbAdAngle}"</p>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 flex items-center justify-between border-t border-slate-50">
                <div className="flex flex-col">
                  <span className="text-[9px] font-black text-slate-400 uppercase">Trend Score</span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${p.trendScore}%` }} />
                    </div>
                    <span className="text-xs font-black text-slate-700">{p.trendScore}%</span>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-slate-400">
                  <Clock size={12} />
                  <span className="text-[9px] font-bold">{p.updatedAt}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Submit Section */}
      <section className="bg-slate-900 rounded-[3rem] p-12 text-center text-white relative overflow-hidden shadow-2xl">
         <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/20 blur-[100px] -mr-32 -mt-32" />
         <div className="absolute bottom-0 left-0 w-64 h-64 bg-emerald-600/10 blur-[100px] -ml-32 -mb-32" />
         
         <div className="relative z-10 max-w-2xl mx-auto space-y-6">
            <h3 className="text-3xl font-black tracking-tight">নতুন কোনো পণ্যের আইডিয়া আছে?</h3>
            <p className="text-slate-400 font-medium">আমাদের টিমের কাছে একটি ট্রেন্ডিং পণ্যের আইডিয়া সাবমিট করুন। আমরা আপনার জন্য ডাটা রিসার্চ করে রিপোর্ট প্রদান করবো।</p>
            <div className="flex flex-col md:flex-row gap-4 justify-center pt-4">
              <input type="text" placeholder="পণ্যের নাম লিখুন..." className="px-6 py-4 bg-white/5 border border-white/10 rounded-2xl outline-none focus:ring-4 focus:ring-indigo-500/20 focus:border-indigo-500 text-white w-full md:w-80" />
              <button className="px-10 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm hover:bg-indigo-700 transition-all flex items-center justify-center gap-2">
                <Send size={18} /> সাবমিট করুন
              </button>
            </div>
         </div>
      </section>

      {/* Modal */}
      {isHowItWorksOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[200] flex items-center justify-center p-6 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-xl rounded-[3rem] p-10 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-300 relative">
            <button onClick={() => setIsHowItWorksOpen(false)} className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400">
              <X size={24} />
            </button>
            
            <div className="space-y-8">
              <div className="text-center">
                <div className="inline-flex p-4 bg-indigo-50 text-indigo-600 rounded-3xl mb-4"><Sparkles size={32} /></div>
                <h3 className="text-2xl font-black text-slate-800">How AI Trending Hub works</h3>
                <p className="text-slate-500 mt-2">আমরা যেভাবে একটি পণ্যকে ট্রেন্ডিং হিসেবে সিলেক্ট করি</p>
              </div>

              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black flex-shrink-0">1</div>
                  <div>
                    <h4 className="font-black text-slate-800">Social Signals Analysis</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">TikTok, Facebook Ads library এবং Instagram Reels-এর ট্রেন্ডিং কীওয়ার্ড এবং ভিডিও এঙ্গেজমেন্ট ট্র্যাক করা হয়।</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black flex-shrink-0">2</div>
                  <div>
                    <h4 className="font-black text-slate-800">Search Volume Growth</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">Google Trends এবং স্থানীয় ই-কমার্স সার্চ রেজাল্ট অ্যানালাইসিস করে পণ্যের ডিমান্ড লেভেল দেখা হয়।</p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-black flex-shrink-0">3</div>
                  <div>
                    <h4 className="font-black text-slate-800">Profitability Audit</h4>
                    <p className="text-xs text-slate-500 leading-relaxed">পণ্যের সোর্সিং প্রাইস এবং সম্ভাব্য বিক্রয়মূল্য হিসাব করে প্রফিট পটেনশিিয়াল নির্ধারণ করা হয়।</p>
                  </div>
                </div>
              </div>

              <button onClick={() => setIsHowItWorksOpen(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black">বুঝেছি, ধন্যবাদ!</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrendingProductsHub;