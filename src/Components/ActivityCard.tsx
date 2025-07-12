import React from 'react';
import Image from 'next/image';
import { ExternalLink } from 'lucide-react';

interface YouTubeVideo {
  videoId: string;
  title: string;
  description: string;
  thumbnail: string;
  publishedAt: string;
  url: string;
  views: string;
  likes: string;
}

interface InstagramPost {
  id: string;
  caption: string;
  media_url: string;
  thumbnail_url: string | null;
  timestamp: string;
  permalink: string;
  like_count: number;
  media_type: string;
}

interface ActivityCardProps {
  video?: YouTubeVideo;
  post?: InstagramPost;
}

const ActivityCard: React.FC<ActivityCardProps> = ({ video, post }) => {
  const truncate = (text: string, len = 60) => {
    if (!text) return '';
    return text.length <= len ? text : text.substring(0, len) + '...';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatViews = (views: string) => {
    const numViews = parseInt(views);
    if (numViews >= 1000000) return `${(numViews / 1000000).toFixed(1)}M`;
    if (numViews >= 1000) return `${(numViews / 1000).toFixed(1)}K`;
    return views;
  };

  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02] border border-slate-700/50 group flex flex-col h-full">
      {/* Thumbnail */}
      <div
        className="relative w-full overflow-hidden cursor-pointer"
        style={{ aspectRatio: '16/9', minHeight: '200px' }}
        onClick={() => {
          if (post) window.open(post.permalink, '_blank', 'noopener,noreferrer');
        }}
      >
        {video && (
          <Image
            src={video.thumbnail}
            alt={video.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        )}
        {post && (
          <img
            src={post.thumbnail_url || post.media_url}
            alt="Instagram post"
            className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />

        {video && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="bg-red-600 rounded-full p-3 shadow-lg">
              <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                <path d="M8 5v14l11-7z" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col space-y-3">
        <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2">
          {video ? truncate(video.title, 60) : truncate(post?.caption || '', 80)}
        </h3>

        {/* Stats */}
        <div className="flex items-center justify-between text-xs text-slate-400">
          {video ? (
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path
                    fillRule="evenodd"
                    d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10z"
                    clipRule="evenodd"
                  />
                </svg>
                {formatViews(video.views)}
              </span>
              <span className="flex items-center">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
                </svg>
                {video.likes}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-3 text-slate-400">
              <span>❤️ {post?.like_count}</span>
              <span className="text-pink-400">{post?.media_type}</span>
            </div>
          )}
          <span>{formatDate(video?.publishedAt || post?.timestamp || '')}</span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div
              className={`px-2 py-1 rounded-md text-xs font-medium 
              ${video ? 'bg-red-600 text-white' : 'bg-pink-500 text-white'}`}
            >
              {video
                ? 'YouTube'
                : post?.media_type === 'VIDEO'
                ? '📹 Instagram'
                : '📸 Instagram'}
            </div>
          </div>
          <a
            href={video?.url || post?.permalink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-400 hover:text-white transition-colors duration-200"
            aria-label="Open post in new tab"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default ActivityCard;
