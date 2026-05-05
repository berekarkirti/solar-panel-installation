import dotenv from 'dotenv';
import database from '../src/config/database.js';
import User from '../src/models/User.js';
import SolarPanel from '../src/models/SolarPanel.js';
import Cart from '../src/models/Cart.js';
import Order from '../src/models/Order.js';
import Installation from '../src/models/Installation.js';
import Review from '../src/models/Review.js';
import authService from '../src/services/auth.service.js';
import solarPanelService from '../src/services/solarPanel.service.js';
import cartService from '../src/services/cart.service.js';
import orderService from '../src/services/order.service.js';
import installationService from '../src/services/installation.service.js';
import reviewService from '../src/services/review.service.js';

dotenv.config();

const testReviewFlow = async () => {
  try {
    await database.connect();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 Testing Review Flow');
    console.log('═══════════════════════════════════════════════════════\n');

    // Clean up test data
    await User.deleteMany({ email: /review\./i });
    await SolarPanel.deleteMany({ name: /Review Test Panel/i });
    await Cart.deleteMany({});
    await Order.deleteMany({});
    await Installation.deleteMany({});
    await Review.deleteMany({});

    // Step 1: Create users
    console.log('Step 1: Creating users...');
    const customerData = await authService.register({
      email: 'review.customer@example.com',
      password: 'customer123',
      role: 'CUSTOMER',
      firstName: 'Review',
      lastName: 'Customer',
    });
    const customerId = customerData.user._id;

    const technicianData = await authService.register({
      email: 'review.technician@example.com',
      password: 'tech123',
      role: 'TECHNICIAN',
      firstName: 'Review',
      lastName: 'Technician',
    });
    const technicianId = technicianData.user._id;

    console.log('✅ Customer created:', customerData.user.email);
    console.log('✅ Technician created:', technicianData.user.email, '\n');

    // Step 2: Create panel, cart, order
    console.log('Step 2: Creating order...');
    const panel = await solarPanelService.createPanel({
      name: 'Review Test Panel 500W',
      capacityKW: 0.5,
      price: 15000,
      description: 'Test panel',
      suitableFor: 'home',
    });
    await cartService.addToCart(customerId, panel._id, 1);
    const order = await orderService.createOrder(customerId);
    console.log('✅ Order created:', order._id, '\n');

    // Step 3: Try to add review before completion (should fail)
    console.log('Step 3: Testing review before installation completion...');
    try {
      await reviewService.addReview(customerId, order._id, 5, 'Great service');
      console.log('❌ Review was allowed before completion!');
    } catch (error) {
      console.log('✅ Review rejected:', error.message, '\n');
    }

    // Step 4: Mark order as PAID and create installation
    console.log('Step 4: Completing order and installation...');
    order.status = 'PAID';
    await order.save();
    const installation = await installationService.assignTechnician(order._id, technicianId);
    await installationService.updateStatus(installation._id, 'IN_PROGRESS', null, technicianId);
    await installationService.updateStatus(installation._id, 'COMPLETED', 'Done', technicianId);
    console.log('✅ Installation completed\n');

    // Step 5: Add review
    console.log('Step 5: Adding review...');
    const review = await reviewService.addReview(customerId, order._id, 5, 'Excellent service!');
    console.log('✅ Review added:', review._id);
    console.log('Rating:', review.rating);
    console.log('Comment:', review.comment, '\n');

    // Step 6: Try to add duplicate review (should fail)
    console.log('Step 6: Testing duplicate review...');
    try {
      await reviewService.addReview(customerId, order._id, 4, 'Another review');
      console.log('❌ Duplicate review was allowed!');
    } catch (error) {
      console.log('✅ Duplicate rejected:', error.message, '\n');
    }

    // Step 7: Get customer reviews
    console.log('Step 7: Getting customer reviews...');
    const customerReviews = await reviewService.getCustomerReviews(customerId);
    console.log('✅ Customer has', customerReviews.length, 'review(s)\n');

    // Step 8: Get all reviews
    console.log('Step 8: Getting all reviews...');
    const allReviews = await reviewService.getAllReviews();
    console.log('✅ Total reviews:', allReviews.length, '\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ All review tests passed!');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

testReviewFlow();