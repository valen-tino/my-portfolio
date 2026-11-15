import React, { useState, useEffect, useRef } from 'react';
import CMSLayout from '../components/CMSLayout';
import { CMSStorage, AboutData } from '../apiStorage';
import WYSIWYGEditor from '../components/WYSIWYGEditor';
import { formatPublicDescription } from '../../utils/contentMigration';

const ALLOWED_IMAGE_EXTENSIONS = /\.(png|jpe?g|gif|webp|svg)$/i;
const MAX_PROFILE_IMAGE_BYTES = 10 * 1024 * 1024;

const DEFAULT_ABOUT_FIELDS: AboutData = {
  description: '',
  imageURL: '',
  name: 'Valentino Jehaut',
  fullName: 'Valentino Yudhistira Jehaut',
  location: 'Bali, Indonesia',
  email: 'valentinojehaut@gmail.com',
  heroHeadline: 'I design and build digital products 💻📱.',
  heroSubheadline: 'I turn ideas into useful digital products through design and development.',
  yearsExperience: '4+',
  yearsExperienceLabel: 'Years of experience',
  selectedProjectsLabel: 'Selected projects',
  degreesCount: '02',
  degreesLabel: 'Bachelor’s degrees',
  workProcessSubtitle:
    'I combine design thinking with spec-driven development—from research and prototyping through structured engineering, automated testing, and iterative delivery.',
  resumeSummary:
    'Bali-based web developer and UI/UX designer. React, TypeScript, WordPress, and Figma.',
  contactHeading: 'Tell me about your project',
  contactSubtext: 'Send me your project details or ask a question. I will reply by email.',
  footerCtaHeading: 'Let’s build something thoughtful together.',
  footerBio:
    'UI/UX designer & full-stack product developer crafting fast, accessible web experiences.',
};

