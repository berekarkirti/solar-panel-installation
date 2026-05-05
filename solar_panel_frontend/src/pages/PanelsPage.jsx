import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import TableRowSkeleton from '../components/ui/skeletons/TableRowSkeleton';
import { Package, Sun, Zap, DollarSign, Home, Building, Plus, X, Edit2, Trash2, ChevronRight } from 'lucide-react';
import { panelService } from '../services/panelService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const getPanelImage = (panel) => {
  const { suitableFor, price, _id } = panel;
  // Use a stable numeric value from the ID for alternating images
  const idNum = _id ? _id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) : 0;

  if (suitableFor === 'commercial') {
    return idNum % 2 === 0 ? '/panels/commercial2.jpg' : '/panels/commercial3.jpg';
  }

  if (suitableFor === 'residential_pro') {
    if (price >= 20000) return '/panels/residencePro2.png';
    return '/panels/residencePro.jpg';
  }

  if (suitableFor === 'residential_basic') {
    return idNum % 2 === 0 ? '/panels/residenceBasic2jpg.jpg' : '/panels/residence3.jpg';
  }

  return '/panels/residential.jpg';
};

const PanelsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { success: showSuccess, error: showError } = useToast();
  const shouldReduceMotion = useReducedMotion();

  const [loading, setLoading] = useState(true);
  const [panels, setPanels] = useState([]);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const hasFetched = useRef(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchPanels();
    }
  }, [authLoading, isAuthenticated, filter]);

  const fetchPanels = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};
      if (filter !== 'all') {
        params.suitableFor = filter;
      }

      const response = await panelService.getAll(params);

      if (response.success) {
        setPanels(Array.isArray(response.data) ? response.data : []);
      } else {
        setError(response.error);
        showError(response.error);
      }
    } catch (err) {
      console.error('Panels fetch error:', err);
      const errorMsg = 'Failed to load solar panels';
      setError(errorMsg);
      showError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (panelId) => {
    navigate(`/panels/${panelId}`);
  };

  const filteredPanels = panels; // Server now handles filtering

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

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [modalMode, setModalMode] = useState('create'); // 'create' or 'edit'
  const [selectedPanel, setSelectedPanel] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    capacity: '',
    suitableFor: 'residential_basic',
  });

  const openModal = (panel = null) => {
    if (panel) {
      setModalMode('edit');
      setSelectedPanel(panel);
      setFormData({
        name: panel.name,
        description: panel.description || '',
        price: panel.price,
        capacity: panel.capacity || (panel.capacityKW * 1000),
        suitableFor: panel.suitableFor,
      });
    } else {
      setModalMode('create');
      setSelectedPanel(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        capacity: '',
        suitableFor: 'residential_basic',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPanel(null);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.price || !formData.capacity) {
      showError('Please fill in all required fields');
      return;
    }

    if (Number(formData.capacity) < 1) {
      showError('Capacity must be at least 1 Watt (0.001 KW)');
      return;
    }

    // Prepare data for backend
    // Backend expects capacityKW (in Kilowatts), but form uses capacity (in Watts)
    const payload = {
      name: formData.name,
      description: formData.description,
      price: Number(formData.price),
      capacityKW: Number(formData.capacity) / 1000, // Convert W to KW
      suitableFor: formData.suitableFor,
    };

    console.log('Sending panel payload:', payload);

    try {
      setSubmitting(true);
      let response;
      if (modalMode === 'create') {
        response = await panelService.create(payload);
      } else {
        response = await panelService.update(selectedPanel._id, payload);
      }

      if (response.success) {
        showSuccess(modalMode === 'create' ? 'Panel created successfully' : 'Panel updated successfully');
        closeModal();
        fetchPanels();
      } else {
        console.error(`${modalMode === 'create' ? 'Create' : 'Update'} panel failed response:`, response);
        showError(response.error);
      }
    } catch (err) {
      console.error(`${modalMode === 'create' ? 'Create' : 'Update'} panel error:`, err);
      showError(`Failed to ${modalMode === 'create' ? 'create' : 'update'} panel`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (panel) => {
    setSelectedPanel(panel);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedPanel) return;

    try {
      setDeleting(true);
      const response = await panelService.delete(selectedPanel._id);
      if (response.success) {
        showSuccess('Panel deleted successfully');
        setShowDeleteModal(false);
        fetchPanels();
      } else {
        showError(response.error);
      }
    } catch (err) {
      console.error('Delete panel error:', err);
      showError('Failed to delete panel');
    } finally {
      setDeleting(false);
      setSelectedPanel(null);
    }
  };

  if (authLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
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
            <Sun className="w-8 h-8" strokeWidth={2.5} />
          </motion.div>
          <div>
            <h2 className="text-3xl font-black text-text-primary tracking-tight">Solar Panels</h2>
            <p className="text-text-secondary font-medium">Choose the best solar panels for your needs</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-bg-subtle/50 p-1.5 rounded-2xl border border-border-soft">
            {[
              { id: 'all', label: 'All', icon: Package },
              { id: 'residential_basic', label: 'Res. Basic', icon: Home },
              { id: 'residential_pro', label: 'Res. Pro', icon: Zap },
              { id: 'commercial', label: 'Enterprise', icon: Building }
            ].map((btn) => (
              <button
                key={btn.id}
                onClick={() => setFilter(btn.id)}
                className={`px-4 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${filter === btn.id
                  ? 'bg-white dark:bg-slate-800 text-amber-500 shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'
                  }`}
              >
                <btn.icon className="w-3.5 h-3.5" />
                {btn.label}
              </button>
            ))}
          </div>

          {isAdmin && (
            <Button
              onClick={() => openModal()}
              className="btn-primary-gradient px-6 py-3.5 rounded-2xl font-black text-white shadow-lg shadow-amber-500/20 flex items-center gap-2 ml-4"
            >
              <Plus className="w-5 h-5" />
              Add Panel
            </Button>
          )}
        </div>
      </div>

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-96 rounded-3xl bg-bg-subtle/50 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && error && (
        <Card className="landing-card p-16 border-none text-center bg-red-50/10">
          <EmptyState
            icon={Package}
            title="Failed to load"
            description={error}
          />
        </Card>
      )}

      {!loading && !error && filteredPanels.length === 0 && (
        <Card className="landing-card p-16 border-none text-center">
          <EmptyState
            icon={Package}
            title="No panels found"
            description="Try a different filter."
          />
        </Card>
      )}

      {!loading && !error && filteredPanels.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {filteredPanels.map((panel) => (
            <motion.div key={panel._id} variants={itemVariants}>
              <Card
                hover={true}
                className="landing-card border-none shadow-premium bg-white dark:bg-slate-900 group overflow-hidden h-full flex flex-col"
              >
                <div className="relative h-48 bg-bg-subtle overflow-hidden">
                  <img
                    src={getPanelImage(panel)}
                    alt={panel.name}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900/40 to-transparent" />
                  <div className="absolute top-4 right-4">
                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-lg ${panel.suitableFor === 'residential_basic'
                      ? 'bg-blue-500/80 text-white'
                      : panel.suitableFor === 'residential_pro'
                        ? 'bg-amber-500/80 text-white'
                        : 'bg-slate-900/80 text-amber-400'
                      }`}>
                      {panel.suitableFor.replace('_', ' ')}
                    </div>
                  </div>
                </div>

                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-black text-text-primary tracking-tight group-hover:text-amber-500 transition-colors uppercase decoration-amber-500/30 decoration-2 underline-offset-4 line-clamp-1">
                        {panel.name}
                      </h3>
                      <div className="flex items-center gap-4 mt-3">
                        <div className="flex items-center gap-1.5 text-[11px] font-black uppercase tracking-tighter text-text-secondary">
                          <Zap className="w-3.5 h-3.5 text-amber-500" />
                          {panel.capacity || panel.capacityKW} Watt
                        </div>
                      </div>
                    </div>
                    {isAdmin && (
                      <div className="flex gap-2 ml-4">
                        <button
                          onClick={(e) => { e.stopPropagation(); openModal(panel); }}
                          className="w-10 h-10 rounded-xl bg-bg-subtle text-text-secondary hover:text-amber-500 hover:bg-amber-500/10 transition-all flex items-center justify-center border border-transparent hover:border-amber-500/20"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteClick(panel); }}
                          className="w-10 h-10 rounded-xl bg-bg-subtle text-text-secondary hover:text-red-500 hover:bg-red-500/10 transition-all flex items-center justify-center border border-transparent hover:border-red-500/20"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <p className="text-sm font-medium text-text-secondary line-clamp-2 leading-relaxed mb-6 opacity-80 italic">
                    {panel.description || "High-performance photovoltaic module engineered for maximum energy conversion efficiency."}
                  </p>

                  <div className="mt-auto space-y-4">
                    <div className="flex items-center justify-between pt-4 border-t border-border-soft">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-text-secondary">Price</p>
                        <div className="flex items-center gap-1 text-text-primary mt-1">
                          <DollarSign className="w-5 h-5 text-amber-500" strokeWidth={3} />
                          <span className="text-3xl font-black tracking-tighter">{panel.price}</span>
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => handleViewDetails(panel._id)}
                      className="w-full btn-primary-gradient py-4 rounded-2xl font-black text-white shadow-xl shadow-amber-500/20 group/btn"
                    >
                      See Details
                      <ChevronRight className="w-5 h-5 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Panel Modal */}
      {createPortal(
        <AnimatePresence>
          {showModal && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              {/* Backdrop */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
                onClick={closeModal}
              />
              {/* Modal Container */}
              <div className="relative z-10 w-full max-w-lg flex items-center justify-center pointer-events-none">
                <motion.div
                  initial={{ scale: 0.9, y: 20, opacity: 0 }}
                  animate={{ scale: 1, y: 0, opacity: 1 }}
                  exit={{ scale: 0.9, y: 20, opacity: 0 }}
                  onClick={(e) => e.stopPropagation()}
                  className="pointer-events-auto bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full overflow-hidden border border-white/10"
                >
              <div className="bg-gradient-to-r from-amber-400 to-orange-500 p-8 flex items-center justify-between text-white">
                <div>
                  <h3 className="text-2xl font-black tracking-tight uppercase">
                    {modalMode === 'create' ? 'Add Panel' : 'Edit Panel'}
                  </h3>
                  <p className="text-white/80 text-xs font-bold uppercase tracking-widest mt-1">Product Details</p>
                </div>
                <button
                  onClick={closeModal}
                  className="p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary mb-3 px-1">Name</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleFormChange}
                    required
                    className="w-full px-5 py-4 rounded-2xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/30 outline-none font-black"
                    placeholder="e.g. Apollo Gen-X 400"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary mb-3 px-1">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    rows="3"
                    className="w-full px-5 py-4 rounded-2xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/30 outline-none resize-none font-medium text-sm leading-relaxed"
                    placeholder="Describe the panel here..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary mb-3 px-1">Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleFormChange}
                      required
                      min="0"
                      step="0.01"
                      className="w-full px-5 py-4 rounded-2xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/30 outline-none font-black"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary mb-3 px-1">Capacity (W)</label>
                    <input
                      type="number"
                      name="capacity"
                      value={formData.capacity}
                      onChange={handleFormChange}
                      required
                      min="0"
                      className="w-full px-5 py-4 rounded-2xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/30 outline-none font-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary mb-3 px-1">Suitable For</label>
                  <select
                    name="suitableFor"
                    value={formData.suitableFor}
                    onChange={handleFormChange}
                    className="w-full px-5 py-4 rounded-2xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/30 outline-none font-black appearance-none"
                  >
                    <option value="residential_basic">Residential Basic</option>
                    <option value="residential_pro">Residential Pro</option>
                    <option value="commercial">Commercial</option>
                  </select>
                </div>

                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    loading={submitting}
                    disabled={submitting}
                    className="flex-1 btn-primary-gradient py-4 rounded-2xl font-black text-white shadow-xl shadow-amber-500/20"
                  >
                    {modalMode === 'create' ? 'Add Panel' : 'Update Panel'}
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={closeModal}
                    disabled={submitting}
                    className="px-8 rounded-2xl border-2 border-border-soft font-bold hover:bg-bg-subtle transition-all"
                  >
                    Cancel
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

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setSelectedPanel(null);
        }}
        onConfirm={confirmDelete}
        title="Delete Panel"
        message={`Are you sure you want to remove "${selectedPanel?.name}"?`}
        confirmText="Remove"
        loading={deleting}
        type="danger"
      />

    </div>
  );
};

export default PanelsPage;