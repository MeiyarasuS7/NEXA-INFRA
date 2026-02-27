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
  stats?: any; // User-specific statistics
  recentActivity?: any[]; // Recent user activities
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
    
    if (!user) {
      return `You are NEXA AI, a helpful assistant for NEXA INFRA - a construction management platform. 
      You help users with finding contractors, project management, and platform navigation.
      Be friendly, professional, and concise.`;
    }

    const baseInfo = `You are NEXA AI, assisting ${user.full_name} (${user.email}).`;
    
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
        - Reviewing platform statistics and metrics
        - Managing contractor approvals and verifications
        - Monitoring project progress and disputes
        - Payment verification and financial oversight
        - User management and platform settings
        - Analytics and performance reports
        
        When asked about "progress" or "status", provide specific data from the stats above.
        Be professional, data-driven, and focus on actionable insights for platform management.`;
        
      case 'CONTRACTOR':
        return `${baseInfo}
        
        ROLE: Contractor
        
        ${stats ? `Your current status:
        - Active Projects: ${stats.activeProjects || 0}
        - Completed Projects: ${stats.completedProjects || 0}
        - Average Rating: ${stats.rating || 'N/A'}
        - Total Earnings: ${stats.totalEarnings || 'N/A'}
        - Pending Reviews: ${stats.pendingReviews || 0}
        ` : ''}
        
        You can help the contractor with:
        - Managing their project assignments and timelines
        - Understanding client requirements and specifications
        - Tracking project milestones and deliverables
        - Submitting invoices and tracking payments
        - Responding to client feedback and reviews
        - Managing your contractor profile and certifications
        
        When asked about "my projects" or "work status", provide details about their active assignments.
        Be supportive, practical, and focus on helping them deliver quality work.`;
        
      case 'USER':
        return `${baseInfo}
        
        ROLE: Client or Project Owner
        
        ${stats ? `Your account overview:
        - Active Projects: ${stats.activeProjects || 0}
        - Total Projects: ${stats.totalProjects || 0}
        - Projects Completed: ${stats.completedProjects || 0}
        - Pending Payments: ${stats.pendingPayments || 0}
        ` : ''}
        
        You can help the client with:
        - Finding and selecting qualified contractors
        - Creating and managing project requests
        - Understanding the payment and milestone process
        - Tracking project progress and contractor performance
        - Reviewing and rating completed work
        - Resolving issues or disputes
        
        When asked about "my projects" or "status", provide information about their specific projects.
        Be helpful, clear, and guide them through the construction project journey.`;
        
      default:
        return `${baseInfo} You are using NEXA INFRA platform. How can I assist you today?`;
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
