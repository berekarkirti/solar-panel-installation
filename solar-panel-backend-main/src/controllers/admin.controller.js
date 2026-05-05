import dashboardService from '../services/dashboard.service.js';

class AdminController {
    async getDashboardStats(req, res, next) {
        try {
            const stats = await dashboardService.getAdminStats();
            res.status(200).json({
                success: true,
                message: 'Dashboard stats retrieved successfully',
                data: stats,
            });
        } catch (error) {
            next(error);
        }
    }
}

export default new AdminController();