const AboutManagement: React.FC = () => {
  const [aboutData, setAboutData] = useState<AboutData>(DEFAULT_ABOUT_FIELDS);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [imageUploading, setImageUploading] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const [cvUploading, setCvUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const data = await CMSStorage.getAbout();
        setAboutData({ ...DEFAULT_ABOUT_FIELDS, ...data });
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

  const extractUploadErrorMessage = (error: unknown, fallback: string): string => {
    if (error && typeof error === 'object') {
      const errObj = error as {
        response?: { data?: { message?: string; error?: { message?: string } } };
        message?: string;
      };
      const cloudinaryMsg = errObj.response?.data?.error?.message;
      const apiMsg = errObj.response?.data?.message;
      if (cloudinaryMsg) return cloudinaryMsg;
      if (apiMsg) return apiMsg;
      if (errObj.message) return errObj.message;
    }
    return fallback;
  };

  const processProfileImageFile = async (file: File) => {
    const isImageType = Boolean(file.type && file.type.startsWith('image/'));
    if (!isImageType && !ALLOWED_IMAGE_EXTENSIONS.test(file.name)) {
      setMessage({
        type: 'error',
        text: 'Please select a valid image file (PNG, JPG, GIF, WebP, or SVG).'
      });
      return;
    }

    if (file.size > MAX_PROFILE_IMAGE_BYTES) {
      setMessage({
        type: 'error',
        text: 'Profile image exceeds 10MB limit.'
      });
      return;
    }

    setImageUploading(true);
    setMessage({ type: '', text: '' });
    try {
      const uploadResult = await CMSStorage.uploadProfileImage(file);

      setAboutData(prev => ({
        ...prev,
        imageURL: uploadResult.imageURL,
        imageCloudinaryId: uploadResult.imageCloudinaryId
      }));

      setMessage({
        type: 'success',
        text: 'Profile image uploaded! Click "Save Changes" below to publish it.'
      });
    } catch (error) {
      console.error('Image upload error:', error);
      setMessage({
        type: 'error',
        text: extractUploadErrorMessage(error, 'Failed to upload image. Please try again.')
      });
    } finally {
      setImageUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await processProfileImageFile(file);
    }
  };

  const handleImageDragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!imageUploading) {
      setIsDraggingImage(true);
    }
  };

  const handleImageDragLeave = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
  };

  const handleImageDrop = async (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingImage(false);
    if (imageUploading) return;

    const file = e.dataTransfer?.files?.[0];
    if (file) {
      await processProfileImageFile(file);
    }
  };

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const file = input.files?.[0];
    if (file) {
      if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
        setMessage({ type: 'error', text: 'Please select a valid PDF file for your CV.' });
        input.value = '';
        return;
      }
      if (file.size > 15 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'CV file exceeds 15MB limit.' });
        input.value = '';
        return;
      }

      setCvUploading(true);
      try {
        const uploadResult = await CMSStorage.uploadCV(file);
        setAboutData(prev => ({
          ...prev,
          cvURL: uploadResult.cvURL,
          cvCloudinaryId: uploadResult.cvCloudinaryId
        }));
        setMessage({
          type: 'success',
          text: 'CV uploaded successfully! Remember to click "Save Changes" to apply.'
        });
      } catch (error) {
        console.error('CV upload error:', error);
        setMessage({
          type: 'error',
          text: extractUploadErrorMessage(error, 'Failed to upload CV. Please try again.')
        });
      } finally {
        setCvUploading(false);
        input.value = '';
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
      <div className="container mx-auto max-w-6xl p-4 space-y-6 text-gray-900">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">About Me Management</h1>
            <p className="text-gray-600 mt-2">Update your personal description and profile image.</p>
          </div>
        </div>

        {/* Form */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Message */}
            {message.text && (
              <div
                role="status"
                className={`p-4 rounded-lg border flex items-center gap-3 ${
                  message.type === 'success'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                    d={message.type === 'success' ? 
                      "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" :
                      "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                    } 
                  />
                </svg>
                <span className="text-sm font-medium">{message.text}</span>
              </div>
            )}

            {/* Current Profile Image */}
            {aboutData.imageURL && (
              <div className="space-y-2">
                <span className="block text-sm font-medium text-gray-800">Current Profile Image</span>
                <div className="flex items-center space-x-4">
                  <img
                    src={aboutData.imageURL}
                    alt="Profile"
                    className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  />
                  <div>
                    <p className="text-sm text-gray-700">Current image uploaded</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Upload a new image below, then click &quot;Save Changes&quot; to replace this one
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Image Upload */}
            <div className="space-y-2">
              <label htmlFor="image-upload" className="block text-sm font-medium text-gray-800">
                Profile Image
              </label>
              <label
                htmlFor="image-upload"
                data-testid="profile-image-dropzone"
                onDragEnter={handleImageDragOver}
                onDragOver={handleImageDragOver}
                onDragLeave={handleImageDragLeave}
                onDrop={handleImageDrop}
                className={`flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
                  isDraggingImage
                    ? 'border-blue-500 bg-blue-50/70'
                    : 'border-gray-300 bg-gray-50/60 hover:border-blue-400 hover:bg-gray-50'
                } ${imageUploading ? 'opacity-60 cursor-wait' : ''}`}
              >
                <div className="space-y-1 text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <div className="flex justify-center text-sm text-gray-600">
                    <span className="font-medium text-blue-600 hover:text-blue-700">
                      {imageUploading ? 'Uploading profile image...' : 'Upload a file'}
                    </span>
                    <input
                      id="image-upload"
                      data-testid="profile-image-input"
                      name="image-upload"
                      type="file"
                      className="sr-only"
                      accept="image/*"
                      onChange={handleImageUpload}
                      ref={fileInputRef}
                      disabled={imageUploading}
                    />
                    <p className="pl-1 text-gray-600">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF, WebP up to 10MB</p>
                </div>
              </label>
            </div>

            {/* CV / Resume Management */}
            <div className="bg-gray-50/70 rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="cv-upload-input" className="text-sm font-semibold text-gray-800">
                  Curriculum Vitae (Download CV Link)
                </label>
                {aboutData.cvURL && (
                  <a
                    href={aboutData.cvURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                  >
                    📄 View Current CV ↗
                  </a>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <input
                  type="file"
                  accept="application/pdf"
                  id="cv-upload-input"
                  data-testid="cv-upload-input"
                  onChange={handleCVUpload}
                  disabled={cvUploading}
                  className="file-input file-input-bordered file-input-sm bg-white text-gray-800 border-gray-300 w-full max-w-xs text-xs"
                />
                {cvUploading && <span className="loading loading-spinner loading-sm text-blue-600"></span>}
                {aboutData.cvURL && aboutData.cvURL !== '/Valen-Jehaut.pdf' && (
                  <button
                    type="button"
                    onClick={() => setAboutData(prev => ({ ...prev, cvURL: '/Valen-Jehaut.pdf', cvCloudinaryId: null }))}
                    className="px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100"
                  >
                    Reset to Local Default
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">
                Accepted format: PDF (up to 15MB). Uploading hosts your document on Cloudinary and updates your staged &quot;Download CV&quot; link until saved.
              </p>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-800">
                About Description
              </label>
              <WYSIWYGEditor
                value={aboutData.description}
                onChange={(html) => setAboutData(prev => ({ ...prev, description: html }))}
                placeholder="Write your personal story..."
                enableSectionPresets={false}
                enableGalleries={false}
                minHeight="280px"
              />
              <p className="text-xs text-gray-500">
                Write a compelling description about yourself, your experience, and what you do.
                This will be displayed on your portfolio&apos;s About section.
              </p>
            </div>

            {/* Identity & Contact Settings */}
            <div className="bg-gray-50/70 rounded-xl border border-gray-200 p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Identity &amp; Contact Details</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Displayed in Hero greeting, Portrait caption, Résumé modal, Contact section, and Footer.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="about-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Display Name
                  </label>
                  <input
                    id="about-name"
                    type="text"
                    value={aboutData.name ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Valentino Jehaut"
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="about-full-name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name (Résumé &amp; Alt Text)
                  </label>
                  <input
                    id="about-full-name"
                    type="text"
                    value={aboutData.fullName ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, fullName: e.target.value }))}
                    placeholder="Valentino Yudhistira Jehaut"
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="about-location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    id="about-location"
                    type="text"
                    value={aboutData.location ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Bali, Indonesia"
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="about-email" className="block text-sm font-medium text-gray-700 mb-1">
                    Primary Contact Email
                  </label>
                  <input
                    id="about-email"
                    type="email"
                    value={aboutData.email ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="valentinojehaut@gmail.com"
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Hero & Work Process Copy */}
            <div className="bg-gray-50/70 rounded-xl border border-gray-200 p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Hero &amp; Work Process Copy</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Controls the Hero headline, subheadline, and Work Process section subtitle.
                </p>
              </div>
              <div className="space-y-4">
                <div>
                  <label htmlFor="about-hero-headline" className="block text-sm font-medium text-gray-700 mb-1">
                    Hero Headline
                  </label>
                  <input
                    id="about-hero-headline"
                    type="text"
                    value={aboutData.heroHeadline ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, heroHeadline: e.target.value }))}
                    placeholder="I design and build digital products 💻📱."
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="about-hero-subheadline" className="block text-sm font-medium text-gray-700 mb-1">
                    Hero Subheadline
                  </label>
                  <input
                    id="about-hero-subheadline"
                    type="text"
                    value={aboutData.heroSubheadline ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, heroSubheadline: e.target.value }))}
                    placeholder="I turn ideas into useful digital products through design and development."
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="about-process-subtitle" className="block text-sm font-medium text-gray-700 mb-1">
                    Work Process Subtitle
                  </label>
                  <textarea
                    id="about-process-subtitle"
                    rows={2}
                    value={aboutData.workProcessSubtitle ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, workProcessSubtitle: e.target.value }))}
                    placeholder="I combine design thinking with spec-driven development..."
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* About Stats & Résumé Summary */}
            <div className="bg-gray-50/70 rounded-xl border border-gray-200 p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">About Stats &amp; Résumé Summary</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Metrics shown in the About section and introductory summary inside the Résumé popup.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label htmlFor="about-years-exp" className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience Value
                  </label>
                  <input
                    id="about-years-exp"
                    type="text"
                    value={aboutData.yearsExperience ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, yearsExperience: e.target.value }))}
                    placeholder="4+"
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="about-years-label" className="block text-sm font-medium text-gray-700 mb-1">
                    Years of Experience Label
                  </label>
                  <input
                    id="about-years-label"
                    type="text"
                    value={aboutData.yearsExperienceLabel ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, yearsExperienceLabel: e.target.value }))}
                    placeholder="Years of experience"
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="about-projects-label" className="block text-sm font-medium text-gray-700 mb-1">
                    Selected Projects Stat Label
                  </label>
                  <input
                    id="about-projects-label"
                    type="text"
                    value={aboutData.selectedProjectsLabel ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, selectedProjectsLabel: e.target.value }))}
                    placeholder="Selected projects"
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="about-degrees-count" className="block text-sm font-medium text-gray-700 mb-1">
                    Degrees Count Value
                  </label>
                  <input
                    id="about-degrees-count"
                    type="text"
                    value={aboutData.degreesCount ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, degreesCount: e.target.value }))}
                    placeholder="02"
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="about-degrees-label" className="block text-sm font-medium text-gray-700 mb-1">
                    Degrees Stat Label
                  </label>
                  <input
                    id="about-degrees-label"
                    type="text"
                    value={aboutData.degreesLabel ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, degreesLabel: e.target.value }))}
                    placeholder="Bachelor’s degrees"
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="about-resume-summary" className="block text-sm font-medium text-gray-700 mb-1">
                  Résumé Modal Summary
                </label>
                <textarea
                  id="about-resume-summary"
                  rows={2}
                  value={aboutData.resumeSummary ?? ''}
                  onChange={(e) => setAboutData(prev => ({ ...prev, resumeSummary: e.target.value }))}
                  placeholder="Bali-based web developer and UI/UX designer. React, TypeScript, WordPress, and Figma."
                  className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Contact Section & Footer Copy */}
            <div className="bg-gray-50/70 rounded-xl border border-gray-200 p-5 space-y-4">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Contact Section &amp; Footer Copy</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Headings and supporting copy displayed in the Contact section and Footer banner.
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="about-contact-heading" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Section Heading
                  </label>
                  <input
                    id="about-contact-heading"
                    type="text"
                    value={aboutData.contactHeading ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, contactHeading: e.target.value }))}
                    placeholder="Tell me about your project"
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="about-contact-subtext" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Section Subtext
                  </label>
                  <input
                    id="about-contact-subtext"
                    type="text"
                    value={aboutData.contactSubtext ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, contactSubtext: e.target.value }))}
                    placeholder="Send me your project details or ask a question. I will reply by email."
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="about-footer-cta" className="block text-sm font-medium text-gray-700 mb-1">
                    Footer CTA Heading
                  </label>
                  <input
                    id="about-footer-cta"
                    type="text"
                    value={aboutData.footerCtaHeading ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, footerCtaHeading: e.target.value }))}
                    placeholder="Let’s build something thoughtful together."
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="about-footer-bio" className="block text-sm font-medium text-gray-700 mb-1">
                    Footer Bio
                  </label>
                  <input
                    id="about-footer-bio"
                    type="text"
                    value={aboutData.footerBio ?? ''}
                    onChange={(e) => setAboutData(prev => ({ ...prev, footerBio: e.target.value }))}
                    placeholder="UI/UX designer & full-stack product developer crafting fast, accessible web experiences."
                    className="w-full px-3 py-2 bg-white text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end mt-6 gap-3">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                onClick={async () => {
                  try {
                    const data = await CMSStorage.getAbout();
                    setAboutData({ ...DEFAULT_ABOUT_FIELDS, ...data });
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
                disabled={loading || imageUploading || cvUploading}
                className={`btn btn-primary text-white ${loading ? 'loading' : ''}`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Preview</h2>
            <div className="flex flex-col lg:flex-row gap-6">
              {aboutData.imageURL && (
                <div className="flex-shrink-0">
                  <img
                    src={aboutData.imageURL}
                    alt="Profile Preview"
                    className="w-48 h-48 rounded-2xl object-cover shadow-lg border border-gray-200"
                  />
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">About Me</h3>
                <div
                  className="wysiwyg-content text-gray-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: formatPublicDescription(aboutData.description) }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CMSLayout>
  );
};

export default AboutManagement;
