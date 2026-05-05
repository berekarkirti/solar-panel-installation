import dotenv from 'dotenv';
import database from '../src/config/database.js';
import User from '../src/models/User.js';

dotenv.config();

const testUniqueEmail = async () => {
  try {
    await database.connect();

    console.log('\n🧪 Testing unique email constraint...\n');

    // Create first user
    const user1 = await User.create({
      email: 'unique.test@example.com',
      password: 'password123',
      role: 'CUSTOMER',
    });
    console.log('✅ First user created:', user1.email);

    // Try to create duplicate
    try {
      await User.create({
        email: 'unique.test@example.com', // Duplicate
        password: 'password456',
        role: 'TECHNICIAN',
      });
      console.log('❌ ERROR: Duplicate email was allowed!');
    } catch (error) {
      if (error.code === 11000) {
        console.log('✅ Unique constraint working: Duplicate email rejected');
        console.log('Error message:', error.message);
      } else {
        throw error;
      }
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

testUniqueEmail();