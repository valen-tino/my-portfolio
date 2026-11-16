import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthService } from '../auth';
import { CMSStatusBanner } from '../components/CMSStatusBanner';
import { parseCMSError } from '../utils/errorUtils';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect if already authenticated
    if (AuthService.isAuthenticated()) {
      navigate('/cms/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (typeof AuthService.loginWithDetails === 'function') {
        const result = await AuthService.loginWithDetails(email, password);
        if (result.success) {
          navigate('/cms/dashboard');
        } else {
          setError(result.error || 'Invalid email or password');
        }
      } else {
        const success = await AuthService.login(email, password);
        if (success) {
          navigate('/cms/dashboard');
        } else {
          setError('Invalid email or password');
        }
      }
    } catch (err) {
      const parsed = parseCMSError(err, 'An error occurred during login');
      setError(parsed.message);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      data-theme="light"
      style={{ colorScheme: 'light' }}
      className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 text-gray-900 flex items-center justify-center p-4"
    >
      <div className="max-w-md w-full">
        <div className="text-center mb-8">          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Valen's Portfolio CMS</h1>
          <p className="text-gray-600">Sign in to manage your portfolio content</p>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <CMSStatusBanner
                  message={{ type: 'error', text: error }}
                  onDismiss={() => setError('')}
                />
              )}

              <div className="form-control">
                <label htmlFor="cms-login-email" className="label">
                  <span className="label-text font-medium text-gray-700">Email Address</span>
                </label>
                <input
                  id="cms-login-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  autoCorrect="off"
                  autoCapitalize="none"
                  spellCheck={false}
                  placeholder="Enter your email"
                  className="input input-bordered bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-blue-500 w-full"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-control">
                <label htmlFor="cms-login-password" className="label">
                  <span className="label-text font-medium text-gray-700">Password</span>
                </label>
                <input
                  id="cms-login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="input input-bordered bg-white text-gray-900 placeholder:text-gray-400 border-gray-300 focus:border-blue-500 w-full"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <button
                type="submit"
                className={`btn btn-info w-full text-white ${loading ? 'loading' : ''}`}
                disabled={loading}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </button>
            </form>
          </div>
        </div>

        <div className="text-center mt-8">
          <a 
            href="/" 
            className="text-blue-600 hover:text-blue-800 transition-colors text-sm font-medium"
          >
            ← Back to Portfolio
          </a>
        </div>
      </div>
    </div>
  );
};

export default Login;
