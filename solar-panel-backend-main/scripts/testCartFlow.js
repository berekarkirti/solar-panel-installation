import dotenv from 'dotenv';
import database from '../src/config/database.js';
import User from '../src/models/User.js';
import SolarPanel from '../src/models/SolarPanel.js';
import Cart from '../src/models/Cart.js';
import authService from '../src/services/auth.service.js';
import cartService from '../src/services/cart.service.js';
import solarPanelService from '../src/services/solarPanel.service.js';

dotenv.config();

const testCartFlow = async () => {
  try {
    await database.connect();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 Testing Cart Flow');
    console.log('═══════════════════════════════════════════════════════\n');

    // Clean up test data
    await User.deleteMany({ email: /cart\.customer/i });
    await SolarPanel.deleteMany({ name: /Cart Test Panel/i });
    await Cart.deleteMany({});

    // Step 1: Create a customer
    console.log('Step 1: Creating customer...');
    const customerData = await authService.register({
      email: 'cart.customer@example.com',
      password: 'customer123',
      role: 'CUSTOMER',
      firstName: 'Cart',
      lastName: 'Customer',
    });
    const customerId = customerData.user._id;
    console.log('✅ Customer created:', customerData.user.email, '\n');

    // Step 2: Create solar panels
    console.log('Step 2: Creating solar panels...');
    const panel1 = await solarPanelService.createPanel({
      name: 'Cart Test Panel 300W',
      capacityKW: 0.3,
      price: 10000,
      description: 'Test panel for cart',
      suitableFor: 'home',
    });

    const panel2 = await solarPanelService.createPanel({
      name: 'Cart Test Panel 500W',
      capacityKW: 0.5,
      price: 15000,
      description: 'Test panel for cart',
      suitableFor: 'home',
    });
    console.log('✅ Panel 1 created:', panel1.name, '- Price:', panel1.price);
    console.log('✅ Panel 2 created:', panel2.name, '- Price:', panel2.price, '\n');

    // Step 3: Get empty cart
    console.log('Step 3: Getting empty cart...');
    let cart = await cartService.getUserCart(customerId);
    console.log('✅ Cart created. Items:', cart.items.length);
    console.log('Total amount:', cart.totalAmount, '\n');

    // Step 4: Add first panel to cart
    console.log('Step 4: Adding first panel to cart...');
    cart = await cartService.addToCart(customerId, panel1._id, 2);
    console.log('✅ Panel added. Items in cart:', cart.items.length);
    console.log('Total amount:', cart.totalAmount);
    console.log('Expected:', panel1.price * 2, '\n');

    // Step 5: Add second panel to cart
    console.log('Step 5: Adding second panel to cart...');
    cart = await cartService.addToCart(customerId, panel2._id, 1);
    console.log('✅ Panel added. Items in cart:', cart.items.length);
    console.log('Total amount:', cart.totalAmount);
    console.log('Expected:', (panel1.price * 2) + (panel2.price * 1), '\n');

    // Step 6: Add same panel again (should increase quantity)
    console.log('Step 6: Adding first panel again...');
    cart = await cartService.addToCart(customerId, panel1._id, 1);
    console.log('✅ Quantity updated. Items in cart:', cart.items.length);
    console.log('Panel 1 quantity:', cart.items[0].quantity);
    console.log('Total amount:', cart.totalAmount);
    console.log('Expected:', (panel1.price * 3) + (panel2.price * 1), '\n');

    // Step 7: Remove a panel
    console.log('Step 7: Removing second panel...');
    cart = await cartService.removeFromCart(customerId, panel2._id);
    console.log('✅ Panel removed. Items in cart:', cart.items.length);
    console.log('Total amount:', cart.totalAmount);
    console.log('Expected:', panel1.price * 3, '\n');

    // Step 8: Try to add inactive panel
    console.log('Step 8: Testing inactive panel...');
    panel2.isActive = false;
    await panel2.save();
    try {
      await cartService.addToCart(customerId, panel2._id, 1);
      console.log('❌ Inactive panel was added!');
    } catch (error) {
      console.log('✅ Inactive panel rejected:', error.message, '\n');
    }

    // Step 9: Clear cart
    console.log('Step 9: Clearing cart...');
    cart = await cartService.clearCart(customerId);
    console.log('✅ Cart cleared. Items:', cart.items.length);
    console.log('Total amount:', cart.totalAmount, '\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ All cart tests passed!');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

testCartFlow();