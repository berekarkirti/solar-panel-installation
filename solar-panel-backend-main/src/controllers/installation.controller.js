import installationService from '../services/installation.service.js';

/**
 * Installation Controller
 * Handles HTTP requests for installations
 */

class InstallationController {
  /**
   * Assign technician to order
   * @route POST /api/v1/installations/assign
   * @access Admin only
   */
  async assignTechnician(req, res, next) {
    try {
      const { orderId, technicianId } = req.body;

      const installation = await installationService.assignTechnician(orderId, technicianId);

      res.status(201).json({
        success: true,
        message: 'Technician assigned successfully',
        data: {
          installation,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all installations
   * @route GET /api/v1/installations
   * @access Admin only
   */
  async getAllInstallations(req, res, next) {
    try {
      const installations = await installationService.getAllInstallations();

      res.status(200).json({
        success: true,
        message: 'All installations retrieved successfully',
        count: installations.length,
        data: {
          installations,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get logged-in user's installations (Technician or Customer)
   * @route GET /api/v1/installations/my
   * @access Technician or Customer
   */
  async getMyInstallations(req, res, next) {
    try {
      const userId = req.user.userId;
      const userRole = req.user.role;

      let installations;

      if (userRole === 'TECHNICIAN') {
        installations = await installationService.getTechnicianInstallations(userId);
      } else if (userRole === 'CUSTOMER') {
        installations = await installationService.getCustomerInstallations(userId);
      } else {
        return res.status(403).json({
          success: false,
          message: 'Access denied',
        });
      }

      res.status(200).json({
        success: true,
        message: 'Installations retrieved successfully',
        count: installations.length,
        data: {
          installations,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update installation status
   * @route PUT /api/v1/installations/:id/status
   * @access Technician only
   */
  async updateStatus(req, res, next) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const technicianId = req.user.userId;

      const installation = await installationService.updateStatus(id, status, notes, technicianId);

      res.status(200).json({
        success: true,
        message: 'Installation status updated successfully',
        data: {
          installation,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
const installationController = new InstallationController();
export default installationController;