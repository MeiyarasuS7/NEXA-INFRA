import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const User = mongoose.model('User', new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  role: String,
  phone: String,
  location: String,
  isVerified: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
}));

const Contractor = mongoose.model('Contractor', new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  company: String,
  specialties: [String],
  bio: String,
  experience: Number,
  rating: Number,
  totalProjects: Number,
  completionRate: Number,
  portfolio: Array,
  certifications: Array,
  availability: String,
  hourlyRate: Number,
  isVerified: Boolean,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date,
}));

const Project = mongoose.model('Project', new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  contractorId: mongoose.Types.ObjectId,
  title: String,
  description: String,
  type: String,
  budget: Number,
  status: String,
  startDate: Date,
  endDate: Date,
  estimatedDuration: Number,
  location: String,
  requirements: [String],
  attachments: [String],
  progress: Number,
  milestones: Array,
  timeline: String,
  notes: String,
  createdAt: Date,
  updatedAt: Date,
}));

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || '');
    console.log('✅ Connected to MongoDB');

    // Clear existing data (optional - comment out if you want to keep existing data)
    // await User.deleteMany({ location: { $regex: 'India' } });
    // await Contractor.deleteMany({});
    // await Project.deleteMany({});
    // console.log('🗑️  Cleared existing India data');

    // Create Contractor Users (5)
    const contractorUsers = [
      {
        email: 'rajesh.buildtech@gmail.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Rajesh Kumar',
        role: 'contractor',
        phone: '+91 9876543210',
        location: 'Mumbai, India',
        isVerified: true,
        isActive: true,
      },
      {
        email: 'priya.architects@gmail.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Priya Sharma',
        role: 'contractor',
        phone: '+91 9876543211',
        location: 'Bangalore, India',
        isVerified: true,
        isActive: true,
      },
      {
        email: 'amit.civileng@gmail.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Amit Patel',
        role: 'contractor',
        phone: '+91 9876543212',
        location: 'Delhi, India',
        isVerified: true,
        isActive: true,
      },
      {
        email: 'kavya.interiors@gmail.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Kavya Singh',
        role: 'contractor',
        phone: '+91 9876543213',
        location: 'Pune, India',
        isVerified: true,
        isActive: true,
      },
      {
        email: 'vikram.electricals@gmail.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Vikram Reddy',
        role: 'contractor',
        phone: '+91 9876543214',
        location: 'Hyderabad, India',
        isVerified: true,
        isActive: true,
      },
    ];

    const insertedContractorUsers = await User.insertMany(contractorUsers);
    console.log('✅ Created 5 contractor users');

    // Create Client Users (5)
    const clientUsers = [
      {
        email: 'rahul.investor@gmail.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Rahul Verma',
        role: 'user',
        phone: '+91 9876543220',
        location: 'Mumbai, India',
        isVerified: true,
        isActive: true,
      },
      {
        email: 'sneha.estate@gmail.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Sneha Gupta',
        role: 'user',
        phone: '+91 9876543221',
        location: 'Bangalore, India',
        isVerified: true,
        isActive: true,
      },
      {
        email: 'deepak.developer@gmail.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Deepak Malhotra',
        role: 'user',
        phone: '+91 9876543222',
        location: 'Delhi, India',
        isVerified: true,
        isActive: true,
      },
      {
        email: 'anjali.realty@gmail.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Anjali Nair',
        role: 'user',
        phone: '+91 9876543223',
        location: 'Chennai, India',
        isVerified: true,
        isActive: true,
      },
      {
        email: 'nikhil.startup@gmail.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Nikhil Kapoor',
        role: 'user',
        phone: '+91 9876543224',
        location: 'Pune, India',
        isVerified: true,
        isActive: true,
      },
    ];

    const insertedClientUsers = await User.insertMany(clientUsers);
    console.log('✅ Created 5 client users');

    // Create Contractor Profiles
    const contractorProfiles = [
      {
        userId: insertedContractorUsers[0]._id,
        company: 'BuildTech Solutions',
        specialties: ['Residential Construction', 'Project Management', 'Civil Engineering'],
        bio: 'Expert in residential construction with 12+ years of experience',
        experience: 12,
        rating: 4.8,
        totalProjects: 45,
        completionRate: 98,
        availability: 'available',
        hourlyRate: 1500,
        isVerified: true,
        isActive: true,
      },
      {
        userId: insertedContractorUsers[1]._id,
        company: 'Priya Architects & Design',
        specialties: ['Architecture', 'Interior Design', 'Urban Planning'],
        bio: 'Award-winning architect specializing in modern design',
        experience: 10,
        rating: 4.9,
        totalProjects: 38,
        completionRate: 100,
        availability: 'busy',
        hourlyRate: 2000,
        isVerified: true,
        isActive: true,
      },
      {
        userId: insertedContractorUsers[2]._id,
        company: 'Amit Civil Engineers',
        specialties: ['Civil Engineering', 'Foundation Works', 'Structural Design'],
        bio: 'Experienced civil engineer with focus on sustainable construction',
        experience: 15,
        rating: 4.7,
        totalProjects: 52,
        completionRate: 96,
        availability: 'available',
        hourlyRate: 1800,
        isVerified: true,
        isActive: true,
      },
      {
        userId: insertedContractorUsers[3]._id,
        company: 'Kavya Interior Solutions',
        specialties: ['Interior Design', 'Space Planning', 'Luxury Finishes'],
        bio: 'Creating beautiful and functional interior spaces',
        experience: 8,
        rating: 4.6,
        totalProjects: 28,
        completionRate: 97,
        availability: 'available',
        hourlyRate: 1200,
        isVerified: true,
        isActive: true,
      },
      {
        userId: insertedContractorUsers[4]._id,
        company: 'Vikram Electrical Enterprises',
        specialties: ['Electrical Works', 'Smart Home Systems', 'Power Distribution'],
        bio: 'Expert in modern electrical systems and automation',
        experience: 11,
        rating: 4.5,
        totalProjects: 40,
        completionRate: 95,
        availability: 'available',
        hourlyRate: 1400,
        isVerified: true,
        isActive: true,
      },
    ];

    await Contractor.insertMany(contractorProfiles);
    console.log('✅ Created 5 contractor profiles');

    // Create Projects (12)
    const projects = [
      {
        userId: insertedClientUsers[0]._id,
        contractorId: insertedContractorUsers[0]._id,
        title: '3BHK Apartment Construction - Bandra',
        description: 'Complete construction of 1500 sq ft modern apartment in Bandra',
        type: 'Residential',
        budget: 2500000,
        status: 'in_progress',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2025-06-15'),
        estimatedDuration: 365,
        location: 'Bandra, Mumbai, India',
        requirements: ['Construction', 'Interior Design', 'Civil Work'],
        attachments: [],
        progress: 65,
        timeline: 'Long-term',
      },
      {
        userId: insertedClientUsers[1]._id,
        contractorId: insertedContractorUsers[1]._id,
        title: 'Modern Office Interior Design',
        description: 'Complete interior design and renovation for tech startup office',
        type: 'Commercial',
        budget: 850000,
        status: 'in_progress',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2025-01-31'),
        estimatedDuration: 150,
        location: 'Whitefield, Bangalore, India',
        requirements: ['Interior Design', 'Space Planning', 'Project Management'],
        attachments: [],
        progress: 40,
        timeline: 'Medium-term',
      },
      {
        userId: insertedClientUsers[2]._id,
        contractorId: insertedContractorUsers[2]._id,
        title: 'Foundation & Structural Work',
        description: 'Foundation work and structural design for 5-story residential building',
        type: 'Residential',
        budget: 3500000,
        status: 'approved',
        startDate: new Date('2025-04-15'),
        endDate: new Date('2026-04-15'),
        estimatedDuration: 365,
        location: 'Rohini, Delhi, India',
        requirements: ['Civil Engineering', 'Structural Design', 'Material Supply'],
        attachments: [],
        progress: 0,
        timeline: 'Long-term',
      },
      {
        userId: insertedClientUsers[3]._id,
        contractorId: insertedContractorUsers[3]._id,
        title: 'Luxury Apartment Makeover',
        description: 'Complete interior redesign of luxury 4BHK apartment',
        type: 'Residential',
        budget: 1200000,
        status: 'completed',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-08-30'),
        estimatedDuration: 228,
        location: 'Nungambakkam, Chennai, India',
        requirements: ['Interior Design', 'Home Automation', 'Luxury Finishes'],
        attachments: [],
        progress: 100,
        timeline: 'Medium-term',
      },
      {
        userId: insertedClientUsers[0]._id,
        contractorId: insertedContractorUsers[4]._id,
        title: 'Home Electrical Rewiring & Smart Systems',
        description: 'Complete electrical rewiring and smart home automation setup',
        type: 'Residential',
        budget: 350000,
        status: 'in_progress',
        startDate: new Date('2024-10-01'),
        endDate: new Date('2025-01-15'),
        estimatedDuration: 106,
        location: 'Colaba, Mumbai, India',
        requirements: ['Electrical Work', 'Smart Home Systems', 'Safety Standards'],
        attachments: [],
        progress: 75,
        timeline: 'Short-term',
      },
      {
        userId: insertedClientUsers[4]._id,
        contractorId: insertedContractorUsers[0]._id,
        title: 'Plot Development & Infrastructure',
        description: 'Development of 10-acre residential plot with complete infrastructure',
        type: 'Residential',
        budget: 8500000,
        status: 'pending',
        startDate: new Date('2025-08-01'),
        endDate: new Date('2027-08-01'),
        estimatedDuration: 730,
        location: 'Vikarabad, Hyderabad, India',
        requirements: ['Site Development', 'Infrastructure', 'Drainage Design'],
        attachments: [],
        progress: 0,
        timeline: 'Long-term',
      },
      {
        userId: insertedClientUsers[1]._id,
        contractorId: insertedContractorUsers[1]._id,
        title: 'Retail Store Interior',
        description: 'Modern retail store design and implementation for fashion brand',
        type: 'Commercial',
        budget: 650000,
        status: 'completed',
        startDate: new Date('2024-03-01'),
        endDate: new Date('2024-07-31'),
        estimatedDuration: 153,
        location: 'MG Road, Bangalore, India',
        requirements: ['Interior Design', 'Visual Merchandising', 'Lighting Design'],
        attachments: [],
        progress: 100,
        timeline: 'Medium-term',
      },
      {
        userId: insertedClientUsers[2]._id,
        contractorId: insertedContractorUsers[2]._id,
        title: 'Multi-Storey Building Structural Design',
        description: 'Structural design and engineering for 8-story commercial complex',
        type: 'Commercial',
        budget: 5500000,
        status: 'in_progress',
        startDate: new Date('2024-07-15'),
        endDate: new Date('2025-12-31'),
        estimatedDuration: 530,
        location: 'Connaught Place, Delhi, India',
        requirements: ['Structural Engineering', 'BIM Modeling', 'Regulatory Compliance'],
        attachments: [],
        progress: 35,
        timeline: 'Long-term',
      },
      {
        userId: insertedClientUsers[3]._id,
        contractorId: insertedContractorUsers[3]._id,
        title: 'School Campus Interior Design',
        description: 'Interior design and layout planning for new school campus',
        type: 'Institutional',
        budget: 3200000,
        status: 'approved',
        startDate: new Date('2025-05-01'),
        endDate: new Date('2026-04-30'),
        estimatedDuration: 365,
        location: 'Velachery, Chennai, India',
        requirements: ['Space Planning', 'Educational Design', 'Safety Standards'],
        attachments: [],
        progress: 0,
        timeline: 'Long-term',
      },
      {
        userId: insertedClientUsers[4]._id,
        contractorId: insertedContractorUsers[4]._id,
        title: 'Restaurant Kitchen & Electrical Setup',
        description: 'Electrical installation and commercial kitchen electrical systems',
        type: 'Commercial',
        budget: 450000,
        status: 'in_progress',
        startDate: new Date('2024-11-01'),
        endDate: new Date('2025-02-28'),
        estimatedDuration: 120,
        location: 'Koregaon Park, Pune, India',
        requirements: ['Electrical Expertise', 'Commercial Standards', 'Energy Efficiency'],
        attachments: [],
        progress: 50,
        timeline: 'Short-term',
      },
      {
        userId: insertedClientUsers[0]._id,
        contractorId: insertedContractorUsers[1]._id,
        title: 'Villa Design & Decor',
        description: 'Complete interior design for luxury villa with modern aesthetics',
        type: 'Residential',
        budget: 1800000,
        status: 'in_progress',
        startDate: new Date('2024-08-15'),
        endDate: new Date('2025-05-15'),
        estimatedDuration: 272,
        location: 'Juhu, Mumbai, India',
        requirements: ['Luxury Design', 'Custom Furnishing', 'Smart Home Integration'],
        attachments: [],
        progress: 55,
        timeline: 'Medium-term',
      },
      {
        userId: insertedClientUsers[2]._id,
        contractorId: insertedContractorUsers[0]._id,
        title: 'Hospital Construction & Infrastructure',
        description: 'Construction and infrastructure development for 200-bed hospital',
        type: 'Institutional',
        budget: 12500000,
        status: 'pending',
        startDate: new Date('2025-06-01'),
        endDate: new Date('2027-12-31'),
        estimatedDuration: 913,
        location: 'Mayur Vihar, Delhi, India',
        requirements: ['Medical Standards Compliance', 'Specialized Infrastructure', 'Infection Control'],
        attachments: [],
        progress: 0,
        timeline: 'Long-term',
      },
    ];

    await Project.insertMany(projects);
    console.log('✅ Created 12 projects');

    console.log('\n📊 Data Summary:');
    console.log('   - 5 Contractor users');
    console.log('   - 5 Client users');
    console.log('   - 5 Contractor profiles');
    console.log('   - 12 Projects across various cities');
    console.log('\n✨ Mock data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Database connection closed');
  }
};

seedData();
