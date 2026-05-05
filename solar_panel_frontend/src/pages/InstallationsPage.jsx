import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import TableRowSkeleton from '../components/ui/skeletons/TableRowSkeleton';
import {
  Wrench, User, Calendar, Clock, CheckCircle, AlertCircle,
  PlayCircle, Sparkles, UserPlus, Package, X, Shield, MapPin, ChevronDown
} from 'lucide-react';
import { installationService } from '../services/installationService';
import { orderService } from '../services/orderService';
import { adminUserService } from '../services/adminUserService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const InstallationsPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const shouldReduceMotion = useReducedMotion();
  const hasFetched = useRef(false);

  const [loading, setLoading] = useState(true);
  const [installations, setInstallations] = useState([]);
  const [paidOrders, setPaidOrders] = useState([]); // PAID orders without installations
  const [technicians, setTechnicians] = useState([]);
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);

  // Assign modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [assigning, setAssigning] = useState(false);

  const isTechnician = user?.role === 'TECHNICIAN';
  const isAdmin = user?.role === 'ADMIN';
  const isCustomer = user?.role === 'CUSTOMER';

  useEffect(() => {
    if (!authLoading && isAuthenticated && !hasFetched.current) {
      hasFetched.current = true;
      fetchData();
    }
  }, [authLoading, isAuthenticated]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (isAdmin) {
        // Admin: fetch installations, paid orders, and technicians
        const [installationsRes, ordersRes, techniciansRes] = await Promise.all([
          installationService.getAll(),
          orderService.getAll(),
          adminUserService.getAllUsers({ role: 'TECHNICIAN' }),
        ]);

        if (installationsRes.success) {
          setInstallations(installationsRes.data || []);
        }

        if (ordersRes.success) {
          // Filter PAID orders that don't have installations yet
          const allOrders = ordersRes.data || [];
          const installationOrderIds = (installationsRes.data || []).map(i => i.order?._id);
          const unassignedPaidOrders = allOrders.filter(
            order => order.status === 'PAID' && !installationOrderIds.includes(order._id)
          );
          setPaidOrders(unassignedPaidOrders);
        }

        if (techniciansRes.success) {
          // Filter only active technicians
          const activeTechnicians = (techniciansRes.data || []).filter(t => t.isActive);
          setTechnicians(activeTechnicians);
        }
      } else {
        // Technician/Customer: fetch only their installations
        const response = await installationService.getMyInstallations();
        if (response.success) {
          setInstallations(response.data || []);
        } else {
          setError(response.error);
          showError(response.error);
        }
      }
    } catch (err) {
      console.error('Fetch data error:', err);
      const errorMsg = 'An unexpected error occurred';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (installationId, currentStatus, newStatus) => {
    try {
      setUpdatingId(installationId);

      // Optimistic update
      setInstallations(prev => prev.map(inst =>
        inst._id === installationId
          ? { ...inst, status: newStatus }
          : inst
      ));

      const response = await installationService.updateStatus(installationId, newStatus);

      if (response.success) {
        showSuccess(`Installation ${newStatus === 'COMPLETED' ? 'completed' : 'updated'} successfully!`);

        if (newStatus === 'COMPLETED') {
          setTimeout(() => {
            hasFetched.current = false;
            fetchData();
          }, 1000);
        }
      } else {
        // Rollback on failure
        setInstallations(prev => prev.map(inst =>
          inst._id === installationId
            ? { ...inst, status: currentStatus }
            : inst
        ));
        showError(response.error || 'Failed to update installation');
      }
    } catch (err) {
      console.error('Status update error:', err);
      // Rollback on error
      setInstallations(prev => prev.map(inst =>
        inst._id === installationId
          ? { ...inst, status: currentStatus }
          : inst
      ));
      showError('Failed to update installation status');
    } finally {
      setUpdatingId(null);
    }
  };

  const openAssignModal = (order) => {
    setSelectedOrder(order);
    setSelectedTechnician('');
    setShowAssignModal(true);
  };

  const closeAssignModal = () => {
    setShowAssignModal(false);
    setSelectedOrder(null);
    setSelectedTechnician('');
  };

  const handleAssignTechnician = async () => {
    if (!selectedOrder || !selectedTechnician) {
      showError('Please select a technician');
      return;
    }

    try {
      setAssigning(true);
      const response = await installationService.assign(selectedOrder._id, selectedTechnician);

      if (response.success) {
        showSuccess('Technician assigned successfully!');
        closeAssignModal();
        // Refresh data
        hasFetched.current = false;
        fetchData();
      } else {
        showError(response.error || 'Failed to assign technician');
      }
    } catch (err) {
      console.error('Assign technician error:', err);
      showError('Failed to assign technician');
    } finally {
      setAssigning(false);
    }
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case 'PENDING':
        return {
          color: 'text-accent bg-accent/10',
          progress: 0,
          icon: Clock,
        };
      case 'IN_PROGRESS':
        return {
          color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/20',
          progress: 50,
          icon: PlayCircle,
        };
      case 'COMPLETED':
        return {
          color: 'text-primary-hover bg-primary-hover/10',
          progress: 100,
          icon: CheckCircle,
        };
      default:
        return {
          color: 'text-text-secondary bg-bg-subtle',
          progress: 0,
          icon: AlertCircle,
        };
    }
  };

  const getNextStatus = (currentStatus) => {
    switch (currentStatus) {
      case 'PENDING':
        return 'IN_PROGRESS';
      case 'IN_PROGRESS':
        return 'COMPLETED';
      default:
        return null;
    }
  };

  const getNextStatusLabel = (currentStatus) => {
    switch (currentStatus) {
      case 'PENDING':
        return 'Start Installation';
      case 'IN_PROGRESS':
        return 'Mark as Completed';
      default:
        return null;
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

  // Show loading while auth is checking
  if (authLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <TableRowSkeleton key={i} />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">

      <div className="flex items-center justify-between flex-wrap gap-6">
        <div className="flex items-center gap-4">
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center text-white"
          >
            <Wrench className="w-8 h-8" strokeWidth={2.5} />
          </motion.div>
          <div>
            <h2 className="text-3xl font-black text-text-primary tracking-tight">My Setups</h2>
            <p className="text-text-secondary font-medium">
              {isTechnician ? 'Tracks the solar panels you are setting up' :
                isCustomer ? 'Installing solar power' :
                  'Manage your solar setups and workers'}
            </p>
          </div>
        </div>
      </div>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <TableRowSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && error && (
        <Card className="landing-card p-12 border-none bg-red-50/10">
          <EmptyState
            icon={Wrench}
            title="Failed to Load"
            description={error}
          />
        </Card>
      )}

      {/* Admin: Unassigned Paid Orders Section */}
      {!loading && !error && isAdmin && paidOrders.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <Package className="w-5 h-5 text-amber-600" />
            </div>
            <h3 className="text-xl font-black text-text-primary tracking-tight">
              Ready for Installation ({paidOrders.length})
            </h3>
          </div>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {paidOrders.map((order) => (
              <motion.div key={order._id} variants={itemVariants}>
                <Card
                  hover={true}
                  className="landing-card border-none shadow-premium bg-white dark:bg-slate-900 overflow-hidden group"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform" />
                  <div className="relative space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Ref #{order._id?.slice(-8).toUpperCase()}</div>
                        <div className="text-lg font-black text-text-primary group-hover:text-amber-500 transition-colors">
                          {order.items?.map(item => item.solarPanel?.name).filter(Boolean).join(', ') || 'Solar Panel'}
                        </div>
                        <div className="text-sm font-bold text-text-secondary mt-1">
                          {order.user?.firstName} {order.user?.lastName}
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-xl text-[10px] font-black tracking-widest bg-green-500 text-white shadow-lg shadow-green-500/20 uppercase">
                        PAID
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs font-black text-text-secondary uppercase tracking-widest">
                      <span className="bg-bg-subtle px-2 py-1 rounded-md">{order.items?.length || 0} PANELS</span>
                      <span className="bg-bg-subtle px-2 py-1 rounded-md text-amber-600">${order.totalAmount?.toFixed(2)}</span>
                    </div>

                    <Button
                      onClick={() => openAssignModal(order)}
                      className="w-full btn-primary-gradient py-3.5 rounded-2xl font-black text-white shadow-lg shadow-amber-500/20"
                      size="sm"
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      Assign Worker
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      )}

      {/* Divider for Admin */}
      {!loading && !error && isAdmin && paidOrders.length > 0 && installations.length > 0 && (
        <div className="py-4">
          <div className="h-px bg-gradient-to-r from-transparent via-border-soft to-transparent" />
        </div>
      )}

      {/* Installations List */}
      {!loading && !error && installations.length === 0 && paidOrders.length === 0 && (
        <Card className="landing-card p-16 border-none text-center">
          <EmptyState
            icon={Wrench}
            title="Nothing found"
            description={
              isAdmin ? "Assign a worker to start a new installation." :
                isTechnician ? "No jobs assigned to you yet." :
                  "Your installations will show up here after you buy panels."
            }
          />
        </Card>
      )}

      {!loading && !error && installations.length > 0 && (
        <div className="space-y-6">
          {isAdmin && (
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <Wrench className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="text-xl font-black text-text-primary tracking-tight">
                Active Deployments ({installations.length})
              </h3>
            </div>
          )}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 gap-6"
          >
            {installations.map((installation) => {
              const statusConfig = getStatusConfig(installation.status);
              const StatusIcon = statusConfig.icon;
              const nextStatus = getNextStatus(installation.status);
              const nextStatusLabel = getNextStatusLabel(installation.status);
              const canUpdate = isTechnician && nextStatus; // Only technicians can update status
              const isUpdating = updatingId === installation._id;

              return (
                <motion.div key={installation._id} variants={itemVariants}>
                  <Card
                    hover={true}
                    className="landing-card border-none shadow-premium bg-white dark:bg-slate-900 group p-6 overflow-hidden"
                  >
                    <div className="flex flex-col lg:flex-row gap-8">
                      <div className="flex-1 space-y-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Unit #{installation._id?.slice(-8).toUpperCase()}</div>
                            <div className="text-2xl font-black text-text-primary tracking-tight group-hover:text-amber-500 transition-colors">
                              {installation.order?.items?.map(item => item.solarPanel?.name).filter(Boolean).join(', ') || 'Solar Panel'}
                            </div>
                            <div className="inline-flex items-center mt-2 px-3 py-1 rounded-lg bg-bg-subtle border border-border-soft text-xs font-bold text-text-secondary">
                              Order Ref: #{installation.order?._id?.slice(-8).toUpperCase() || 'N/A'}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <motion.div
                              whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
                              className={`${statusConfig.color} px-4 py-2 rounded-2xl flex items-center gap-2 shadow-sm border border-white/10`}
                            >
                              <StatusIcon className="w-4 h-4" strokeWidth={2.5} />
                              <span className="text-[10px] font-black uppercase tracking-widest">{installation.status}</span>
                            </motion.div>
                            <div className="text-[11px] font-black text-text-secondary uppercase tracking-tighter">
                              {statusConfig.progress}% DONE
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-2xl bg-bg-subtle/50 border border-border-soft hover:border-amber-400/30 transition-colors">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-1.5 bg-amber-500/10 rounded-lg">
                                <User className="w-4 h-4 text-amber-600" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Consumer Account</span>
                            </div>
                            <div className="font-black text-text-primary tracking-tight">
                              {installation.customer?.firstName || 'Anonymous'} {installation.customer?.lastName || 'Client'}
                            </div>
                            {installation.customer?.email && (
                              <div className="text-sm font-medium text-text-secondary mt-1 truncate opacity-70">
                                {installation.customer.email}
                              </div>
                            )}
                          </div>

                          <div className="p-4 rounded-2xl bg-bg-subtle/50 border border-border-soft hover:border-amber-400/30 transition-colors">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="p-1.5 bg-amber-500/10 rounded-lg">
                                <Shield className="w-4 h-4 text-amber-600" />
                              </div>
                              <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Assigned Professional</span>
                            </div>
                            <div className="font-black text-text-primary tracking-tight">
                              {installation.technician?.firstName || 'Unassigned'} {installation.technician?.lastName || 'Lead'}
                            </div>
                            {installation.technician?.email && (
                              <div className="text-sm font-medium text-text-secondary mt-1 truncate opacity-70">
                                {installation.technician.email}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Deployment Address */}
                        <div className="p-4 rounded-2xl bg-bg-subtle/50 border border-border-soft hover:border-amber-400/30 transition-colors">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="p-1.5 bg-amber-500/10 rounded-lg">
                              <MapPin className="w-4 h-4 text-amber-600" />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-text-secondary">Deployment Site</span>
                          </div>
                          <div className="font-black text-text-primary tracking-tight">
                            {installation.order?.shippingAddress?.address || 'Address Unavailable'}
                          </div>
                          <div className="text-sm font-bold text-text-secondary mt-1 uppercase tracking-wider">
                            {installation.order?.shippingAddress?.city || 'City Unknown'}
                          </div>
                        </div>

                        {installation.notes && (
                          <div className="p-4 rounded-2xl bg-amber-500/5 border border-amber-500/10">
                            <div className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Worker Notes</div>
                            <div className="text-sm font-medium text-text-primary leading-relaxed">{installation.notes}</div>
                          </div>
                        )}
                      </div>

                      <div className="w-full lg:w-72 flex flex-col justify-between pt-2">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 group/item">
                            <div className="w-8 h-8 rounded-xl bg-bg-subtle flex items-center justify-center group-hover/item:bg-amber-100 transition-colors">
                              <Calendar className="w-4 h-4 text-text-secondary group-hover/item:text-amber-600" />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-tighter text-text-secondary leading-none mb-1">Created On</p>
                              <p className="text-xs font-bold text-text-primary">
                                {installation.createdAt ? new Date(installation.createdAt).toLocaleDateString('en-US', {
                                  year: 'numeric', month: 'short', day: 'numeric'
                                }) : 'N/A'}
                              </p>
                            </div>
                          </div>

                          {installation.updatedAt && (
                            <div className="flex items-center gap-3 group/item">
                              <div className="w-8 h-8 rounded-xl bg-bg-subtle flex items-center justify-center group-hover/item:bg-amber-100 transition-colors">
                                <Clock className="w-4 h-4 text-text-secondary group-hover/item:text-amber-600" />
                              </div>
                              <div>
                                <p className="text-[10px] font-black uppercase tracking-tighter text-text-secondary leading-none mb-1">Last Update</p>
                                <p className="text-xs font-bold text-text-primary">
                                  {new Date(installation.updatedAt).toLocaleDateString('en-US', {
                                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                  })}
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="mt-8 space-y-4">
                          <div className="relative h-2 w-full bg-bg-subtle rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${statusConfig.progress}%` }}
                              transition={{ duration: 1, ease: "easeOut" }}
                              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                            />
                          </div>

                          {canUpdate && (
                            <Button
                              onClick={() => handleStatusUpdate(installation._id, installation.status, nextStatus)}
                              disabled={isUpdating}
                              loading={isUpdating}
                              className="w-full btn-primary-gradient py-4 rounded-2xl font-black text-white shadow-lg shadow-amber-500/20"
                            >
                              {nextStatusLabel}
                            </Button>
                          )}

                          {installation.status === 'COMPLETED' && (
                            <div className="flex items-center justify-center gap-2 text-xs font-black text-green-500 uppercase tracking-widest bg-green-500/10 py-4 rounded-2xl border border-green-500/20">
                              <Sparkles className="w-4 h-4" />
                              <span>Deployment Verified</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      )}

      {/* Assign Technician Modal */}
      {createPortal(
        <AnimatePresence>
          {showAssignModal && selectedOrder && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* Backdrop overlay */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60"
                onClick={closeAssignModal}
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
                        <UserPlus className="w-6 h-6" />
                      </div>
                      <h3 className="text-2xl font-black tracking-tight">
                        Deploy Pro
                      </h3>
                    </div>
                    <button
                      onClick={closeAssignModal}
                      className="relative z-10 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="p-8 space-y-8">
                    <div className="p-6 bg-amber-500/5 rounded-[1.5rem] border border-amber-500/10">
                      <div className="text-[10px] font-black uppercase tracking-[0.2em] text-amber-600 mb-3 ml-1">Active Mandate</div>
                      <div className="text-xl font-black text-text-primary mb-1 tracking-tight">
                        Order #{selectedOrder._id?.slice(-8).toUpperCase()}
                      </div>
                      <div className="flex items-center gap-2 text-sm font-bold text-text-secondary">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                        Client: {selectedOrder.user?.firstName} {selectedOrder.user?.lastName}
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-text-secondary mb-4 ml-1">
                        Lead Professional
                      </label>
                      <div className="relative group">
                        <select
                          value={selectedTechnician}
                          onChange={(e) => setSelectedTechnician(e.target.value)}
                          className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 dark:border-white/5 focus:border-amber-400 dark:focus:border-amber-400 focus:ring-8 focus:ring-amber-400/5 transition-all text-text-primary bg-slate-50 dark:bg-white/5 outline-none font-black appearance-none"
                        >
                          <option value="" className="bg-white dark:bg-slate-900 font-bold">Select Worker...</option>
                          {technicians.map((tech) => (
                            <option key={tech._id} value={tech._id} className="bg-white dark:bg-slate-900 font-bold">
                              {tech.firstName} {tech.lastName} ({tech.email})
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-text-secondary group-focus-within:text-amber-500 transition-colors">
                          <ChevronDown className="w-5 h-5" />
                        </div>
                      </div>
                      {technicians.length === 0 && (
                        <p className="text-[10px] font-black text-rose-500 mt-3 px-1 uppercase tracking-widest flex items-center gap-2">
                          <AlertCircle className="w-3.5 h-3.5" />
                          No active professionals detected in system.
                        </p>
                      )}
                    </div>

                    <div className="flex gap-4 pt-2">
                      <Button
                        onClick={handleAssignTechnician}
                        loading={assigning}
                        disabled={assigning || !selectedTechnician}
                        className="flex-3 btn-primary-gradient py-4.5 rounded-[1.25rem] font-black text-white shadow-xl shadow-amber-500/20 text-sm uppercase tracking-widest"
                      >
                        Confirm Deployment
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={closeAssignModal}
                        disabled={assigning}
                        className="flex-1 px-4 rounded-[1.25rem] border-2 border-slate-200 dark:border-white/10 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-white/5 transition-all text-text-secondary"
                      >
                        Exit
                      </Button>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          )}
        </AnimatePresence>,
        document.body
      )}

    </div>
  );
};

export default InstallationsPage;