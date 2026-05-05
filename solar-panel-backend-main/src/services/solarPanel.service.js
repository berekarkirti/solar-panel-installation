import SolarPanel from '../models/SolarPanel.js';

/**
 * Solar Panel Service
 * Handles business logic for solar panels
 */

class SolarPanelService {
    /**
     * Get all active solar panels with optional filters
     * @param {Object} filters - Search filters
     * @returns {Promise<Array>}
     */
    async getAllPanels(filters = {}) {
        const query = { isActive: true };

        // Search by name (case-insensitive)
        if (filters.name) {
            query.name = { $regex: filters.name, $options: 'i' };
        }

        // Filter by suitableFor
        if (filters.suitableFor) {
            query.suitableFor = filters.suitableFor.toLowerCase();
        }

        // Filter by price range
        if (filters.minPrice || filters.maxPrice) {
            query.price = {};
            if (filters.minPrice) {
                query.price.$gte = parseFloat(filters.minPrice);
            }
            if (filters.maxPrice) {
                query.price.$lte = parseFloat(filters.maxPrice);
            }
        }

        const panels = await SolarPanel.find(query).sort({ createdAt: -1 });
        return panels;
    }

    /**
     * Get single panel by ID
     * @param {string} panelId
     * @returns {Promise<Object>}
     */
    async getPanelById(panelId) {
        const panel = await SolarPanel.findById(panelId);

        if (!panel) {
            const error = new Error('Solar panel not found');
            error.statusCode = 404;
            throw error;
        }

        return panel;
    }

    /**
     * Create a new solar panel
     * @param {Object} panelData
     * @returns {Promise<Object>}
     */
    async createPanel(panelData) {
        const panel = await SolarPanel.create(panelData);
        return panel;
    }

    /**
     * Update solar panel
     * @param {string} panelId
     * @param {Object} updateData
     * @returns {Promise<Object>}
     */
    async updatePanel(panelId, updateData) {
        const panel = await SolarPanel.findById(panelId);

        if (!panel) {
            const error = new Error('Solar panel not found');
            error.statusCode = 404;
            throw error;
        }

        // Update fields
        Object.keys(updateData).forEach((key) => {
            panel[key] = updateData[key];
        });

        await panel.save();
        return panel;
    }

    /**
     * Delete solar panel (soft delete)
     * @param {string} panelId
     * @returns {Promise<Object>}
     */
    async deletePanel(panelId) {
        const panel = await SolarPanel.findById(panelId);

        if (!panel) {
            const error = new Error('Solar panel not found');
            error.statusCode = 404;
            throw error;
        }

        panel.isActive = false;
        await panel.save();

        return { message: 'Solar panel deleted successfully' };
    }
}

// Export singleton instance
const solarPanelService = new SolarPanelService();
export default solarPanelService;