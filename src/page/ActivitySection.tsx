'use client';
import React, { useState, useEffect, useRef } from 'react';
import ActivityCard from '@/Components/ActivityCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, useAnimation } from 'framer-motion';
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
interface ActivitySectionProps {
  maxVideos?: number;
  className?: string;
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
const InstagramCard: React.FC<{ post: InstagramPost }> = ({ post }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  const truncateText = (text: string, maxLength: number) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  const getDisplayImage = () => {
    if (post.thumbnail_url) return post.thumbnail_url;
    if (post.media_type === 'VIDEO') return post.media_url;
    return post.media_url;
  };
  const handleThumbnailClick = () => {
    window.open(post.permalink, '_blank', 'noopener,noreferrer');
  };
  return (
    <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-slate-700 overflow-hidden h-full flex flex-col">
      <div className="relative cursor-pointer" onClick={handleThumbnailClick}>
        <img
          src={getDisplayImage()}
          alt="Instagram post"
          className="w-full h-48 object-cover hover:opacity-90 transition-opacity duration-200"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            target.nextElementSibling?.classList.remove('hidden');
          }}
        />
        <div className="hidden w-full h-48 bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
          <span className="text-white text-lg font-bold">Instagram</span>
        </div>
        <div className="absolute top-3 right-3 bg-pink-500 text-white px-2 py-1 rounded-full text-xs font-medium">
          {post.media_type === 'VIDEO' ? '📹' : '📸'} Instagram
        </div>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <p className="text-slate-300 text-sm mb-3 line-clamp-3 leading-relaxed flex-1">
          {truncateText(post.caption, 100)}
        </p>
        <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
          <span>{formatDate(post.timestamp)}</span>
          <div className="flex items-center gap-3">
            <span>❤️ {post.like_count}</span>
            <span className="text-pink-400">{post.media_type}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
const ActivitySection: React.FC<ActivitySectionProps> = ({
  maxVideos = 4,
  className = ''
}) => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [instagramPosts, setInstagramPosts] = useState<InstagramPost[]>([]);
  const [allActivities, setAllActivities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [retryCount, setRetryCount] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const [cardsPerView, setCardsPerView] = useState(4);
  useEffect(() => {
    const updateCardsPerView = () => {
      const width = window.innerWidth;
      if (width >= 1200) {
        setCardsPerView(4);
      } else if (width >= 900) {
        setCardsPerView(3);
      } else if (width >= 600) {
        setCardsPerView(2);
      } else {
        setCardsPerView(1);
      }
      setCurrentIndex(0);
    };
    updateCardsPerView();
    window.addEventListener('resize', updateCardsPerView);
    return () => window.removeEventListener('resize', updateCardsPerView);
  }, []);
  const fetchSocialActivityData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('https://server-mmmut-xyz-our-activity-5uzu5ohwb.vercel.app/api/v1/social-activity', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      let videoData: YouTubeVideo[] = [];
      let instagramData: InstagramPost[] = [];
      if (data.youtubeData && Array.isArray(data.youtubeData)) {
        videoData = data.youtubeData.map((video: any) => ({
          ...video,
          thumbnail: video.thumbnail?.replace('http://', 'https://') || `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`
        }));
      }
      if (data.instagramData && Array.isArray(data.instagramData)) {
        instagramData = data.instagramData;
      }
      const limitedVideos = videoData.slice(0, maxVideos);
      setVideos(limitedVideos);
      const limitedInstagram = instagramData.slice(0, 4);
      setInstagramPosts(limitedInstagram);
      const combinedActivities = [
        ...limitedVideos.map(video => ({ ...video, type: 'youtube' })),
        ...limitedInstagram.map(post => ({ ...post, type: 'instagram' }))
      ];
      setAllActivities(combinedActivities);
      setRetryCount(0);
    } catch (err) {
      console.error('Error fetching social activity data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
      setVideos([]);
      setInstagramPosts([]);
      setAllActivities([]);
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          fetchSocialActivityData();
        }, 2000 * (retryCount + 1));
      }
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchSocialActivityData();
  }, [maxVideos]);
  const maxScrollIndex = Math.max(0, allActivities.length - cardsPerView);
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < maxScrollIndex;
  const scrollLeft = () => {
    if (canScrollLeft) {
      const newIndex = currentIndex - cardsPerView;
      setCurrentIndex(Math.max(newIndex, 0));
      controls.start({
        x: `-${Math.max(newIndex, 0) * (100 / cardsPerView)}%`,
        transition: { duration: 0.5, ease: "easeOut" }
      });
    }
  };
  const scrollRight = () => {
    if (canScrollRight) {
      const newIndex = currentIndex + cardsPerView;
      setCurrentIndex(Math.min(newIndex, maxScrollIndex));
      controls.start({
        x: `-${Math.min(newIndex, maxScrollIndex) * (100 / cardsPerView)}%`,
        transition: { duration: 0.5, ease: "easeOut" }
      });
    }
  };
  const cardWidthPercentage = 100 / cardsPerView;
  if (loading) {
    return (
      <section className={`py-12 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
              Recent Activity Feed
            </h2>
            <p className="text-slate-400 text-lg mb-4">
              YouTube & Instagram Highlights
            </p>
          </div>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            <span className="ml-4 text-slate-400">Loading activities...</span>
          </div>
        </div>
      </section>
    );
  }
  if (error) {
    return (
      <section className={`py-12 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${className}`}>
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
              Recent Activity Feed
            </h2>
            <p className="text-slate-400 text-lg mb-4">
              YouTube & Instagram Highlights
            </p>
          </div>
          <div className="text-center py-12">
            <div className="text-red-400 text-lg mb-4">
              Unable to load latest activities
            </div>
            <div className="text-slate-500 text-sm mb-4">
              {error}
            </div>
            <button
              onClick={() => {
                setRetryCount(0);
                fetchSocialActivityData();
              }}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
            >
              Retry {retryCount > 0 && `(${retryCount}/3)`}
            </button>
          </div>
        </div>
      </section>
    );
  }
  return (
    <section className={`py-12 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${className}`}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
            Recent Activity Feed
          </h2>
          <p className="text-slate-400 text-lg mb-4">
            YouTube & Instagram Highlights
          </p>
        </div>
        {allActivities.length > 0 ? (
          <>
            <div className="text-center mb-6">
              <p className="text-slate-500 text-sm">
                Showing {videos.length} YouTube videos + {instagramPosts.length} Instagram posts
              </p>
            </div>
            <div className="relative">
              {allActivities.length > cardsPerView && (
                <>
                  <button
                    onClick={scrollLeft}
                    disabled={!canScrollLeft}
                    className="absolute left-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 bg-slate-700/90 hover:bg-slate-600/90 disabled:bg-slate-800/50 disabled:text-slate-600 text-white rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={scrollRight}
                    disabled={!canScrollRight}
                    className="absolute right-0 top-1/2 -translate-y-1/2 z-10 flex items-center justify-center w-10 h-10 bg-slate-700/90 hover:bg-slate-600/90 disabled:bg-slate-800/50 disabled:text-slate-600 text-white rounded-full transition-all duration-200 backdrop-blur-sm shadow-lg disabled:cursor-not-allowed"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
              <div className="overflow-hidden px-8 sm:px-12">
                <motion.div
                  ref={scrollContainerRef}
                  className="flex gap-4 sm:gap-6"
                  animate={controls}
                  initial={false}
                >
                  {allActivities.map((activity) => (
                    <div
                      key={activity.videoId || activity.id}
                      className="flex-shrink-0"
                      style={{ width: `${cardWidthPercentage}%` }}
                    >
                      {activity.type === 'youtube' ? (
                        <ActivityCard video={activity} />
                      ) : (
                        <InstagramCard post={activity} />
                      )}
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
            {allActivities.length > cardsPerView && (
              <div className="flex items-center justify-center gap-2 mt-8">
                {[...Array(Math.ceil(allActivities.length / cardsPerView))].map((_, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setCurrentIndex(index * cardsPerView);
                      controls.start({
                        x: `-${index * 100}%`,
                        transition: { duration: 0.5, ease: "easeOut" }
                      });
                    }}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === Math.floor(currentIndex / cardsPerView)
                        ? 'bg-blue-500 w-8'
                        : 'bg-slate-600 hover:bg-slate-500 w-2'
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <div className="text-slate-400 text-lg">
              No activity found. Check back later for updates!
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
export default ActivitySection;