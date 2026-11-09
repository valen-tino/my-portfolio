import React from 'react';
import { Link } from 'react-router-dom';
import { BlogItem } from '../../cms/apiStorage';

interface BlogCardProps {
  item: BlogItem;
}

const CATEGORY_STYLES: Record<string, string> = {
  Event: 'badge-secondary',
  News: 'badge-info',
  Tech: 'badge-accent',
  Personal: 'badge-primary'
};

const BlogCard: React.FC<BlogCardProps> = ({ item }) => {
  const detailLink = `/blogs/${item.slug || item.id || item._id}`;
  const categoryBadgeClass = CATEGORY_STYLES[item.category] || 'badge-neutral';

  return (
    <article
      className="card bg-base-100 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] w-full max-w-sm mx-auto h-full flex flex-col justify-between relative border border-base-200 overflow-hidden"
      data-testid={`blog-card-${item.id || item._id}`}
    >
      {/* Pinned Badge */}
      {item.isPinned && (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-500 text-white shadow-lg backdrop-blur-md">
            📌 Pinned
          </span>
        </div>
      )}

      {/* Category Pill */}
      <div className="absolute top-3 right-3 z-10">
        <span className={`badge ${categoryBadgeClass} badge-sm font-semibold shadow-md`}>
          {item.category}
        </span>
      </div>

      {/* Cover Image */}
      <figure className="aspect-video overflow-hidden flex-shrink-0 bg-base-300 relative group">
        <Link to={detailLink} className="w-full h-full block">
          {item.imageURL ? (
            <img
              src={item.imageURL}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-indigo-950 to-slate-900 text-base-content/40 text-sm">
              📰 {item.category} Article
            </div>
          )}
        </Link>
      </figure>

      {/* Body */}
      <div className="card-body p-5 sm:p-6 flex-1 flex flex-col justify-between text-left">
        <div>
          {/* Metadata: Date, Read Time, Location */}
          <div className="flex items-center gap-2 text-xs text-base-content/60 mb-2 flex-wrap">
            {item.date && <span>📅 {item.date}</span>}
            {item.readTime && <span>• ⏱️ {item.readTime}</span>}
            {item.location && <span>• 📍 {item.location}</span>}
          </div>

          {/* Title */}
          <h3 className="card-title text-lg font-bold text-base-content hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug">
            <Link to={detailLink}>{item.title}</Link>
          </h3>

          {/* Excerpt */}
          <p className="text-sm text-base-content/70 line-clamp-3 mb-4 leading-relaxed">
            {item.desc}
          </p>
        </div>

        <div>
          {/* Tags */}
          {item.tags && item.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {item.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="badge badge-outline badge-xs text-base-content/70">
                  #{tag}
                </span>
              ))}
              {item.tags.length > 3 && (
                <span className="badge badge-ghost badge-xs text-base-content/50">
                  +{item.tags.length - 3}
                </span>
              )}
            </div>
          )}

          {/* Footer Action */}
          <div className="card-actions justify-between items-center pt-2 border-t border-base-200">
            <span className="text-xs text-base-content/50 font-medium">
              By {item.author || 'Valentino Jehaut'}
            </span>
            <Link
              to={detailLink}
              className="btn btn-primary btn-sm gap-1 hover:gap-2 transition-all font-semibold"
            >
              Read Article →
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogCard;

