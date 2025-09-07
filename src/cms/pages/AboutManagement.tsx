import React, { useState, useEffect, useRef } from 'react';
import CMSLayout from '../components/CMSLayout';
import { CMSStorage, AboutData } from '../apiStorage';

const AboutManagement: React.FC = () => {
  const [aboutData, setAboutData] = useState<AboutData>({
    description: '',
    imageURL: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imageUploading, setImageUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const data = await CMSStorage.getAbout();
        setAboutData(data);
      } catch (error) {
        console.error('Error fetching about data:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load about data. Please refresh the page.'
        });
      }
    };
    
    fetchAboutData();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageUploading(true);
      try {
        const uploadResult = await CMSStorage.uploadProfileImage(file);
        
        setAboutData(prev => ({
          ...prev,
          imageURL: uploadResult.imageURL,
          imageCloudinaryId: uploadResult.imageCloudinaryId
        }));
        
        setMessage({
          type: 'success',
          text: `Image uploaded successfully!`
        });
      } catch (error) {
        console.error('Image upload error:', error);
        setMessage({
          type: 'error',
          text: 'Failed to upload image. Please try again.'
        });
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await CMSStorage.updateAbout(aboutData);
      setMessage({
        type: 'success',
        text: 'About section updated successfully!'
      });
    } catch (error) {
      console.error('Update error:', error);
      setMessage({
        type: 'error',
        text: 'Failed to update about section. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <CMSLayout>
      <div className="container mx-auto max-w-6xl p-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">About Me Management</h1>
            <p className="text-base-content/70 mt-2">Update your personal description and profile image.</p>
          </div>
        </div>

        {/* Form */}
        <div className="card bg-base-100 shadow-xl">
          <form onSubmit={handleSubmit} className="card-body space-y-6">
            {/* Message */}
            {message.text && (
              <div className={`alert ${message.type === 'success' ? 'alert-success' : 'alert-error'}`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={message.type === 'success' ? 
                      "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" :
                      message.type === 'error' ?
                      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" :
                      "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    } 
                  />
                </svg>
                <span>{message.text}</span>
              </div>
            )}

            {/* Current Profile Image */}
            {aboutData.imageURL && (
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Current Profile Image</span>
                </label>
                <div className="flex items-center space-x-4">
                  <img
                    src={aboutData.imageURL}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-base-300"
                  />
                  <div>
                    <p className="text-sm text-base-content/70">Current image uploaded</p>
                    <p className="text-xs text-base-content/50 mt-1">
                      Upload a new image to replace this one
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">Profile Image</span>
              </label>
              <div className={`flex justify-center px-6 pt-5 pb-6 border-2 border-base-300 border-dashed rounded-lg ${imageUploading ? 'opacity-50' : ''}`}>
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex text-sm text-base-content/70">
                    <label htmlFor="image-upload" className="relative cursor-pointer rounded-md font-medium text-primary hover:text-primary/80 focus-within:outline-none">
                      <span>{imageUploading ? 'Uploading...' : 'Upload a file'}</span>
                      <input
                        id="image-upload"
                        name="image-upload"
                        type="file"
                        className="sr-only"
                        accept="image/*"
                        onChange={handleImageUpload}
                        ref={fileInputRef}
                        disabled={imageUploading}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="form-control">
              <label className="label">
                <span className="label-text font-medium">About Description</span>
              </label>
              <textarea
                rows={12}
                className="textarea textarea-bordered w-full"
                placeholder="Tell your story..."
                value={aboutData.description}
                onChange={(e) => setAboutData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
              <label className="label">
                <span className="label-text-alt">
                  Write a compelling description about yourself, your experience, and what you do. 
                  This will be displayed on your portfolio's About section.
                </span>
              </label>
            </div>

            {/* Submit Button */}
            <div className="card-actions justify-end mt-6 gap-3">
              <button
                type="button"
                className="btn btn-ghost"
                onClick={async () => {
                  try {
                    const data = await CMSStorage.getAbout();
                    setAboutData(data);
                    setMessage({ type: '', text: '' });
                  } catch (error) {
                    console.error('Reset error:', error);
                    setMessage({
                      type: 'error',
                      text: 'Failed to reset data. Please refresh the page.'
                    });
                  }
                }}
              >
                Reset
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary ${loading ? 'loading' : ''}`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="card bg-base-100 shadow-xl">
          <div className="card-body">
            <h2 className="card-title text-xl mb-4">Preview</h2>
            <div className="flex flex-col lg:flex-row gap-6">
              {aboutData.imageURL && (
                <div className="flex-shrink-0">
                  <img
                    src={aboutData.imageURL}
                    alt="Profile Preview"
                    className="w-48 h-48 rounded-2xl object-cover shadow-lg"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold mb-4">About Me</h3>
                <div className="prose max-w-none">
                  {aboutData.description.split('\n').map((paragraph, index) => (
                    paragraph.trim() && (
                      <p key={index} className="text-base-content/80 leading-relaxed mb-4">
                        {paragraph}
                      </p>
                    )
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CMSLayout>
  );
};

export default AboutManagement;
