import Installation from '../models/Installation.js';
import Order from '../models/Order.js';
import User from '../models/User.js';
import { ORDER_STATUS } from '../constants/orderStatus.js';
import { INSTALLATION_STATUS } from '../constants/installationStatus.js';
import USER_ROLES from '../constants/roles.js';

/**
 * Installation Service
 * Handles business logic for installations
 */

class InstallationService {
  /**
   * Assign technician to order (Create installation)
   * @param {string} orderId
   * @param {string} technicianId
   * @returns {Promise<Object>}
   */
  async assignTechnician(orderId, technicianId) {
    // Validate order exists
    const order = await Order.findById(orderId).populate('user');

    if (!order) {
      const error = new Error('Order not found');
      error.statusCode = 404;
      throw error;
    }

    // Check order status
    if (order.status !== ORDER_STATUS.PAID) {
      const error = new Error(`Cannot create installation for order with status: ${order.status}. Order must be PAID.`);
      error.statusCode = 400;
      throw error;
    }

    // Check if installation already exists
    const existingInstallation = await Installation.findOne({ order: orderId });
    if (existingInstallation) {
      const error = new Error('Installation already assigned for this order');
      error.statusCode = 400;
      throw error;
    }

    // Validate technician exists and has TECHNICIAN role
    const technician = await User.findById(technicianId);
    if (!technician) {
      const error = new Error('Technician not found');
      error.statusCode = 404;
      throw error;
    }

    if (technician.role !== USER_ROLES.TECHNICIAN) {
      const error = new Error('Selected user is not a technician');
      error.statusCode = 400;
      throw error;
    }

    // Create installation
    const installation = await Installation.create({
      order: orderId,
      customer: order.user._id,
      technician: technicianId,
      status: INSTALLATION_STATUS.PENDING,
    });

    // Populate details
    await installation.populate({
      path: 'order',
      populate: {
        path: 'items.solarPanel',
        select: 'name price capacityKW'
      }
    });
    await installation.populate('customer', 'email firstName lastName');
    await installation.populate('technician', 'email firstName lastName');

    return installation;
  }

  /**
   * Get all installations (Admin)
   * @returns {Promise<Array>}
   */
  async getAllInstallations() {
    const installations = await Installation.find()
      .populate({
        path: 'order',
        populate: {
          path: 'items.solarPanel',
          select: 'name price capacityKW'
        }
      })
      .populate('customer', 'email firstName lastName')
      .populate('technician', 'email firstName lastName')
      .sort({ createdAt: -1 });

    return installations;
  }

  /**
   * Get installations assigned to a technician
   * @param {string} technicianId
   * @returns {Promise<Array>}
   */
  async getTechnicianInstallations(technicianId) {
    const installations = await Installation.find({ technician: technicianId })
      .populate({
        path: 'order',
        populate: {
          path: 'items.solarPanel',
          select: 'name price capacityKW'
        }
      })
      .populate('customer', 'email firstName lastName phoneNumber')
      .sort({ createdAt: -1 });

    return installations;
  }

  /**
   * Get installations for a customer
   * @param {string} customerId
   * @returns {Promise<Array>}
   */
  async getCustomerInstallations(customerId) {
    const installations = await Installation.find({ customer: customerId })
      .populate({
        path: 'order',
        populate: {
          path: 'items.solarPanel',
          select: 'name price capacityKW'
        }
      })
      .populate('technician', 'email firstName lastName phoneNumber')
      .sort({ createdAt: -1 });

    return installations;
  }

  /**
   * Update installation status
   * @param {string} installationId
   * @param {string} status
   * @param {string} notes
   * @param {string} technicianId
   * @returns {Promise<Object>}
   */
  async updateStatus(installationId, status, notes, technicianId) {
    const installation = await Installation.findById(installationId);

    if (!installation) {
      const error = new Error('Installation not found');
      error.statusCode = 404;
      throw error;
    }

    // Verify technician owns this installation
    if (installation.technician.toString() !== technicianId) {
      const error = new Error('You are not assigned to this installation');
      error.statusCode = 403;
      throw error;
    }

    // Validate status transition
    const validTransitions = {
      [INSTALLATION_STATUS.PENDING]: [INSTALLATION_STATUS.IN_PROGRESS],
      [INSTALLATION_STATUS.IN_PROGRESS]: [INSTALLATION_STATUS.COMPLETED],
      [INSTALLATION_STATUS.COMPLETED]: [], // No transitions from COMPLETED
    };

    const currentStatus = installation.status;
    const allowedStatuses = validTransitions[currentStatus];

    if (!allowedStatuses.includes(status)) {
      const error = new Error(
        `Invalid status transition from ${currentStatus} to ${status}. Allowed: ${allowedStatuses.join(', ') || 'None'}`
      );
      error.statusCode = 400;
      throw error;
    }

    // Update status
    installation.status = status;

    // Update notes if provided
    if (notes) {
      installation.notes = notes;
    }

    await installation.save();

    // Populate details
    await installation.populate({
      path: 'order',
      populate: {
        path: 'items.solarPanel',
        select: 'name price capacityKW'
      }
    });
    await installation.populate('customer', 'email firstName lastName');
    await installation.populate('technician', 'email firstName lastName');

    return installation;
  }

  /**
   * Get single installation by ID
   * @param {string} installationId
   * @returns {Promise<Object>}
   */
  async getInstallationById(installationId) {
    const installation = await Installation.findById(installationId)
      .populate({
        path: 'order',
        populate: {
          path: 'items.solarPanel',
          select: 'name price capacityKW'
        }
      })
      .populate('customer', 'email firstName lastName phoneNumber')
      .populate('technician', 'email firstName lastName phoneNumber');

    if (!installation) {
      const error = new Error('Installation not found');
      error.statusCode = 404;
      throw error;
    }

    return installation;
  }
}

// Export singleton instance
const installationService = new InstallationService();
export default installationService;