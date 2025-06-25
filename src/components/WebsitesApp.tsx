import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Edit3, Trash2, Save, X, ExternalLink, Globe, Link as LinkIcon, FileText } from 'lucide-react';
import Header from './Header';

interface Website {
  id: string;
  title: string;
  description: string;
  url: string;
  createdAt: Date;
  updatedAt: Date;
}

const WebsitesApp: React.FC = () => {
  const navigate = useNavigate();
  const [websites, setWebsites] = useState<Website[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWebsite, setSelectedWebsite] = useState<Website | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingWebsite, setEditingWebsite] = useState<Partial<Website>>({});

  useEffect(() => {
    // Load websites from localStorage
    const savedWebsites = localStorage.getItem('private_hub_websites');
    if (savedWebsites) {
      const parsedWebsites = JSON.parse(savedWebsites).map((website: any) => ({
        ...website,
        createdAt: new Date(website.createdAt),
        updatedAt: new Date(website.updatedAt)
      }));
      setWebsites(parsedWebsites);
    }
  }, []);

  const saveWebsites = (newWebsites: Website[]) => {
    setWebsites(newWebsites);
    localStorage.setItem('private_hub_websites', JSON.stringify(newWebsites));
  };

  const createWebsite = () => {
    const newWebsite: Website = {
      id: Date.now().toString(),
      title: 'New Website',
      description: '',
      url: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setEditingWebsite(newWebsite);
    setIsEditing(true);
  };

  const editWebsite = (website: Website) => {
    setEditingWebsite({ ...website });
    setIsEditing(true);
  };

  const saveWebsite = () => {
    if (!editingWebsite.title?.trim() || !editingWebsite.url?.trim()) return;

    // Ensure URL has protocol
    let url = editingWebsite.url || '';
    if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    const websiteToSave: Website = {
      id: editingWebsite.id || Date.now().toString(),
      title: editingWebsite.title || '',
      description: editingWebsite.description || '',
      url: url,
      createdAt: editingWebsite.createdAt || new Date(),
      updatedAt: new Date()
    };

    const existingIndex = websites.findIndex(w => w.id === websiteToSave.id);
    let newWebsites;
    
    if (existingIndex >= 0) {
      newWebsites = [...websites];
      newWebsites[existingIndex] = websiteToSave;
    } else {
      newWebsites = [websiteToSave, ...websites];
    }

    saveWebsites(newWebsites);
    setIsEditing(false);
    setEditingWebsite({});
    setSelectedWebsite(websiteToSave);
  };

  const deleteWebsite = (websiteId: string) => {
    if (window.confirm('Are you sure you want to delete this website?')) {
      const newWebsites = websites.filter(w => w.id !== websiteId);
      saveWebsites(newWebsites);
      if (selectedWebsite?.id === websiteId) {
        setSelectedWebsite(null);
      }
    }
  };

  const openWebsite = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const filteredWebsites = websites.filter(website =>
    website.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    website.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    website.url.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDomainFromUrl = (url: string) => {
    try {
      return new URL(url).hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center mb-6">
          <button
            onClick={() => navigate('/')}
            className="mr-4 p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-3xl font-bold text-white">Websites</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Websites List */}
          <div className="lg:col-span-1 backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Your Websites</h2>
              <button
                onClick={createWebsite}
                className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search websites..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="space-y-2 max-h-[calc(100%-8rem)] overflow-y-auto">
              {filteredWebsites.map((website) => (
                <div
                  key={website.id}
                  onClick={() => setSelectedWebsite(website)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedWebsite?.id === website.id
                      ? 'bg-blue-600/30 border border-blue-500/50'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{website.title}</h3>
                      <p className="text-sm text-slate-300 truncate mt-1">{website.description}</p>
                      <p className="text-xs text-blue-300 truncate mt-1">{getDomainFromUrl(website.url)}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openWebsite(website.url);
                      }}
                      className="ml-2 p-1 rounded text-slate-400 hover:text-white transition-colors"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="mt-2">
                    <span className="text-xs text-slate-400">
                      {formatDate(website.updatedAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Website Viewer/Editor */}
          <div className="lg:col-span-2 backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-2xl p-6">
            {isEditing ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    {editingWebsite.id ? 'Edit Website' : 'New Website'}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={saveWebsite}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditingWebsite({});
                      }}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Website Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter website title..."
                      value={editingWebsite.title || ''}
                      onChange={(e) => setEditingWebsite({ ...editingWebsite, title: e.target.value })}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Website URL *
                    </label>
                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="url"
                        placeholder="https://example.com"
                        value={editingWebsite.url || ''}
                        onChange={(e) => setEditingWebsite({ ...editingWebsite, url: e.target.value })}
                        className="w-full pl-10 pr-4 p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter website description..."
                      value={editingWebsite.description || ''}
                      onChange={(e) => setEditingWebsite({ ...editingWebsite, description: e.target.value })}
                      rows={4}
                      className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            ) : selectedWebsite ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-300">
                      Added {formatDate(selectedWebsite.createdAt)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openWebsite(selectedWebsite.url)}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Visit
                    </button>
                    <button
                      onClick={() => editWebsite(selectedWebsite)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteWebsite(selectedWebsite.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                  <h1 className="text-2xl font-bold text-white mb-2">{selectedWebsite.title}</h1>
                  
                  <div className="flex items-center gap-2 mb-4 p-3 bg-white/5 rounded-lg">
                    <LinkIcon className="w-4 h-4 text-blue-400" />
                    <a
                      href={selectedWebsite.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-300 hover:text-blue-200 transition-colors truncate"
                    >
                      {selectedWebsite.url}
                    </a>
                  </div>

                  {selectedWebsite.description && (
                    <div className="mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="w-4 h-4 text-slate-400" />
                        <span className="text-sm font-medium text-slate-300">Description</span>
                      </div>
                      <div className="text-slate-200 whitespace-pre-wrap leading-relaxed p-3 bg-white/5 rounded-lg">
                        {selectedWebsite.description}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-400 mt-4">
                    Last updated: {formatDate(selectedWebsite.updatedAt)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Globe className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No website selected</h3>
                  <p className="text-slate-300">Select a website from the list or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WebsitesApp;