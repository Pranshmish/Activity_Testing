"use client";

import React, { useState, useEffect, useRef } from "react";
import ActivityCard from "@/Components/ActivityCard";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, useAnimation } from "framer-motion";
import axios from "axios";

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

interface ActivitySectionProps {
  maxVideos?: number;
  className?: string;
}

const ActivitySection: React.FC<ActivitySectionProps> = ({
  maxVideos = 4,
  className = "",
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

  const cardsPerView = 4;
  const scroll = 3;

  const fetchSocialActivityData = async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await axios.get(
        "https://server-mmmut-xyz-our-activity-5uzu5ohwb.vercel.app/api/v1/social-activity"
      );

      const data = res.data;

      let videoData: YouTubeVideo[] = [];
      let instagramData: InstagramPost[] = [];

      if (Array.isArray(data.youtubeData)) {
        videoData = data.youtubeData.map((v: any) => ({
          ...v,
          thumbnail:
            v.thumbnail?.replace("http://", "https://") ||
            `https://img.youtube.com/vi/${v.videoId}/hqdefault.jpg`,
        }));
      }

      if (Array.isArray(data.instagramData)) {
        instagramData = data.instagramData;
      }

      const limitedVideos = videoData.slice(0, maxVideos);
      const limitedInstagram = instagramData.slice(0, 4);

      setVideos(limitedVideos);
      setInstagramPosts(limitedInstagram);

      const combined = [
        ...limitedVideos.map((v) => ({ ...v, type: "youtube" })),
        ...limitedInstagram.map((p) => ({ ...p, type: "instagram" })),
      ];

      setAllActivities(combined);
      setRetryCount(0);
    } catch (err: any) {
      setError(err?.message || "Something went wrong");
      setVideos([]);
      setInstagramPosts([]);
      setAllActivities([]);
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount((prev) => prev + 1);
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

  const maxScrollIndex = Math.max(0, allActivities.length - scroll);
  const canScrollLeft = currentIndex > 0;
  const canScrollRight = currentIndex < maxScrollIndex;

  const scrollLeft = () => {
    if (!canScrollLeft) return;
    const newIndex = Math.max(currentIndex - scroll, 0);
    setCurrentIndex(newIndex);
    controls.start({
      x: `-${newIndex * (100 / cardsPerView)}%`,
      transition: { duration: 0.5, ease: "easeOut" },
    });
  };

  const scrollRight = () => {
    if (!canScrollRight) return;
    const newIndex = Math.min(currentIndex + scroll, maxScrollIndex);
    setCurrentIndex(newIndex);
    controls.start({
      x: `-${newIndex * (100 / cardsPerView)}%`,
      transition: { duration: 0.5, ease: "easeOut" },
    });
  };

  const cardWidthPercentage = 100 / cardsPerView;

  if (loading) {
    return (
      <section
        className={`py-12 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${className}`}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
            Recent Activity Feed
          </h2>
          <p className="text-slate-400 text-lg mb-6">
            YouTube & Instagram Highlights
          </p>
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500" />
            <span className="ml-4 text-slate-400">Loading activities...</span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section
        className={`py-12 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${className}`}
      >
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
            Recent Activity Feed
          </h2>
          <p className="text-slate-400 text-lg mb-4">
            YouTube & Instagram Highlights
          </p>
          <div className="text-red-400 text-lg mb-2">Unable to load data</div>
          <p className="text-slate-500 text-sm mb-4">{error}</p>
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
      </section>
    );
  }

  return (
    <section
      className={`py-12 px-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 ${className}`}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-600 mb-2">
            Recent Activity Feed
          </h2>
          <p className="text-slate-400 text-lg">
            YouTube & Instagram Highlights
          </p>
        </div>

        {allActivities.length > 0 ? (
          <>
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
                      {activity.type === "youtube" ? (
                        <ActivityCard video={activity} />
                      ) : (
                        <ActivityCard post={activity} />
                      )}
                    </div>
                  ))}
                </motion.div>
              </div>
            </div>
          </>
        ) : (
          <div className="text-center py-12 text-slate-400 text-lg">
            No activity found. Check back later.
          </div>
        )}
      </div>
    </section>
  );
};

export default ActivitySection;

