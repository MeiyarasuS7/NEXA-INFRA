import mongoose from 'mongoose';
import { config } from 'dotenv';
import User from '../src/models/User';

// Load environment variables
config();

const seedAdmin = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ MongoDB connected');

    const adminEmail = process.env.ADMIN_EMAIL || 'aamanojkumar190@gmail.com';
    const adminPassword = 'admin123'; // Default password
    const adminName = 'Admin User';

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log('✅ Admin user already exists');
      process.exit(0);
    }

    // Create admin user
    await User.create({
      email: adminEmail,
      password: adminPassword,
      name: adminName,
      role: 'super_admin',
      isVerified: true,
      isActive: true,
    });

    console.log('✅ Admin user created successfully');
    console.log(`📧 Email: ${adminEmail}`);
    console.log(`🔐 Password: ${adminPassword}`);
    console.log('⚠️  Please change this password immediately after first login!');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding admin:', error);
    process.exit(1);
  }
};

seedAdmin();
