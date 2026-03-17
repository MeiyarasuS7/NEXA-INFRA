import type { Contractor, Project, Review } from '@/types';

export const MOCK_CONTRACTORS: Contractor[] = [
  {
    id: '1', userId: '10', businessName: 'Raj & Associates Construction', specialties: ['Residential', 'Interior Design', 'Renovation'],
    rating: 4.9, reviewCount: 142, completedProjects: 98, yearsExperience: 16, location: 'Chennai, Tamil Nadu',
    bio: 'Award-winning construction company specializing in premium residential builds and modern interior designs. Over 16 years of excellence in South Indian construction.',
    avatar: '', verified: true, status: 'APPROVED', hourlyRate: 850, certifications: ['Licensed Contractor', 'Vastu Expert', 'Green Building'],
  },
  {
    id: '2', userId: '11', businessName: 'Keralam Infra Solutions', specialties: ['Commercial', 'Infrastructure', 'Electrical'],
    rating: 4.7, reviewCount: 96, completedProjects: 67, yearsExperience: 13, location: 'Kochi, Kerala',
    bio: 'Leading commercial construction and infrastructure specialist. Delivering large-scale projects from planning to execution with cutting-edge technology.',
    avatar: '', verified: true, status: 'APPROVED', hourlyRate: 950, certifications: ['Licensed Engineer', 'ISO Certified', 'Safety Certified'],
  },
  {
    id: '3', userId: '12', businessName: 'Bangalore Premier Builders', specialties: ['Commercial', 'Residential', 'Mall Construction'],
    rating: 4.8, reviewCount: 118, completedProjects: 156, yearsExperience: 18, location: 'Bangalore, Karnataka',
    bio: 'Premier construction firm recognized for premium residential and commercial complexes. Specializing in innovative architectural designs and quality execution.',
    avatar: '', verified: true, status: 'APPROVED', hourlyRate: 1000, certifications: ['Licensed Contractor', 'Project Management', 'BIS Certified'],
  },
  {
    id: '4', userId: '13', businessName: 'Coimbatore Express Builders', specialties: ['Plumbing', 'Electrical', 'Foundation Works'],
    rating: 4.6, reviewCount: 134, completedProjects: 187, yearsExperience: 14, location: 'Coimbatore, Tamil Nadu',
    bio: 'Specialized contractor with two decades of expertise in plumbing, electrical and foundation works. Trusted by residential and commercial clients across Tamil Nadu.',
    avatar: '', verified: true, status: 'APPROVED', hourlyRate: 750, certifications: ['Master Electrician', 'Plumbing License', 'Safety Certificate'],
  },
  {
    id: '5', userId: '14', businessName: 'Thiruvananthapuram Modern Constructions', specialties: ['Architecture', 'Interior Design', 'Restoration'],
    rating: 4.8, reviewCount: 108, completedProjects: 134, yearsExperience: 11, location: 'Thiruvananthapuram, Kerala',
    bio: 'Modern construction with heritage restoration expertise. Combining traditional Kerala architecture with contemporary design for unique spaces.',
    avatar: '', verified: true, status: 'APPROVED', hourlyRate: 900, certifications: ['Architectural Expert', 'Heritage Restoration', 'Design Certified'],
  },
  {
    id: '6', userId: '15', businessName: 'Mysore Quality Projects', specialties: ['Civil Works', 'Landscaping', 'Painting'],
    rating: 4.7, reviewCount: 92, completedProjects: 156, yearsExperience: 12, location: 'Mysore, Karnataka',
    bio: 'Quality-focused construction company known for meticulous civil works and beautiful landscaping. Creating premium living spaces in Mysore and vicinity.',
    avatar: '', verified: true, status: 'APPROVED', hourlyRate: 800, certifications: ['Civil Engineer', 'Environmental Expert', 'Landscape Certified'],
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1', title: 'Modern Apartment Interior - T. Nagar, Chennai', description: 'Complete apartment renovation with modular kitchen, false ceiling, and interior design installation.',
    status: 'IN_PROGRESS', progress: 65, budget: 450000, startDate: '2025-12-01', userId: '3', contractorId: '1',
    contractorName: 'Raj & Associates Construction', userName: 'Arjun Kumar',
    milestones: [
      { id: '1', title: 'Demolition complete', completed: true },
      { id: '2', title: 'Plumbing & electrical rough-in', completed: true },
      { id: '3', title: 'Walls & ceiling complete', completed: true },
      { id: '4', title: 'Interior finishing', completed: false },
      { id: '5', title: 'Final inspection', completed: false },
    ],
  },
  {
    id: '2', title: 'Corporate Office Development - Kochi IT Park', description: 'Premium office complex development with conference rooms, cafeteria, and parking facility.',
    status: 'APPROVED', progress: 10, budget: 1200000, startDate: '2026-01-15', userId: '3', contractorId: '2',
    contractorName: 'Keralam Infra Solutions', userName: 'Arjun Kumar',
  },
  {
    id: '3', title: 'Eco-Friendly Villa - Bangalore Suburbs', description: 'Sustainable luxury villa with solar panels, rainwater harvesting, and energy-efficient systems.',
    status: 'COMPLETED', progress: 100, budget: 650000, startDate: '2025-06-01', endDate: '2025-11-20', userId: '5', contractorId: '3',
    contractorName: 'Bangalore Premier Builders', userName: 'Priya Sharma',
  },
  {
    id: '4', title: 'Luxury Bathroom & Tile Work - Madurai', description: 'Master bathroom renovation with premium fixtures, Italian tiles, and heated flooring system.',
    status: 'PENDING', progress: 0, budget: 280000, startDate: '2026-03-01', userId: '3', userName: 'Arjun Kumar',
  },
  {
    id: '5', title: 'Restaurant Build-Out - Coimbatore Food Court', description: 'Complete commercial interior construction for multi-cuisine restaurant space.',
    status: 'DISPUTED', progress: 40, budget: 950000, startDate: '2025-09-01', userId: '6', contractorId: '4',
    contractorName: 'Coimbatore Express Builders', userName: 'Deepak Iyer',
  },
];

export const MOCK_REVIEWS: Review[] = [
  { id: '1', contractorId: '1', userId: '3', userName: 'Arjun Kumar', rating: 5, comment: 'Exceptional work on our Chennai apartment. The team was professional, punctual, and attention to detail was outstanding.', createdAt: '2025-11-25', projectTitle: 'Modern Apartment Interior - T. Nagar, Chennai' },
  { id: '2', contractorId: '1', userId: '5', userName: 'Priya Sharma', rating: 4, comment: 'Great quality work and materials. Communication was good throughout the project.', createdAt: '2025-10-15', projectTitle: 'Villa Renovation' },
  { id: '3', contractorId: '3', userId: '5', userName: 'Priya Sharma', rating: 5, comment: 'Bangalore Premier Builders did incredible job with our eco-friendly villa. Sustainable yet luxurious!', createdAt: '2025-11-22', projectTitle: 'Eco-Friendly Villa - Bangalore Suburbs' },
  { id: '4', contractorId: '2', userId: '6', userName: 'Deepak Iyer', rating: 4, comment: 'Professional team, good coordination, fair pricing. The office looks amazing.', createdAt: '2025-08-30', projectTitle: 'Corporate Office Development - Kochi IT Park' },
];
