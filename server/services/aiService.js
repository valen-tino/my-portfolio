const OpenAI = require('openai');

// Opencode Go / Deepseek API configuration (aligned with Vercel DEEPSEEK_API_KEY & DEEPSEEK_BASE_URL)
const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || 'oc_sk_c26451b97d8f_PeNlC8VXODkpok9xUXa2RwUZzOMUUic4';
const DEEPSEEK_BASE_URL = process.env.DEEPSEEK_BASE_URL || 'https://api.opencodego.com/v1';
const AI_MODEL = 'deepseek-v4.1-flash';
const MAX_TOKENS = 8192;

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
   * Rewrite project details using deepseek-v4.1-flash model
   * @param {string} projectDetails - Current project details in HTML or markdown
   * @param {string} projectTitle - Title of the project for context
   * @returns {Promise<{success: boolean, data?: string, error?: string}>}
   */
  async rewriteProjectDetails(projectDetails, projectTitle) {
    try {
      const prompt = `You are a professional technical writer helping to improve project documentation. 

        Please rewrite the following project details to make them much clearer, more professional, and more engaging while maintaining all the technical information. The project is titled "${projectTitle}".

        Current project details:
        ${projectDetails}

        Please structure the content with these exact 5 standard section titles (using Markdown H2: ##) and bold inline field labels:

        ## 1. Project Background & Context
        - Overview paragraph explaining project motivation and business need
        - **Target Users:** Describe target users/stakeholders
        - **Objectives:** Describe project scope and objectives

        ## 2. Development Process
        - Overview paragraph of research, planning, and requirements gathering
        - **Technical Approach:** Architecture and methodology used
        - **Key Challenges:** Challenges faced and solutions implemented

        ## 3. Implementation Details
        - **Core Features:** (followed by a clean bullet list of features)
        - **Technologies:** Comma-separated list of technologies and tools utilized
        - **Notable Achievements:** Specific milestones, metrics, and Valentino Jehaut's key technical contributions

        ## 4. Team Structure & Roles
        - Valentino Jehaut's specific role and responsibilities (bullet list)
        - **Project Team:** Team composition and collaboration approach

        ## 5. Outcomes & Impact
        - **Deliverables:** Final project deliverables
        - **Key Improvements:** Bullet list of measurable improvements achieved
        - **User Feedback:** Stakeholder/user reception
        - **Lessons Learned:** Key takeaways

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
        model: AI_MODEL,
        temperature: 0.7,
        max_tokens: MAX_TOKENS,
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
   * Create a portfolio item from text description using deepseek-v4.1-flash model
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
        
        For the projectDetails, structure the content with these exact 5 standard section titles (using Markdown H2: ##) and bold inline field labels:

        ## 1. Project Background & Context
        - Overview paragraph explaining project motivation and business need
        - **Target Users:** Describe target users and stakeholders
        - **Objectives:** Describe project scope and objectives
        
        ## 2. Development Process
        - Overview paragraph of research, planning, and requirements gathering
        - **Technical Approach:** Architecture and development methodology used
        - **Key Challenges:** Challenges faced and solutions implemented
        
        ## 3. Implementation Details
        - **Core Features:** (followed by a clean bullet list of core features)
        - **Technologies:** Comma-separated list of technologies and tools utilized
        - **Notable Achievements:** Specific milestones, metrics, and Valentino Jehaut's technical contributions

        ## 4. Team Structure & Roles
        - Valentino Jehaut's specific role and responsibilities (bullet list)
        - **Project Team:** Team composition and collaboration approach
        
        ## 5. Outcomes & Impact
        - **Deliverables:** Final project deliverables
        - **Key Improvements:** Bullet list of measurable improvements achieved
        - **User Feedback:** User and stakeholder feedback
        - **Lessons Learned:** Key takeaways

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
        model: AI_MODEL,
        temperature: 0.3,
        max_tokens: MAX_TOKENS,
      }, {
        timeout: 180000 // 3 minutes timeout
      });

      const response = completion.choices[0]?.message?.content;

      if (!response) {
        return {
          success: false,
          error: "No response generated from AI service"
        };
      }

      // Try to parse the JSON response (strip markdown fences if present)
      try {
        const cleanedResponse = response.trim().replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
        const portfolioData = JSON.parse(cleanedResponse);
        
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
        model: AI_MODEL,
        max_tokens: MAX_TOKENS,
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
