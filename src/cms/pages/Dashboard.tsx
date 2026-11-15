import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CMSStorage } from '../apiStorage';
import CMSLayout from '../components/CMSLayout';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    techTools: 0,
    education: 0,
    portfolios: 0,
    contactEntries: 0,
    blogs: 0,
    experiences: 0,
    workProcesses: 0,
    roles: 0,
    socialLinks: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [
          techToolsRes,
          educationRes,
          portfoliosRes,
          contactsRes,
          blogsRes,
          experiencesRes,
          workProcessRes,
          rolesRes,
          socialLinksRes,
        ] = await Promise.allSettled([
          typeof CMSStorage.getTechTools === 'function' ? CMSStorage.getTechTools() : Promise.resolve([]),
          typeof CMSStorage.getEducation === 'function' ? CMSStorage.getEducation() : Promise.resolve([]),
          typeof CMSStorage.getPortfolios === 'function' ? CMSStorage.getPortfolios() : Promise.resolve([]),
          typeof CMSStorage.getContacts === 'function' ? CMSStorage.getContacts() : Promise.resolve([]),
          typeof CMSStorage.getBlogs === 'function' ? CMSStorage.getBlogs() : Promise.resolve([]),
          typeof CMSStorage.getExperiences === 'function' ? CMSStorage.getExperiences() : Promise.resolve([]),
          typeof CMSStorage.getWorkProcesses === 'function' ? CMSStorage.getWorkProcesses() : Promise.resolve([]),
          typeof CMSStorage.getRoles === 'function' ? CMSStorage.getRoles() : Promise.resolve([]),
          typeof CMSStorage.getSocialLinks === 'function' ? CMSStorage.getSocialLinks() : Promise.resolve([]),
        ]);

        const countOf = (res: PromiseSettledResult<any[]>) =>
          res.status === 'fulfilled' && Array.isArray(res.value) ? res.value.length : 0;

        setStats({
          techTools: countOf(techToolsRes),
          education: countOf(educationRes),
          portfolios: countOf(portfoliosRes),
          contactEntries: countOf(contactsRes),
          blogs: countOf(blogsRes),
          experiences: countOf(experiencesRes),
          workProcesses: countOf(workProcessRes),
          roles: countOf(rolesRes),
          socialLinks: countOf(socialLinksRes),
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      }
    };
    fetchStats();
  }, []);

  const quickActions = [
    {
      title: 'Add Portfolio',
      description: 'Showcase your latest case studies and projects',
      link: '/cms/portfolios',
      color: 'bg-purple-500',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    {
      title: 'Manage Blogs & News',
      description: 'Write and publish journal articles and event updates',
      link: '/cms/blogs',
      color: 'bg-sky-500',
      icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'
    },
    {
      title: 'Manage Experiences',
      description: 'Update work history, roles, and company logos',
      link: '/cms/experiences',
      color: 'bg-indigo-500',
      icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z'
    },
    {
      title: 'Manage Work Process',
      description: 'Edit the design and spec-driven engineering steps',
      link: '/cms/work-process',
      color: 'bg-cyan-600',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
    },
    {
      title: 'Edit About Me & Copy',
      description: 'Update bio, portrait, CV PDF, Hero, Stats, and Footer copy',
      link: '/cms/about',
      color: 'bg-blue-500',
      icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
    },
    {
      title: 'Manage Social Links',
      description: 'Configure social & contact links shown on site',
      link: '/cms/social-links',
      color: 'bg-teal-600',
      icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
    },
    {
      title: 'Manage Tech Tools',
      description: 'Add or edit your technology skills',
      link: '/cms/tech-tools',
      color: 'bg-green-500',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
    },
    {
      title: 'Update Education',
      description: 'Manage degrees, courses, and certificates',
      link: '/cms/education',
      color: 'bg-yellow-500',
      icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'
    }
  ];

  const statCards = [
    {
      title: 'Portfolio Items',
      value: stats.portfolios,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    {
      title: 'Blogs & News',
      value: stats.blogs,
      color: 'text-sky-600',
      bgColor: 'bg-sky-100',
      icon: 'M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z'
    },
    {
      title: 'Experiences',
      value: stats.experiences,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H6a2 2 0 01-2-2V8a2 2 0 012-2V6z'
    },
    {
      title: 'Work Process Steps',
      value: stats.workProcesses,
      color: 'text-cyan-700',
      bgColor: 'bg-cyan-100',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4'
    },
    {
      title: 'Tech Tools',
      value: stats.techTools,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z'
    },
    {
      title: 'Education Items',
      value: stats.education,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      icon: 'M12 14l9-5-9-5-9 5 9 5z M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z'
    },
    {
      title: 'Social Links',
      value: stats.socialLinks,
      color: 'text-teal-700',
      bgColor: 'bg-teal-100',
      icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1'
    },
    {
      title: 'Contact Entries',
      value: stats.contactEntries,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      icon: 'M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z'
    }
  ];

  return (
    <CMSLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-2 text-gray-600">Welcome back! Here&apos;s an overview of your portfolio content.</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat) => (
            <div key={stat.title} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
              <div className="flex items-center">
                <div className={`flex-shrink-0 p-3 rounded-lg ${stat.bgColor}`}>
                  <svg className={`w-6 h-6 ${stat.color}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action) => (
              <Link
                key={action.title}
                to={action.link}
                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow p-6 group"
              >
                <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={action.icon} />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
                <p className="text-gray-600 text-sm">{action.description}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Activity</h2>
            <div className="space-y-3">
              {stats.contactEntries > 0 ? (
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-green-400 rounded-full mr-3"></div>
                  <span>You have {stats.contactEntries} contact entries to review</span>
                </div>
              ) : (
                <div className="flex items-center text-sm text-gray-600">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-3"></div>
                  <span>No new contact entries</span>
                </div>
              )}
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                <span>Portfolio contains {stats.portfolios} projects &amp; {stats.blogs} journal articles</span>
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                <span>
                  {stats.experiences} experiences, {stats.workProcesses} process steps, {stats.roles} roles, {stats.socialLinks} social links &amp; {stats.techTools} tech tools configured
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Tips */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">Tips</h3>
          <ul className="text-blue-800 text-sm space-y-1">
            <li>• Keep your portfolio projects updated with latest work</li>
            <li>• Manage Hero, Stats, Work Process subtitle, and Footer copy in About Me Content</li>
            <li>• Keep your Social Links and Experiences updated so Contact and Résumé stay current</li>
            <li>• Update your tech tools list when learning new technologies</li>
          </ul>
        </div>
      </div>
    </CMSLayout>
  );
};

export default Dashboard;
