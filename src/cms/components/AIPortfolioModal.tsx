import React, { useState } from 'react';
import { PortfolioItem, TechTool, Role } from '../apiStorage';
import aiService from '../../services/ai';
import {
  validateTextForPortfolioCreation,
  extractTechTitles,
  extractRoleTitles,
  parseAIPortfolioResponse,
  createPortfolioItemFromAI,
  generatePortfolioPreview,
  sanitizeTextForAI,
  formatAIErrorMessage,
  separateTechnologies,
  ParsedPortfolioData
} from '../../utils/aiHelpers';

interface AIPortfolioModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerate: (portfolio: Omit<PortfolioItem, 'id' | '_id'>) => void;
  availableTechTools: TechTool[];
  availableRoles: Role[];
}

const AIPortfolioModal: React.FC<AIPortfolioModalProps> = ({
  isOpen,
  onClose,
  onGenerate,
  availableTechTools,
  availableRoles
}) => {
  const [textDescription, setTextDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedData, setGeneratedData] = useState<ParsedPortfolioData | null>(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState<'input' | 'preview' | 'success'>('input');

  const handleClose = () => {
    setTextDescription('');
    setGeneratedData(null);
    setError('');
    setStep('input');
    setIsGenerating(false);
    onClose();
  };

  const handleGenerate = async () => {
    setError('');

    // Validate input
    const validation = validateTextForPortfolioCreation(textDescription);
    if (!validation.isValid) {
      setError(validation.message || 'Invalid input');
      return;
    }

    setIsGenerating(true);

    try {
      // Sanitize input
      const sanitizedText = sanitizeTextForAI(textDescription);
      const techTitles = extractTechTitles(availableTechTools);
      const roleTitles = extractRoleTitles(availableRoles);

      // Call AI service
      const response = await aiService.createPortfolioFromText(
        sanitizedText,
        techTitles,
        roleTitles
      );

      if (!response.success || !response.data) {
        setError(formatAIErrorMessage(response.error || 'Unknown error'));
        return;
      }

      // Parse response
      const parsedData = parseAIPortfolioResponse(response.data);
      if (!parsedData) {
        setError('Failed to parse AI response. Please try again.');
        return;
      }

      setGeneratedData(parsedData);
      setStep('preview');

    } catch (error: any) {
      console.error('Error generating portfolio:', error);
      setError(formatAIErrorMessage(error.message || 'Unexpected error occurred'));
    } finally {
      setIsGenerating(false);
    }
  };

  const handleConfirm = () => {
    if (!generatedData) return;

    const portfolioItem = createPortfolioItemFromAI(generatedData);
    
    // Separate matched and unmatched technologies
    const { matched: matchedTech, unmatched: unmatchedTech } = separateTechnologies(
      generatedData.tech,
      availableTechTools
    );
    
    // Update the portfolio item with separated technologies
    const updatedPortfolioItem = {
      ...portfolioItem,
      tech: matchedTech, // Only matched technologies go to the main tech array
      customTech: unmatchedTech // Unmatched technologies for custom field
    };
    
    onGenerate(updatedPortfolioItem);
    setStep('success');
    
    // Close modal after a brief delay
    setTimeout(() => {
      handleClose();
    }, 1500);
  };

  const handleBack = () => {
    setStep('input');
    setError('');
  };

  const handleTryAgain = () => {
    setStep('input');
    setGeneratedData(null);
    setError('');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">
              🤖 Add New Project using AI
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Describe your project and let AI generate a structured portfolio item
            </p>
          </div>
          <button
            onClick={handleClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
          
          {/* Step 1: Input */}
          {step === 'input' && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Project Description *
                </label>
                <textarea
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your project in detail. Include:
• What the project does and its purpose
• Technologies you used (React, Node.js, Python, etc.)
• Your role in the project (Developer, Designer, etc.)
• Key features and functionality
• Any live URLs or repositories
• Challenges you overcame
• Notable achievements or results

Example: 'I built an e-commerce website using React and Node.js. As a full-stack developer, I created user authentication, shopping cart functionality, and integrated Stripe for payments. The site is hosted on Heroku and increased sales by 30%. I used MongoDB for the database and implemented real-time notifications with Socket.io...'"
                  value={textDescription}
                  onChange={(e) => setTextDescription(e.target.value)}
                  disabled={isGenerating}
                />
                <div className="mt-1 flex justify-between text-xs text-gray-500">
                  <span>Be as detailed as possible for better AI results</span>
                  <span>{textDescription.length}/2000</span>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-md p-3">
                  <div className="flex">
                    <svg className="w-5 h-5 text-red-400 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              )}

              {isGenerating && (
                <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-blue-400 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    <div className="text-sm text-blue-700">
                      <p className="font-medium">AI is analyzing your project description...</p>
                      <p className="text-xs mt-1">This may take up to 2-3 minutes for complex projects. Please wait.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Available Context Info */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <h3 className="text-sm font-medium text-blue-900 mb-2">Available Context</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-blue-800">Technologies ({availableTechTools.length}):</span>
                    <div className="text-blue-700 mt-1">
                      {availableTechTools.length > 0 ? (
                        availableTechTools.slice(0, 6).map(tool => tool.title).join(', ') + 
                        (availableTechTools.length > 6 ? `, +${availableTechTools.length - 6} more` : '')
                      ) : (
                        'None configured'
                      )}
                    </div>
                  </div>
                  <div>
                    <span className="font-medium text-blue-800">Roles ({availableRoles.length}):</span>
                    <div className="text-blue-700 mt-1">
                      {availableRoles.length > 0 ? (
                        availableRoles.map(role => role.title).join(', ')
                      ) : (
                        'None configured'
                      )}
                    </div>
                  </div>
                </div>
                <p className="text-xs text-blue-600 mt-2">
                  AI will automatically match technologies with your existing tools. Unmatched technologies will be added to the "Custom Technologies" field.
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Preview */}
          {step === 'preview' && generatedData && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-sm font-medium text-green-800">AI Generated Portfolio Item</h3>
                </div>
                <p className="text-sm text-green-700 mt-1">Review the generated content and confirm to create the project</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Column - Basic Info */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <p className="text-sm text-gray-900">{generatedData.title}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <p className="text-sm text-gray-900">{generatedData.desc}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project Link</label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                      <p className="text-sm text-gray-900">
                        {generatedData.linkTo || <span className="text-gray-500">None specified</span>}
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                      {generatedData.tech.length > 0 ? (
                        <div className="space-y-2">
                          {(() => {
                            // Separate matched and unmatched technologies for preview
                            const { matched: matchedTech, unmatched: unmatchedTech } = separateTechnologies(
                              generatedData.tech,
                              availableTechTools
                            );
                            
                            return (
                              <>
                                {matchedTech.length > 0 && (
                                  <div>
                                    <div className="text-xs font-medium text-green-700 mb-1">✅ Matched with your tech tools:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {matchedTech.map((tech, index) => (
                                        <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded">
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                {unmatchedTech.length > 0 && (
                                  <div>
                                    <div className="text-xs font-medium text-orange-700 mb-1">📝 Will be added as custom technologies:</div>
                                    <div className="flex flex-wrap gap-1">
                                      {unmatchedTech.map((tech, index) => (
                                        <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded">
                                          {tech}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">None specified</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Roles</label>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                      {generatedData.roles.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {generatedData.roles.map((role, index) => (
                            <span key={index} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded">
                              {role}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">None specified</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Column - Project Details */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Details (Markdown)</label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-md h-80 overflow-y-auto">
                    <pre className="text-sm text-gray-900 whitespace-pre-wrap font-mono">{generatedData.projectDetails}</pre>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Portfolio Item Created!</h3>
              <p className="text-gray-600">The AI-generated portfolio item has been added to your editing form.</p>
            </div>
          )}

        </div>

        {/* Footer */}
        {step !== 'success' && (
          <div className="px-6 py-4 border-t border-gray-200 flex justify-between">
            <div>
              {step === 'preview' && (
                <div className="flex space-x-3">
                  <button
                    onClick={handleBack}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Back to Edit
                  </button>
                  <button
                    onClick={handleTryAgain}
                    className="px-4 py-2 text-blue-700 bg-blue-50 border border-blue-300 rounded-md hover:bg-blue-100"
                  >
                    Try Different Input
                  </button>
                </div>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={isGenerating}
              >
                Cancel
              </button>
              
              {step === 'input' && (
                <button
                  onClick={handleGenerate}
                  disabled={isGenerating || textDescription.trim().length < 50}
                  className={`px-4 py-2 rounded-md text-white font-medium ${
                    isGenerating || textDescription.trim().length < 50
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                      {isGenerating ? (
                        <div className="flex items-center">
                          <svg className="w-4 h-4 mr-2 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                          </svg>
                          <span className="animate-pulse">Analyzing with AI...</span>
                        </div>
                      ) : (
                        '✨ Generate Portfolio'
                      )}
                </button>
              )}

              {step === 'preview' && (
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium"
                >
                  ✅ Confirm & Create
                </button>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AIPortfolioModal;
