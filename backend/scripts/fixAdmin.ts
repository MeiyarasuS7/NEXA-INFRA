import mongoose from 'mongoose';
import { config } from 'dotenv';
import User from '../src/models/User';

config();

const fixAdminUser = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ MongoDB connected');

    const adminEmail = process.env.ADMIN_EMAIL || 'aamanojkumar190@gmail.com';

    // Delete any existing admin users with this email
    await User.deleteOne({ email: adminEmail.toLowerCase() });
    console.log('🗑️  Old admin user deleted');

    // Create new admin user with correct role
    await User.create({
      email: adminEmail.toLowerCase(),
      password: 'admin123', // Default password
      name: 'Admin User',
      role: 'super_admin',
      isVerified: true,
      isActive: true,
    });

    console.log('✅ Admin user created successfully');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔐 Password: admin123`);
    console.log(`👤 Role: super_admin`);

    // Verify the user was created correctly
    const adminUser = await User.findOne({ email: adminEmail.toLowerCase() });
    console.log('\n📋 Admin User Details:');
    console.log(`   Email: ${adminUser?.email}`);
    console.log(`   Name: ${adminUser?.name}`);
    console.log(`   Role: ${adminUser?.role}`);
    console.log(`   Verified: ${adminUser?.isVerified}`);
    console.log(`   Active: ${adminUser?.isActive}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
};

fixAdminUser();
