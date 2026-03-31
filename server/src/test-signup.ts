import { query } from './config/database';
import bcrypt from 'bcryptjs';

async function testSignup() {
  try {
    console.log('Testing DB insert...');
    const salt = await bcrypt.genSalt(12);
    const password_hash = await bcrypt.hash('Password123!', salt);
    
    const userResult = await query(
      'INSERT INTO users (full_name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING user_id, full_name, email, phone',
      ['Test User', 'testxyz@adipay.com', '9998887711', password_hash]
    );

    const user = userResult.rows[0];
    console.log('User created:', user);

    await query('INSERT INTO accounts (user_id) VALUES ($1)', [user.user_id]);
    console.log('Account created for user:', user.user_id);

  } catch (e: any) {
    console.error('Test Failed:', e.message);
  } finally {
    process.exit();
  }
}

testSignup();
