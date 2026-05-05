import reviewService from '../services/review.service.js';

/**
 * Review Controller
 * Handles HTTP requests for reviews
 */

class ReviewController {
  /**
   * Add a review
   * @route POST /api/v1/reviews
   * @access Customer only
   */
  async addReview(req, res, next) {
    try {
      const customerId = req.user.userId;
      const { orderId, solarPanelId, rating, comment } = req.body;

      let review;
      if (solarPanelId) {
        review = await reviewService.addProductReview(customerId, solarPanelId, rating, comment);
      } else if (orderId) {
        review = await reviewService.addReview(customerId, orderId, rating, comment);
      } else {
        return res.status(400).json({ success: false, message: 'Either orderId or solarPanelId is required' });
      }

      res.status(201).json({
        success: true,
        message: 'Review added successfully',
        data: {
          review,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get product reviews
   * @route GET /api/v1/reviews/product/:id
   */
  async getProductReviews(req, res, next) {
    try {
      const { id } = req.params;
      const reviews = await reviewService.getProductReviews(id);

      res.status(200).json({
        success: true,
        count: reviews.length,
        data: { reviews }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get logged-in customer's reviews
   * @route GET /api/v1/reviews/my
   * @access Customer only
   */
  async getMyReviews(req, res, next) {
    try {
      const customerId = req.user.userId;

      const reviews = await reviewService.getCustomerReviews(customerId);

      res.status(200).json({
        success: true,
        message: 'Reviews retrieved successfully',
        count: reviews.length,
        data: {
          reviews,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all reviews (Admin only)
   * @route GET /api/v1/reviews
   * @access Admin only
   */
  async getAllReviews(req, res, next) {
    try {
      const reviews = await reviewService.getAllReviews();

      res.status(200).json({
        success: true,
        message: 'All reviews retrieved successfully',
        count: reviews.length,
        data: {
          reviews,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get latest reviews (Public)
   * @route GET /api/v1/reviews/latest
   */
  async getLatestReviews(req, res, next) {
    try {
      const limit = parseInt(req.query.limit) || 6;
      const reviews = await reviewService.getAllReviews(limit);

      res.status(200).json({
        success: true,
        message: 'Latest reviews retrieved successfully',
        count: reviews.length,
        data: {
          reviews,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a review (Admin only)
   * @route DELETE /api/v1/reviews/:id
   * @access Admin only
   */
  async deleteReview(req, res, next) {
    try {
      const { id } = req.params;

      await reviewService.deleteReview(id);

      res.status(200).json({
        success: true,
        message: 'Review deleted successfully',
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
const reviewController = new ReviewController();
export default reviewController;