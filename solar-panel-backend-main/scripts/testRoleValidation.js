import dotenv from 'dotenv';
import database from '../src/config/database.js';
import User from '../src/models/User.js';

dotenv.config();

const testRoleValidation = async () => {
  try {
    await database.connect();

    console.log('\n🧪 Testing role validation...\n');

    // Test 1: Valid roles
    console.log('Test 1: Creating users with valid roles...');
    const validRoles = ['ADMIN', 'CUSTOMER', 'TECHNICIAN'];
    
    for (const role of validRoles) {
      const user = await User.create({
        email: `${role.toLowerCase()}.valid@example.com`,
        password: 'password123',
        role: role,
      });
      console.log(`✅ ${role} created successfully`);
    }

    // Test 2: Invalid role
    console.log('\nTest 2: Attempting to create user with invalid role...');
    try {
      await User.create({
        email: 'invalid.role@example.com',
        password: 'password123',
        role: 'SUPER_USER', // Invalid
      });
      console.log('❌ ERROR: Invalid role was allowed!');
    } catch (error) {
      if (error.name === 'ValidationError') {
        console.log('✅ Role validation working: Invalid role rejected');
        console.log('Error message:', error.message);
      } else {
        throw error;
      }
    }

    // Test 3: Missing role (should default to CUSTOMER)
    console.log('\nTest 3: Creating user without specifying role...');
    const defaultUser = await User.create({
      email: 'no.role@example.com',
      password: 'password123',
    });
    console.log(`✅ User created with default role: ${defaultUser.role}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

testRoleValidation();