import Order from '../models/Order.js';
import Installation from '../models/Installation.js';
import SolarPanel from '../models/SolarPanel.js';

class DashboardService {
    async getAdminStats() {
        const [revenueByMonth, panelsByType, installationStatus] = await Promise.all([
            this.getRevenueByMonth(),
            this.getPanelsByType(),
            this.getInstallationStatusStats(),
        ]);

        return {
            revenueByMonth,
            panelsByType,
            installationStatus,
        };
    }

    async getRevenueByMonth() {
        const revenue = await Order.aggregate([
            { $match: { status: 'PAID' } },
            {
                $group: {
                    _id: {
                        year: { $year: '$createdAt' },
                        month: { $month: '$createdAt' },
                    },
                    revenue: { $sum: '$totalAmount' },
                },
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 },
        ]);

        const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return revenue.map((item) => ({
            month: months[item._id.month - 1],
            revenue: item.revenue,
        }));
    }

    async getPanelsByType() {
        const panels = await Order.aggregate([
            { $match: { status: 'PAID' } },
            { $unwind: '$items' },
            {
                $lookup: {
                    from: 'solarpanels',
                    localField: 'items.solarPanel',
                    foreignField: '_id',
                    as: 'panelInfo',
                },
            },
            { $unwind: '$panelInfo' },
            {
                $group: {
                    _id: '$panelInfo.capacityKW',
                    value: { $sum: '$items.quantity' },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        return panels.map((item) => ({
            name: `${item._id * 1000}W`,
            value: item.value,
        }));
    }

    async getInstallationStatusStats() {
        const stats = await Installation.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        // Ensure all statuses are present
        const allStatuses = ['PENDING', 'IN_PROGRESS', 'COMPLETED'];
        const result = allStatuses.map((status) => {
            const found = stats.find((s) => s._id === status);
            return {
                name: status.charAt(0) + status.slice(1).toLowerCase().replace('_', ' '),
                count: found ? found.count : 0,
            };
        });

        return result;
    }
}

export default new DashboardService();
