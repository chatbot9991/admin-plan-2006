// src/pages/dashboard/Dashboard.tsx

import React, { useEffect, useState, useMemo } from 'react';
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';
import { motion } from 'framer-motion';
import {
  Users,
  Activity,
  Calendar,
  Zap,
  TrendingUp,
  BarChart3,
  Cpu,
  Wallet,
  Crown,
  MoreHorizontal,
} from 'lucide-react';
import Cookies from 'js-cookie';

// --- Interfaces ---

interface CountsUsersActiveResult {
  today: number;
  lastWeek: number;
  lastMonth: number;
}
interface ModelStatus {
  dailyCount: number;
  monthlyCount: number;
  aiOptionId: string;
  aiOptionName: string;
  aiOptionImage?: string;
}
interface AppReportData {
  countsUsersActiveResult: CountsUsersActiveResult;
  modelStatus: ModelStatus[];
}

interface TransactionMonth {
  month: string;
  totalAmount: number;
  count: number;
}

interface DailyTransaction {
  date: string;
  count: number;
  totalAmount: number;
  _id?: string;
}

interface PlanUserCount {
  _id: string | null;
  count: number;
}
interface PortalReportData {
  totalUsers: number;
  newUsers: any[];
  last12MonthsTransaction: TransactionMonth[];
  dailyTransaction: DailyTransaction[];
  planUsers: {
    FreePlan: PlanUserCount[];
    HavePlan: PlanUserCount[];
  };
}

// --- Constants ---
const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const PLAN_COLORS = ['#e2e8f0', '#f59e0b']; // Gray for Free, Amber for VIP
const BASE_API_URL = 'https://dev.backend.mobo.land/api/v1';
const BASE_IMG_URL = 'https://dev.backend.mobo.land/';

// --- Helper Component for Stable Images ---
const ModelIcon = React.memo(({ url, alt }: { url?: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [url]);

  if (!url || hasError) {
    return (
      <div
        className="bg-light rounded-circle d-flex align-items-center justify-content-center"
        style={{ width: 36, height: 36 }}
      >
        <Cpu size={18} className="text-secondary" />
      </div>
    );
  }

  return (
    <img
      src={`${BASE_IMG_URL}${url}`}
      alt={alt}
      className="rounded-circle"
      style={{ width: 36, height: 36, objectFit: 'cover' }}
      onError={() => setHasError(true)}
    />
  );
});

