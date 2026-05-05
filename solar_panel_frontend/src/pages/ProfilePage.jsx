import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion, AnimatePresence } from 'framer-motion';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import StatSkeleton from '../components/ui/skeletons/StatSkeleton';
import {
  User, Mail, Shield, Calendar, Save, RefreshCw, Phone, Clock,
  CheckCircle, XCircle, Lock, Camera, Maximize2, Upload, X, Edit2, MapPin, Building
} from 'lucide-react';
import { userService } from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const ProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    city: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Image Handling State
  const [selectedImage, setSelectedImage] = useState(null); // File object
  const [previewUrl, setPreviewUrl] = useState(''); // Local preview URL
  const [showImageOptions, setShowImageOptions] = useState(false); // Toggle menu
  const [showFullscreen, setShowFullscreen] = useState(false); // Fullscreen modal

  const fileInputRef = useRef(null);
  const optionsRef = useRef(null);
  const shouldReduceMotion = useReducedMotion();
  const { user, login, isLoading: authLoading } = useAuth();
  const { success: showSuccess, error: showError, info: showInfo } = useToast();
  const hasFetched = useRef(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!authLoading && user && !hasFetched.current) {
      hasFetched.current = true;
      fetchProfile();
    }
  }, [authLoading, user]);

  // Handle outside click to close image options
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target)) {
        setShowImageOptions(false);
      }
    };

    if (showImageOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showImageOptions]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await userService.getProfile();

      if (response.success && response.data) {
        updateProfileState(response.data);
      } else {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          updateProfileState(JSON.parse(storedUser));
        }
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateProfileState = (userData) => {
    setProfile(userData);
    setFormData({
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      email: userData.email || '',
      phoneNumber: userData.phoneNumber || '',
      address: userData.address || '',
      city: userData.city || '',
      newPassword: '',
      confirmPassword: '',
    });
    setPreviewUrl(userData.profileImage || '');
    setSelectedImage(null);
  };

  const handleChange = (e) => {
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

  const handleImageClick = () => {
    setShowImageOptions(!showImageOptions);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showError('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setShowImageOptions(false);
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      showError('First name and last name are required');
      return;
    }

    if (formData.newPassword && formData.newPassword.length < 6) {
      showError('Password must be at least 6 characters long');
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    const hasTextChanges =
      formData.firstName.trim() !== (profile?.firstName || '') ||
      formData.lastName.trim() !== (profile?.lastName || '') ||
      formData.phoneNumber.trim() !== (profile?.phoneNumber || '') ||
      formData.address.trim() !== (profile?.address || '') ||
      formData.city.trim() !== (profile?.city || '') ||
      formData.newPassword.trim() !== '';

    const hasImageChange = !!selectedImage;

    if (!hasTextChanges && !hasImageChange) {
      showInfo('No changes made');
      return;
    }

    try {
      setSaving(true);

      // Use FormData to handle both text and file
      const data = new FormData();
      data.append('firstName', formData.firstName.trim());
      data.append('lastName', formData.lastName.trim());
      if (formData.phoneNumber.trim()) data.append('phoneNumber', formData.phoneNumber.trim());
      if (formData.address.trim()) data.append('address', formData.address.trim());
      if (formData.city.trim()) data.append('city', formData.city.trim());
      if (formData.newPassword.trim()) data.append('password', formData.newPassword.trim());

      if (selectedImage) {
        data.append('profileImage', selectedImage);
      } else if (previewUrl && previewUrl !== profile.profileImage && !previewUrl.startsWith('blob:')) {
        // Case where we might revert to URL logic if needed, but primarily we use file upload now.
        // If user didn't upload a new file, we don't send profileImage unless we want to support generic URL updates again.
        // For now, assume file upload is the primary way.
      }

      const response = await userService.updateProfile(data);

      if (response.success && response.data) {
        const updatedUser = response.data;
        updateProfileState(updatedUser);

        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          login(updatedUser, storedToken);
        }

        showSuccess('Profile updated successfully!');
      } else {
        showError(response.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Profile update error:', err);
      showError('An unexpected error occurred');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (profile) updateProfileState(profile);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const containerVariants = transformVariant({});
  const itemVariants = transformVariant({ y: 20 });

  function transformVariant(base) {
    return shouldReduceMotion ? {} : {
      hidden: { opacity: 0, ...base },
      visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } },
    };
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <StatSkeleton />
          <div className="lg:col-span-2"><StatSkeleton /></div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <Card>
        <EmptyState icon={User} title="No user data" description="Unable to load user profile. Please login again." />
      </Card>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-20"
    >
      <div className="flex items-center gap-4">
        <motion.div
          initial={{ scale: 0, rotate: -45 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ duration: 0.5, type: 'spring' }}
          className="w-14 h-14 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl shadow-lg shadow-amber-500/20 flex items-center justify-center text-white"
        >
          <User className="w-8 h-8" strokeWidth={2.5} />
        </motion.div>
        <div>
          <h2 className="text-3xl font-black text-text-primary tracking-tight">Profile</h2>
          <p className="text-text-secondary font-medium">Update your info and password</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Profile Card & Image Upload */}
        <motion.div variants={itemVariants}>
          <Card className="landing-card p-8 border-none shadow-premium bg-white dark:bg-slate-900 group">
            <div className="text-center relative">
              <div
                className="relative mx-auto w-40 h-40 mb-6 group cursor-pointer"
                onClick={handleImageClick}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-amber-400 to-orange-500 rounded-3xl rotate-6 group-hover:rotate-12 transition-transform duration-500 opacity-20" />
                <div className="relative w-full h-full rounded-3xl overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl transition-smooth group-hover:scale-[1.02]">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Profile"
                      className="w-full h-full object-cover transition-all group-hover:brightness-90"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-5xl font-black">
                      {profile.firstName?.charAt(0) || 'U'}
                    </div>
                  )}

                  {/* Hover/Click Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px]">
                    <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                      <Camera className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                {/* Status Indicator */}
                <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl border-4 border-white dark:border-slate-900 bg-green-500 flex items-center justify-center shadow-lg">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
              </div>

              {/* Popup Menu for Image Options */}
              <AnimatePresence>
                {showImageOptions && (
                  <motion.div
                    ref={optionsRef}
                    initial={{ opacity: 0, scale: 0.9, y: -10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    className="absolute top-48 left-1/2 -translate-x-1/2 z-20 bg-white dark:bg-slate-800 border border-border-soft shadow-2xl rounded-2xl overflow-hidden w-52 py-2"
                  >
                    <button
                      onClick={(e) => { e.stopPropagation(); setShowFullscreen(true); setShowImageOptions(false); }}
                      className="w-full text-left px-5 py-3 hover:bg-bg-subtle flex items-center gap-3 text-sm font-bold text-text-primary transition-colors"
                    >
                      <Maximize2 className="w-4 h-4 text-amber-500" />
                      View Profile
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); triggerFileUpload(); }}
                      className="w-full text-left px-5 py-3 hover:bg-bg-subtle flex items-center gap-3 text-sm font-bold text-text-primary transition-colors border-t border-border-soft"
                    >
                      <Upload className="w-4 h-4 text-amber-500" />
                      Upload New
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>

              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept="image/*"
                className="hidden"
              />

              <h3 className="text-2xl font-black text-text-primary tracking-tight mb-1">
                {profile.fullName || `${profile.firstName} ${profile.lastName}`.trim()}
              </h3>
              <p className="text-text-secondary font-medium mb-4">{profile.email}</p>

              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-black uppercase tracking-widest border border-amber-500/20">
                <Shield className="w-3.5 h-3.5" />
                {profile.role}
              </div>

              <div className="mt-8 pt-6 border-t border-border-soft flex items-center justify-center gap-6">
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Impact</p>
                  <p className="text-lg font-black text-text-primary">Global</p>
                </div>
                <div className="w-px h-8 bg-border-soft" />
                <div className="text-center">
                  <p className="text-[10px] font-black uppercase tracking-widest text-text-secondary mb-1">Member</p>
                  <p className="text-lg font-black text-text-primary">{new Date(profile.createdAt).getFullYear()}</p>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Edit Form */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="landing-card p-8 border-none shadow-premium bg-white dark:bg-slate-900">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-10 h-10 rounded-xl bg-bg-subtle flex items-center justify-center">
                <Edit2 className="w-5 h-5 text-amber-500" />
              </div>
              <h3 className="text-xl font-black text-text-primary tracking-tight">Personal Info</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary mb-2 px-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    disabled={saving}
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/30 outline-none font-bold disabled:opacity-50"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary mb-2 px-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    disabled={saving}
                    required
                    className="w-full px-5 py-3.5 rounded-2xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/30 outline-none font-bold disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary mb-2 px-1">Email</label>
                  <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="email"
                      value={formData.email}
                      disabled
                      className="w-full pl-12 pr-4 py-3.5 rounded-2xl border-2 border-border-soft bg-bg-subtle/50 text-text-secondary cursor-not-allowed font-medium"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary mb-2 px-1">Phone Number</label>
                  <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-amber-500 transition-colors" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      disabled={saving}
                      maxLength={10}
                      className="w-full pl-12 py-3.5 rounded-2xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/30 outline-none font-bold disabled:opacity-50"
                      placeholder="10-digit number"
                    />
                  </div>
                </div>
              </div>

              {user?.role === 'CUSTOMER' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary mb-2 px-1">Address</label>
                    <div className="relative group">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-amber-500 transition-colors" />
                      <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        disabled={saving}
                        className="w-full pl-12 py-3.5 rounded-2xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/30 outline-none font-bold disabled:opacity-50"
                        placeholder="Street address"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary mb-2 px-1">City</label>
                    <div className="relative group">
                      <Building className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary group-focus-within:text-amber-500 transition-colors" />
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        disabled={saving}
                        className="w-full pl-12 py-3.5 rounded-2xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/30 outline-none font-bold disabled:opacity-50"
                        placeholder="City"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-6 border-t border-border-soft">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Lock className="w-4 h-4 text-orange-500" />
                  </div>
                  <h4 className="text-sm font-black text-text-primary uppercase tracking-wider">Password</h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary mb-2 px-1">New Password</label>
                    <input
                      type="password"
                      name="newPassword"
                      value={formData.newPassword}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full px-5 py-3.5 rounded-2xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/30 outline-none font-bold"
                      placeholder="Undisclosed"
                      autoComplete="new-password"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-black uppercase tracking-widest text-text-secondary mb-2 px-1">Confirm Password</label>
                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      disabled={saving}
                      className="w-full px-5 py-3.5 rounded-2xl border-2 border-border-soft focus:border-amber-400 focus:ring-4 focus:ring-amber-400/10 transition-all text-text-primary bg-bg-subtle/30 outline-none font-bold"
                      placeholder="Repeat password"
                      autoComplete="new-password"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-4">
                <Button
                  type="submit"
                  loading={saving}
                  disabled={saving}
                  className="flex-1 btn-primary-gradient py-4 rounded-2xl font-black text-white shadow-lg shadow-amber-500/20"
                >
                  <Save className="w-5 h-5 mr-2" />
                  Save Changes
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleReset}
                  disabled={saving}
                  className="px-8 rounded-2xl border-2 border-border-soft font-bold hover:bg-bg-subtle transition-all"
                >
                  <RefreshCw className="w-5 h-5 mr-2" />
                  Reset
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      </div>

      {/* Activity & Details Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <motion.div variants={itemVariants}>
          <Card className="landing-card border-none p-6 bg-white dark:bg-slate-900 shadow-premium">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Shield className="w-5 h-5 text-blue-500" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-text-primary tracking-tight">Account Details</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-bg-subtle/50 rounded-2xl border border-border-soft group hover:border-blue-400/30 transition-colors">
                <span className="text-[11px] font-black uppercase tracking-widest text-text-secondary">Last Update</span>
                <span className="text-sm font-bold text-text-primary group-hover:text-blue-500 transition-colors">{formatDate(profile.updatedAt)}</span>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card className="landing-card border-none p-6 bg-white dark:bg-slate-900 shadow-premium">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-green-500" strokeWidth={2.5} />
              </div>
              <h3 className="text-xl font-black text-text-primary tracking-tight">Login History</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-bg-subtle/50 rounded-2xl border border-border-soft group hover:border-green-400/30 transition-colors">
                <span className="text-[11px] font-black uppercase tracking-widest text-text-secondary">Last Login</span>
                <span className="text-sm font-bold text-text-primary group-hover:text-green-500 transition-colors">{formatDateTime(profile.lastLogin)}</span>
              </div>
              <div className="flex items-center justify-between p-4 bg-bg-subtle/50 rounded-2xl border border-border-soft group hover:border-green-400/30 transition-colors">
                <span className="text-[11px] font-black uppercase tracking-widest text-text-secondary">Account Status</span>
                <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${profile.isActive
                  ? 'bg-green-500 text-white shadow-lg shadow-green-500/20'
                  : 'bg-red-500 text-white shadow-lg shadow-red-500/20'
                  }`}>
                  {profile.isActive ? 'Active' : 'Suspended'}
                </span>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Fullscreen Image Modal */}
      {createPortal(
        <AnimatePresence>
          {showFullscreen && (
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/95 backdrop-blur-xl p-4 sm:p-8"
              onClick={() => setShowFullscreen(false)}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0"
              />
            <motion.button
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              className="absolute top-8 right-8 p-3 bg-white/10 hover:bg-white/20 rounded-2xl text-white transition-colors z-10"
              onClick={() => setShowFullscreen(false)}
            >
              <X className="w-8 h-8" />
            </motion.button>
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={previewUrl}
                alt="Full Profile"
                className="max-w-full max-h-[85vh] object-contain rounded-3xl shadow-2xl border-8 border-white/5"
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>,
      document.body
    )}

    </motion.div>
  );
};

export default ProfilePage;