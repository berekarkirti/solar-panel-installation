import dotenv from 'dotenv';
import database from '../src/config/database.js';
import User from '../src/models/User.js';

dotenv.config();

const testUserModel = async () => {
  try {
    // Connect to database
    await database.connect();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 Testing User Model');
    console.log('═══════════════════════════════════════════════════════\n');

    // Test 1: Create a customer
    console.log('Test 1: Creating a customer...');
    const customer = await User.create({
      email: 'jane.customer@example.com',
      password: 'janecust123',
      role: 'CUSTOMER',
      firstName: 'Jane',
      lastName: 'Customer',
      phoneNumber: '+919865320147',
    });
    console.log('✅ Customer created:', customer.toSafeObject());

    // Test 2: Create a technician
    console.log('\nTest 2: Creating a technician...');
    const technician = await User.create({
      email: 'alex.tech@example.com',
      password: 'alextech123',
      role: 'TECHNICIAN',
      firstName: 'Alex',
      lastName: 'Technician',
    });
    console.log('✅ Technician created:', technician.toSafeObject());

    // Test 3: Create an admin
    console.log('\nTest 3: Creating an admin...');
    const admin = await User.create({
      email: 'admin@example.com',
      password: 'admin123',
      role: 'ADMIN',
      firstName: 'Super',
      lastName: 'Admin',
    });
    console.log('✅ Admin created:', admin.toSafeObject());

    // Test 4: Test virtual property (fullName)
    console.log('\nTest 4: Testing fullName virtual...');
    console.log('Full name:', customer.fullName);

    // Test 5: Test instance methods
    console.log('\nTest 5: Testing instance methods...');
    console.log('Is customer?', customer.isCustomer()); // true
    console.log('Is admin?', customer.isAdmin()); // false
    console.log('Is technician?', technician.isTechnician()); // true

    // Test 6: Test static methods
    console.log('\nTest 6: Testing static methods...');
    const foundUser = await User.findByEmail('jane.customer@example.com');
    console.log('Found by email:', foundUser ? foundUser.email : 'Not found');

    const customers = await User.findActiveByRole('CUSTOMER');
    console.log('Active customers count:', customers.length);

    const technicianCount = await User.countByRole('TECHNICIAN');
    console.log('Technician count:', technicianCount);

    // Test 7: Verify password is not exposed
    console.log('\nTest 7: Verifying password exclusion...');
    const userWithoutPassword = await User.findById(customer._id);
    console.log('Password in query result:', userWithoutPassword.password); // undefined
    console.log('Password field exists:', 'password' in userWithoutPassword.toObject()); // false

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ All tests completed successfully!');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

testUserModel();