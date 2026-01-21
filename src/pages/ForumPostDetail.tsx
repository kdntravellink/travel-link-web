import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, useNavigate } from 'react-router-dom';
import { MessageSquare, ThumbsUp, Eye, Send, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
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
  created_at: string;
  user?: {
    full_name: string;
    profile_photo: string;
  };
}

interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  content: string;
  likes_count: number;
  created_at: string;
  user?: {
    full_name: string;
    profile_photo: string;
  };
}

export default function ForumPostDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [commentContent, setCommentContent] = useState('');

  // Fetch post
  const { data: post, isLoading: postLoading } = useQuery({
    queryKey: ['forum-post', id],
    queryFn: async () => {
      const response = await api.get(`/forum/posts/${id}`);
      return response.data as ForumPost;
    },
  });

  // Fetch comments
  const { data: comments = [], isLoading: commentsLoading } = useQuery({
    queryKey: ['forum-comments', id],
    queryFn: async () => {
      const response = await api.get(`/forum/posts/${id}/comments`);
      return response.data as Comment[];
    },
  });

  // Like post mutation
  const likeMutation = useMutation({
    mutationFn: async () => {
      await api.post(`/forum/posts/${id}/like`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-post', id] });
      toast.success('Post liked!');
    },
    onError: () => {
      toast.error('Failed to like post');
    },
  });

  // Add comment mutation
  const commentMutation = useMutation({
    mutationFn: async (content: string) => {
      await api.post(`/forum/posts/${id}/comments`, { content });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', id] });
      queryClient.invalidateQueries({ queryKey: ['forum-post', id] });
      setCommentContent('');
      toast.success('Comment added!');
    },
    onError: () => {
      toast.error('Failed to add comment');
    },
  });

  const handleSubmitComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      toast.error('Please login to comment');
      navigate('/login');
      return;
    }
    if (commentContent.trim()) {
      commentMutation.mutate(commentContent);
    }
  };

  if (postLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Post not found</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/forum')}
        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="w-5 h-5" />
        Back to Forum
      </button>

      {/* Post Card */}
      <div className="bg-white rounded-lg shadow-md p-8 mb-6">
        {/* Post Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-3">
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
              {post.category}
            </span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{post.title}</h1>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="font-medium">{post.user?.full_name || 'Anonymous'}</span>
            <span>•</span>
            <span>{new Date(post.created_at).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Post Content */}
        <div className="prose max-w-none mb-6">
          <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Photos */}
        {post.photos && post.photos.length > 0 && (
          <div className="mb-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {post.photos.map((photo, index) => (
                <img
                  key={photo}
                  src={photo.startsWith('http') ? photo : `http://localhost:3001${photo}`}
                  alt={`Post photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                  onClick={() => window.open(photo.startsWith('http') ? photo : `http://localhost:3001${photo}`, '_blank')}
                />
              ))}
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-6">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats and Actions */}
        <div className="flex items-center justify-between pt-6 border-t">
          <div className="flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{post.views_count} views</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageSquare className="w-4 h-4" />
              <span>{post.comments_count} comments</span>
            </div>
          </div>
          <button
            onClick={() => likeMutation.mutate()}
            disabled={!user}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
              user
                ? 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            <ThumbsUp className="w-4 h-4" />
            <span>{post.likes_count}</span>
          </button>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6">
          Comments ({comments.length})
        </h2>

        {/* Add Comment Form */}
        {user ? (
          <form onSubmit={handleSubmitComment} className="mb-8">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="Share your thoughts..."
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
            <div className="mt-3 flex justify-end">
              <button
                type="submit"
                disabled={!commentContent.trim() || commentMutation.isPending}
                className="flex items-center gap-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-4 h-4" />
                Post Comment
              </button>
            </div>
          </form>
        ) : (
          <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
            <p className="text-gray-600">
              <button
                onClick={() => navigate('/login')}
                className="text-blue-500 hover:text-blue-600 font-medium"
              >
                Login
              </button>{' '}
              to join the discussion
            </p>
          </div>
        )}

        {/* Comments List */}
        {commentsLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-4 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3 mb-3">
                  <span className="font-medium text-gray-900">
                    {comment.user?.full_name || 'Anonymous'}
                  </span>
                  <span className="text-sm text-gray-500">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-gray-700 whitespace-pre-wrap mb-3">
                  {comment.content}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <ThumbsUp className="w-4 h-4" />
                  <span>{comment.likes_count}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
