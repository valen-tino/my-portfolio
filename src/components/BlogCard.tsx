import { useState } from 'react';
import type { BlogPost } from '../types/portfolio';
import { formatFullDate, toISODateAttribute } from '../utils/dateFormat';
import { ArrowRightIcon } from './Icons';
import { ImagePlaceholder } from './ImagePlaceholder';
import { ProgressiveImageFrame } from './Skeleton';

interface BlogCardProps {
  post: BlogPost;
  onSelectPost: (post: BlogPost) => void;
  aspectRatio?: string;
}

export function BlogCard({ post, onSelectPost, aspectRatio = 'aspect-[16/10]' }: BlogCardProps) {
  const [imgError, setImgError] = useState(false);
  const [imgLoaded, setImgLoaded] = useState(false);
  const href = `/blogs/${post.slug || post.id}`;
  const showImage = Boolean(post.imageURL) && !imgError;

  return (
    <article data-gsap="card-interactive" className="group min-w-0">
      <a
        href={href}
        onClick={(event) => {
          if (
            !event.metaKey &&
            !event.ctrlKey &&
            !event.shiftKey &&
            !event.altKey &&
            event.button === 0
          ) {
            event.preventDefault();
            onSelectPost(post);
          }
        }}
        className="block"
        aria-label={`Read article: ${post.title}`}
      >
        <div className="relative">
          {showImage ? (
            <ProgressiveImageFrame aspectRatio={aspectRatio} loaded={imgLoaded}>
              <img
                src={post.imageURL}
                alt={post.title}
                width={800}
                height={500}
                loading="lazy"
                decoding="async"
                onLoad={() => setImgLoaded(true)}
                onError={() => {
                  setImgLoaded(true);
                  setImgError(true);
                }}
                className="relative z-[1] h-full w-full object-cover"
              />
            </ProgressiveImageFrame>
          ) : (
            <ImagePlaceholder label={post.title} aspectRatio={aspectRatio} />
          )}
          <span className="card-hover-cta absolute bottom-3 right-3 flex min-h-12 items-center gap-5 rounded-full bg-white px-4 py-3 text-sm font-medium text-ink group-hover:bg-brand group-hover:text-white group-focus-within:bg-brand group-focus-within:text-white">
            Read article <ArrowRightIcon className="size-4" />
          </span>
        </div>
        <div className="mt-5 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-600">
          <span>{post.category}</span>
          <span aria-hidden="true">/</span>
          <time dateTime={toISODateAttribute(post.date)}>{formatFullDate(post.date)}</time>
          <span aria-hidden="true">/</span>
          <span>{post.readTime}</span>
        </div>
        <h3 className="mt-3 max-w-[34ch] text-xl font-medium leading-snug tracking-[-0.035em] group-hover:text-brand sm:text-2xl">
          {post.title}
        </h3>
      </a>
    </article>
  );
}
