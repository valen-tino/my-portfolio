import apiService from './api';

export interface AIResponse {
  success: boolean;
  data?: string;
  error?: string;
}

class AIService {
  /**
   * Rewrite project details using deepseek-chat model
   * @param projectDetails - Current project details in markdown
   * @param projectTitle - Title of the project for context
   * @returns Rewritten project details
   */
  async rewriteProjectDetails(
    projectDetails: string,
    projectTitle: string
  ): Promise<AIResponse> {
    try {
      const response = await apiService.rewriteProjectDetails({
        projectDetails,
        projectTitle
      });

      if (response.success) {
        return {
          success: true,
          data: response.data.rewrittenContent
        };
      } else {
        return {
          success: false,
          error: response.message || "Failed to rewrite project details"
        };
      }

    } catch (error: any) {
      console.error("Error rewriting project details:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to rewrite project details"
      };
    }
  }

  /**
   * Create a portfolio item from text description using deepseek-reasoner model
   * @param textDescription - User's text description of the project
   * @param availableTechTools - List of available tech tools
   * @param availableRoles - List of available roles
   * @returns Structured portfolio item data
   */
  async createPortfolioFromText(
    textDescription: string,
    availableTechTools: string[],
    availableRoles: string[]
  ): Promise<AIResponse> {
    try {
      const response = await apiService.createPortfolioFromText({
        textDescription
      });

      if (response.success) {
        return {
          success: true,
          data: JSON.stringify(response.data)
        };
      } else {
        return {
          success: false,
          error: response.message || "Failed to create portfolio from text"
        };
      }

    } catch (error: any) {
      console.error("Error creating portfolio from text:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Failed to create portfolio from text"
      };
    }
  }

  /**
   * Test the AI service connection
   */
  async testConnection(): Promise<AIResponse> {
    try {
      const response = await apiService.testAIConnection();

      if (response.success) {
        return {
          success: true,
          data: response.data.response || "Connection test completed"
        };
      } else {
        return {
          success: false,
          error: response.message || "Connection test failed"
        };
      }

    } catch (error: any) {
      console.error("AI service connection test failed:", error);
      return {
        success: false,
        error: error.response?.data?.message || error.message || "Connection test failed"
      };
    }
  }
}

export const aiService = new AIService();
export default aiService;
