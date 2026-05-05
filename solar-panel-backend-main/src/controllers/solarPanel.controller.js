import solarPanelService from '../services/solarPanel.service.js';

/**
 * Solar Panel Controller
 * Handles HTTP requests for solar panels
 */

class SolarPanelController {
  /**
   * Get all active solar panels
   * @route GET /api/v1/panels
   * @access Public
   */
  async getAllPanels(req, res, next) {
    try {
      const { name, suitableFor, minPrice, maxPrice } = req.query;

      const filters = {
        name,
        suitableFor,
        minPrice,
        maxPrice,
      };

      const panels = await solarPanelService.getAllPanels(filters);

      res.status(200).json({
        success: true,
        message: 'Solar panels retrieved successfully',
        count: panels.length,
        data: {
          panels,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get single solar panel by ID
   * @route GET /api/v1/panels/:id
   * @access Public
   */
  async getPanelById(req, res, next) {
    try {
      const { id } = req.params;

      const panel = await solarPanelService.getPanelById(id);

      res.status(200).json({
        success: true,
        message: 'Solar panel retrieved successfully',
        data: {
          panel,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new solar panel
   * @route POST /api/v1/panels
   * @access Admin only
   */
  async createPanel(req, res, next) {
    try {
      console.log('Create panel request body:', req.body);
      const { name, capacityKW, price, description, suitableFor } = req.body;

      const panelData = {
        name,
        capacityKW,
        price,
        description,
        suitableFor,
      };

      const panel = await solarPanelService.createPanel(panelData);

      res.status(201).json({
        success: true,
        message: 'Solar panel created successfully',
        data: {
          panel,
        },
      });
    } catch (error) {
      console.error('Create panel error in controller:', error);
      next(error);
    }
  }

  /**
   * Update solar panel
   * @route PUT /api/v1/panels/:id
   * @access Admin only
   */
  async updatePanel(req, res, next) {
    try {
      const { id } = req.params;
      const { name, capacityKW, price, description, suitableFor, isActive } = req.body;

      const updateData = {
        name,
        capacityKW,
        price,
        description,
        suitableFor,
        isActive,
      };

      // Remove undefined fields
      Object.keys(updateData).forEach((key) => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });

      const panel = await solarPanelService.updatePanel(id, updateData);

      res.status(200).json({
        success: true,
        message: 'Solar panel updated successfully',
        data: {
          panel,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete solar panel (soft delete)
   * @route DELETE /api/v1/panels/:id
   * @access Admin only
   */
  async deletePanel(req, res, next) {
    try {
      const { id } = req.params;

      const result = await solarPanelService.deletePanel(id);

      res.status(200).json({
        success: true,
        message: result.message,
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
const solarPanelController = new SolarPanelController();
export default solarPanelController;