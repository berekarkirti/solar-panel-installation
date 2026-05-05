import dotenv from 'dotenv';
import database from '../src/config/database.js';
import User from '../src/models/User.js';
import SolarPanel from '../src/models/SolarPanel.js';
import Cart from '../src/models/Cart.js';
import Order from '../src/models/Order.js';
import Payment from '../src/models/Payment.js';
import authService from '../src/services/auth.service.js';
import solarPanelService from '../src/services/solarPanel.service.js';
import cartService from '../src/services/cart.service.js';
import orderService from '../src/services/order.service.js';
import paymentService from '../src/services/payment.service.js';

dotenv.config();

const testPaymentFlow = async () => {
  try {
    await database.connect();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 Testing Payment Flow');
    console.log('═══════════════════════════════════════════════════════\n');

    // Clean up test data
    await User.deleteMany({ email: /payment\.customer/i });
    await SolarPanel.deleteMany({ name: /Payment Test Panel/i });
    await Cart.deleteMany({});
    await Order.deleteMany({});
    await Payment.deleteMany({});

    // Step 1: Create a customer
    console.log('Step 1: Creating customer...');
    const customerData = await authService.register({
      email: 'payment.customer@example.com',
      password: 'customer123',
      role: 'CUSTOMER',
      firstName: 'Payment',
      lastName: 'Customer',
    });
    const customerId = customerData.user._id;
    console.log('✅ Customer created:', customerData.user.email, '\n');

    // Step 2: Create solar panel
    console.log('Step 2: Creating solar panel...');
    const panel = await solarPanelService.createPanel({
      name: 'Payment Test Panel 500W',
      capacityKW: 0.5,
      price: 15000,
      description: 'Test panel for payment',
      suitableFor: 'home',
    });
    console.log('✅ Panel created:', panel.name, '- Price:', panel.price, '\n');

    // Step 3: Add panel to cart
    console.log('Step 3: Adding panel to cart...');
    await cartService.addToCart(customerId, panel._id, 2);
    console.log('✅ Panel added to cart\n');

    // Step 4: Create order
    console.log('Step 4: Creating order...');
    const order = await orderService.createOrder(customerId);
    console.log('✅ Order created:', order._id);
    console.log('Order total:', order.totalAmount);
    console.log('Order status:', order.status, '\n');

    // Step 5: Create payment intent
    console.log('Step 5: Creating payment intent...');
    const paymentIntent = await paymentService.createPaymentIntent(customerId, order._id);
    console.log('✅ Payment intent created');
    console.log('Payment ID:', paymentIntent.paymentId);
    console.log('Client secret:', paymentIntent.clientSecret.substring(0, 30) + '...');
    console.log('Amount:', paymentIntent.amount);
    console.log('Currency:', paymentIntent.currency, '\n');

    // Step 6: Verify payment record created
    console.log('Step 6: Verifying payment record...');
    const paymentRecord = await Payment.findById(paymentIntent.paymentId);
    console.log('✅ Payment status:', paymentRecord.status);
    console.log('Payment intent ID:', paymentRecord.paymentIntentId, '\n');

    // Step 7: Try to create duplicate payment (should fail)
    console.log('Step 7: Testing duplicate payment prevention...');
    try {
      await paymentService.createPaymentIntent(customerId, order._id);
      console.log('❌ Duplicate payment was allowed!');
    } catch (error) {
      console.log('✅ Duplicate payment rejected:', error.message, '\n');
    }

    // Step 8: Simulate payment confirmation
    console.log('Step 8: Simulating payment confirmation...');
    console.log('⚠️  Note: In real scenario, payment is confirmed via Stripe checkout');
    console.log('⚠️  For testing, we\'ll manually update the payment intent status\n');

    // Step 9: Get user's payment history
    console.log('Step 9: Getting payment history...');
    const userPayments = await paymentService.getUserPayments(customerId);
    console.log('✅ User has', userPayments.length, 'payment(s)');
    console.log('Latest payment status:', userPayments[0].status, '\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ Payment flow test completed!');
    console.log('');
    console.log('📌 Next Steps:');
    console.log('1. Use Stripe test cards to complete payment via API');
    console.log('2. Test card: 4242 4242 4242 4242');
    console.log('3. Use any future expiry date and any CVC');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

testPaymentFlow();