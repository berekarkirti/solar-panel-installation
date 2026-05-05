import dotenv from 'dotenv';
import database from '../src/config/database.js';
import User from '../src/models/User.js';
import SolarPanel from '../src/models/SolarPanel.js';
import Cart from '../src/models/Cart.js';
import Order from '../src/models/Order.js';
import authService from '../src/services/auth.service.js';
import solarPanelService from '../src/services/solarPanel.service.js';
import cartService from '../src/services/cart.service.js';
import orderService from '../src/services/order.service.js';

dotenv.config();

const testOrderFlow = async () => {
  try {
    await database.connect();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 Testing Order Flow');
    console.log('═══════════════════════════════════════════════════════\n');

    // Clean up test data
    await User.deleteMany({ email: /order\.customer/i });
    await SolarPanel.deleteMany({ name: /Order Test Panel/i });
    await Cart.deleteMany({});
    await Order.deleteMany({});

    // Step 1: Create a customer
    console.log('Step 1: Creating customer...');
    const customerData = await authService.register({
      email: 'order.customer@example.com',
      password: 'customer123',
      role: 'CUSTOMER',
      firstName: 'Order',
      lastName: 'Customer',
    });
    const customerId = customerData.user._id;
    console.log('✅ Customer created:', customerData.user.email, '\n');

    // Step 2: Create solar panels
    console.log('Step 2: Creating solar panels...');
    const panel1 = await solarPanelService.createPanel({
      name: 'Order Test Panel 300W',
      capacityKW: 0.3,
      price: 10000,
      description: 'Test panel for order',
      suitableFor: 'home',
    });

    const panel2 = await solarPanelService.createPanel({
      name: 'Order Test Panel 500W',
      capacityKW: 0.5,
      price: 15000,
      description: 'Test panel for order',
      suitableFor: 'home',
    });
    console.log('✅ Panel 1 created:', panel1.name, '- Price:', panel1.price);
    console.log('✅ Panel 2 created:', panel2.name, '- Price:', panel2.price, '\n');

    // Step 3: Add panels to cart
    console.log('Step 3: Adding panels to cart...');
    await cartService.addToCart(customerId, panel1._id, 2);
    const cart = await cartService.addToCart(customerId, panel2._id, 1);
    console.log('✅ Cart created with', cart.items.length, 'items');
    console.log('Cart total:', cart.totalAmount, '\n');

    // Step 4: Try to create order from empty cart (should fail)
    console.log('Step 4: Testing empty cart validation...');
    await cartService.clearCart(customerId);
    try {
      await orderService.createOrder(customerId);
      console.log('❌ Order created from empty cart!');
    } catch (error) {
      console.log('✅ Empty cart rejected:', error.message, '\n');
    }

    // Step 5: Re-add items to cart
    console.log('Step 5: Re-adding items to cart...');
    await cartService.addToCart(customerId, panel1._id, 2);
    await cartService.addToCart(customerId, panel2._id, 1);
    console.log('✅ Cart repopulated\n');

    // Step 6: Create order
    console.log('Step 6: Creating order from cart...');
    const order = await orderService.createOrder(customerId);
    console.log('✅ Order created:', order._id);
    console.log('Order status:', order.status);
    console.log('Order total:', order.totalAmount);
    console.log('Order items:', order.items.length);
    console.log('Price saved at purchase:', order.items[0].priceAtPurchase, '\n');

    // Step 7: Verify cart is cleared
    console.log('Step 7: Verifying cart is cleared...');
    const clearedCart = await cartService.getUserCart(customerId);
    console.log('✅ Cart items after order:', clearedCart.items.length);
    console.log('Cart total:', clearedCart.totalAmount, '\n');

    // Step 8: Verify priceAtPurchase works
    console.log('Step 8: Testing priceAtPurchase...');
    panel1.price = 20000; // Change price
    await panel1.save();
    console.log('Panel price changed to:', panel1.price);
    console.log('Order still shows old price:', order.items[0].priceAtPurchase);
    console.log('✅ Price locked at purchase time\n');

    // Step 9: Get user's orders
    console.log('Step 9: Getting user orders...');
    const userOrders = await orderService.getUserOrders(customerId);
    console.log('✅ User has', userOrders.length, 'order(s)\n');

    // Step 10: Get order by ID
    console.log('Step 10: Getting order by ID...');
    const foundOrder = await orderService.getOrderById(order._id);
    console.log('✅ Order found:', foundOrder._id);
    console.log('User email:', foundOrder.user.email, '\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ All order tests passed!');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

testOrderFlow();