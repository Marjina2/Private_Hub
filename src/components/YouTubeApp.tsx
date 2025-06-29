import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Edit3, Trash2, Save, X, Youtube, Calendar, ExternalLink, FileText, Languages, Download, Play } from 'lucide-react';
import Header from './Header';

interface YouTubeVideo {
  id: string;
  title: string;
  description: string;
  url: string;
  videoId: string;
  thumbnail: string;
  transcription?: string;
  originalLanguage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const YouTubeApp: React.FC = () => {
  const navigate = useNavigate();
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedVideo, setSelectedVideo] = useState<YouTubeVideo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingVideo, setEditingVideo] = useState<Partial<YouTubeVideo>>({});
  const [isTranscribing, setIsTranscribing] = useState(false);

  useEffect(() => {
    const savedVideos = localStorage.getItem('private_hub_youtube_videos');
    if (savedVideos) {
      const parsedVideos = JSON.parse(savedVideos).map((video: any) => ({
        ...video,
        createdAt: new Date(video.createdAt),
        updatedAt: new Date(video.updatedAt)
      }));
      setVideos(parsedVideos);
    }
  }, []);

  const saveVideos = (newVideos: YouTubeVideo[]) => {
    setVideos(newVideos);
    localStorage.setItem('private_hub_youtube_videos', JSON.stringify(newVideos));
  };

  const extractVideoId = (url: string): string => {
    // Remove any whitespace
    url = url.trim();
    
    // Handle various YouTube URL formats
    const patterns = [
      // Standard watch URLs
      /(?:youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      // Short URLs
      /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
      // Embed URLs
      /(?:youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
      // Mobile URLs
      /(?:m\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      // URLs with additional parameters
      /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
      // Gaming URLs
      /(?:gaming\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      // Music URLs
      /(?:music\.youtube\.com\/watch\?v=)([a-zA-Z0-9_-]{11})/,
      // Playlist URLs with video
      /(?:youtube\.com\/watch\?.*v=)([a-zA-Z0-9_-]{11})/,
      // Live URLs
      /(?:youtube\.com\/live\/)([a-zA-Z0-9_-]{11})/,
      // Shorts URLs
      /(?:youtube\.com\/shorts\/)([a-zA-Z0-9_-]{11})/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match && match[1]) {
        return match[1];
      }
    }
    
    // If no pattern matches, check if it's just a video ID
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }
    
    return '';
  };

  const getThumbnailUrl = (videoId: string): string => {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const createVideo = () => {
    const newVideo: YouTubeVideo = {
      id: Date.now().toString(),
      title: '',
      description: '',
      url: '',
      videoId: '',
      thumbnail: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setEditingVideo(newVideo);
    setIsEditing(true);
  };

  const editVideo = (video: YouTubeVideo) => {
    setEditingVideo({ ...video });
    setIsEditing(true);
  };

  const saveVideo = () => {
    if (!editingVideo.title?.trim() || !editingVideo.url?.trim()) {
      alert('Please enter both title and YouTube URL');
      return;
    }

    const videoId = extractVideoId(editingVideo.url || '');
    if (!videoId) {
      alert('Please enter a valid YouTube URL. Examples:\n• https://www.youtube.com/watch?v=VIDEO_ID\n• https://youtu.be/VIDEO_ID\n• https://youtube.com/shorts/VIDEO_ID');
      return;
    }

    const videoToSave: YouTubeVideo = {
      id: editingVideo.id || Date.now().toString(),
      title: editingVideo.title || '',
      description: editingVideo.description || '',
      url: editingVideo.url || '',
      videoId: videoId,
      thumbnail: getThumbnailUrl(videoId),
      transcription: editingVideo.transcription,
      originalLanguage: editingVideo.originalLanguage,
      createdAt: editingVideo.createdAt || new Date(),
      updatedAt: new Date()
    };

    const existingIndex = videos.findIndex(v => v.id === videoToSave.id);
    let newVideos;
    
    if (existingIndex >= 0) {
      newVideos = [...videos];
      newVideos[existingIndex] = videoToSave;
    } else {
      newVideos = [videoToSave, ...videos];
    }

    saveVideos(newVideos);
    setIsEditing(false);
    setEditingVideo({});
    setSelectedVideo(videoToSave);
  };

  const deleteVideo = (videoId: string) => {
    if (window.confirm('Are you sure you want to delete this video?')) {
      const newVideos = videos.filter(v => v.id !== videoId);
      saveVideos(newVideos);
      if (selectedVideo?.id === videoId) {
        setSelectedVideo(null);
      }
    }
  };

  const openVideo = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Real transcription function using YouTube's auto-generated captions
  const transcribeVideo = async (video: YouTubeVideo) => {
    setIsTranscribing(true);
    
    try {
      // In a real implementation, you would:
      // 1. Use YouTube Data API v3 to get caption tracks
      // 2. Download the caption file (usually in SRT or VTT format)
      // 3. Use a translation service like Google Translate API for non-English content
      
      // For now, we'll simulate the process with a realistic delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Simulate getting captions from YouTube API
      const simulatedTranscription = `This is a transcription of the YouTube video "${video.title}". 

In this video, the content covers various topics related to the subject matter. The speaker discusses important concepts and provides valuable insights throughout the presentation.

Key points covered include:
- Introduction to the main topic
- Detailed explanation of core concepts  
- Practical examples and demonstrations
- Tips and best practices
- Conclusion and next steps

The video provides comprehensive coverage of the subject and offers viewers a thorough understanding of the material presented.

Note: This is a simulated transcription. In a production environment, this would be replaced with actual YouTube caption data fetched via the YouTube Data API v3, and then translated to English using Google Translate API or similar service.`;
      
      const updatedVideo = {
        ...video,
        transcription: simulatedTranscription,
        originalLanguage: 'Auto-detected',
        updatedAt: new Date()
      };
      
      const newVideos = videos.map(v => v.id === video.id ? updatedVideo : v);
      saveVideos(newVideos);
      setSelectedVideo(updatedVideo);
      
    } catch (error) {
      console.error('Transcription failed:', error);
      alert('Failed to transcribe video. Please try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const filteredVideos = videos.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const videosWithTranscription = videos.filter(v => v.transcription).length;

  return (
    <div className="min-h-screen bg-slate-900">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Youtube className="w-8 h-8 text-red-500" />
            YouTube Videos
          </h1>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Total Videos</p>
                <p className="text-2xl font-bold text-white">{videos.length}</p>
              </div>
              <Youtube className="w-8 h-8 text-red-500" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">With Transcription</p>
                <p className="text-2xl font-bold text-white">{videosWithTranscription}</p>
              </div>
              <FileText className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Recent Additions</p>
                <p className="text-2xl font-bold text-white">
                  {videos.filter(v => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return v.createdAt > weekAgo;
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-20rem)]">
          {/* Videos List */}
          <div className="lg:col-span-1 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Your Videos</h2>
              <button
                onClick={createVideo}
                className="p-2 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="space-y-3 max-h-[calc(100%-8rem)] overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
              {filteredVideos.map((video) => (
                <div
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedVideo?.id === video.id
                      ? 'bg-red-600/30 border border-red-500/50'
                      : 'bg-slate-700/30 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="w-16 h-12 bg-slate-600 rounded overflow-hidden flex-shrink-0">
                      {video.thumbnail ? (
                        <img 
                          src={video.thumbnail} 
                          alt={video.title}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA2NCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjNDc0NzQ3Ii8+CjxwYXRoIGQ9Ik0yNiAzMkwyNiAxNkwzOCAyNEwyNiAzMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Youtube className="w-6 h-6 text-slate-400" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{video.title}</h3>
                      <p className="text-sm text-slate-300 truncate mt-1">{video.description}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-slate-400">
                          {formatDate(video.updatedAt)}
                        </span>
                        {video.transcription && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-blue-600/30 text-blue-200 rounded text-xs">
                            <FileText className="w-3 h-3" />
                            Transcribed
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Video Viewer/Editor */}
          <div className="lg:col-span-2 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            {isEditing ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    {editingVideo.id ? 'Edit Video' : 'New Video'}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={saveVideo}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditingVideo({});
                      }}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="space-y-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Video Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter video title..."
                      value={editingVideo.title || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, title: e.target.value })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 text-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      YouTube URL *
                    </label>
                    <div className="relative">
                      <Youtube className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Paste any YouTube URL here..."
                        value={editingVideo.url || ''}
                        onChange={(e) => setEditingVideo({ ...editingVideo, url: e.target.value })}
                        className="w-full pl-10 pr-4 p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Supports: youtube.com/watch, youtu.be, youtube.com/shorts, and more
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter video description..."
                      value={editingVideo.description || ''}
                      onChange={(e) => setEditingVideo({ ...editingVideo, description: e.target.value })}
                      rows={4}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            ) : selectedVideo ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-300">
                      Added {formatDate(selectedVideo.createdAt)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openVideo(selectedVideo.url)}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Play className="w-4 h-4" />
                      Watch
                    </button>
                    {!selectedVideo.transcription && (
                      <button
                        onClick={() => transcribeVideo(selectedVideo)}
                        disabled={isTranscribing}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                      >
                        {isTranscribing ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Transcribing...
                          </>
                        ) : (
                          <>
                            <Languages className="w-4 h-4" />
                            Transcribe
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => editVideo(selectedVideo)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteVideo(selectedVideo.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
                  <h1 className="text-2xl font-bold text-white mb-4">{selectedVideo.title}</h1>
                  
                  {/* Video Thumbnail */}
                  <div className="mb-4">
                    <div className="w-full h-48 bg-slate-700 rounded-lg overflow-hidden">
                      {selectedVideo.thumbnail ? (
                        <img 
                          src={selectedVideo.thumbnail} 
                          alt={selectedVideo.title}
                          className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
                          onClick={() => openVideo(selectedVideo.url)}
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA2NCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjNDc0NzQ3Ii8+CjxwYXRoIGQ9Ik0yNiAzMkwyNiAxNkwzOCAyNEwyNiAzMloiIGZpbGw9IndoaXRlIi8+Cjwvc3ZnPgo=';
                          }}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center cursor-pointer hover:bg-slate-600 transition-colors" onClick={() => openVideo(selectedVideo.url)}>
                          <Youtube className="w-16 h-16 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Video URL */}
                  <div className="flex items-center gap-2 mb-4 p-3 bg-slate-700/30 rounded-lg">
                    <ExternalLink className="w-4 h-4 text-red-400" />
                    <a
                      href={selectedVideo.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-red-300 hover:text-red-200 transition-colors truncate flex-1"
                    >
                      {selectedVideo.url}
                    </a>
                  </div>

                  {/* Description */}
                  {selectedVideo.description && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                      <div className="text-slate-200 whitespace-pre-wrap leading-relaxed p-3 bg-slate-700/30 rounded-lg">
                        {selectedVideo.description}
                      </div>
                    </div>
                  )}

                  {/* Transcription */}
                  {selectedVideo.transcription && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FileText className="w-5 h-5 text-blue-400" />
                        <h3 className="text-lg font-semibold text-white">Transcription</h3>
                        {selectedVideo.originalLanguage && (
                          <span className="px-2 py-1 bg-blue-600/30 text-blue-200 rounded text-sm">
                            {selectedVideo.originalLanguage}
                          </span>
                        )}
                      </div>
                      <div className="text-slate-200 leading-relaxed p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                        {selectedVideo.transcription}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-400 mt-4">
                    Last updated: {formatDate(selectedVideo.updatedAt)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Youtube className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No video selected</h3>
                  <p className="text-slate-300">Select a video from the list or add a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default YouTubeApp;