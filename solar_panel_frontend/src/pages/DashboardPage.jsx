import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
    Sun,
    Package,
    Wrench,
    Users,
    LayoutDashboard,
    ShoppingCart,
    MessageSquare,
    ArrowRight,
    AlertCircle,
    Activity,
    CheckCircle,
    TrendingUp,
    BarChart3,
    PieChart as PieIcon,
    RefreshCcw,
    Zap
} from 'lucide-react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';

const CHART_COLORS = ['#f59e0b', '#3b82f6', '#22c55e', '#a855f7', '#ef4444'];

const DashboardPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const shouldReduceMotion = useReducedMotion();

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        revenueByMonth: [],
        panelsByType: [],
        installationStatus: [],
    });
    const [error, setError] = useState(null);

    useEffect(() => {
        if (user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') {
            fetchStats();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await adminService.getStats();
            if (response.success) {
                setStats(response.data);
            } else {
                setError(response.error);
            }
        } catch {
            setError('Failed to load dashboard statistics');
        } finally {
            setLoading(false);
        }
    };

    const containerVariants = shouldReduceMotion
        ? {}
        : {
            hidden: { opacity: 0 },
            visible: {
                opacity: 1,
                transition: {
                    staggerChildren: 0.1,
                },
            },
        };

    const itemVariants = shouldReduceMotion
        ? {}
        : {
            hidden: { opacity: 0, y: 20 },
            visible: {
                opacity: 1,
                y: 0,
                transition: {
                    duration: 0.4,
                    ease: [0.16, 1, 0.3, 1],
                },
            },
        };

    const statCards = [
        {
            title: 'Solar Panels',
            description: 'Browse our catalog of high-efficiency solar panels.',
            icon: Sun,
            path: '/panels',
            colorClass: 'feature-icon-amber',
            roles: ['ADMIN', 'CUSTOMER', 'TECHNICIAN'],
        },
        {
            title: 'My Orders',
            description: 'Track your recent purchases and order history.',
            icon: Package,
            path: '/orders',
            colorClass: 'feature-icon-blue',
            roles: ['ADMIN', 'CUSTOMER'],
        },
        {
            title: 'Installations',
            description: 'Manage and view upcoming jobs.',
            icon: Wrench,
            path: '/installations',
            colorClass: 'feature-icon-green',
            roles: ['ADMIN', 'TECHNICIAN', 'CUSTOMER'],
        },
        {
            title: 'Cart',
            description: 'View items in your shopping cart.',
            icon: ShoppingCart,
            path: '/cart',
            colorClass: 'feature-icon-yellow',
            roles: ['CUSTOMER'],
        },
        {
            title: 'User Management',
            description: 'Manage system users and roles.',
            icon: Users,
            path: '/users',
            colorClass: 'feature-icon-purple',
            roles: ['ADMIN'],
        },
        {
            title: 'Reviews',
            description: 'See what people are saying.',
            icon: MessageSquare,
            path: '/reviews',
            colorClass: 'feature-icon-red',
            roles: ['ADMIN', 'CUSTOMER'],
        },
    ];

    const visibleCards = statCards.filter(card =>
        card.roles.includes(user?.role)
    );

    return (
        <div className="space-y-10 pb-20">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-4">
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.5, type: 'spring' }}
                        className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center text-white"
                    >
                        <LayoutDashboard className="w-8 h-8" strokeWidth={2.5} />
                    </motion.div>
                    <div className="flex-1">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-3xl font-black text-text-primary tracking-tight leading-none mb-2"
                        >
                            Welcome back
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-text-secondary font-medium"
                        >
                            <span className="text-amber-500 font-bold">{user?.firstName} {user?.lastName}</span>, here's what's happening with your energy.
                        </motion.p>
                    </div>
                </div>

                {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (
                    <div className="flex gap-3 ml-auto">
                        <Button
                            variant="secondary"
                            onClick={fetchStats}
                            disabled={loading}
                            className="bg-white dark:bg-white/5 border-2 border-border-soft hover:border-amber-400/50 shadow-sm"
                        >
                            <RefreshCcw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                            Sync Data
                        </Button>
                    </div>
                )}
            </div>

            {/* Analytics Overview Section */}
            {(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (
                <div className="space-y-8">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-black text-text-primary tracking-tight flex items-center gap-3">
                            <TrendingUp className="w-7 h-7 text-amber-500" />
                            Stats
                        </h2>
                    </div>

                    {error ? (
                        <Card className="p-12 text-center border-2 border-red-100 bg-red-50/30 rounded-3xl">
                            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-red-800 mb-2">System Interruption</h3>
                            <p className="text-red-600 mb-8 max-w-md mx-auto">{error}</p>
                            <Button onClick={fetchStats} className="btn-primary-gradient px-8 py-3 rounded-xl mx-auto">
                                Reconnect Now
                            </Button>
                        </Card>
                    ) : loading ? (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 xl:grid-cols-3">
                            {[1, 2, 3].map((i) => (
                                <Card key={i} className="h-[450px] animate-pulse bg-white/50 dark:bg-white/5 rounded-3xl border-none">
                                    <div className="h-8 w-1/3 bg-gray-200 dark:bg-white/10 rounded-lg mb-4" />
                                    <div className="h-4 w-2/3 bg-gray-200 dark:bg-white/10 rounded-lg mb-12" />
                                    <div className="h-64 w-full bg-gray-100 dark:bg-white/5 rounded-2xl" />
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-6">
                            {/* Revenue Chart */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.3 }}
                                className="lg:col-span-4"
                            >
                                <Card className="p-8 h-full rounded-3xl border-none shadow-xl bg-white dark:bg-slate-900 relative overflow-hidden">
                                    <div className="mb-8 flex items-center justify-between relative z-10">
                                        <div>
                                            <h3 className="text-xl font-black text-text-primary tracking-tight">Money Earned</h3>
                                            <p className="text-sm text-text-secondary font-medium">Monthly growth</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                            <BarChart3 className="w-5 h-5 text-amber-500" />
                                        </div>
                                    </div>
                                    <div className="h-[350px] w-full relative z-10">
                                        {stats.revenueByMonth.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={stats.revenueByMonth} margin={{ top: 10, right: 30, left: 0, bottom: 10 }}>
                                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-border-soft)" opacity={0.2} />
                                                    <XAxis
                                                        dataKey="month"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: "var(--color-text-secondary)", fontSize: 12, fontWeight: 600 }}
                                                    />
                                                    <YAxis
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: "var(--color-text-secondary)", fontSize: 12, fontWeight: 600 }}
                                                        tickFormatter={(value) => `$${value / 1000}k`}
                                                    />
                                                    <Tooltip
                                                        contentStyle={{
                                                            backgroundColor: 'var(--color-card-bg)',
                                                            borderRadius: "16px",
                                                            border: "none",
                                                            boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.15)",
                                                            color: 'var(--color-text-primary)',
                                                            fontWeight: 'bold'
                                                        }}
                                                    />
                                                    <Line
                                                        type="monotone"
                                                        dataKey="revenue"
                                                        stroke="url(#colorRevenue)"
                                                        strokeWidth={5}
                                                        dot={{ fill: '#f59e0b', r: 6, strokeWidth: 3, stroke: '#fff' }}
                                                        activeDot={{ r: 10, strokeWidth: 0 }}
                                                        name="Revenue"
                                                    />
                                                    <defs>
                                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="1" y2="0">
                                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={1} />
                                                            <stop offset="95%" stopColor="#fb923c" stopOpacity={1} />
                                                        </linearGradient>
                                                    </defs>
                                                </LineChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-text-secondary italic">
                                                <BarChart3 className="w-12 h-12 mb-2 opacity-10" />
                                                No historical data available
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Panels Distribution */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.4 }}
                                className="lg:col-span-2"
                            >
                                <Card className="p-8 h-full rounded-3xl border-none shadow-xl bg-white dark:bg-slate-900">
                                    <div className="mb-8">
                                        <h3 className="text-xl font-black text-text-primary tracking-tight">Market Share</h3>
                                        <p className="text-sm text-text-secondary font-medium">Panel types popularity</p>
                                    </div>
                                    <div className="h-[350px] w-full">
                                        {stats.panelsByType.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={stats.panelsByType} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                                                    <XAxis type="number" hide />
                                                    <YAxis
                                                        type="category"
                                                        dataKey="name"
                                                        axisLine={false}
                                                        tickLine={false}
                                                        tick={{ fill: "var(--color-text-primary)", fontSize: 13, fontWeight: 700 }}
                                                    />
                                                    <Tooltip cursor={{ fill: 'transparent' }} />
                                                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 10, 10, 0]} barSize={25} name="Units" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-full flex flex-col items-center justify-center text-text-secondary italic">
                                                <Sun className="w-12 h-12 mb-2 opacity-10" />
                                                Inventory empty
                                            </div>
                                        )}
                                    </div>
                                </Card>
                            </motion.div>

                            {/* Installations by Status */}
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="lg:col-span-6"
                            >
                                <Card className="p-8 rounded-3xl border-none shadow-xl bg-white dark:bg-slate-900 overflow-hidden">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-black text-text-primary tracking-tight uppercase">Current Setups</h3>
                                            <p className="text-sm text-text-secondary font-medium">Installation status and numbers</p>

                                            <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
                                                <div className="p-6 rounded-2xl bg-orange-50 dark:bg-orange-500/10 border-2 border-orange-100 dark:border-orange-500/20">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <AlertCircle className="w-5 h-5 text-orange-500" />
                                                        <span className="text-sm font-bold text-orange-700 dark:text-orange-400 uppercase tracking-wider">Pending</span>
                                                    </div>
                                                    <div className="text-4xl font-black text-orange-600 dark:text-orange-500 tracking-tight">
                                                        {stats.installationStatus.find(s => s.name === 'Pending')?.count || 0}
                                                    </div>
                                                </div>
                                                <div className="p-6 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border-2 border-blue-100 dark:border-blue-500/20">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <Activity className="w-5 h-5 text-blue-500" />
                                                        <span className="text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider">In Progress</span>
                                                    </div>
                                                    <div className="text-4xl font-black text-blue-600 dark:text-blue-500 tracking-tight">
                                                        {stats.installationStatus.find(s => s.name === 'In progress')?.count || 0}
                                                    </div>
                                                </div>
                                                <div className="p-6 rounded-2xl bg-green-50 dark:bg-green-500/10 border-2 border-green-100 dark:border-green-500/20">
                                                    <div className="flex items-center gap-3 mb-2">
                                                        <CheckCircle className="w-5 h-5 text-green-500" />
                                                        <span className="text-sm font-bold text-green-700 dark:text-green-400 uppercase tracking-wider">Completed</span>
                                                    </div>
                                                    <div className="text-4xl font-black text-green-600 dark:text-green-500 tracking-tight">
                                                        {stats.installationStatus.find(s => s.name === 'Completed')?.count || 0}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="w-full md:w-64 h-64">
                                            {stats.installationStatus.some(s => s.count > 0) ? (
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <PieChart>
                                                        <Pie
                                                            data={stats.installationStatus}
                                                            cx="50%"
                                                            cy="50%"
                                                            innerRadius={65}
                                                            outerRadius={85}
                                                            paddingAngle={8}
                                                            dataKey="count"
                                                        >
                                                            {stats.installationStatus.map((entry, index) => (
                                                                <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                                                            ))}
                                                        </Pie>
                                                        <Tooltip />
                                                    </PieChart>
                                                </ResponsiveContainer>
                                            ) : (
                                                <div className="h-full flex items-center justify-center">
                                                    <div className="w-32 h-32 rounded-full border-8 border-bg-subtle opacity-20" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        </div>
                    )}

                    {/* Quick Access Grid */}
                    <div className="space-y-6 pt-10 border-t border-border-soft/50">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-black text-text-primary tracking-tight flex items-center gap-2">
                                <Zap className="w-5 h-5 text-amber-500" />
                                Fast Links
                            </h2>
                        </div>
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                        >
                            {visibleCards.map((card) => (
                                <motion.div key={card.title} variants={itemVariants}>
                                    <Card
                                        hover={true}
                                        className="h-full landing-card group p-6 relative overflow-hidden transition-smooth border-none shadow-premium bg-white dark:bg-slate-900"
                                    >
                                        <div className="relative z-10 flex flex-col h-full">
                                            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${card.colorClass} shadow-lg shadow-black/5`}>
                                                <card.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                                            </div>
                                            <h3 className="text-xl font-bold text-text-primary mb-2 tracking-tight group-hover:text-amber-500 transition-colors">{card.title}</h3>
                                            <p className="text-text-secondary text-sm mb-8 leading-relaxed font-medium">{card.description}</p>

                                            <div className="mt-auto">
                                                <Button
                                                    className="w-full justify-between btn-primary-gradient rounded-xl font-bold shadow-lg shadow-amber-500/10"
                                                    onClick={() => navigate(card.path)}
                                                >
                                                    <span>Enter {card.title}</span>
                                                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                                </Button>
                                            </div>
                                        </div>
                                    </Card>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            )}

            {/* Customer view should still see Fast Links if not Admin/Tech */}
            {!(user?.role === 'ADMIN' || user?.role === 'TECHNICIAN') && (
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-black text-text-primary tracking-tight flex items-center gap-2">
                            <Zap className="w-5 h-5 text-amber-500" />
                            Fast Links
                        </h2>
                    </div>
                    <motion.div
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {visibleCards.map((card) => (
                            <motion.div key={card.title} variants={itemVariants}>
                                <Card
                                    hover={true}
                                    className="h-full landing-card group p-6 relative overflow-hidden transition-smooth border-none shadow-premium bg-white dark:bg-slate-900"
                                >
                                    <div className="relative z-10 flex flex-col h-full">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${card.colorClass} shadow-lg shadow-black/5`}>
                                            <card.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
                                        </div>
                                        <h3 className="text-xl font-bold text-text-primary mb-2 tracking-tight group-hover:text-amber-500 transition-colors">{card.title}</h3>
                                        <p className="text-text-secondary text-sm mb-8 leading-relaxed font-medium">{card.description}</p>

                                        <div className="mt-auto">
                                            <Button
                                                className="w-full justify-between btn-primary-gradient rounded-xl font-bold shadow-lg shadow-amber-500/10"
                                                onClick={() => navigate(card.path)}
                                            >
                                                <span>Enter {card.title}</span>
                                                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            )}
        </div>
    );
};

export default DashboardPage;
