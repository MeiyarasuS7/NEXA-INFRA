// ============================= GROQ AI SERVICE =============================

import type { User, UserRole } from '@/types';

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface GroqChatRequest {
  messages: ChatMessage[];
  model?: string;
  temperature?: number;
  max_tokens?: number;
}

interface GroqChatResponse {
  choices: Array<{
    message: {
      role: string;
      content: string;
    };
  }>;
}

interface UserContext {
  user: User | null;
  stats?: Record<string, unknown>; // User-specific statistics
  recentActivity?: unknown[]; // Recent user activities
}

class GroqService {
  private apiKey: string;
  private baseUrl = 'https://api.groq.com/openai/v1';
  private model: string;
  private temperature: number;
  private maxTokens: number;

  constructor() {
    this.apiKey = import.meta.env.VITE_GROQ_API_KEY || '';
    this.model = import.meta.env.VITE_GROQ_MODEL || 'llama-3.1-70b-versatile';
    this.temperature = parseFloat(import.meta.env.VITE_CHATBOT_TEMPERATURE || '0.7');
    this.maxTokens = parseInt(import.meta.env.VITE_CHATBOT_MAX_TOKENS || '1024');
  }

  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey !== 'your-groq-api-key-here';
  }

  private getSystemPrompt(userContext: UserContext): string {
    const { user, stats } = userContext;
    
    // Construction-focused system prompt
    const constructionScope = `
    IMPORTANT: You are NEXA AI, a specialized assistant for NEXA INFRA construction platform.
    
    YOU ONLY RESPOND TO:
    1. CONSTRUCTION-RELATED TOPICS including but not limited to:
       - Building materials (cement, bricks, sand, gravel, steel rods, paint, tiles, plaster, concrete, mortar, etc.)
       - Construction tools and equipment (hammer, drill, saw, crane, excavator, mixer, etc.)
       - Construction processes (foundation, framing, roofing, plumbing, electrical work, finishing, etc.)
       - Land development and site preparation
       - Construction safety and regulations
       - Cost estimation and budgeting for construction projects
       - Construction planning and project management
       - Building design and architecture
       - Quality control and inspections
    
    2. NEXA INFRA PLATFORM TOPICS:
       - Finding and managing contractors
       - Project tracking and milestones
       - Payment systems and escrow
       - Platform features and navigation
       - User account management
       - Reviews and ratings system
    
    FOR NON-CONSTRUCTION TOPICS: Politely respond: "I'm NEXA AI, specializing in construction and our platform. I can help you with construction materials, building processes, finding contractors, or managing projects on NEXA INFRA. How can I assist you with your construction needs?"
    
    Be professional, helpful, and focus on actionable construction advice.`;

    if (!user) {
      return `${constructionScope}
      
      You help visitors with understanding the NEXA INFRA platform for construction projects.
      Be friendly and guide them toward construction-related solutions.`;
    }

    const baseInfo = `${constructionScope}
    
    Current user: ${user.full_name} (${user.email})`;
    
    switch (user.role) {
      case 'SUPER_ADMIN':
        return `${baseInfo}
        
        ROLE: Platform Administrator
        
        You have access to admin-specific information:
        ${stats ? `
        - Total Contractors: ${stats.totalContractors || 'N/A'}
        - Active Projects: ${stats.activeProjects || 'N/A'}
        - Pending Approvals: ${stats.pendingApprovals || 'N/A'}
        - Monthly Revenue: ${stats.monthlyRevenue || 'N/A'}
        - Active Disputes: ${stats.disputes || 'N/A'}
        ` : ''}
        You can help the admin with:
        - Reviewing platform statistics and construction project metrics
        - Managing contractor approvals and certifications
        - Monitoring construction project progress and disputes
        - Construction industry insights and trends
        - Payment verification for construction projects
        - Construction-related user management
        
        Focus on construction industry data and platform management for building projects.`;
        
      case 'CONTRACTOR':
        return `${baseInfo}
        
        ROLE: Construction Contractor
        
        ${stats ? `Your current status:
        - Active Projects: ${stats.activeProjects || 0}
        - Completed Projects: ${stats.completedProjects || 0}
        - Average Rating: ${stats.rating || 'N/A'}
        - Total Earnings: ${stats.totalEarnings || 'N/A'}
        - Pending Reviews: ${stats.pendingReviews || 0}
        ` : ''}
        
        You can help with:
        - Construction project management and timelines
        - Building material recommendations and costs
        - Construction techniques and best practices
        - Client communication for construction projects
        - Quality control and safety protocols
        - Construction tools and equipment advice
        - Tracking construction milestones and deliverables
        - Construction industry regulations and standards
        Provide practical construction advice and project management guidance.`;
        
      case 'USER':
        return `${baseInfo}
        
        ROLE: Construction Project Owner/Client
        
        ${stats ? `Your account overview:
        - Active Projects: ${stats.activeProjects || 0}
        - Total Projects: ${stats.totalProjects || 0}
        - Projects Completed: ${stats.completedProjects || 0}
        - Pending Payments: ${stats.pendingPayments || 0}
        ` : ''}
        
        You can help with:
        - Finding qualified construction contractors
        - Understanding construction costs and materials
        - Planning and managing building projects
        - Construction timeline and milestone guidance
        - Building material selection and quality assessment
        - Construction safety and inspection processes
        - Resolving construction-related issues
        - Understanding building codes and permits
        
        Guide them through their construction project journey with practical building advice.`;
        
      default:
        return `${baseInfo} Help them with construction projects and NEXA INFRA platform usage.`;
    }
  }

  async chat(messages: ChatMessage[], userContext?: UserContext): Promise<string> {
    if (!this.isConfigured()) {
      return "I'm currently in demo mode. Please configure the VITE_GROQ_API_KEY in your .env file to enable AI responses.";
    }
    try {
      const systemPrompt = this.getSystemPrompt(userContext || { user: null });
      
      const requestBody: GroqChatRequest = {
        messages: [
          {
            role: 'system',
            content: systemPrompt
          },
          ...messages
        ],
        model: this.model,
        temperature: this.temperature,
        max_tokens: this.maxTokens,
      };

      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API request failed with status ${response.status}`);
      }

      const data: GroqChatResponse = await response.json();
      
      return data.choices[0]?.message?.content || 'Sorry, I could not generate a response.';
    } catch (error) {
      console.error('Groq API error:', error);
      if (error instanceof Error) {
        return `Error: ${error.message}. Please check your Groq API configuration.`;
      }
      return 'An unexpected error occurred. Please try again.';
    }
  }

  // Quick responses for common queries
  async getResponse(
    userMessage: string, 
    conversationHistory: ChatMessage[], 
    userContext?: UserContext
  ): Promise<string> {
    // Add user message to conversation history
    const messages: ChatMessage[] = [
      ...conversationHistory,
      { role: 'user', content: userMessage }
    ];

    return await this.chat(messages, userContext);
  }
}

export const groqService = new GroqService();
