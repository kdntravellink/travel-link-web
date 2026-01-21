import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MessageSquare, ThumbsUp, Eye, Plus, Search, Filter, UserPlus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

interface ForumPost {
  id: number;
  user_id: number;
  title: string;
  content: string;
  category: string;
  tags: string[];
  photos: string[];
  likes_count: number;
  comments_count: number;
  views_count: number;
  pinned: boolean;
  created_at: string;
  user?: {
    full_name: string;
    profile_photo: string;
  };
}

const CATEGORIES = [
  'All',
  'Trip Planning',
  'Recommendations',
  'Travel Stories',
  'Tips & Advice',
  'Photography',
  'Budget Travel',
  'Solo Travel',
  'Family Travel',
  'Adventure',
  'Culture',
  'Food & Dining',
  'Transportation',
  'Accommodation',
  'Safety',
  'General Discussion'
];

export default function Forum() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ['forum-posts', selectedCategory],
    queryFn: async () => {
      const params: any = { limit: 50 };
      if (selectedCategory !== 'All') {
        params.category = selectedCategory;
      }
      const response = await api.get('/forum/posts', { params });
      return response.data as ForumPost[];
    },
  });

  // Filter posts by search query
  const filteredPosts = posts.filter(post =>
    searchQuery === '' ||
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Sort: pinned first, then by creation date
  const sortedPosts = [...filteredPosts].sort((a, b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <MessageSquare className="w-8 h-8 text-blue-500" />
            <h1 className="text-3xl font-bold">Community Forum</h1>
          </div>
          <p className="text-gray-600">
            Connect with fellow travelers, share experiences, and get advice
          </p>
        </div>
        {user ? (
          <button
            onClick={() => navigate('/forum/new')}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Post
          </button>
        ) : (
          <Link
            to="/register"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            <UserPlus className="w-5 h-5" />
            Sign Up to Post
          </Link>
        )}
      </div>

      {/* Call-to-Action Banner for Non-Logged-In Users */}
      {!user && (
        <div className="mb-6 bg-gradient-to-r from-blue-500 to-cyan-600 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
                <UserPlus className="w-6 h-6" />
                Join the Conversation!
              </h2>
              <p className="text-blue-50 mb-3">
                Create an account to share your travel stories, ask questions, get tips from experienced travelers, 
                and help others plan their perfect trip. Join our friendly community today!
              </p>
              <div className="flex gap-3">
                <Link
                  to="/register"
                  className="px-6 py-2 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors"
                >
                  Sign Up Free
                </Link>
                <Link
                  to="/login"
                  className="px-6 py-2 bg-blue-700 text-white font-semibold rounded-lg hover:bg-blue-800 transition-colors border border-blue-400"
                >
                  Login
                </Link>
              </div>
            </div>
            <div className="hidden lg:block ml-6">
              <MessageSquare className="w-24 h-24 text-blue-200 opacity-50" />
            </div>
          </div>
        </div>
      )}

      {/* Search and Filter */}
      <div className="mb-6 space-y-4">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search posts, tags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-gray-500 flex-shrink-0" />
          {CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-colors ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* Posts List */}
      <div className="space-y-4">
        {sortedPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>No posts found</p>
            <button
              onClick={() => navigate('/forum/new')}
              className="mt-4 text-blue-500 hover:text-blue-600"
            >
              Be the first to post!
            </button>
          </div>
        ) : (
          sortedPosts.map((post) => (
            <div
              key={post.id}
              onClick={() => navigate(`/forum/${post.id}`)}
              className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer p-6 ${
                post.pinned ? 'border-2 border-blue-500' : ''
              }`}
            >
              {/* Pinned Badge */}
              {post.pinned && (
                <div className="mb-3">
                  <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                    📌 Pinned
                  </span>
                </div>
              )}

              {/* Post Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {post.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span className="font-medium">
                      {post.user?.full_name || 'Anonymous'}
                    </span>
                    <span>•</span>
                    <span>{new Date(post.created_at).toLocaleDateString()}</span>
                    <span>•</span>
                    <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                      {post.category}
                    </span>
                  </div>
                </div>
              </div>

              {/* Content Preview */}
              <p className="text-gray-600 line-clamp-2 mb-4">
                {post.content}
              </p>

              {/* Tags */}
              {post.tags && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {post.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{post.likes_count}</span>
                </div>
                <div className="flex items-center gap-1">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments_count} comments</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  <span>{post.views_count} views</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
