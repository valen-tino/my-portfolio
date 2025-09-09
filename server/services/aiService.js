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

        Please structure the content with these key sections:

        1. Project Background & Context
       - Project motivation and business need
       - Target users/stakeholders 
       - Project scope and objectives

        2. Development Process
       - Planning and requirements gathering
       - Technical approach and architecture
       - Key challenges and solutions
       - Development methodology used

        3. Implementation Details  
       - Core features and functionality
       - Technologies and tools utilized
       - Technical specifications
       - Notable achievements

        4. Team Structure
       - Project roles and responsibilities
       - Team composition (if applicable)
       - Collaboration approach

        5. Outcomes & Impact
       - Project results and deliverables
       - Metrics and improvements achieved
       - User/stakeholder feedback
       - Lessons learned

        Requirements:
        1. Highlight Valentino Jehaut's specific contributions and roles in the project.
        2. Use proper markdown formatting with headings, bullet points, and sections where appropriate.
        3. Keep the description concise but informative, ideally between 200-400 words.
        4. Avoid overly technical jargon; make it accessible to a broader audience while retaining necessary technical details.
        5. Ensure the tone is professional and polished, suitable for a portfolio.
        6. Maintain factual accuracy while improving clarity and engagement

        Please follow these rules:
        1. Make the content clearer and more engaging
        2. Maintain all technical details and specifications 
        3. Use proper markdown formatting
        4. Keep the same general structure but improve readability
        5. Add appropriate headings and bullet points where helpful
        6. Make it sound more professional and polished
        7. Include information about team members and roles, even if only roles are available

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
        max_tokens: 8192,
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
      const prompt = `Analyze this project description and create a structured portfolio item in JSON format.

        Project description:
        ${textDescription}

        Available technologies: ${availableTechTools.join(", ")}
        Available roles: ${availableRoles.join(", ")}

        Return a JSON object with:
        {
          "title": "Clear, professional project title",
          "desc": "2-3 sentence overview",
          "projectDetails": "Detailed markdown description",
          "linkTo": "Project URL or empty string", 
          "tech": ["matching technologies"],
          "roles": ["matching roles"]
        }

        Guidelines:
        - Match technologies with available list, include others if mentioned
        - Only use roles from provided list
        - Keep description concise and engaging
        - Structure markdown with headers, bullet points
        
        For the projectDetails, include these sections:
        1. Background & Context
       - Project motivation/business need
       - Target users/stakeholders
       - Project scope and objectives
        
        2. Development Process
       - Planning and requirements gathering
       - Technical approach and architecture
       - Key challenges and solutions
       - Development methodology used
        
        3. Implementation Details
       - Core features and functionality
       - Technologies and tools utilized
       - Your specific contributions and role
       - Notable technical achievements

        4. Team Structure
       - Project roles and team composition (list team members if known, otherwise list roles)
       - Collaboration approach and team dynamics
       - Team size and organization
        
        5. Outcomes & Impact
       - Project results and deliverables
       - Metrics and improvements achieved
       - User/stakeholder feedback
       - Lessons learned

        Additional requirements:
        - Highlight Valentino Jehaut's contributions throughout
        - Focus on clarity and professionalism 
        - Keep technical details accurate but accessible
        - Use proper markdown formatting with headers and bullet points
        - Aim for 200-400 words total in projectDetails
        - Maintain engaging but professional tone
        - Include team information even if only roles are available

        Return only valid JSON, no additional text.`;

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
        max_tokens: 8192,
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
