import React, { useState } from 'react';
import CMSLayout from '../components/CMSLayout';
import aiService from '../../services/ai';
import apiService from '../../services/api';

const AITest: React.FC = () => {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [rewriteTest, setRewriteTest] = useState({
    input: 'This is a simple web application built with React.',
    output: ''
  });
  const [portfolioTest, setPortfolioTest] = useState({
    input: 'I built an e-commerce website using React and Node.js. As a full-stack developer, I created user authentication, shopping cart functionality, and integrated Stripe for payments.',
    output: ''
  });

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testAIStatus = async () => {
    setLoading(true);
    try {
      addResult('Testing AI status...');
      const response = await apiService.getAIStatus();
      if (response.success) {
        addResult(`✅ AI Status: ${response.data.status}`);
        addResult(`- API Key configured: ${response.data.isConfigured ? 'Yes' : 'No'}`);
        addResult(`- Service initialized: ${response.data.isInitialized ? 'Yes' : 'No'}`);
      } else {
        addResult(`❌ Failed to get AI status: ${response.message}`);
      }
    } catch (error: any) {
      addResult(`❌ Error testing AI status: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testConnection = async () => {
    setLoading(true);
    try {
      addResult('Testing AI connection...');
      const response = await aiService.testConnection();
      if (response.success) {
        addResult(`✅ Connection successful: ${response.data}`);
      } else {
        addResult(`❌ Connection failed: ${response.error}`);
      }
    } catch (error: any) {
      addResult(`❌ Error testing connection: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testRewrite = async () => {
    setLoading(true);
    try {
      addResult('Testing project rewrite...');
      const response = await aiService.rewriteProjectDetails(
        rewriteTest.input,
        'Test Project'
      );
      if (response.success && response.data) {
        addResult('✅ Rewrite successful!');
        setRewriteTest(prev => ({ ...prev, output: response.data || '' }));
      } else {
        addResult(`❌ Rewrite failed: ${response.error}`);
      }
    } catch (error: any) {
      addResult(`❌ Error during rewrite: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testPortfolioGeneration = async () => {
    setLoading(true);
    try {
      addResult('Testing portfolio generation...');
      const response = await aiService.createPortfolioFromText(
        portfolioTest.input,
        ['React', 'Node.js', 'MongoDB', 'Python'],
        ['Developer', 'Designer', 'Project Manager']
      );
      if (response.success && response.data) {
        addResult('✅ Portfolio generation successful!');
        const parsed = JSON.parse(response.data);
        setPortfolioTest(prev => ({ 
          ...prev, 
          output: JSON.stringify(parsed, null, 2) 
        }));
      } else {
        addResult(`❌ Generation failed: ${response.error}`);
      }
    } catch (error: any) {
      addResult(`❌ Error during generation: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
    setRewriteTest(prev => ({ ...prev, output: '' }));
    setPortfolioTest(prev => ({ ...prev, output: '' }));
  };

  return (
    <CMSLayout>
      <div className="max-w-7xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Integration Test</h1>
          <p className="mt-2 text-gray-600">Test the Deepseek AI integration features</p>
        </div>

        {/* Test Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={testAIStatus}
              disabled={loading}
              className="btn btn-primary"
            >
              Test AI Status
            </button>
            <button
              onClick={testConnection}
              disabled={loading}
              className="btn btn-secondary"
            >
              Test Connection
            </button>
            <button
              onClick={testRewrite}
              disabled={loading}
              className="btn bg-purple-600 hover:bg-purple-700 text-white"
            >
              Test Rewrite
            </button>
            <button
              onClick={testPortfolioGeneration}
              disabled={loading}
              className="btn bg-green-600 hover:bg-green-700 text-white"
            >
              Test Portfolio Generation
            </button>
            <button
              onClick={clearResults}
              className="btn btn-ghost"
            >
              Clear Results
            </button>
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Test Results</h2>
          <div className="bg-gray-900 text-gray-100 p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm">
            {testResults.length === 0 ? (
              <p className="text-gray-500">No tests run yet. Click a test button above to start.</p>
            ) : (
              testResults.map((result, index) => (
                <div key={index} className="mb-1">{result}</div>
              ))
            )}
            {loading && (
              <div className="text-yellow-400 animate-pulse">Processing...</div>
            )}
          </div>
        </div>

        {/* Rewrite Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rewrite Test</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Input Text</label>
              <textarea
                value={rewriteTest.input}
                onChange={(e) => setRewriteTest(prev => ({ ...prev, input: e.target.value }))}
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">AI Output</label>
              <textarea
                value={rewriteTest.output}
                readOnly
                className="w-full h-32 px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                placeholder="AI rewritten content will appear here..."
              />
            </div>
          </div>
        </div>

        {/* Portfolio Generation Test */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Portfolio Generation Test</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Description</label>
              <textarea
                value={portfolioTest.input}
                onChange={(e) => setPortfolioTest(prev => ({ ...prev, input: e.target.value }))}
                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Generated Portfolio JSON</label>
              <textarea
                value={portfolioTest.output}
                readOnly
                className="w-full h-48 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-xs"
                placeholder="Generated portfolio data will appear here..."
              />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Test Instructions</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Click "Test AI Status" to check if the AI service is properly configured</li>
            <li>• Click "Test Connection" to verify the Deepseek API connection</li>
            <li>• Click "Test Rewrite" to test the project details rewriting feature</li>
            <li>• Click "Test Portfolio Generation" to test AI-powered portfolio creation</li>
            <li>• Check the console for detailed error messages if tests fail</li>
          </ul>
        </div>
      </div>
    </CMSLayout>
  );
};

export default AITest;
