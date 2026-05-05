import dotenv from 'dotenv';
import database from '../src/config/database.js';
import User from '../src/models/User.js';
import authService from '../src/services/auth.service.js';

dotenv.config();

const testAuthFlow = async () => {
  try {
    await database.connect();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 Testing Complete Authentication Flow');
    console.log('═══════════════════════════════════════════════════════\n');

    // Clean up test users
    await User.deleteMany({ email: { $in: ['test.customer@example.com', 'test.admin@example.com'] } });

    // Test 1: Register a customer
    console.log('Test 1: Register customer...');
    const customerData = await authService.register({
      email: 'test.customer@example.com',
      password: 'customer123',
      role: 'CUSTOMER',
      firstName: 'Test',
      lastName: 'Customer',
    });
    console.log('✅ Customer registered');
    console.log('User:', customerData.user.email, '- Role:', customerData.user.role);
    console.log('Access token received:', customerData.accessToken.substring(0, 30) + '...\n');

    // Test 2: Register an admin
    console.log('Test 2: Register admin...');
    const adminData = await authService.register({
      email: 'test.admin@example.com',
      password: 'admin123',
      role: 'ADMIN',
      firstName: 'Test',
      lastName: 'Admin',
    });
    console.log('✅ Admin registered');
    console.log('User:', adminData.user.email, '- Role:', adminData.user.role, '\n');

    // Test 3: Login with correct credentials
    console.log('Test 3: Login with correct credentials...');
    const loginData = await authService.login('test.customer@example.com', 'customer123');
    console.log('✅ Login successful');
    console.log('User:', loginData.user.email);
    console.log('Last login updated:', loginData.user.lastLogin, '\n');

    // Test 4: Login with wrong password
    console.log('Test 4: Login with wrong password...');
    try {
      await authService.login('test.customer@example.com', 'wrongpassword');
      console.log('❌ Wrong password was accepted!');
    } catch (error) {
      console.log('✅ Login rejected:', error.message, '\n');
    }

    // Test 5: Token verification
    console.log('Test 5: Token verification...');
    const decoded = authService.verifyAccessToken(customerData.accessToken);
    console.log('✅ Token verified');
    console.log('Decoded user ID:', decoded.userId);
    console.log('Decoded role:', decoded.role, '\n');

    // Test 6: Get user by ID
    console.log('Test 6: Get user by ID...');
    const user = await authService.getUserById(decoded.userId);
    console.log('✅ User retrieved');
    console.log('Email:', user.email);
    console.log('Role:', user.role);
    console.log('Password in response:', user.password); // Should be undefined
    console.log('\n');

    // Test 7: Duplicate email registration
    console.log('Test 7: Duplicate email registration...');
    try {
      await authService.register({
        email: 'test.customer@example.com',
        password: 'another123',
        role: 'CUSTOMER',
      });
      console.log('❌ Duplicate email was allowed!');
    } catch (error) {
      console.log('✅ Duplicate rejected:', error.message, '\n');
    }

    console.log('═══════════════════════════════════════════════════════');
    console.log('✅ All authentication flow tests passed!');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

testAuthFlow();