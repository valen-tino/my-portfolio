const OpenAI = require('openai');

// Deepseek API configuration
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY;
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com';

class AIService {
  constructor() {
    if (!DEEPSEEK_API_KEY) {
      throw new Error('DEEPSEEK_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({
      baseURL: DEEPSEEK_BASE_URL,
      apiKey: DEEPSEEK_API_KEY,
    });
  }

  /**
   * Rewrite project details using deepseek-chat model
   * @param {string} projectDetails - Current project details in markdown
   * @param {string} projectTitle - Title of the project for context
   * @returns {Promise<{success: boolean, data?: string, error?: string}>}
   */
  async rewriteProjectDetails(projectDetails, projectTitle) {
    try {
      const prompt = `You are a professional technical writer helping to improve project documentation. 

Please rewrite the following project details to make them much clearer, more professional, and more engaging while maintaining all the technical information. The project is titled "${projectTitle}".

Current project details:
${projectDetails}

Requirements:
1. Make the content clearer and more engaging
2. Maintain all technical details and specifications
3. Use proper markdown formatting
4. Keep the same general structure but improve readability
5. Add appropriate headings and bullet points where helpful
6. Make it sound more professional and polished

Return only the rewritten project details in markdown format.`;

      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are a professional technical writer who specializes in creating clear, engaging, and well-structured project documentation."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "deepseek-chat",
        temperature: 0.7,
        max_tokens: 2000,
      }, {
        timeout: 120000 // 2 minutes timeout
      });

      const rewrittenContent = completion.choices[0]?.message?.content;

      if (!rewrittenContent) {
        return {
          success: false,
          error: "No response generated from AI service"
        };
      }

      return {
        success: true,
        data: rewrittenContent.trim()
      };

    } catch (error) {
      console.error("Error rewriting project details:", error);
      return {
        success: false,
        error: error.message || "Failed to rewrite project details"
      };
    }
  }

  /**
   * Create a portfolio item from text description using deepseek-reasoner model
   * @param {string} textDescription - User's text description of the project
   * @param {string[]} availableTechTools - List of available tech tools
   * @param {string[]} availableRoles - List of available roles
   * @returns {Promise<{success: boolean, data?: string, error?: string}>}
   */
  async createPortfolioFromText(textDescription, availableTechTools = [], availableRoles = []) {
    try {
      const prompt = `You are an AI assistant that helps extract structured project information from text descriptions.

Please analyze the following project description and create a structured portfolio item. Extract all relevant information and match technologies and roles from the provided lists when possible.

Project description:
${textDescription}

Available technologies: ${availableTechTools.join(", ")}
Available roles: ${availableRoles.join(", ")}

Please return a JSON object with the following structure:
{
  "title": "Project Title",
  "desc": "Brief description (2-3 sentences max)",
  "projectDetails": "Detailed project description in markdown format",
  "linkTo": "Project URL if mentioned (or empty string)",
  "tech": ["Array", "of", "technologies", "used"],
  "roles": ["Array", "of", "roles", "applicable"]
}

Rules:
1. For "tech": Use technologies from the available list when they match the project. You can also add other technologies mentioned in the description even if they're not in the available list.
2. For "roles": Only use roles from the available roles list that are applicable to this project.
3. For "desc": Keep it concise and engaging, suitable for a portfolio card preview.
4. For "projectDetails": Create a comprehensive markdown description with proper sections, bullet points, and formatting.
5. If no project URL is mentioned, use an empty string for "linkTo".
6. Make sure the title is professional and descriptive.

Return only the JSON object, no additional text.`;

      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: "You are an expert at analyzing project descriptions and extracting structured information. You always respond with valid JSON only."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        model: "deepseek-reasoner",
        temperature: 0.3,
        max_tokens: 4000,
      }, {
        timeout: 180000 // 3 minutes timeout for reasoner model
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        return {
          success: false,
          error: "No response generated from AI service"
        };
      }

      // Try to parse the JSON response
      try {
        const portfolioData = JSON.parse(response.trim());
        
        // Validate required fields
        if (!portfolioData.title || !portfolioData.desc) {
          return {
            success: false,
            error: "AI response missing required fields (title or desc)"
          };
        }

        // Ensure arrays exist
        portfolioData.tech = portfolioData.tech || [];
        portfolioData.roles = portfolioData.roles || [];
        portfolioData.linkTo = portfolioData.linkTo || "";
        portfolioData.projectDetails = portfolioData.projectDetails || portfolioData.desc;

        return {
          success: true,
          data: JSON.stringify(portfolioData)
        };

      } catch (parseError) {
        console.error("Failed to parse AI response as JSON:", response);
        return {
          success: false,
          error: "AI response was not valid JSON format"
        };
      }

    } catch (error) {
      console.error("Error creating portfolio from text:", error);
      return {
        success: false,
        error: error.message || "Failed to create portfolio from text"
      };
    }
  }

  /**
   * Test the AI service connection
   */
  async testConnection() {
    try {
      const completion = await this.openai.chat.completions.create({
        messages: [
          {
            role: "user",
            content: "Hello, please respond with 'Connection successful' if you can receive this message."
          }
        ],
        model: "deepseek-chat",
        max_tokens: 20,
      });

      const response = completion.choices[0]?.message?.content;

      return {
        success: true,
        data: response || "Connection test completed"
      };

    } catch (error) {
      console.error("AI service connection test failed:", error);
      return {
        success: false,
        error: error.message || "Connection test failed"
      };
    }
  }
}

module.exports = AIService;
