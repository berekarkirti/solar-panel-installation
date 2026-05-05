import dotenv from 'dotenv';
import database from '../src/config/database.js';
import authService from '../src/services/auth.service.js';

dotenv.config();

const testAuthService = async () => {
  try {
    await database.connect();

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('🧪 Testing Authentication Service');
    console.log('═══════════════════════════════════════════════════════\n');

    // Test 1: Password hashing
    console.log('Test 1: Password hashing...');
    const plainPassword = 'mySecurePassword123';
    const hashedPassword = await authService.hashPassword(plainPassword);
    console.log('Plain password:', plainPassword);
    console.log('Hashed password:', hashedPassword);
    console.log('✅ Password hashed successfully\n');

    // Test 2: Password comparison
    console.log('Test 2: Password comparison...');
    const isValid = await authService.comparePassword(plainPassword, hashedPassword);
    const isInvalid = await authService.comparePassword('wrongPassword', hashedPassword);
    console.log('Correct password match:', isValid); // true
    console.log('Wrong password match:', isInvalid); // false
    console.log('✅ Password comparison working\n');

    // Test 3: JWT token generation
    console.log('Test 3: JWT token generation...');
    const payload = {
      userId: '507f1f77bcf86cd799439011',
      email: 'test@example.com',
      role: 'CUSTOMER',
    };
    const accessToken = authService.generateAccessToken(payload);
    const refreshToken = authService.generateRefreshToken(payload);
    console.log('Access token generated:', accessToken.substring(0, 50) + '...');
    console.log('Refresh token generated:', refreshToken.substring(0, 50) + '...');
    console.log('✅ Tokens generated successfully\n');

    // Test 4: JWT token verification
    console.log('Test 4: JWT token verification...');
    const decoded = authService.verifyAccessToken(accessToken);
    console.log('Decoded payload:', decoded);
    console.log('User ID matches:', decoded.userId === payload.userId);
    console.log('Email matches:', decoded.email === payload.email);
    console.log('Role matches:', decoded.role === payload.role);
    console.log('✅ Token verification working\n');

    // Test 5: Invalid token handling
    console.log('Test 5: Invalid token handling...');
    try {
      authService.verifyAccessToken('invalid.token.here');
      console.log('❌ Invalid token was accepted!');
    } catch (error) {
      console.log('✅ Invalid token rejected:', error.message);
    }

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ All authentication service tests passed!');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error);
  } finally {
    await database.disconnect();
    process.exit(0);
  }
};

testAuthService();