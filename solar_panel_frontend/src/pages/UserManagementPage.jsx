import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import TableRowSkeleton from '../components/ui/skeletons/TableRowSkeleton';
import {
    Users, UserPlus, Edit2, Trash2, Search, Filter,
    CheckCircle, XCircle, Mail, Phone, Calendar, X, Eye, EyeOff
} from 'lucide-react';
import { adminUserService } from '../services/adminUserService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const UserManagementPage = () => {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { success: showSuccess, error: showError } = useToast();
    const shouldReduceMotion = useReducedMotion();
    const hasFetched = useRef(false);

    const [loading, setLoading] = useState(true);
    const [users, setUsers] = useState([]);
    const [error, setError] = useState(null);
    const [roleFilter, setRoleFilter] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
    const [selectedUser, setSelectedUser] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showViewModal, setShowViewModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        phoneNumber: '',
    });

    useEffect(() => {
        if (!authLoading && isAuthenticated && !hasFetched.current) {
            hasFetched.current = true;
            fetchUsers();
        }
    }, [authLoading, isAuthenticated]);

    // Effect to refetch when roleFilter changes
    useEffect(() => {
        if (hasFetched.current) {
            // Only refetch if we've already done the initial fetch
            fetchUsersWithCurrentFilters();
        }
    }, [roleFilter]);

    const fetchUsers = async (overrideParams = {}) => {
        try {
            setLoading(true);
            setError(null);

            const params = { ...overrideParams };
            if (roleFilter && !Object.prototype.hasOwnProperty.call(overrideParams, 'role')) params.role = roleFilter;
            if (searchTerm && !Object.prototype.hasOwnProperty.call(overrideParams, 'search')) params.search = searchTerm;

            const response = await adminUserService.getAllUsers(params);

            if (response.success) {
                setUsers(response.data || []);
            } else {
                setError(response.error);
                showError(response.error);
            }
        } catch (err) {
            console.error('Users fetch error:', err);
            const errorMsg = 'An unexpected error occurred';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Fetch with current role filter (used when filter changes)
    const fetchUsersWithCurrentFilters = async () => {
        try {
            setLoading(true);
            setError(null);

            const params = {};
            if (roleFilter) params.role = roleFilter;
            // Don't include searchTerm when filter changes - user must click Search for that

            const response = await adminUserService.getAllUsers(params);

            if (response.success) {
                setUsers(response.data || []);
            } else {
                setError(response.error);
                showError(response.error);
            }
        } catch (err) {
            console.error('Users fetch error:', err);
            const errorMsg = 'An unexpected error occurred';
            setError(errorMsg);
            showError(errorMsg);
        } finally {
            setLoading(false);
        }
    };

    // Search handler - only triggers when Search button is clicked
    const handleSearch = (e) => {
        e.preventDefault();
        fetchUsers(); // This will include both roleFilter and searchTerm
    };

    // Filter change handler - immediately fetches with new filter
    const handleFilterChange = (role) => {
        setRoleFilter(role);
        // The useEffect watching roleFilter will trigger the fetch
    };

    const openCreateModal = () => {
        setModalMode('create');
        setSelectedUser(null);
        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
        });
        setShowModal(true);
    };

    const openEditModal = (userToEdit) => {
        if (userToEdit.role !== 'TECHNICIAN') {
            showError('Only technicians can be edited');
            return;
        }
        setModalMode('edit');
        setSelectedUser(userToEdit);
        setFormData({
            email: userToEdit.email || '',
            password: '',
            firstName: userToEdit.firstName || '',
            lastName: userToEdit.lastName || '',
            phoneNumber: userToEdit.phoneNumber || '',
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setSelectedUser(null);
        setFormData({
            email: '',
            password: '',
            firstName: '',
            lastName: '',
            phoneNumber: '',
        });
    };

    const handleViewClick = (userToView) => {
        setSelectedUser(userToView);
        setShowViewModal(true);
    };

    const closeViewModal = () => {
        setShowViewModal(false);
        setSelectedUser(null);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        if (name === 'phoneNumber') {
            const numericValue = value.replace(/\D/g, '').slice(0, 10);
            setFormData({
                ...formData,
                [name]: numericValue,
            });
            return;
        }
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.firstName.trim() || !formData.lastName.trim()) {
            showError('First name and last name are required');
            return;
        }

        if (modalMode === 'create') {
            if (!formData.email.trim() || !formData.password.trim()) {
                showError('Email and password are required');
                return;
            }
            if (formData.password.length < 6) {
                showError('Password must be at least 6 characters');
                return;
            }
        }

        try {
            setSubmitting(true);

            let response;
            if (modalMode === 'create') {
                response = await adminUserService.createTechnician(formData);
            } else {
                const updateData = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    phoneNumber: formData.phoneNumber,
                };
                if (formData.password.trim()) {
                    updateData.password = formData.password;
                }
                response = await adminUserService.updateTechnician(selectedUser._id, updateData);
            }

            if (response.success) {
                showSuccess(modalMode === 'create' ? 'Technician created successfully' : 'Technician updated successfully');
                closeModal();
                hasFetched.current = false;
                fetchUsers();
            } else {
                showError(response.error);
            }
        } catch (err) {
            console.error('Submit error:', err);
            showError('An unexpected error occurred');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeleteClick = (userToDelete) => {
        if (userToDelete.role !== 'TECHNICIAN') {
            showError('Only technicians can be deleted');
            return;
        }
        setSelectedUser(userToDelete);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;

        try {
            setDeleting(true);
            const response = await adminUserService.deleteTechnician(selectedUser._id);
            if (response.success) {
                showSuccess('Technician deleted successfully');
                setUsers(prev => prev.filter(u => u._id !== selectedUser._id));
                setShowDeleteModal(false);
            } else {
                showError(response.error);
            }
        } catch (err) {
            console.error('Delete error:', err);
            showError('Failed to delete technician');
        } finally {
            setDeleting(false);
            setSelectedUser(null);
        }
    };

    const handleToggleStatus = async (userToToggle) => {
        if (userToToggle.role !== 'TECHNICIAN') {
            showError('Only technician status can be toggled');
            return;
        }

        try {
            const response = await adminUserService.toggleUserStatus(userToToggle._id);
            if (response.success) {
                showSuccess(`Technician ${response.data.isActive ? 'activated' : 'deactivated'} successfully`);
                setUsers(prev => prev.map(u => u._id === userToToggle._id ? response.data : u));
            } else {
                showError(response.error);
            }
        } catch (err) {
            console.error('Toggle status error:', err);
            showError('Failed to toggle status');
        }
    };

    const containerVariants = shouldReduceMotion ? {} : {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };

    const itemVariants = shouldReduceMotion ? {} : {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    };

    if (authLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3, 4].map((i) => <TableRowSkeleton key={i} />)}
            </div>
        );
    }

    return (
        <div className="pb-20">
            <div className="space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between flex-wrap gap-6">
                    <div className="flex items-center gap-4">
                        <motion.div
                            initial={{ scale: 0, rotate: -45 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ duration: 0.5, type: 'spring' }}
                            className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center text-white"
                        >
                            <Users className="w-8 h-8" strokeWidth={2.5} />
                        </motion.div>
                        <div>
                            <h2 className="text-3xl font-black text-text-primary tracking-tight">Users</h2>
                            <p className="text-text-secondary font-medium">Manage your workers and customers</p>
                        </div>
                    </div>
                    <Button
                        onClick={openCreateModal}
                        className="btn-primary-gradient px-6 py-3 rounded-xl font-bold shadow-lg shadow-amber-500/10 flex items-center gap-2"
                    >
                        <UserPlus className="w-5 h-5" />
                        Add Worker
                    </Button>
                </div>

                {/* Filters */}
                <Card className="landing-card p-6 border-none shadow-premium bg-white dark:bg-slate-900">
                    <div className="flex flex-col md:flex-row gap-6">
                        <form onSubmit={handleSearch} className="flex-1 flex gap-3">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-amber-500 transition-colors" />
                                <input
                                    type="text"
                                    placeholder="Search by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 rounded-xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all bg-bg-subtle/50 text-text-primary outline-none font-medium"
                                />
                            </div>
                            <Button
                                type="submit"
                                variant="secondary"
                                className="bg-white dark:bg-white/5 border-2 border-border-soft hover:border-amber-400/50 rounded-xl px-6 font-bold"
                            >
                                Search
                            </Button>
                        </form>

                        <div className="flex items-center gap-3">
                            <div className="p-2.5 bg-bg-subtle/50 rounded-xl border border-border-soft">
                                <Filter className="w-5 h-5 text-text-secondary" />
                            </div>
                            <select
                                value={roleFilter}
                                onChange={(e) => handleFilterChange(e.target.value)}
                                className="px-4 py-3 rounded-xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all bg-bg-subtle/50 text-text-primary outline-none font-bold"
                            >
                                <option value="">All Users</option>
                                <option value="CUSTOMER">Customers</option>
                                <option value="TECHNICIAN">Workers</option>
                            </select>
                        </div>
                    </div>
                </Card>

                {/* Loading */}
                {loading && (
                    <div className="space-y-4">
                        {[1, 2, 3, 4].map((i) => <TableRowSkeleton key={i} />)}
                    </div>
                )}

                {/* Error */}
                {!loading && error && (
                    <Card className="landing-card p-12 border-none bg-red-50/10">
                        <EmptyState icon={Users} title="Failed to load" description={error} />
                    </Card>
                )}

                {/* Empty */}
                {!loading && !error && users.length === 0 && (
                    <Card className="landing-card p-12 border-none">
                        <EmptyState
                            icon={Users}
                            title="No Records Found"
                            description="Adjust your filters or try a different search term."
                        />
                    </Card>
                )}

                {/* User List */}
                {!loading && !error && users.length > 0 && (
                    <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-4">
                        {users.map((userItem) => {
                            const isTechnician = userItem.role === 'TECHNICIAN';
                            const isCustomer = userItem.role === 'CUSTOMER';

                            return (
                                <motion.div key={userItem._id} variants={itemVariants}>
                                    <Card
                                        hover={true}
                                        className="landing-card border-none shadow-sm hover:shadow-xl transition-smooth group p-5 bg-white dark:bg-slate-900"
                                    >
                                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                                            <div className="flex items-center gap-5 flex-1 min-w-0">
                                                {/* Avatar */}
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-black text-xl flex-shrink-0 shadow-lg shadow-amber-500/10 overflow-hidden">
                                                    {userItem.profileImage ? (
                                                        <img src={userItem.profileImage} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        userItem.firstName?.charAt(0) || 'U'
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-3 flex-wrap mb-1">
                                                        <h3 className="text-xl font-black text-text-primary tracking-tight group-hover:text-amber-500 transition-colors">
                                                            {userItem.firstName} {userItem.lastName}
                                                        </h3>
                                                        <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shadow-sm ${isTechnician
                                                            ? 'bg-blue-500 text-white'
                                                            : 'bg-green-500 text-white'
                                                            }`}>
                                                            {userItem.role}
                                                        </span>
                                                        {!userItem.isActive && (
                                                            <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider bg-red-500 text-white shadow-sm">
                                                                Inactive
                                                            </span>
                                                        )}
                                                    </div>

                                                    <div className="flex items-center gap-4 text-sm text-text-secondary flex-wrap font-medium">
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-bg-subtle rounded-md">
                                                            <Mail className="w-3.5 h-3.5 text-amber-500" />
                                                            <span className="truncate">{userItem.email}</span>
                                                        </div>
                                                        {userItem.phoneNumber && (
                                                            <div className="flex items-center gap-1.5 px-2 py-1 bg-bg-subtle rounded-md">
                                                                <Phone className="w-3.5 h-3.5 text-amber-500" />
                                                                <span>{userItem.phoneNumber}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1.5 px-2 py-1 bg-bg-subtle rounded-md">
                                                            <Calendar className="w-3.5 h-3.5 text-amber-500" />
                                                            <span>Joined {new Date(userItem.createdAt).toLocaleDateString()}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Actions - Only for Technicians */}
                                            {isTechnician && (
                                                <div className="flex items-center gap-3 flex-shrink-0 ml-auto sm:ml-0">
                                                    <motion.button
                                                        whileHover={{ scale: 1.05, y: -2 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleToggleStatus(userItem)}
                                                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 shadow-sm hover:shadow-md ${userItem.isActive
                                                            ? 'bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white'
                                                            : 'bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white'
                                                            }`}
                                                        title={userItem.isActive ? 'Deactivate' : 'Activate'}
                                                    >
                                                        {userItem.isActive ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05, y: -2 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleViewClick(userItem)}
                                                        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-text-primary hover:bg-amber-400 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-amber-400/20"
                                                        title="View Details"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05, y: -2 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => openEditModal(userItem)}
                                                        className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-white/5 flex items-center justify-center text-text-primary hover:bg-amber-400 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md border border-transparent hover:border-amber-400/20"
                                                        title="Edit"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </motion.button>
                                                    <motion.button
                                                        whileHover={{ scale: 1.05, y: -2 }}
                                                        whileTap={{ scale: 0.95 }}
                                                        onClick={() => handleDeleteClick(userItem)}
                                                        className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 hover:bg-rose-600 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md flex items-center justify-center"
                                                        title="Delete"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </motion.button>
                                                </div>
                                            )}

                                            {/* View button for customers */}
                                            {isCustomer && (
                                                <div className="flex items-center gap-3 flex-shrink-0 ml-auto sm:ml-0">
                                                    <Button
                                                        onClick={() => handleViewClick(userItem)}
                                                        variant="secondary"
                                                        className="px-5 py-2 rounded-xl font-black flex items-center gap-2 border-2 border-slate-200 dark:border-white/10 hover:border-amber-400 hover:text-amber-500 hover:bg-amber-400/5 transition-all text-[10px] uppercase tracking-widest shadow-sm hover:shadow-md"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        View Profile
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </div>

            {/* Edit Worker Modal */}
            {createPortal(
                <AnimatePresence>
                    {showModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            {/* Backdrop overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/60"
                                onClick={closeModal}
                            />
                            {/* Modal Container */}
                            <div className="relative z-10 w-full max-w-md flex items-center justify-center pointer-events-none">
                                <motion.div
                                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                                    animate={{ scale: 1, y: 0, opacity: 1 }}
                                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="pointer-events-auto bg-white dark:bg-slate-900 rounded-[2rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full overflow-hidden border border-border-soft"
                                >
                                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-8 flex items-center justify-between text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
                                        <div className="relative z-10 flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/20">
                                                {modalMode === 'create' ? <UserPlus className="w-6 h-6" /> : <Edit2 className="w-6 h-6" />}
                                            </div>
                                            <h3 className="text-2xl font-black tracking-tight">
                                                {modalMode === 'create' ? 'Add Worker' : 'Edit Worker'}
                                            </h3>
                                        </div>
                                        <button
                                            onClick={closeModal}
                                            className="relative z-10 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>
                                    </div>

                                    <form onSubmit={handleSubmit} className="p-8 space-y-6">
                                        {modalMode === 'create' && (
                                            <div>
                                                <label className="block text-[11px] uppercase tracking-widest font-black text-text-secondary mb-2 px-1">Email Address</label>
                                                <input
                                                    type="email"
                                                    name="email"
                                                    value={formData.email}
                                                    onChange={handleFormChange}
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/50 outline-none font-bold placeholder:font-medium"
                                                    placeholder="worker@example.com"
                                                />
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] uppercase tracking-widest font-black text-text-secondary mb-2 px-1">First Name</label>
                                                <input
                                                    type="text"
                                                    name="firstName"
                                                    value={formData.firstName}
                                                    onChange={handleFormChange}
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/50 outline-none font-bold"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] uppercase tracking-widest font-black text-text-secondary mb-2 px-1">Last Name</label>
                                                <input
                                                    type="text"
                                                    name="lastName"
                                                    value={formData.lastName}
                                                    onChange={handleFormChange}
                                                    required
                                                    className="w-full px-4 py-3 rounded-xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/50 outline-none font-bold"
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-[11px] uppercase tracking-widest font-black text-text-secondary mb-2 px-1">Phone Number</label>
                                            <input
                                                type="tel"
                                                name="phoneNumber"
                                                value={formData.phoneNumber}
                                                onChange={handleFormChange}
                                                maxLength={10}
                                                className="w-full px-4 py-3 rounded-xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/50 outline-none font-bold placeholder:font-medium"
                                                placeholder="10-digit number"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[11px] uppercase tracking-widest font-black text-text-secondary mb-2 px-1">
                                                Password {modalMode === 'create' ? '(Initial)' : '(Optional Change)'}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type={showPassword ? 'text' : 'password'}
                                                    name="password"
                                                    value={formData.password}
                                                    onChange={handleFormChange}
                                                    required={modalMode === 'create'}
                                                    minLength={modalMode === 'create' ? 6 : undefined}
                                                    className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/50 outline-none font-bold placeholder:font-medium"
                                                    placeholder={modalMode === 'create' ? 'Min 6 characters' : 'Set new password'}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowPassword(!showPassword)}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 text-text-secondary hover:text-amber-500 transition-colors"
                                                >
                                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-4">
                                            <Button
                                                type="submit"
                                                loading={submitting}
                                                disabled={submitting}
                                                className="flex-3 btn-primary-gradient py-4.5 rounded-[1.25rem] font-black text-white shadow-xl shadow-amber-500/20 text-sm uppercase tracking-widest"
                                            >
                                                {modalMode === 'create' ? 'Create' : 'Save Changes'}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="secondary"
                                                onClick={closeModal}
                                                disabled={submitting}
                                                className="flex-1 px-4 rounded-[1.25rem] border-2 border-slate-200 dark:border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-text-secondary"
                                            >
                                                Exit
                                            </Button>
                                        </div>
                                    </form>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* View User Modal */}
            {createPortal(
                <AnimatePresence>
                    {showViewModal && selectedUser && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            {/* Backdrop overlay */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-slate-900/60"
                                onClick={closeViewModal}
                            />
                            <div className="relative z-10 w-full max-w-md flex items-center justify-center pointer-events-none">
                                <motion.div
                                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                                    animate={{ scale: 1, y: 0, opacity: 1 }}
                                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                                    onClick={(e) => e.stopPropagation()}
                                    className="pointer-events-auto bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.3)] w-full overflow-hidden border border-border-soft flex flex-col"
                                >
                                    <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-10 flex flex-col items-center text-white relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-xl" />
                                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-600/20 rounded-full -ml-16 -mb-16 blur-xl" />
                                        <button
                                            onClick={closeViewModal}
                                            className="absolute right-6 top-6 z-10 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors backdrop-blur-sm"
                                        >
                                            <X className="w-5 h-5" />
                                        </button>

                                        <div className="relative z-10 w-28 h-28 rounded-[2rem] bg-white/20 backdrop-blur-md flex items-center justify-center mb-5 border-2 border-white/30 shadow-2xl overflow-hidden">
                                            {selectedUser.profileImage ? (
                                                <img src={selectedUser.profileImage} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <span className="text-5xl font-black">{selectedUser.firstName?.charAt(0)}</span>
                                            )}
                                        </div>

                                        <h3 className="relative z-10 text-3xl font-black tracking-tight mb-2">
                                            {selectedUser.firstName} {selectedUser.lastName}
                                        </h3>
                                        <span className="relative z-10 px-4 py-1.5 rounded-xl bg-white/20 text-[11px] font-black uppercase tracking-widest backdrop-blur-sm border border-white/20 shadow-sm">
                                            {selectedUser.role}
                                        </span>
                                    </div>

                                    <div className="p-10 space-y-6">
                                        <div className="grid grid-cols-1 gap-6">
                                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-bg-subtle/50 border border-border-soft/50">
                                                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                                                    <Mail className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-0.5">Email Address</p>
                                                    <p className="font-bold text-text-primary">{selectedUser.email}</p>
                                                </div>
                                            </div>

                                            {selectedUser.phoneNumber && (
                                                <div className="flex items-start gap-4 p-4 rounded-2xl bg-bg-subtle/50 border border-border-soft/50">
                                                    <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 flex-shrink-0">
                                                        <Phone className="w-5 h-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-0.5">Phone Number</p>
                                                        <p className="font-bold text-text-primary">{selectedUser.phoneNumber}</p>
                                                    </div>
                                                </div>
                                            )}

                                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-bg-subtle/50 border border-border-soft/50">
                                                <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 flex-shrink-0">
                                                    <Calendar className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-0.5">Member Since</p>
                                                    <p className="font-bold text-text-primary">{new Date(selectedUser.createdAt).toLocaleDateString(undefined, {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-start gap-4 p-4 rounded-2xl bg-bg-subtle/50 border border-border-soft/50">
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${selectedUser.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                                    {selectedUser.isActive ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-0.5">Account Status</p>
                                                    <p className={`font-bold ${selectedUser.isActive ? 'text-green-600' : 'text-red-600'}`}>
                                                        {selectedUser.isActive ? 'Active & Healthy' : 'Currently Inactive'}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <Button
                                            onClick={closeViewModal}
                                            className="w-full btn-primary-gradient py-4.5 rounded-[1.25rem] font-black text-white shadow-xl shadow-amber-500/20 mt-4 text-sm uppercase tracking-widest"
                                        >
                                            Done
                                        </Button>
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    )}
                </AnimatePresence>,
                document.body
            )}

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => {
                    setShowDeleteModal(false);
                    setSelectedUser(null);
                }}
                onConfirm={confirmDelete}
                title="Remove Access"
                message={`Permanently remove ${selectedUser?.firstName} ${selectedUser?.lastName} from the system?`}
                confirmText="Remove Account"
                loading={deleting}
                type="danger"
            />
        </div>
    );
};

export default UserManagementPage;
