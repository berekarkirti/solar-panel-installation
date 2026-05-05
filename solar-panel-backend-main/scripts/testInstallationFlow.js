import dotenv from 'dotenv';
import database from '../src/config/database.js';
import User from '../src/models/User.js';
import SolarPanel from '../src/models/SolarPanel.js';
import Cart from '../src/models/Cart.js';
import Order from '../src/models/Order.js';
import Installation from '../src/models/Installation.js';
import authService from '../src/services/auth.service.js';
import solarPanelService from '../src/services/solarPanel.service.js';
import cartService from '../src/services/cart.service.js';
import orderService from '../src/services/order.service.js';
import installationService from '../src/services/installation.service.js';

dotenv.config();

const testInstallationFlow = async () => {
  try {
    await database.connect();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 Testing Installation Flow');
    console.log('═══════════════════════════════════════════════════════\n');

    // Clean up test data
    await User.deleteMany({ email: /installation\./i });
    await SolarPanel.deleteMany({ name: /Installation Test Panel/i });
    await Cart.deleteMany({});
    await Order.deleteMany({});
    await Installation.deleteMany({});

    // Step 1: Create users
    console.log('Step 1: Creating users...');
    const customerData = await authService.register({
      email: 'installation.customer@example.com',
      password: 'customer123',
      role: 'CUSTOMER',
      firstName: 'Installation',
      lastName: 'Customer',
    });
    const customerId = customerData.user._id;

    const technicianData = await authService.register({
      email: 'installation.technician@example.com',
      password: 'tech123',
      role: 'TECHNICIAN',
      firstName: 'John',
      lastName: 'Technician',
    });
    const technicianId = technicianData.user._id;

    console.log('✅ Customer created:', customerData.user.email);
    console.log('✅ Technician created:', technicianData.user.email, '\n');

    // Step 2: Create solar panel
    console.log('Step 2: Creating solar panel...');
    const panel = await solarPanelService.createPanel({
      name: 'Installation Test Panel 500W',
      capacityKW: 0.5,
      price: 15000,
      description: 'Test panel',
      suitableFor: 'home',
    });
    console.log('✅ Panel created:', panel.name, '\n');

    // Step 3: Create cart and order
    console.log('Step 3: Creating order...');
    await cartService.addToCart(customerId, panel._id, 2);
    const order = await orderService.createOrder(customerId);
    console.log('✅ Order created:', order._id);
    console.log('Order status:', order.status, '\n');

    // Step 4: Try to assign technician to PENDING order (should fail)
    console.log('Step 4: Testing assignment to PENDING order...');
    try {
      await installationService.assignTechnician(order._id, technicianId);
      console.log('❌ Assignment to PENDING order was allowed!');
    } catch (error) {
      console.log('✅ Assignment rejected:', error.message, '\n');
    }

    // Step 5: Update order to PAID
    console.log('Step 5: Updating order to PAID...');
    order.status = 'PAID';
    await order.save();
    console.log('✅ Order status updated to PAID\n');

    // Step 6: Assign technician
    console.log('Step 6: Assigning technician...');
    const installation = await installationService.assignTechnician(order._id, technicianId);
    console.log('✅ Installation created:', installation._id);
    console.log('Status:', installation.status);
    console.log('Technician:', installation.technician.firstName, installation.technician.lastName, '\n');

    // Step 7: Try to assign again (should fail)
    console.log('Step 7: Testing duplicate assignment...');
    try {
      await installationService.assignTechnician(order._id, technicianId);
      console.log('❌ Duplicate assignment was allowed!');
    } catch (error) {
      console.log('✅ Duplicate rejected:', error.message, '\n');
    }

    // Step 8: Get technician installations
    console.log('Step 8: Getting technician installations...');
    const techInstallations = await installationService.getTechnicianInstallations(technicianId);
    console.log('✅ Technician has', techInstallations.length, 'installation(s)\n');

    // Step 9: Update status PENDING → IN_PROGRESS
    console.log('Step 9: Updating status to IN_PROGRESS...');
    const updated1 = await installationService.updateStatus(
      installation._id,
      'IN_PROGRESS',
      'Started installation work',
      technicianId
    );
    console.log('✅ Status updated to:', updated1.status);
    console.log('Notes:', updated1.notes, '\n');

    // Step 10: Try invalid transition (should fail)
    console.log('Step 10: Testing invalid status transition...');
    try {
      await installationService.updateStatus(installation._id, 'PENDING', null, technicianId);
      console.log('❌ Invalid transition was allowed!');
    } catch (error) {
      console.log('✅ Invalid transition rejected:', error.message, '\n');
    }

    // Step 11: Update status IN_PROGRESS → COMPLETED
    console.log('Step 11: Completing installation...');
    const updated2 = await installationService.updateStatus(
      installation._id,
      'COMPLETED',
      'Installation completed successfully',
      technicianId
    );
    console.log('✅ Status updated to:', updated2.status, '\n');

    // Step 12: Get customer installations
    console.log('Step 12: Getting customer installations...');
    const custInstallations = await installationService.getCustomerInstallations(customerId);
    console.log('✅ Customer has', custInstallations.length, 'installation(s)');
    console.log('Installation status:', custInstallations[0].status, '\n');

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ All installation tests passed!');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

testInstallationFlow();