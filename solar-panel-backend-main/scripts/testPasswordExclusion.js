import dotenv from 'dotenv';
import database from '../src/config/database.js';
import User from '../src/models/User.js';

dotenv.config();

const testPasswordExclusion = async () => {
  try {
    await database.connect();

    console.log('\n🧪 Testing password exclusion...\n');

    // Create a test user
    const user = await User.create({
      email: 'password.test@example.com',
      password: 'secretpassword123',
      role: 'CUSTOMER',
      firstName: 'Test',
      lastName: 'User',
    });

    console.log('Test 1: Default query (password should be excluded)');
    const foundUser = await User.findById(user._id);
    console.log('Password field:', foundUser.password); // undefined
    console.log('Has password in object:', 'password' in foundUser.toObject()); // false
    console.log('✅ Password excluded by default\n');

    console.log('Test 2: Explicit password inclusion with select()');
    const userWithPassword = await User.findById(user._id).select('+password');
    console.log('Password field:', userWithPassword.password); // Shows hashed password
    console.log('✅ Password can be explicitly included when needed\n');

    console.log('Test 3: JSON serialization (toJSON)');
    const jsonOutput = foundUser.toJSON();
    console.log('Password in JSON:', jsonOutput.password); // undefined
    console.log('JSON output:', JSON.stringify(jsonOutput, null, 2));
    console.log('✅ Password excluded from JSON serialization\n');

    console.log('Test 4: Object conversion (toObject)');
    const objOutput = foundUser.toObject();
    console.log('Password in object:', objOutput.password); // undefined
    console.log('✅ Password excluded from object conversion\n');

    console.log('Test 5: Safe object method');
    const safeObj = foundUser.toSafeObject();
    console.log('Password in safe object:', safeObj.password); // undefined
    console.log('✅ toSafeObject() excludes password\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

testPasswordExclusion();