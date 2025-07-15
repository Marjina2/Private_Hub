import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Search, Edit3, Trash2, Save, X, Image as ImageIcon, 
  Calendar, FolderPlus, Folder, ChevronDown, ChevronRight, Upload, 
  Download, Eye, EyeOff, Lock, Unlock, Grid3x3, List, Filter,
  Star, StarOff, Share2, Copy, ZoomIn, ZoomOut, RotateCw, Move,
  Settings, Shield, AlertTriangle, Check
} from 'lucide-react';
import Header from './Header';

interface PhotoGroup {
  id: string;
  name: string;
  color: string;
  isPrivate: boolean;
  password?: string;
  createdAt: Date;
}

interface Photo {
  id: string;
  title: string;
  description: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  dataUrl: string;
  groupId?: string;
  isPrivate: boolean;
  isFavorite: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PhotoGalleryApp: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [groups, setGroups] = useState<PhotoGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<Partial<Photo>>({});
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupPassword, setNewGroupPassword] = useState('');
  const [isNewGroupPrivate, setIsNewGroupPrivate] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'private' | 'public'>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [unlockedGroups, setUnlockedGroups] = useState<Set<string>>(new Set());
  const [groupPasswordInput, setGroupPasswordInput] = useState('');
  const [showPasswordPrompt, setShowPasswordPrompt] = useState<string | null>(null);

  const groupColors = [
    'from-red-500 to-red-600',
    'from-blue-500 to-blue-600',
    'from-green-500 to-green-600',
    'from-purple-500 to-purple-600',
    'from-yellow-500 to-yellow-600',
    'from-pink-500 to-pink-600',
    'from-indigo-500 to-indigo-600',
    'from-teal-500 to-teal-600'
  ];

  useEffect(() => {
    // Load photos and groups from localStorage with encryption
    const savedPhotos = localStorage.getItem('private_hub_photos');
    const savedGroups = localStorage.getItem('private_hub_photo_groups');
    
    if (savedPhotos) {
      try {
        const parsedPhotos = JSON.parse(atob(savedPhotos)).map((photo: any) => ({
          ...photo,
          createdAt: new Date(photo.createdAt),
          updatedAt: new Date(photo.updatedAt)
        }));
        setPhotos(parsedPhotos);
      } catch (error) {
        console.error('Failed to load photos:', error);
      }
    }

    if (savedGroups) {
      try {
        const parsedGroups = JSON.parse(atob(savedGroups)).map((group: any) => ({
          ...group,
          createdAt: new Date(group.createdAt)
        }));
        setGroups(parsedGroups);
        setExpandedGroups(new Set(parsedGroups.filter((g: PhotoGroup) => !g.isPrivate).map((g: PhotoGroup) => g.id)));
      } catch (error) {
        console.error('Failed to load groups:', error);
      }
    }
  }, []);

  const savePhotos = (newPhotos: Photo[]) => {
    setPhotos(newPhotos);
    // Encrypt data before storing
    localStorage.setItem(`private_hub_photos_${currentToken}`, btoa(JSON.stringify(newPhotos)));
  };

  const saveGroups = (newGroups: PhotoGroup[]) => {
    setGroups(newGroups);
    // Encrypt data before storing
    localStorage.setItem(`private_hub_photo_groups_${currentToken}`, btoa(JSON.stringify(newGroups)));
  };

  const createGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup: PhotoGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      color: groupColors[groups.length % groupColors.length],
      isPrivate: isNewGroupPrivate,
      password: isNewGroupPrivate ? btoa(newGroupPassword) : undefined,
      createdAt: new Date()
    };

    const newGroups = [...groups, newGroup];
    saveGroups(newGroups);
    
    if (!isNewGroupPrivate) {
      setExpandedGroups(prev => new Set([...prev, newGroup.id]));
    }
    
    setNewGroupName('');
    setNewGroupPassword('');
    setIsNewGroupPrivate(false);
    setIsCreatingGroup(false);
  };

  const unlockGroup = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (!group || !group.password) return;

    if (btoa(groupPasswordInput) === group.password) {
      setUnlockedGroups(prev => new Set([...prev, groupId]));
      setExpandedGroups(prev => new Set([...prev, groupId]));
      setShowPasswordPrompt(null);
      setGroupPasswordInput('');
    } else {
      alert('Incorrect password');
    }
  };

  const deleteGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group? All photos in this group will be moved to "No Group".')) {
      const updatedPhotos = photos.map(photo => 
        photo.groupId === groupId ? { ...photo, groupId: undefined } : photo
      );
      savePhotos(updatedPhotos);

      const newGroups = groups.filter(g => g.id !== groupId);
      saveGroups(newGroups);
      
      setExpandedGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
      
      setUnlockedGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const handleFileUpload = async (files: FileList) => {
    setIsUploading(true);
    setUploadProgress(0);

    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const maxSize = 10 * 1024 * 1024; // 10MB

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      
      if (!validTypes.includes(file.type)) {
        alert(`${file.name} is not a supported image format`);
        continue;
      }

      if (file.size > maxSize) {
        alert(`${file.name} is too large. Maximum size is 10MB`);
        continue;
      }

      try {
        const dataUrl = await fileToDataUrl(file);
        
        const newPhoto: Photo = {
          id: Date.now().toString() + i,
          title: file.name.split('.')[0],
          description: '',
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type,
          dataUrl: dataUrl,
          groupId: selectedGroupId || undefined,
          isPrivate: false,
          isFavorite: false,
          tags: [],
          createdAt: new Date(),
          updatedAt: new Date()
        };

        const newPhotos = [newPhoto, ...photos];
        savePhotos(newPhotos);
        
        setUploadProgress(((i + 1) / files.length) * 100);
      } catch (error) {
        console.error('Failed to upload file:', file.name, error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setIsUploading(false);
    setUploadProgress(0);
  };

  const fileToDataUrl = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const editPhoto = (photo: Photo) => {
    setEditingPhoto({ ...photo });
    setIsEditing(true);
  };

  const savePhoto = () => {
    if (!editingPhoto.title?.trim()) return;

    const photoToSave: Photo = {
      id: editingPhoto.id || Date.now().toString(),
      title: editingPhoto.title || '',
      description: editingPhoto.description || '',
      fileName: editingPhoto.fileName || '',
      fileSize: editingPhoto.fileSize || 0,
      mimeType: editingPhoto.mimeType || '',
      dataUrl: editingPhoto.dataUrl || '',
      groupId: editingPhoto.groupId,
      isPrivate: editingPhoto.isPrivate || false,
      isFavorite: editingPhoto.isFavorite || false,
      tags: editingPhoto.tags || [],
      createdAt: editingPhoto.createdAt || new Date(),
      updatedAt: new Date()
    };

    const existingIndex = photos.findIndex(p => p.id === photoToSave.id);
    let newPhotos;
    
    if (existingIndex >= 0) {
      newPhotos = [...photos];
      newPhotos[existingIndex] = photoToSave;
    } else {
      newPhotos = [photoToSave, ...photos];
    }

    savePhotos(newPhotos);
    setIsEditing(false);
    setEditingPhoto({});
    setSelectedPhoto(photoToSave);
  };

  const deletePhoto = (photoId: string) => {
    if (window.confirm('Are you sure you want to delete this photo?')) {
      const newPhotos = photos.filter(p => p.id !== photoId);
      savePhotos(newPhotos);
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto(null);
      }
    }
  };

  const toggleFavorite = (photoId: string) => {
    const newPhotos = photos.map(photo => {
      if (photo.id === photoId) {
        const updatedPhoto = { ...photo, isFavorite: !photo.isFavorite, updatedAt: new Date() };
        if (selectedPhoto?.id === photoId) {
          setSelectedPhoto(updatedPhoto);
        }
        return updatedPhoto;
      }
      return photo;
    });
    savePhotos(newPhotos);
  };

  const togglePrivate = (photoId: string) => {
    const newPhotos = photos.map(photo => {
      if (photo.id === photoId) {
        const updatedPhoto = { ...photo, isPrivate: !photo.isPrivate, updatedAt: new Date() };
        if (selectedPhoto?.id === photoId) {
          setSelectedPhoto(updatedPhoto);
        }
        return updatedPhoto;
      }
      return photo;
    });
    savePhotos(newPhotos);
  };

  const downloadPhoto = (photo: Photo) => {
    const link = document.createElement('a');
    link.href = photo.dataUrl;
    link.download = photo.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const toggleGroupExpanded = (groupId: string) => {
    const group = groups.find(g => g.id === groupId);
    if (group?.isPrivate && !unlockedGroups.has(groupId)) {
      setShowPasswordPrompt(groupId);
      return;
    }

    setExpandedGroups(prev => {
      const newSet = new Set(prev);
      if (newSet.has(groupId)) {
        newSet.delete(groupId);
      } else {
        newSet.add(groupId);
      }
      return newSet;
    });
  };

  const filteredPhotos = photos.filter(photo => {
    const matchesSearch = photo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         photo.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'favorites' && photo.isFavorite) ||
                         (filterBy === 'private' && photo.isPrivate) ||
                         (filterBy === 'public' && !photo.isPrivate);
    
    return matchesSearch && matchesFilter;
  });

  // Group photos by group
  const groupedPhotos = groups.reduce((acc, group) => {
    if (group.isPrivate && !unlockedGroups.has(group.id)) {
      acc[group.id] = [];
    } else {
      acc[group.id] = filteredPhotos.filter(photo => photo.groupId === group.id);
    }
    return acc;
  }, {} as Record<string, Photo[]>);

  const ungroupedPhotos = filteredPhotos.filter(photo => !photo.groupId);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const totalPhotos = photos.length;
  const favoritePhotos = photos.filter(p => p.isFavorite).length;
  const privatePhotos = photos.filter(p => p.isPrivate).length;

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
            <ImageIcon className="w-8 h-8 text-purple-400" />
            Photo Gallery
          </h1>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Total Photos</p>
                <p className="text-2xl font-bold text-white">{totalPhotos}</p>
              </div>
              <ImageIcon className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Favorites</p>
                <p className="text-2xl font-bold text-white">{favoritePhotos}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Private</p>
                <p className="text-2xl font-bold text-white">{privatePhotos}</p>
              </div>
              <Lock className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Groups</p>
                <p className="text-2xl font-bold text-white">{groups.length}</p>
              </div>
              <Folder className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-22rem)]">
          {/* Photos List */}
          <div className="lg:col-span-1 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Your Photos</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsCreatingGroup(true)}
                  className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                  title="Create Group"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                  title="Upload Photos"
                >
                  <Upload className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
            />

            {/* Upload Progress */}
            {isUploading && (
              <div className="mb-4 p-3 bg-green-600/20 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Upload className="w-4 h-4 text-green-400" />
                  <span className="text-green-200 text-sm">Uploading...</span>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Create Group Form */}
            {isCreatingGroup && (
              <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                <input
                  type="text"
                  placeholder="Enter group name..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="w-full p-2 bg-slate-600/50 border border-slate-500/50 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                />
                <div className="flex items-center gap-2 mb-2">
                  <input
                    type="checkbox"
                    id="isPrivate"
                    checked={isNewGroupPrivate}
                    onChange={(e) => setIsNewGroupPrivate(e.target.checked)}
                    className="rounded"
                  />
                  <label htmlFor="isPrivate" className="text-sm text-slate-300">Private Group</label>
                </div>
                {isNewGroupPrivate && (
                  <input
                    type="password"
                    placeholder="Enter password..."
                    value={newGroupPassword}
                    onChange={(e) => setNewGroupPassword(e.target.value)}
                    className="w-full p-2 bg-slate-600/50 border border-slate-500/50 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                  />
                )}
                <div className="flex gap-2">
                  <button
                    onClick={createGroup}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingGroup(false);
                      setNewGroupName('');
                      setNewGroupPassword('');
                      setIsNewGroupPrivate(false);
                    }}
                    className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search photos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Filter and View Controls */}
            <div className="flex gap-2 mb-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="flex-1 p-2 bg-slate-700/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Photos</option>
                <option value="favorites">Favorites</option>
                <option value="private">Private</option>
                <option value="public">Public</option>
              </select>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="p-2 bg-slate-700/50 border border-slate-600/50 rounded text-slate-300 hover:text-white transition-colors"
              >
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid3x3 className="w-4 h-4" />}
              </button>
            </div>

            <div className="space-y-3 max-h-[calc(100%-18rem)] overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
              {/* Grouped Photos */}
              {groups.map((group) => {
                const groupPhotos = groupedPhotos[group.id] || [];
                const isExpanded = expandedGroups.has(group.id);
                const isLocked = group.isPrivate && !unlockedGroups.has(group.id);
                
                return (
                  <div key={group.id} className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                      <button
                        onClick={() => toggleGroupExpanded(group.id)}
                        className="flex items-center gap-2 text-white hover:text-slate-300 transition-colors flex-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${group.color}`} />
                        <span className="font-medium">{group.name}</span>
                        {group.isPrivate && (
                          <Lock className="w-3 h-3 text-red-400" />
                        )}
                        <span className="text-xs text-slate-400">({isLocked ? '?' : groupPhotos.length})</span>
                      </button>
                      <button
                        onClick={() => deleteGroup(group.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {isExpanded && !isLocked && (
                      <div className={`ml-4 ${viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}`}>
                        {groupPhotos.map((photo) => (
                          <PhotoItem
                            key={photo.id}
                            photo={photo}
                            viewMode={viewMode}
                            isSelected={selectedPhoto?.id === photo.id}
                            onSelect={setSelectedPhoto}
                            onToggleFavorite={toggleFavorite}
                            onTogglePrivate={togglePrivate}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Ungrouped Photos */}
              {ungroupedPhotos.length > 0 && (
                <div className="space-y-2">
                  <div className="p-2 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-2 text-white">
                      <Folder className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">No Group</span>
                      <span className="text-xs text-slate-400">({ungroupedPhotos.length})</span>
                    </div>
                  </div>
                  
                  <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
                    {ungroupedPhotos.map((photo) => (
                      <PhotoItem
                        key={photo.id}
                        photo={photo}
                        viewMode={viewMode}
                        isSelected={selectedPhoto?.id === photo.id}
                        onSelect={setSelectedPhoto}
                        onToggleFavorite={toggleFavorite}
                        onTogglePrivate={togglePrivate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Photo Viewer/Editor */}
          <div className="lg:col-span-3 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            {isEditing ? (
              <PhotoEditor
                editingPhoto={editingPhoto}
                setEditingPhoto={setEditingPhoto}
                groups={groups}
                onSave={savePhoto}
                onCancel={() => {
                  setIsEditing(false);
                  setEditingPhoto({});
                }}
              />
            ) : selectedPhoto ? (
              <PhotoViewer
                photo={selectedPhoto}
                onEdit={() => editPhoto(selectedPhoto)}
                onDelete={() => deletePhoto(selectedPhoto.id)}
                onDownload={() => downloadPhoto(selectedPhoto)}
                onToggleFavorite={() => toggleFavorite(selectedPhoto.id)}
                onTogglePrivate={() => togglePrivate(selectedPhoto.id)}
                onCopyToClipboard={copyToClipboard}
                formatDate={formatDate}
                formatFileSize={formatFileSize}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <ImageIcon className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No photo selected</h3>
                  <p className="text-slate-300 mb-4">Select a photo from the gallery or upload new ones</p>
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Upload className="w-4 h-4" />
                    Upload Photos
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Password Prompt Modal */}
      {showPasswordPrompt && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-md mx-4">
            <div className="flex items-center gap-3 mb-4">
              <Lock className="w-6 h-6 text-red-400" />
              <h3 className="text-lg font-semibold text-white">Enter Group Password</h3>
            </div>
            <input
              type="password"
              placeholder="Enter password..."
              value={groupPasswordInput}
              onChange={(e) => setGroupPasswordInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && unlockGroup(showPasswordPrompt)}
              className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-4"
              autoFocus
            />
            <div className="flex gap-2">
              <button
                onClick={() => unlockGroup(showPasswordPrompt)}
                className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
              >
                Unlock
              </button>
              <button
                onClick={() => {
                  setShowPasswordPrompt(null);
                  setGroupPasswordInput('');
                }}
                className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Photo Item Component
interface PhotoItemProps {
  photo: Photo;
  viewMode: 'grid' | 'list';
  isSelected: boolean;
  onSelect: (photo: Photo) => void;
  onToggleFavorite: (photoId: string) => void;
  onTogglePrivate: (photoId: string) => void;
}

const PhotoItem: React.FC<PhotoItemProps> = ({
  photo,
  viewMode,
  isSelected,
  onSelect,
  onToggleFavorite,
  onTogglePrivate
}) => {
  if (viewMode === 'grid') {
    return (
      <div
        onClick={() => onSelect(photo)}
        className={`relative group cursor-pointer rounded-lg overflow-hidden transition-all ${
          isSelected ? 'ring-2 ring-purple-500' : ''
        }`}
      >
        <div className="aspect-square bg-slate-700">
          <img
            src={photo.dataUrl}
            alt={photo.title}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="flex gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite(photo.id);
              }}
              className="p-1 bg-black/50 rounded text-white hover:text-yellow-400 transition-colors"
            >
              {photo.isFavorite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onTogglePrivate(photo.id);
              }}
              className="p-1 bg-black/50 rounded text-white hover:text-red-400 transition-colors"
            >
              {photo.isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </button>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
          <p className="text-white text-xs truncate">{photo.title}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={() => onSelect(photo)}
      className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
        isSelected ? 'bg-purple-600/30 border border-purple-500/50' : 'bg-slate-700/30 hover:bg-slate-700/50'
      }`}
    >
      <div className="w-12 h-12 bg-slate-700 rounded overflow-hidden flex-shrink-0">
        <img
          src={photo.dataUrl}
          alt={photo.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-white truncate">{photo.title}</h3>
        <div className="flex items-center gap-2 mt-1">
          {photo.isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
          {photo.isPrivate && <Lock className="w-3 h-3 text-red-400" />}
          <span className="text-xs text-slate-400">{photo.fileName}</span>
        </div>
      </div>
    </div>
  );
};

// Photo Editor Component
interface PhotoEditorProps {
  editingPhoto: Partial<Photo>;
  setEditingPhoto: (photo: Partial<Photo>) => void;
  groups: PhotoGroup[];
  onSave: () => void;
  onCancel: () => void;
}

const PhotoEditor: React.FC<PhotoEditorProps> = ({
  editingPhoto,
  setEditingPhoto,
  groups,
  onSave,
  onCancel
}) => {
  const [newTag, setNewTag] = useState('');

  const addTag = () => {
    if (newTag.trim() && !editingPhoto.tags?.includes(newTag.trim())) {
      setEditingPhoto({
        ...editingPhoto,
        tags: [...(editingPhoto.tags || []), newTag.trim()]
      });
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setEditingPhoto({
      ...editingPhoto,
      tags: editingPhoto.tags?.filter(tag => tag !== tagToRemove) || []
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">Edit Photo</h2>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            Save
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
        {/* Photo Preview */}
        <div className="space-y-4">
          <div className="aspect-video bg-slate-700 rounded-lg overflow-hidden">
            {editingPhoto.dataUrl && (
              <img
                src={editingPhoto.dataUrl}
                alt={editingPhoto.title}
                className="w-full h-full object-contain"
              />
            )}
          </div>
        </div>

        {/* Edit Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Title *
            </label>
            <input
              type="text"
              placeholder="Enter photo title..."
              value={editingPhoto.title || ''}
              onChange={(e) => setEditingPhoto({ ...editingPhoto, title: e.target.value })}
              className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Description
            </label>
            <textarea
              placeholder="Enter photo description..."
              value={editingPhoto.description || ''}
              onChange={(e) => setEditingPhoto({ ...editingPhoto, description: e.target.value })}
              rows={3}
              className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Group
            </label>
            <select
              value={editingPhoto.groupId || ''}
              onChange={(e) => setEditingPhoto({ ...editingPhoto, groupId: e.target.value || undefined })}
              className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">No Group</option>
              {groups.map((group) => (
                <option key={group.id} value={group.id}>
                  {group.name} {group.isPrivate ? '🔒' : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isFavorite"
                checked={editingPhoto.isFavorite || false}
                onChange={(e) => setEditingPhoto({ ...editingPhoto, isFavorite: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isFavorite" className="text-sm text-slate-300">Favorite</label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isPrivate"
                checked={editingPhoto.isPrivate || false}
                onChange={(e) => setEditingPhoto({ ...editingPhoto, isPrivate: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="isPrivate" className="text-sm text-slate-300">Private</label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">
              Tags
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Add tag..."
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 p-2 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={addTag}
                className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded transition-colors"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {editingPhoto.tags?.map((tag, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-purple-600/30 text-purple-200 rounded text-sm flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="text-purple-300 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Photo Viewer Component
interface PhotoViewerProps {
  photo: Photo;
  onEdit: () => void;
  onDelete: () => void;
  onDownload: () => void;
  onToggleFavorite: () => void;
  onTogglePrivate: () => void;
  onCopyToClipboard: (text: string) => void;
  formatDate: (date: Date) => string;
  formatFileSize: (bytes: number) => string;
}

const PhotoViewer: React.FC<PhotoViewerProps> = ({
  photo,
  onEdit,
  onDelete,
  onDownload,
  onToggleFavorite,
  onTogglePrivate,
  onCopyToClipboard,
  formatDate,
  formatFileSize
}) => {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-300">
            Added {formatDate(photo.createdAt)}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              photo.isFavorite 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                : 'bg-slate-600 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {photo.isFavorite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
          </button>
          <button
            onClick={onTogglePrivate}
            className={`p-2 rounded-lg transition-colors ${
              photo.isPrivate 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-slate-600 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {photo.isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
          </button>
          <button
            onClick={onDownload}
            className="p-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
          </button>
          <button
            onClick={() => onCopyToClipboard(photo.dataUrl)}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
        <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
          {photo.title}
          {photo.isFavorite && <Star className="w-6 h-6 text-yellow-400 fill-current" />}
          {photo.isPrivate && <Lock className="w-6 h-6 text-red-400" />}
        </h1>

        {/* Photo Display */}
        <div className="mb-6 bg-slate-700/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <button
              onClick={() => setZoom(Math.max(0.1, zoom - 0.1))}
              className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-slate-300 text-sm">{Math.round(zoom * 100)}%</span>
            <button
              onClick={() => setZoom(Math.min(3, zoom + 0.1))}
              className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => setRotation((rotation + 90) % 360)}
              className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors"
            >
              <RotateCw className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setRotation(0);
              }}
              className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded transition-colors text-sm"
            >
              Reset
            </button>
          </div>
          
          <div className="max-h-96 overflow-auto bg-slate-800 rounded-lg flex items-center justify-center">
            <img
              src={photo.dataUrl}
              alt={photo.title}
              className="max-w-full max-h-full object-contain transition-transform"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`
              }}
            />
          </div>
        </div>

        {/* Photo Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="space-y-3">
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <h3 className="text-sm font-medium text-slate-300 mb-1">File Name</h3>
              <p className="text-white">{photo.fileName}</p>
            </div>
            
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <h3 className="text-sm font-medium text-slate-300 mb-1">File Size</h3>
              <p className="text-white">{formatFileSize(photo.fileSize)}</p>
            </div>
            
            <div className="p-3 bg-slate-700/30 rounded-lg">
              <h3 className="text-sm font-medium text-slate-300 mb-1">Type</h3>
              <p className="text-white">{photo.mimeType}</p>
            </div>
          </div>
          
          <div className="space-y-3">
            {photo.description && (
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <h3 className="text-sm font-medium text-slate-300 mb-1">Description</h3>
                <p className="text-white whitespace-pre-wrap">{photo.description}</p>
              </div>
            )}
            
            {photo.tags.length > 0 && (
              <div className="p-3 bg-slate-700/30 rounded-lg">
                <h3 className="text-sm font-medium text-slate-300 mb-2">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {photo.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-600/30 text-purple-200 rounded text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="text-xs text-slate-400">
          Last updated: {formatDate(photo.updatedAt)}
        </div>
      </div>
    </div>
  );
};

export default PhotoGalleryApp;