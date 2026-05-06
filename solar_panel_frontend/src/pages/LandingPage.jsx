// src/pages/LandingPage.jsx
import { useState, useEffect } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Sun,
    Zap,
    Shield,
    BarChart3,
    Users,
    Wrench,
    ShoppingCart,
    CheckCircle2,
    ArrowRight,
    Play,
    Star,
    Menu,
    X,
    ChevronDown,
    Leaf,
    DollarSign,
    Clock,
    Phone,
    Mail,
    MapPin,
    Facebook,
    Twitter,
    Linkedin,
    Instagram,
    ArrowUp,
} from 'lucide-react';
import ThemeToggle from '../components/ui/ThemeToggle';
import { getApiBaseUrl } from '../config/apiBase.js';

// Animation variants
const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};


const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.3 },
    },
};

const scaleIn = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
};

// Navbar Component
const Navbar = () => {
    const { isAuthenticated } = useAuth();
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '#features' },
        { name: 'Products', href: '#products' },
        { name: 'How It Works', href: '#how-it-works' },
        { name: 'Testimonials', href: '#Reviews' },
        { name: 'Contact', href: '#contact' },
    ];

    return (
        <motion.nav
            initial={{ y: -100 }}
            animate={{ y: 0 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'navbar-scrolled bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg shadow-lg'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2">
                        <div className="relative">
                            <Sun className="w-10 h-10 text-amber-500" />
                            <motion.div
                                animate={{ rotate: 360 }}
                                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                                className="absolute inset-0"
                            >
                                <Zap className="w-4 h-4 text-amber-600 absolute -top-1 -right-1" />
                            </motion.div>
                        </div>
                        <span className={`text-2xl font-bold transition-colors ${isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'
                            }`}>
                            Solar<span className="text-amber-500">Pro</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className={`font-medium transition-colors hover:text-amber-500 ${isScrolled
                                    ? 'text-gray-700 dark:text-gray-300'
                                    : 'text-white/90'
                                    }`}
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* CTA Buttons & Theme Toggle */}
                    <div className="hidden md:flex items-center gap-4">
                        <ThemeToggle className={!isScrolled ? "bg-white/10 text-white hover:bg-white/20 border border-white/20" : ""} />

                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="btn-primary-gradient px-6 py-2.5 font-semibold rounded-full"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className={`font-medium transition-colors ${isScrolled
                                        ? 'text-gray-700 dark:text-gray-300 hover:text-amber-500'
                                        : 'text-white hover:text-amber-300'
                                        }`}
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="btn-primary-gradient px-6 py-2.5 font-semibold rounded-full"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className="md:hidden p-2"
                    >
                        {isMobileMenuOpen ? (
                            <X className={isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'} />
                        ) : (
                            <Menu className={isScrolled ? 'text-gray-900 dark:text-white' : 'text-white'} />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                <motion.div
                    initial={false}
                    animate={isMobileMenuOpen ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
                    className="md:hidden overflow-hidden landing-card rounded-2xl mb-4"
                >
                    <div className="p-6 space-y-4">
                        {navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMobileMenuOpen(false)}
                                className="block landing-text-primary font-medium hover:text-amber-500 transition-colors"
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="flex items-center justify-between py-2">
                            <span className="landing-text-primary font-medium">Theme</span>
                            <ThemeToggle />
                        </div>
                        <hr className="border-gray-200 dark:border-gray-700" />
                        {isAuthenticated ? (
                            <Link
                                to="/dashboard"
                                className="block w-full text-center btn-primary-gradient px-6 py-3 font-semibold rounded-full"
                            >
                                Dashboard
                            </Link>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="block landing-text-primary font-medium"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="block w-full text-center btn-primary-gradient px-6 py-3 font-semibold rounded-full"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </motion.nav>
    );
};

// Hero Section
const HeroSection = () => {
    const { isAuthenticated } = useAuth();
    const { scrollY } = useScroll();
    const y = useTransform(scrollY, [0, 500], [0, 150]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section className="relative min-h-screen flex items-center overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 hero-gradient">
                {/* Animated gradient orbs */}
                <motion.div
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{ duration: 8, repeat: Infinity }}
                    className="absolute top-20 right-20 w-96 h-96 orb-amber rounded-full blur-3xl"
                />
                <motion.div
                    animate={{
                        scale: [1.2, 1, 1.2],
                        opacity: [0.2, 0.4, 0.2],
                    }}
                    transition={{ duration: 10, repeat: Infinity }}
                    className="absolute bottom-20 left-20 w-96 h-96 orb-orange rounded-full blur-3xl"
                />

                {/* Grid pattern overlay */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                />
            </div>

            <motion.div style={{ y, opacity }} className="relative z-10 w-full">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left Content */}
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                            className="text-center lg:text-left"
                        >
                            <motion.div
                                variants={fadeInUp}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full badge-amber text-sm font-medium mb-6"
                            >
                                <Zap className="w-4 h-4" />
                                #1 Solar Management Platform
                            </motion.div>

                            <motion.h1
                                variants={fadeInUp}
                                className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
                            >
                                Start Using Clean{' '}
                                <span className="gradient-text-primary">
                                    Solar Energy
                                </span>
                            </motion.h1>

                            <motion.p
                                variants={fadeInUp}
                                className="text-lg text-gray-300 mb-8 max-w-xl mx-auto lg:mx-0"
                            >
                                Change how you use power with our easy way to manage your solar panels.
                                Browse products, track setups, and manage your solar journey—all in one place.
                            </motion.p>

                            <motion.div
                                variants={fadeInUp}
                                className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start"
                            >
                                <Link
                                    to={isAuthenticated ? "/dashboard" : "/register"}
                                    className="group btn-primary-gradient px-8 py-4 font-semibold rounded-full flex items-center justify-center gap-2"
                                >
                                    {isAuthenticated ? "Go to Dashboard" : "Start Your Journey"}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <button className="px-8 py-4 glass-card text-white font-semibold rounded-full hover:bg-white/20 transition-all duration-300 flex items-center justify-center gap-2">
                                    <Play className="w-5 h-5" />
                                    Watch Demo
                                </button>
                            </motion.div>

                            {/* Stats */}
                            <motion.div
                                variants={fadeInUp}
                                className="grid grid-cols-3 gap-8 mt-12 pt-12 border-t border-white/10"
                            >
                                {[
                                    { value: '10K+', label: 'Happy Customers' },
                                    { value: '50MW', label: 'Power Generated' },
                                    { value: '99%', label: 'Satisfaction Rate' },
                                ].map((stat, index) => (
                                    <div key={index} className="text-center lg:text-left">
                                        <div className="text-3xl font-bold text-amber-400">
                                            {stat.value}
                                        </div>
                                        <div className="text-sm text-gray-400">{stat.label}</div>
                                    </div>
                                ))}
                            </motion.div>
                        </motion.div>

                        {/* Right Content - Hero Image/Illustration */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8, rotateY: -15 }}
                            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
                            transition={{ duration: 0.8, delay: 0.2 }}
                            className="relative hidden lg:block"
                        >
                            <div className="relative">
                                {/* Glassmorphism card - Orange/Amber Stats Card */}
                                <motion.div
                                    initial={{ opacity: 0, x: -50 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.6, delay: 0.4 }}
                                    className="absolute -top-10 -left-10 w-72 h-72 glass-card-orange rounded-3xl p-6 z-10"
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                            <BarChart3 className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-white font-semibold">Energy Output</div>
                                            <div className="text-green-400 text-sm flex items-center gap-1">
                                                <ArrowUp className="w-3 h-3" />
                                                +24% this month
                                            </div>
                                        </div>
                                    </div>
                                    <div className="h-32 flex items-end gap-2">
                                        {[40, 65, 45, 80, 55, 90, 70].map((height, i) => (
                                            <motion.div
                                                key={i}
                                                initial={{ height: 0 }}
                                                animate={{ height: `${height}%` }}
                                                transition={{ duration: 0.5, delay: 0.8 + i * 0.1 }}
                                                className="flex-1 bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-md shadow-lg shadow-amber-500/20"
                                            />
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-2 text-xs text-white/60">
                                        <span>Mon</span>
                                        <span>Tue</span>
                                        <span>Wed</span>
                                        <span>Thu</span>
                                        <span>Fri</span>
                                        <span>Sat</span>
                                        <span>Sun</span>
                                    </div>
                                </motion.div>

                                {/* Main solar panel image placeholder - Slate Glass */}
                                <div className="w-full h-[500px] glass-card-slate rounded-3xl flex items-center justify-center overflow-hidden">
                                    <div className="relative w-72 h-72">
                                        {/* Animated sun rays */}
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ duration: 60, repeat: Infinity, ease: 'linear' }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            {[...Array(12)].map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    className="absolute w-1 h-16 bg-gradient-to-t from-amber-400/0 to-amber-400/40 rounded-full"
                                                    style={{
                                                        transform: `rotate(${i * 30}deg) translateY(-60px)`,
                                                        transformOrigin: 'center 80px'
                                                    }}
                                                    animate={{ opacity: [0.3, 0.7, 0.3] }}
                                                    transition={{ duration: 2, delay: i * 0.15, repeat: Infinity }}
                                                />
                                            ))}
                                        </motion.div>

                                        {/* Animated sun */}
                                        <motion.div
                                            animate={{
                                                rotate: 360,
                                                scale: [1, 1.05, 1]
                                            }}
                                            transition={{
                                                rotate: { duration: 30, repeat: Infinity, ease: 'linear' },
                                                scale: { duration: 3, repeat: Infinity, ease: 'easeInOut' }
                                            }}
                                            className="absolute inset-0 flex items-center justify-center"
                                        >
                                            <div className="relative">
                                                <Sun className="w-32 h-32 text-amber-400 drop-shadow-[0_0_30px_rgba(251,191,36,0.5)]" />
                                                <div className="absolute inset-0 animate-ping">
                                                    <Sun className="w-32 h-32 text-amber-400/30" />
                                                </div>
                                            </div>
                                        </motion.div>

                                        {/* Solar panel grid */}
                                        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 grid grid-cols-4 gap-1.5 p-2 bg-slate-800/50 rounded-lg backdrop-blur-sm">
                                            {Array.from({ length: 16 }).map((_, i) => (
                                                <motion.div
                                                    key={i}
                                                    initial={{ opacity: 0, scale: 0.8 }}
                                                    animate={{
                                                        opacity: [0.4, 1, 0.4],
                                                        scale: 1
                                                    }}
                                                    transition={{
                                                        opacity: { duration: 2, delay: i * 0.1, repeat: Infinity },
                                                        scale: { duration: 0.3, delay: 0.5 + i * 0.05 }
                                                    }}
                                                    className="w-7 h-7 solar-panel-cell"
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Floating notification card */}
                                <motion.div
                                    initial={{ opacity: 0, x: 50, y: 20 }}
                                    animate={{ opacity: 1, x: 0, y: 0 }}
                                    transition={{ duration: 0.5, delay: 1.2 }}
                                    className="absolute -bottom-6 -right-6 landing-card rounded-2xl shadow-2xl p-4 flex items-center gap-3"
                                >
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ duration: 0.3, delay: 1.5, type: 'spring' }}
                                        className="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
                                    >
                                        <CheckCircle2 className="w-5 h-5 text-green-600" />
                                    </motion.div>
                                    <div>
                                        <div className="landing-text-primary font-semibold">Installation Complete</div>
                                        <div className="landing-text-muted text-sm">System is now active</div>
                                    </div>
                                </motion.div>

                                {/* Additional floating element - Power indicator */}
                                <motion.div
                                    initial={{ opacity: 0, y: -20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5, delay: 1.4 }}
                                    className="absolute top-24 -right-4 glass-card-amber rounded-xl p-3 flex items-center gap-2"
                                >
                                    <Zap className="w-5 h-5 text-amber-400" />
                                    <div>
                                        <div className="text-white text-sm font-semibold">12.4 kWh</div>
                                        <div className="text-white/60 text-xs">Today's Output</div>
                                    </div>
                                </motion.div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute bottom-8 left-1/2 -translate-x-1/2"
            >
                <ChevronDown className="w-8 h-8 text-white/50" />
            </motion.div>
        </section>
    );
};

// Features Section
const FeaturesSection = () => {
    const features = [
        {
            icon: ShoppingCart,
            title: 'Smart Shopping',
            description: 'Browse our extensive catalog of residential and commercial solar panels with advanced filtering and comparison tools.',
            colorClass: 'feature-icon-blue',
        },
        {
            icon: BarChart3,
            title: 'Real-time Dashboard',
            description: 'Monitor your energy production, savings, and system performance with intuitive analytics and reports.',
            colorClass: 'feature-icon-amber',
        },
        {
            icon: Wrench,
            title: 'Installation Tracking',
            description: 'Track every step of your installation journey from order to activation with live status updates.',
            colorClass: 'feature-icon-green',
        },
        {
            icon: Users,
            title: 'Role-Based Access',
            description: 'Custom dashboards for customers, technicians, and administrators with appropriate permissions.',
            colorClass: 'feature-icon-purple',
        },
        {
            icon: Shield,
            title: 'Secure & Reliable',
            description: 'Enterprise-grade security with encrypted data transmission and secure authentication.',
            colorClass: 'feature-icon-red',
        },
        {
            icon: Zap,
            title: 'Instant Updates',
            description: 'Real-time notifications keep you informed about order status, installations, and system alerts.',
            colorClass: 'feature-icon-yellow',
        },
    ];

    return (
        <section id="features" className="py-24 landing-section">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={staggerContainer}
                    className="text-center mb-16"
                >
                    <motion.div
                        variants={fadeInUp}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full badge-amber text-sm font-medium mb-4"
                    >
                        <Zap className="w-4 h-4" />
                        Powerful Features
                    </motion.div>
                    <motion.h2
                        variants={fadeInUp}
                        className="text-4xl font-bold landing-text-primary mb-4"
                    >
                        Everything You Need to{' '}
                        <span className="gradient-text-primary">
                            Go Solar
                        </span>
                    </motion.h2>
                    <motion.p
                        variants={fadeInUp}
                        className="text-lg landing-text-secondary max-w-2xl mx-auto"
                    >
                        We provide all the tools you need to see, buy,
                        setup, and track your solar panels.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={staggerContainer}
                    className="grid md:grid-cols-2 lg:grid-cols-3 gap-8"
                >
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            whileHover={{ y: -5, transition: { duration: 0.2 } }}
                            className="group relative landing-card rounded-2xl p-8 landing-card-hover transition-all duration-300 overflow-hidden"
                        >
                            {/* Background gradient on hover */}
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/0 to-orange-500/0 group-hover:from-amber-500/5 group-hover:to-orange-500/5 transition-all duration-300" />

                            <div className={`relative w-14 h-14 rounded-xl ${feature.colorClass} flex items-center justify-center mb-6 shadow-lg`}>
                                <feature.icon className="w-7 h-7 text-white" />
                            </div>

                            <h3 className="relative text-xl font-bold landing-text-primary mb-3">{feature.title}</h3>
                            <p className="relative landing-text-secondary leading-relaxed">{feature.description}</p>

                            <div className="relative mt-6 flex items-center font-medium text-amber-500">
                                <span className="group-hover:mr-2 transition-all duration-300">Learn more</span>
                                <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// Products Section
const ProductsSection = () => {
    const products = [
        {
            name: 'Residential Basic',
            power: '5kW',
            price: 8999,
            image: '🏠',
            features: ['10 Solar Panels', '25-Year Warranty', 'Free Installation', 'Smart Monitoring'],
            popular: false,
        },
        {
            name: 'Residential Pro',
            power: '10kW',
            price: 15999,
            image: '🏡',
            features: ['20 Solar Panels', '30-Year Warranty', 'Free Installation', 'Smart Monitoring', 'Battery Storage'],
            popular: true,
        },
        {
            name: 'Commercial',
            power: '50kW',
            price: 59999,
            image: '🏢',
            features: ['100 Solar Panels', '30-Year Warranty', 'Priority Installation', 'Advanced Analytics', 'Dedicated Support'],
            popular: false,
        },
    ];

    return (
        <section id="products" className="py-24 landing-section-alt">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={staggerContainer}
                    className="text-center mb-16"
                >
                    <motion.div
                        variants={fadeInUp}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full badge-green text-sm font-medium mb-4"
                    >
                        <Sun className="w-4 h-4" />
                        Our Products
                    </motion.div>
                    <motion.h2
                        variants={fadeInUp}
                        className="text-4xl font-bold landing-text-primary mb-4"
                    >
                        Solar Solutions for{' '}
                        <span className="gradient-text-green">
                            Every Need
                        </span>
                    </motion.h2>
                    <motion.p
                        variants={fadeInUp}
                        className="text-lg landing-text-secondary max-w-2xl mx-auto"
                    >
                        From compact residential systems to large commercial installations,
                        we have the perfect solar solution for you.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={staggerContainer}
                    className="grid md:grid-cols-3 gap-8"
                >
                    {products.map((product, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            whileHover={{ y: -10, transition: { duration: 0.3 } }}
                            className={`relative landing-card rounded-3xl p-8 transition-all duration-300 ${product.popular ? 'product-card-popular' : ''
                                }`}
                        >
                            {product.popular && (
                                <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-sm font-semibold rounded-full shadow-lg shadow-amber-500/30">
                                    Most Popular
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <div className="text-6xl mb-4">{product.image}</div>
                                <h3 className="text-2xl font-bold landing-text-primary">{product.name}</h3>
                                <div className="text-amber-500 font-semibold">
                                    {product.power} System
                                </div>
                            </div>

                            <ul className="space-y-3 mb-8">
                                {product.features.map((feature, i) => (
                                    <li key={i} className="flex items-center gap-3 landing-text-secondary">
                                        <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <Link
                                to="/panels"
                                className={`block w-full py-3 rounded-full font-semibold text-center transition-all duration-300 ${product.popular
                                    ? 'btn-primary-gradient'
                                    : 'bg-gray-100 dark:bg-gray-800 landing-text-primary hover:bg-gray-200 dark:hover:bg-gray-700'
                                    }`}
                            >
                                View Details
                            </Link>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// How It Works Section
const HowItWorksSection = () => {
    const steps = [
        {
            step: '01',
            title: 'See Panels',
            description: 'Pick solar panels from our easy-to-use catalog.',
            icon: ShoppingCart,
        },
        {
            step: '02',
            title: 'Buy Panels',
            description: 'Pay safely and easily for your new panels.',
            icon: CheckCircle2,
        },
        {
            step: '03',
            title: 'Get Installation',
            description: 'We assign a worker to set up your panels.',
            icon: Users,
        },
        {
            step: '04',
            title: 'Track Power',
            description: 'See how well it works and get the most power from your dashboard.',
            icon: BarChart3,
        },
    ];

    return (
        <section id="how-it-works" className="py-24 text-white hero-gradient">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={staggerContainer}
                    className="text-center mb-16"
                >
                    <motion.div
                        variants={fadeInUp}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full badge-amber text-sm font-medium mb-4"
                    >
                        <Zap className="w-4 h-4" />
                        Simple Process
                    </motion.div>
                    <motion.h2
                        variants={fadeInUp}
                        className="text-4xl font-bold mb-4"
                    >
                        How It{' '}
                        <span className="gradient-text-primary">
                            Works
                        </span>
                    </motion.h2>
                    <motion.p
                        variants={fadeInUp}
                        className="text-lg text-gray-400 max-w-2xl mx-auto"
                    >
                        Getting solar power has never been easier.
                        Follow these simple steps to start.
                    </motion.p>
                </motion.div>

                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={staggerContainer}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            variants={fadeInUp}
                            className="relative"
                        >
                            {/* Connector line */}
                            {index < steps.length - 1 && (
                                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 z-0 bg-gradient-to-r from-amber-500 to-transparent" />
                            )}

                            <div className="relative z-10 text-center">
                                <div className="relative inline-flex items-center justify-center mb-6">
                                    <div className="w-32 h-32 rounded-full glass-card-orange flex items-center justify-center">
                                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-500/40">
                                            <step.icon className="w-10 h-10 text-white" />
                                        </div>
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-slate-800 border-2 border-amber-500 flex items-center justify-center text-amber-500 font-bold">
                                        {step.step}
                                    </div>
                                </div>
                                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                                <p className="text-gray-400">{step.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// Stats Section
const StatsSection = () => {
    const stats = [
        { icon: Sun, value: '50+', label: 'MW Generated', colorClass: 'feature-icon-amber' },
        { icon: Users, value: '10,000+', label: 'Happy Customers', colorClass: 'feature-icon-blue' },
        { icon: Leaf, value: '25,000', label: 'Tons CO₂ Saved', colorClass: 'feature-icon-green' },
        { icon: DollarSign, value: '$5M+', label: 'Customer Savings', colorClass: 'feature-icon-purple' },
    ];

    return (
        <section className="py-20 landing-section-alt">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={staggerContainer}
                    className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
                >
                    {stats.map((stat, index) => (
                        <motion.div
                            key={index}
                            variants={scaleIn}
                            whileHover={{ scale: 1.05 }}
                            className="text-center p-8 rounded-2xl landing-card"
                        >
                            <div className={`w-16 h-16 rounded-2xl ${stat.colorClass} flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                                <stat.icon className="w-8 h-8 text-white" />
                            </div>
                            <div className="text-4xl font-bold landing-text-primary mb-2">{stat.value}</div>
                            <div className="landing-text-secondary">{stat.label}</div>
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </section>
    );
};

// Reviews Section
const ReviewsSection = () => {
    const [Reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedReview, setSelectedReview] = useState(null);
    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await fetch(`${getApiBaseUrl()}/reviews/latest?limit=10`);
                const data = await response.json();
                if (data.success) {
                    const mappedReviews = data.data.reviews.map(review => ({
                        id: review._id || Math.random().toString(),
                        name: `${review.customer?.firstName || 'Anonymous'} ${review.customer?.lastName || ''}`,
                        role: review.customer?.role === 'CUSTOMER' ? 'Verified Customer' : 'Client',
                        image: review.customer?.profileImage || (review.customer?.firstName?.charAt(0) || '👤'),
                        content: review.comment || 'No comment provided.',
                        rating: review.rating,
                        panel: review.solarPanel ? {
                            name: review.solarPanel.name,
                            capacity: review.solarPanel.capacityKW
                        } : null
                    }));
                    setReviews(mappedReviews);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchReviews();
    }, []);

    // Only display reviews if they exist
    if (loading || Reviews.length === 0) return null;

    // Triple the Reviews for seamless infinite loop
    const marqueeItems = [...Reviews, ...Reviews, ...Reviews];

    return (
        <section id="Reviews" className="py-24 landing-section overflow-hidden">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={staggerContainer}
                    className="text-center"
                >
                    <motion.div
                        variants={fadeInUp}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full badge-purple text-sm font-medium mb-4"
                    >
                        <Star className="w-4 h-4" />
                        Reviews
                    </motion.div>
                    <motion.h2
                        variants={fadeInUp}
                        className="text-4xl font-bold landing-text-primary mb-4"
                    >
                        What Our Customers{' '}
                        <span className="gradient-text-purple">Say</span>
                    </motion.h2>
                    <motion.p
                        variants={fadeInUp}
                        className="text-lg landing-text-secondary max-w-2xl mx-auto"
                    >
                        Don't just take our word for it. Here's what our satisfied customers
                        have to say about their solar journey with us.
                    </motion.p>
                </motion.div>
            </div>

            {/* Infinite Marquee Container */}
            <div
                className="relative w-full"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                <div className="flex w-fit">
                    <motion.div
                        animate={{
                            x: isPaused ? 0 : [0, '-33.333%']
                        }}
                        transition={{
                            x: {
                                duration: 30,
                                repeat: Infinity,
                                ease: "linear",
                                repeatType: "loop"
                            }
                        }}
                        className="flex gap-8 px-4"
                        style={{ width: 'max-content' }}
                    >
                        {marqueeItems.map((testimonial, index) => (
                            <motion.div
                                key={`${testimonial.id}-${index}`}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setSelectedReview(testimonial)}
                                className="w-[350px] flex-shrink-0 cursor-pointer landing-card rounded-2xl p-8 landing-card-hover transition-all duration-300"
                            >
                                <div className="flex items-center gap-1 mb-4">
                                    {[...Array(testimonial.rating || 5)].map((_, i) => (
                                        <Star
                                            key={i}
                                            className="w-5 h-5 text-amber-400 fill-amber-400"
                                        />
                                    ))}
                                </div>

                                <p className="landing-text-secondary mb-4 leading-relaxed line-clamp-3 italic">
                                    "{testimonial.content}"
                                </p>

                                {testimonial.panel && (
                                    <div className="mb-6 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/5 border border-amber-500/10">
                                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="text-xs font-medium text-amber-600/80 truncate">
                                            {testimonial.panel.name}
                                        </span>
                                    </div>
                                )}

                                <div className="flex items-center gap-4">
                                    {typeof testimonial.image === 'string' && testimonial.image.startsWith('http') ? (
                                        <img src={testimonial.image} alt={testimonial.name} className="w-12 h-12 rounded-full object-cover border-2 border-amber-500/20" />
                                    ) : (
                                        <div className="text-2xl w-12 h-12 flex items-center justify-center bg-slate-800/50 rounded-full border border-slate-700">{testimonial.image}</div>
                                    )}
                                    <div>
                                        <div className="font-bold landing-text-primary text-sm">{testimonial.name}</div>
                                        <div className="landing-text-muted text-xs">{testimonial.role}</div>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>

                {/* Gradient Masks */}
                <div className="absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
                <div className="absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-white dark:from-slate-950 to-transparent z-10 pointer-events-none" />
            </div>

            {/* Zoom Modal */}
            <AnimatePresence>
                {selectedReview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
                        onClick={() => setSelectedReview(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="relative max-w-xl w-full landing-card-slate rounded-3xl p-8 md:p-12 shadow-2xl border border-white/10"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedReview(null)}
                                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 transition-colors"
                            >
                                <X className="w-6 h-6 text-gray-400" />
                            </button>

                            <div className="flex items-center gap-1 mb-6">
                                {[...Array(selectedReview.rating || 5)].map((_, i) => (
                                    <Star key={i} className="w-6 h-6 text-amber-400 fill-amber-400" />
                                ))}
                            </div>

                            <p className="text-xl md:text-2xl text-gray-100 mb-8 leading-relaxed italic font-serif">
                                "{selectedReview.content}"
                            </p>

                            {selectedReview.panel && (
                                <div className="mb-10 p-6 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center shadow-lg shadow-amber-500/30">
                                            <Sun className="w-6 h-6 text-white" />
                                        </div>
                                        <div>
                                            <div className="text-amber-500 font-bold">{selectedReview.panel.name}</div>
                                            <div className="text-gray-400 text-sm">Capacity: {selectedReview.panel.capacity}kW</div>
                                        </div>
                                    </div>
                                    <Link
                                        to="/panels"
                                        className="btn-primary-gradient px-6 py-3 rounded-xl font-bold text-sm shadow-xl shadow-amber-500/20 flex items-center gap-2"
                                    >
                                        Browse Panels
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                </div>
                            )}

                            <div className="flex items-center gap-6">
                                {typeof selectedReview.image === 'string' && selectedReview.image.startsWith('http') ? (
                                    <img src={selectedReview.image} alt={selectedReview.name} className="w-16 h-16 rounded-full object-cover border-2 border-amber-500" />
                                ) : (
                                    <div className="text-5xl w-16 h-16 flex items-center justify-center bg-slate-800 rounded-full border border-slate-700">{selectedReview.image}</div>
                                )}
                                <div>
                                    <div className="text-xl font-bold text-white">{selectedReview.name}</div>
                                    <div className="text-amber-500 font-medium">{selectedReview.role}</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
};

// CTA Section
const CTASection = () => {
    const { isAuthenticated } = useAuth();

    return (
        <section className="py-24 landing-section-alt">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: '-100px' }}
                    variants={fadeInUp}
                    className="relative overflow-hidden rounded-3xl cta-gradient p-12 md:p-20"
                >
                    {/* Background elements */}
                    <div className="absolute inset-0 overflow-hidden">
                        <motion.div
                            animate={{
                                scale: [1, 1.2, 1],
                                opacity: [0.1, 0.2, 0.1]
                            }}
                            transition={{ duration: 8, repeat: Infinity }}
                            className="absolute -top-24 -right-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                        />
                        <motion.div
                            animate={{
                                scale: [1.2, 1, 1.2],
                                opacity: [0.1, 0.2, 0.1]
                            }}
                            transition={{ duration: 10, repeat: Infinity }}
                            className="absolute -bottom-24 -left-24 w-96 h-96 bg-white/10 rounded-full blur-3xl"
                        />
                    </div>

                    <div className="relative z-10 text-center">
                        <motion.h2
                            variants={fadeInUp}
                            className="text-3xl md:text-5xl font-bold text-white mb-6"
                        >
                            Ready to Start Your Solar Journey?
                        </motion.h2>
                        <motion.p
                            variants={fadeInUp}
                            className="text-lg md:text-xl text-white/90 max-w-2xl mx-auto mb-10"
                        >
                            Join thousands of satisfied customers who have already made the switch
                            to clean, renewable energy. Get started today!
                        </motion.p>
                        <motion.div
                            variants={fadeInUp}
                            className="flex flex-col sm:flex-row gap-4 justify-center"
                        >
                            <Link
                                to={isAuthenticated ? "/dashboard" : "/register"}
                                className="px-8 py-4 bg-white text-amber-600 font-semibold rounded-full hover:shadow-xl hover:shadow-white/20 transition-all duration-300 flex items-center justify-center gap-2"
                            >
                                {isAuthenticated ? "Go to Dashboard" : "Get Started Free"}
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                            <Link
                                to="/panels"
                                className="px-8 py-4 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold rounded-full hover:bg-white/30 transition-all duration-300"
                            >
                                Browse Products
                            </Link>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};

// Footer Component
const Footer = () => {
    const footerLinks = {
        Product: ['Features', 'Case Studies', 'Reviews'],
        Company: ['About Us', 'Careers', 'Contact', 'Partners'],
        Resources: ['Blog', 'Documentation', 'Help Center', 'API'],
        Legal: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
    };

    return (
        <footer id="contact" className="bg-slate-900 text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
                <div className="grid md:grid-cols-2 lg:grid-cols-6 gap-12">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-6">
                            <Sun className="w-10 h-10 text-amber-500" />
                            <span className="text-2xl font-bold">
                                Solar<span className="text-amber-500">Pro</span>
                            </span>
                        </Link>
                        <p className="text-gray-400 mb-6 max-w-sm">
                            Empowering homes and businesses with sustainable solar energy solutions.
                            Join the renewable energy revolution today.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Twitter, Linkedin, Instagram].map((Icon, index) => (
                                <a
                                    key={index}
                                    href="#"
                                    className="w-10 h-10 rounded-full bg-slate-800 hover:bg-amber-500 flex items-center justify-center transition-colors duration-300"
                                >
                                    <Icon className="w-5 h-5" />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Links */}
                    {Object.entries(footerLinks).map(([category, links]) => (
                        <div key={category}>
                            <h4 className="font-semibold text-lg mb-4">{category}</h4>
                            <ul className="space-y-3">
                                {links.map((link) => (
                                    <li key={link}>
                                        <a
                                            href="#"
                                            className="text-gray-400 hover:text-amber-500 transition-colors"
                                        >
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>

                {/* Contact Info */}
                <div className="border-t border-slate-800 mt-12 pt-12">
                    <div className="grid md:grid-cols-3 gap-6 mb-12">
                        {[
                            { icon: Phone, text: '+1 (555) 123-4567' },
                            { icon: Mail, text: 'hello@solarpro.com' },
                            { icon: MapPin, text: 'A-123, 1st floor, Nr. Hanuman Temple, Varachha Road, Surat, Gujarat, 395001' },
                        ].map(({ icon: Icon, text }, index) => (
                            <div key={index} className="flex items-center gap-3 text-gray-400">
                                <Icon className="w-5 h-5 text-amber-500" />
                                {text}
                            </div>
                        ))}
                    </div>

                    {/* Bottom */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-slate-800">
                        <p className="text-gray-400 text-sm">
                            © {new Date().getFullYear()} SolarPro. All rights reserved.
                        </p>
                        <div className="flex gap-6 text-sm text-gray-400">
                            <a href="#" className="hover:text-amber-500 transition-colors">Privacy</a>
                            <a href="#" className="hover:text-amber-500 transition-colors">Terms</a>
                            <a href="#" className="hover:text-amber-500 transition-colors">Cookies</a>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

// Scroll to Top Button
const ScrollToTop = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const toggleVisibility = () => setIsVisible(window.scrollY > 500);
        window.addEventListener('scroll', toggleVisibility);
        return () => window.removeEventListener('scroll', toggleVisibility);
    }, []);

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    return (
        <motion.button
            initial={{ opacity: 0, scale: 0 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0 }}
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 w-12 h-12 btn-primary-gradient text-white rounded-full shadow-lg hover:shadow-xl hover:shadow-amber-500/30 flex items-center justify-center z-50 transition-shadow"
        >
            <ArrowUp className="w-5 h-5" />
        </motion.button>
    );
};

// Main Landing Page Component
const LandingPage = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <ProductsSection />
            <HowItWorksSection />
            <StatsSection />
            <ReviewsSection />
            <CTASection />
            <Footer />
            <ScrollToTop />
        </div>
    );
};

export default LandingPage;