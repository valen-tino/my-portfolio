import { PortfolioItem, TechTool, Role } from '../cms/apiStorage';

export interface ParsedPortfolioData {
  title: string;
  desc: string;
  projectDetails: string;
  linkTo: string;
  tech: string[];
  roles: string[];
}

/**
 * Validates if the project details have sufficient content for rewriting
 */
export function validateProjectDetailsForRewriting(projectDetails: string): {
  isValid: boolean;
  message?: string;
} {
  if (!projectDetails || projectDetails.trim().length === 0) {
    return {
      isValid: false,
      message: "Project details are empty. Please add some content first."
    };
  }

  if (projectDetails.trim().length < 20) {
    return {
      isValid: false,
      message: "Project details are too short. Please add more content to get meaningful AI improvements."
    };
  }

  return { isValid: true };
}

/**
 * Validates if the text description is sufficient for AI portfolio generation
 */
export function validateTextForPortfolioCreation(textDescription: string): {
  isValid: boolean;
  message?: string;
} {
  if (!textDescription || textDescription.trim().length === 0) {
    return {
      isValid: false,
      message: "Please provide a project description."
    };
  }

  if (textDescription.trim().length < 50) {
    return {
      isValid: false,
      message: "Description is too short. Please provide more details about the project (at least 50 characters)."
    };
  }

  if (textDescription.trim().length > 2000) {
    return {
      isValid: false,
      message: "Description is too long. Please keep it under 2000 characters."
    };
  }

  return { isValid: true };
}

/**
 * Extract available technology titles from TechTool array
 */
export function extractTechTitles(techTools: TechTool[]): string[] {
  return techTools.map(tool => tool.title);
}

/**
 * Extract available role titles from Role array
 */
export function extractRoleTitles(roles: Role[]): string[] {
  return roles.map(role => role.title);
}

/**
 * Parse JSON response from AI service into portfolio item structure
 */
export function parseAIPortfolioResponse(jsonString: string): ParsedPortfolioData | null {
  try {
    const parsed = JSON.parse(jsonString);
    
    // Validate required fields
    if (!parsed.title || !parsed.desc) {
      console.error("AI response missing required fields:", parsed);
      return null;
    }

    return {
      title: String(parsed.title).trim(),
      desc: String(parsed.desc).trim(),
      projectDetails: String(parsed.projectDetails || parsed.desc).trim(),
      linkTo: String(parsed.linkTo || "").trim(),
      tech: Array.isArray(parsed.tech) ? parsed.tech.map((t: any) => String(t).trim()) : [],
      roles: Array.isArray(parsed.roles) ? parsed.roles.map((r: any) => String(r).trim()) : []
    };
  } catch (error) {
    console.error("Failed to parse AI portfolio response:", error);
    return null;
  }
}

/**
 * Create a new portfolio item from parsed AI data
 */
export function createPortfolioItemFromAI(parsedData: ParsedPortfolioData): Omit<PortfolioItem, 'id' | '_id'> {
  return {
    title: parsedData.title,
    desc: parsedData.desc,
    projectDetails: parsedData.projectDetails,
    linkTo: parsedData.linkTo,
    imageURL: '', // Will be set when user uploads image
    tech: parsedData.tech,
    roles: parsedData.roles
  };
}

/**
 * Generate a preview summary for AI-generated portfolio item
 */
export function generatePortfolioPreview(parsedData: ParsedPortfolioData): string {
  const techList = parsedData.tech.length > 0 ? parsedData.tech.join(", ") : "Not specified";
  const rolesList = parsedData.roles.length > 0 ? parsedData.roles.join(", ") : "Not specified";
  const hasLink = parsedData.linkTo.length > 0 ? "Yes" : "No";

  return `Title: ${parsedData.title}
Description: ${parsedData.desc}
Technologies: ${techList}
Roles: ${rolesList}
Has Link: ${hasLink}`;
}

/**
 * Sanitize and prepare text for AI processing
 */
export function sanitizeTextForAI(text: string): string {
  return text
    .trim()
    // Remove excessive whitespace
    .replace(/\s+/g, ' ')
    // Remove potential harmful characters that might break JSON
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, '')
    // Limit length as backup
    .substring(0, 2000);
}

/**
 * Check if rewritten content is significantly different from original
 */
export function isContentSignificantlyDifferent(
  original: string, 
  rewritten: string, 
  minDifferenceThreshold: number = 0.2
): boolean {
  if (!original || !rewritten) return false;
  
  const originalWords = original.toLowerCase().split(/\s+/);
  const rewrittenWords = rewritten.toLowerCase().split(/\s+/);
  
  // Simple word difference ratio
  const originalSet = new Set(originalWords);
  const rewrittenSet = new Set(rewrittenWords);
  
  const intersection = new Set([...originalSet].filter(x => rewrittenSet.has(x)));
  const union = new Set([...originalSet, ...rewrittenSet]);
  
  const similarity = intersection.size / union.size;
  const difference = 1 - similarity;
  
  return difference >= minDifferenceThreshold;
}

/**
 * Separate AI-generated technologies into matched and unmatched categories
 */
export function separateTechnologies(
  aiTechnologies: string[],
  availableTechTools: { title: string }[]
): { matched: string[]; unmatched: string[] } {
  const availableTitles = availableTechTools.map(tool => tool.title.toLowerCase());
  const matched: string[] = [];
  const unmatched: string[] = [];
  
  aiTechnologies.forEach(tech => {
    const techLower = tech.toLowerCase().trim();
    const foundTool = availableTechTools.find(tool => 
      tool.title.toLowerCase() === techLower
    );
    
    if (foundTool) {
      matched.push(foundTool.title); // Use the original case from available tools
    } else {
      unmatched.push(tech.trim()); // Keep original case for custom technologies
    }
  });
  
  return { matched, unmatched };
}

/**
 * Format error messages for user display
 */
export function formatAIErrorMessage(error: string): string {
  // Common error patterns and user-friendly messages
  const errorMappings = {
    'rate_limit': 'AI service is temporarily busy. Please try again in a moment.',
    'invalid_api_key': 'AI service configuration error. Please contact support.',
    'network': 'Network connection error. Please check your internet and try again.',
    'timeout': 'AI service is taking too long to respond. Please try again.',
    'quota_exceeded': 'AI service quota exceeded. Please try again later.'
  };

  const lowerError = error.toLowerCase();
  
  for (const [pattern, message] of Object.entries(errorMappings)) {
    if (lowerError.includes(pattern)) {
      return message;
    }
  }

  // Default user-friendly message
  return 'AI service encountered an error. Please try again or contact support if the issue persists.';
}
