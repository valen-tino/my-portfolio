import React from 'react';
import Navbar from '../sections/nav/nav';
import Footer from '../sections/footer/footer';
import BlogSection from '../sections/blog/blog';

const BlogPage: React.FC = () => {
  return (
    <div className="App min-h-screen flex flex-col bg-base-100">
      <Navbar />

      <main className="flex-1 section pt-28 pb-24">
        <div className="section-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <BlogSection showArchiveLink={false} />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default BlogPage;