const Dashboard: React.FC = () => {
  // State
  const [appData, setAppData] = useState<AppReportData | null>(null);
  const [portalData, setPortalData] = useState<PortalReportData | null>(null);
  const [loading, setLoading] = useState(true);

  // View States
  const [modelView, setModelView] = useState<'daily' | 'monthly'>('monthly');
  const [revenueView, setRevenueView] = useState<'daily' | 'monthly'>('monthly'); // اضافه شده برای نمودار درآمد

  // --- Fetch Data ---
  useEffect(() => {
    const fetchData = async () => {
      try {
        let token: any = localStorage.getItem('token');
        if (!token) token = Cookies.get('adminJwt');
        if (!token) token = Cookies.get('token');

        const headers: HeadersInit = { 'Content-Type': 'application/json' };
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const [appRes, portalRes] = await Promise.all([
          fetch(`${BASE_API_URL}/app/report/dashboard`, { method: 'GET', headers }),
          fetch(`${BASE_API_URL}/portal/report/dashboard`, { method: 'GET', headers }),
        ]);

        if (appRes.ok) {
          const appJson = await appRes.json();
          setAppData(appJson);
        }

        if (portalRes.ok) {
          const portalJson = await portalRes.json();
          setPortalData(portalJson);
        }
      } catch (error) {
        console.error('Dashboard Fetch Error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // --- Data Processing (Memoized) ---

  const aiChartData = useMemo(() => {
    if (!appData?.modelStatus) return [];
    return appData.modelStatus
      .map((item) => ({
        name: item.aiOptionName,
        count: modelView === 'daily' ? item.dailyCount : item.monthlyCount,
        icon: item.aiOptionImage,
        fullData: item,
      }))
      .sort((a, b) => b.count - a.count);
  }, [appData, modelView]);

  // --- تغییر جدید: محاسبه داده‌های درآمد برای دو حالت روزانه و ماهانه ---
  const currentRevenueData = useMemo(() => {
    if (!portalData) return [];

    if (revenueView === 'monthly') {
      return (portalData.last12MonthsTransaction || []).map((item) => ({
        name: item.month,
        amount: item.totalAmount,
        count: item.count,
      }));
    } else {
      // حالت روزانه
      return (portalData.dailyTransaction || []).map((item) => ({
        name: new Date(item.date || item._id || '').toLocaleDateString('fa-IR', {
          month: 'short',
          day: 'numeric',
        }),
        amount: item.totalAmount || 0,
        count: item.count || 0,
      }));
    }
  }, [portalData, revenueView]);
  // ------------------------------------------------------------------

  const { freeUsers, paidUsers, planChartData } = useMemo(() => {
    const free = portalData?.planUsers?.FreePlan?.[0]?.count || 0;
    const paid = portalData?.planUsers?.HavePlan?.[0]?.count || 0;
    return {
      freeUsers: free,
      paidUsers: paid,
      planChartData: [
        { name: 'کاربران رایگان', value: free },
        { name: 'کاربران ویژه (VIP)', value: paid },
      ],
    };
  }, [portalData]);

  const totalMonthlyAIRequests = useMemo(
    () => appData?.modelStatus.reduce((acc, curr) => acc + curr.monthlyCount, 0) || 0,
    [appData]
  );

  const totalRevenue = useMemo(
    () => portalData?.last12MonthsTransaction.reduce((acc, curr) => acc + curr.totalAmount, 0) || 0,
    [portalData]
  );

  // --- Render Components ---

  const StatCard = ({ title, value, icon: Icon, color, delay, subText, subValue }: any) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="col-12 col-md-6 col-xl-3"
    >
      <div className="card border-0 shadow-sm h-100 overflow-hidden stat-card bg-white rounded-4">
        <div className="card-body p-4 position-relative z-2">
          <div className="d-flex justify-content-between align-items-start mb-4">
            <div
              className={`p-3 rounded-4 d-flex align-items-center justify-content-center bg-${color}-subtle text-${color}`}
            >
              <Icon size={26} strokeWidth={2} />
            </div>
            {subValue && (
              <div
                className={`badge bg-${color}-subtle text-${color} border border-${color}-subtle rounded-pill px-3 py-2 d-flex align-items-center gap-1`}
              >
                <span className="fw-bold">{subValue}</span>
              </div>
            )}
          </div>
          <h2 className="fw-bolder text-dark mb-1 ls-tight">{value}</h2>
          <p className="text-muted small fw-medium mb-0">{title}</p>
          {subText && (
            <div className="mt-3 text-muted" style={{ fontSize: '0.75rem' }}>
              {subText}
            </div>
          )}
        </div>
        <div
          className={`position-absolute top-0 end-0 rounded-circle opacity-10 bg-${color}`}
          style={{
            width: 140,
            height: 140,
            transform: 'translate(30%, -30%)',
            filter: 'blur(40px)',
          }}
        />
      </div>
    </motion.div>
  );

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light-subtle">
        <div className="spinner-border text-primary" role="status"></div>
      </div>
    );
  }

  return (
    <div
      className="container-fluid p-4 dashboard-container"
      style={{ minHeight: '100vh', backgroundColor: '#f8fafc' }}
    >
      {/* Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-md-center mb-5 gap-3 fade-in-down">
        <div>
          <h2 className="fw-bolder text-dark mb-1">داشبورد مدیریت</h2>
          <p className="text-muted mb-0">نمای کلی عملکرد سیستم، فروش و کاربران</p>
        </div>
        <div className="d-flex gap-2">
          <span className="bg-white border shadow-sm px-3 py-2 rounded-pill text-muted small fw-bold d-flex align-items-center gap-2">
            <Calendar size={16} />
            {new Date().toLocaleDateString('fa-IR', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>

      {/* Row 1: Key Metrics */}
      <div className="row g-4 mb-4">
        <StatCard
          title="کل کاربران ثبت‌نامی"
          value={(portalData?.totalUsers || 0).toLocaleString()}
          icon={Users}
          color="primary"
          delay={0.1}
          subValue={`+${portalData?.newUsers?.[0]?.today?.length || 0} امروز`}
          subText="تعداد کل کاربران پلتفرم"
        />

        <StatCard
          title="کاربران فعال (ماهانه)"
          value={(appData?.countsUsersActiveResult?.lastMonth || 0).toLocaleString()}
          icon={Activity}
          color="info"
          delay={0.2}
          subValue={`${appData?.countsUsersActiveResult?.today || 0} آنلاین`}
          subText="کاربرانی که در ۳۰ روز اخیر تعامل داشته‌اند"
        />

        <StatCard
          title="درآمد کل (سال جاری)"
          value={`${(totalRevenue / 1000000).toFixed(1)} M`}
          icon={Wallet}
          color="success"
          delay={0.3}
          subValue="تومان"
          subText={`مجموع ${totalRevenue.toLocaleString()} تومان`}
        />

        <StatCard
          title="درخواست‌های هوش مصنوعی"
          value={totalMonthlyAIRequests.toLocaleString()}
          icon={Cpu}
          color="warning"
          delay={0.4}
          subValue="ماهانه"
          subText="مجموع پرامپت‌های ارسال شده"
        />
      </div>

      {/* Row 2: Financial & User Charts */}
      <div className="row g-4 mb-4">
        {/* Financial Chart (UPDATED with Daily/Monthly Toggle) */}
        <div className="col-12 col-xl-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="card border-0 shadow-sm h-100 rounded-4"
          >
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
              <div>
                <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                  <TrendingUp className="text-success" size={20} />
                  {revenueView === 'monthly'
                    ? 'نمودار درآمد (۱۲ ماه اخیر)'
                    : 'نمودار درآمد (۳۰ روز اخیر)'}
                </h5>
                <p className="text-muted small mb-0">روند فروش و تراکنش‌های موفق</p>
              </div>

              {/* Toggle Buttons for Revenue Chart */}
              <div className="bg-light p-1 rounded-pill d-flex border">
                <button
                  className={`btn btn-sm rounded-pill px-4 transition-all ${
                    revenueView === 'daily'
                      ? 'bg-white text-success shadow-sm fw-bold'
                      : 'text-muted'
                  }`}
                  onClick={() => setRevenueView('daily')}
                >
                  روزانه
                </button>
                <button
                  className={`btn btn-sm rounded-pill px-4 transition-all ${
                    revenueView === 'monthly'
                      ? 'bg-white text-success shadow-sm fw-bold'
                      : 'text-muted'
                  }`}
                  onClick={() => setRevenueView('monthly')}
                >
                  ماهانه
                </button>
              </div>
            </div>
            <div className="card-body">
              <div style={{ width: '100%', height: 320 }}>
                <ResponsiveContainer>
                  <AreaChart
                    data={currentRevenueData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      interval={revenueView === 'daily' ? 2 : 0} // Show fewer ticks on daily view
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#94a3b8', fontSize: 12 }}
                      tickFormatter={(value) =>
                        value >= 1000000
                          ? `${(value / 1000000).toFixed(1)}M`
                          : `${(value / 1000).toFixed(0)}k`
                      }
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: any) => [`${value.toLocaleString()} تومان`, 'درآمد']}
                    />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="#10b981"
                      strokeWidth={3}
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                      animationDuration={800}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>

        {/* User Plan Distribution */}
        <div className="col-12 col-xl-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.99 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="card border-0 shadow-sm h-100 rounded-4"
          >
            <div className="card-header bg-white border-0 pt-4 px-4">
              <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                <Crown className="text-warning" size={20} />
                وضعیت اشتراک کاربران
              </h5>
            </div>
            <div className="card-body d-flex flex-column align-items-center justify-content-center">
              <div style={{ width: '100%', height: 220 }} className="position-relative">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={planChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {planChartData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={PLAN_COLORS[index % PLAN_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="position-absolute top-50 start-50 translate-middle text-center">
                  <span className="display-6 fw-bold text-dark">{portalData?.totalUsers}</span>
                  <span className="d-block text-muted small">Total Users</span>
                </div>
              </div>

              <div className="d-flex justify-content-around w-100 mt-3">
                <div className="text-center">
                  <div className="d-flex align-items-center gap-1 justify-content-center text-muted mb-1">
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: PLAN_COLORS[0],
                      }}
                    ></div>
                    <span className="small">رایگان</span>
                  </div>
                  <h5 className="fw-bold m-0">{freeUsers}</h5>
                </div>
                <div className="text-center">
                  <div className="d-flex align-items-center gap-1 justify-content-center text-muted mb-1">
                    <div
                      style={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        backgroundColor: PLAN_COLORS[1],
                      }}
                    ></div>
                    <span className="small">ویژه (VIP)</span>
                  </div>
                  <h5 className="fw-bold m-0">{paidUsers}</h5>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Row 3: AI Models Analytics */}
      <div className="row g-4">
        {/* Bar Chart */}
        <div className="col-12 col-xl-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="card border-0 shadow-sm h-100 rounded-4"
          >
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex flex-wrap justify-content-between align-items-center gap-3">
              <div>
                <h5 className="fw-bold text-dark mb-1 d-flex align-items-center gap-2">
                  <BarChart3 className="text-primary" size={20} />
                  آمار مصرف مدل‌های هوش مصنوعی
                </h5>
                <p className="text-muted small mb-0">تعداد درخواست‌ها به تفکیک مدل</p>
              </div>
              <div className="bg-light p-1 rounded-pill d-flex border">
                <button
                  className={`btn btn-sm rounded-pill px-4 transition-all ${
                    modelView === 'daily' ? 'bg-white text-primary shadow-sm fw-bold' : 'text-muted'
                  }`}
                  onClick={() => setModelView('daily')}
                >
                  روزانه
                </button>
                <button
                  className={`btn btn-sm rounded-pill px-4 transition-all ${
                    modelView === 'monthly'
                      ? 'bg-white text-primary shadow-sm fw-bold'
                      : 'text-muted'
                  }`}
                  onClick={() => setModelView('monthly')}
                >
                  ماهانه
                </button>
              </div>
            </div>
            <div className="card-body px-2 pb-2">
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer>
                  <BarChart data={aiChartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis
                      dataKey="name"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 11, fontWeight: 500 }}
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                      height={60}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#64748b', fontSize: 12 }}
                    />
                    <Tooltip
                      cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                      contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                      }}
                    />
                    <defs>
                      <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
                        <stop offset="100%" stopColor="#818cf8" stopOpacity={0.6} />
                      </linearGradient>
                    </defs>
                    <Bar
                      dataKey="count"
                      fill="url(#barGradient)"
                      radius={[6, 6, 0, 0]}
                      barSize={28}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        </div>

        {/* List: Top Models */}
        <div className="col-12 col-xl-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="card border-0 shadow-sm h-100 rounded-4"
          >
            <div className="card-header bg-white border-0 pt-4 px-4 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold text-dark mb-0 d-flex align-items-center gap-2">
                <Zap className="text-warning" size={20} />
                محبوب‌ترین مدل‌ها
              </h5>
              <button className="btn btn-sm btn-icon text-muted">
                <MoreHorizontal size={20} />
              </button>
            </div>
            <div className="card-body p-0">
              <div
                className="d-flex flex-column p-3 gap-2 overflow-auto custom-scrollbar"
                style={{ maxHeight: '380px' }}
              >
                {aiChartData.slice(0, 6).map((model, idx) => (
                  <div
                    key={model.name}
                    className="d-flex align-items-center justify-content-between p-3 rounded-3 hover-bg-light transition-all"
                  >
                    <div className="d-flex align-items-center gap-3">
                      <div className="avatar-item border shadow-sm rounded-circle p-1 bg-white">
                        <ModelIcon url={model.icon} alt={model.name} />
                      </div>
                      <div>
                        <h6 className="mb-1 fw-bold text-dark small">{model.name}</h6>
                        <div
                          className="progress"
                          style={{ height: 4, width: 80, backgroundColor: '#f1f5f9' }}
                        >
                          <div
                            className="progress-bar rounded-pill"
                            role="progressbar"
                            style={{
                              width: `${(model.count / (aiChartData[0].count || 1)) * 100}%`,
                              backgroundColor: COLORS[idx % COLORS.length],
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className="fw-bold text-dark d-block small">
                        {model.count.toLocaleString()}
                      </span>
                      <small className="text-muted" style={{ fontSize: '0.65rem' }}>
                        درخواست
                      </small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* --- Styles --- */}
      <style>{`
        .dashboard-container { font-family: inherit; }
        .ls-tight { letter-spacing: -0.02em; }
        .transition-all { transition: all 0.3s ease; }
        
        .bg-primary-subtle { background-color: #e0e7ff !important; } .text-primary { color: #4f46e5 !important; }
        .bg-info-subtle { background-color: #e0f2fe !important; } .text-info { color: #0284c7 !important; }
        .bg-success-subtle { background-color: #dcfce7 !important; } .text-success { color: #16a34a !important; }
        .bg-warning-subtle { background-color: #fef3c7 !important; } .text-warning { color: #d97706 !important; }

        .stat-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .stat-card:hover { transform: translateY(-5px); box-shadow: 0 10px 30px -5px rgba(0, 0, 0, 0.08) !important; }

        .hover-bg-light:hover { background-color: #f8fafc; }
        
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        
        .fade-in-down { animation: fadeInDown 0.5s ease-out; }
        @keyframes fadeInDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>
    </div>
  );
};

export default Dashboard;
