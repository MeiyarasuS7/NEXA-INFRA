import type { Contractor, Project, Review } from '@/types';

export const MOCK_CONTRACTORS: Contractor[] = [
  {
    id: '1', userId: '10', businessName: 'Wilson & Sons Construction', specialties: ['Residential', 'Remodeling', 'Roofing'],
    rating: 4.8, reviewCount: 124, completedProjects: 89, yearsExperience: 15, location: 'Austin, TX',
    bio: 'Family-owned construction company specializing in residential builds and remodeling projects with over 15 years of experience.',
    avatar: '', verified: true, status: 'APPROVED', hourlyRate: 85, certifications: ['Licensed General Contractor', 'OSHA Certified'],
  },
  {
    id: '2', userId: '11', businessName: 'Metro Build Corp', specialties: ['Commercial', 'Industrial', 'Electrical'],
    rating: 4.6, reviewCount: 87, completedProjects: 56, yearsExperience: 12, location: 'Dallas, TX',
    bio: 'Commercial construction specialists handling projects from ground-up builds to full tenant improvements.',
    avatar: '', verified: true, status: 'APPROVED', hourlyRate: 110, certifications: ['Commercial License', 'EPA Certified'],
  },
  {
    id: '3', userId: '12', businessName: 'GreenSpace Builders', specialties: ['Sustainable', 'Residential', 'Landscaping'],
    rating: 4.9, reviewCount: 62, completedProjects: 41, yearsExperience: 8, location: 'Denver, CO',
    bio: 'Eco-friendly construction company focused on sustainable building practices and energy-efficient homes.',
    avatar: '', verified: true, status: 'APPROVED', hourlyRate: 95, certifications: ['LEED Certified', 'Green Building Council'],
  },
  {
    id: '4', userId: '13', businessName: 'Precision Plumbing & Build', specialties: ['Plumbing', 'Bathroom', 'Kitchen'],
    rating: 4.7, reviewCount: 156, completedProjects: 203, yearsExperience: 20, location: 'Houston, TX',
    bio: 'Master plumber with two decades of experience in residential and commercial plumbing and renovation.',
    avatar: '', verified: true, status: 'APPROVED', hourlyRate: 75, certifications: ['Master Plumber License'],
  },
  {
    id: '5', userId: '14', businessName: 'SkyHigh Structures', specialties: ['High-Rise', 'Commercial', 'Steel'],
    rating: 4.5, reviewCount: 34, completedProjects: 18, yearsExperience: 10, location: 'Chicago, IL',
    bio: 'Specializing in commercial high-rise construction and structural steel work across the Midwest.',
    avatar: '', verified: false, status: 'PENDING', hourlyRate: 130,
  },
  {
    id: '6', userId: '15', businessName: 'HomeStyle Renovations', specialties: ['Interior Design', 'Remodeling', 'Painting'],
    rating: 4.8, reviewCount: 98, completedProjects: 145, yearsExperience: 11, location: 'Miami, FL',
    bio: 'Full-service renovation company bringing your dream home to life with modern designs and quality craftsmanship.',
    avatar: '', verified: true, status: 'APPROVED', hourlyRate: 70,
  },
];

export const MOCK_PROJECTS: Project[] = [
  {
    id: '1', title: 'Kitchen Remodel - Downtown Apartment', description: 'Complete kitchen renovation including cabinets, countertops, and appliance installation.',
    status: 'IN_PROGRESS', progress: 65, budget: 45000, startDate: '2025-12-01', userId: '3', contractorId: '1',
    contractorName: 'Wilson & Sons Construction', userName: 'Sarah Chen',
    milestones: [
      { id: '1', title: 'Demolition complete', completed: true },
      { id: '2', title: 'Plumbing rough-in', completed: true },
      { id: '3', title: 'Cabinets installed', completed: true },
      { id: '4', title: 'Countertops fitted', completed: false },
      { id: '5', title: 'Final inspection', completed: false },
    ],
  },
  {
    id: '2', title: 'Office Build-Out - Tech Park', description: 'New office space build-out for a tech startup including open floor plan and conference rooms.',
    status: 'APPROVED', progress: 10, budget: 120000, startDate: '2026-01-15', userId: '3', contractorId: '2',
    contractorName: 'Metro Build Corp', userName: 'Sarah Chen',
  },
  {
    id: '3', title: 'Sustainable Home Addition', description: 'Adding a sunroom and energy-efficient HVAC system to existing home.',
    status: 'COMPLETED', progress: 100, budget: 65000, startDate: '2025-06-01', endDate: '2025-11-20', userId: '5', contractorId: '3',
    contractorName: 'GreenSpace Builders', userName: 'Mike Torres',
  },
  {
    id: '4', title: 'Bathroom Renovation Suite', description: 'Master bathroom remodel with luxury fixtures and heated flooring.',
    status: 'PENDING', progress: 0, budget: 28000, startDate: '2026-03-01', userId: '3', userName: 'Sarah Chen',
  },
  {
    id: '5', title: 'Restaurant Interior Fit-Out', description: 'Complete interior construction for new restaurant space.',
    status: 'DISPUTED', progress: 40, budget: 95000, startDate: '2025-09-01', userId: '6', contractorId: '4',
    contractorName: 'Precision Plumbing & Build', userName: 'Lisa Wang',
  },
];

export const MOCK_REVIEWS: Review[] = [
  { id: '1', contractorId: '1', userId: '3', userName: 'Sarah Chen', rating: 5, comment: 'Outstanding work on our kitchen remodel. The team was professional and finished ahead of schedule.', createdAt: '2025-11-25', projectTitle: 'Kitchen Remodel' },
  { id: '2', contractorId: '1', userId: '5', userName: 'Mike Torres', rating: 4, comment: 'Great quality work. Communication could be slightly better but the end result exceeded expectations.', createdAt: '2025-10-15', projectTitle: 'Deck Construction' },
  { id: '3', contractorId: '3', userId: '5', userName: 'Mike Torres', rating: 5, comment: 'GreenSpace did an incredible job with our sustainable home addition. Highly recommend!', createdAt: '2025-11-22', projectTitle: 'Sustainable Home Addition' },
  { id: '4', contractorId: '2', userId: '6', userName: 'Lisa Wang', rating: 4, comment: 'Professional team, fair pricing. The office turned out great.', createdAt: '2025-08-30', projectTitle: 'Office Renovation' },
];
