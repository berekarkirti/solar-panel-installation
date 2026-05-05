import cartService from '../services/cart.service.js';

/**
 * Cart Controller
 * Handles HTTP requests for shopping cart
 */

class CartController {
  /**
   * Get user's cart
   * @route GET /api/v1/cart
   * @access Customer only
   */
  async getCart(req, res, next) {
    try {
      const userId = req.user.userId;

      const cart = await cartService.getUserCart(userId);

      res.status(200).json({
        success: true,
        message: 'Cart retrieved successfully',
        data: {
          cart,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add panel to cart
   * @route POST /api/v1/cart/add
   * @access Customer only
   */
  async addToCart(req, res, next) {
    try {
      const userId = req.user.userId;
      const { solarPanelId, quantity } = req.body;

      const cart = await cartService.addToCart(userId, solarPanelId, quantity);

      res.status(200).json({
        success: true,
        message: 'Panel added to cart successfully',
        data: {
          cart,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove panel from cart
   * @route DELETE /api/v1/cart/remove/:panelId
   * @access Customer only
   */
  async removeFromCart(req, res, next) {
    try {
      const userId = req.user.userId;
      const { panelId } = req.params;

      const cart = await cartService.removeFromCart(userId, panelId);

      res.status(200).json({
        success: true,
        message: 'Panel removed from cart successfully',
        data: {
          cart,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clear entire cart
   * @route DELETE /api/v1/cart/clear
   * @access Customer only
   */
  async clearCart(req, res, next) {
    try {
      const userId = req.user.userId;

      const cart = await cartService.clearCart(userId);

      res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        data: {
          cart,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
const cartController = new CartController();
export default cartController;