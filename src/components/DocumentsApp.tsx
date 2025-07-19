import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Search, Edit3, Trash2, Save, X, BookOpen, 
  Calendar, Eye, Share2, Copy, Download, Upload, FileText,
  Folder, FolderPlus, ChevronDown, ChevronRight, Star, StarOff,
  Lock, Unlock, Tag, Clock, User, MoreHorizontal
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import ShareComponent from './ShareComponent';

// Editor.js imports
import EditorJS from '@editorjs/editorjs';
import Header as EditorHeader from '@editorjs/header';
import List from '@editorjs/list';
import Paragraph from '@editorjs/paragraph';
import Image from '@editorjs/image';
import Code from '@editorjs/code';
import Quote from '@editorjs/quote';
import Delimiter from '@editorjs/delimiter';
import Table from '@editorjs/table';
import Checklist from '@editorjs/checklist';
import LinkTool from '@editorjs/link';
import Embed from '@editorjs/embed';
import Marker from '@editorjs/marker';
import InlineCode from '@editorjs/inline-code';

interface DocumentFolder {
  id: string;
  name: string;
  color: string;
  isPrivate: boolean;
  createdAt: Date;
}

interface Document {
  id: string;
  title: string;
  content: any; // Editor.js data
  folderId?: string;
  isPrivate: boolean;
  isFavorite: boolean;
  tags: string[];
  createdBy: string;
  lastEditedBy: string;
  createdAt: Date;
  updatedAt: Date;
  wordCount: number;
  readTime: number;
}

const DocumentsApp: React.FC = () => {
  const navigate = useNavigate();
  const { currentToken, currentUser } = useAuth();
  const editorRef = useRef<EditorJS | null>(null);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<DocumentFolder[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Partial<Document>>({});
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [filterBy, setFilterBy] = useState<'all' | 'favorites' | 'private' | 'recent'>('all');
  const [isLoading, setIsLoading] = useState(false);

  const folderColors = [
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
    // Load documents and folders from token-specific localStorage
    const savedDocuments = localStorage.getItem(`private_hub_documents_${currentToken}`);
    const savedFolders = localStorage.getItem(`private_hub_document_folders_${currentToken}`);
    
    if (savedDocuments) {
      try {
        const parsedDocuments = JSON.parse(savedDocuments).map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt)
        }));
        setDocuments(parsedDocuments);
      } catch (error) {
        console.error('Failed to load documents:', error);
      }
    }

    if (savedFolders) {
      try {
        const parsedFolders = JSON.parse(savedFolders).map((folder: any) => ({
          ...folder,
          createdAt: new Date(folder.createdAt)
        }));
        setFolders(parsedFolders);
        setExpandedFolders(new Set(parsedFolders.map((f: DocumentFolder) => f.id)));
      } catch (error) {
        console.error('Failed to load folders:', error);
      }
    }
  }, [currentToken]);

  const saveDocuments = (newDocuments: Document[]) => {
    setDocuments(newDocuments);
    localStorage.setItem(`private_hub_documents_${currentToken}`, JSON.stringify(newDocuments));
  };

  const saveFolders = (newFolders: DocumentFolder[]) => {
    setFolders(newFolders);
    localStorage.setItem(`private_hub_document_folders_${currentToken}`, JSON.stringify(newFolders));
  };

  const initializeEditor = (data?: any) => {
    if (editorRef.current) {
      editorRef.current.destroy();
    }

    editorRef.current = new EditorJS({
      holder: 'editor-container',
      data: data || {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: 'Start writing your document...'
            }
          }
        ]
      },
      tools: {
        header: {
          class: EditorHeader,
          config: {
            placeholder: 'Enter a header',
            levels: [1, 2, 3, 4, 5, 6],
            defaultLevel: 2
          }
        },
        list: {
          class: List,
          inlineToolbar: true,
          config: {
            defaultStyle: 'unordered'
          }
        },
        checklist: {
          class: Checklist,
          inlineToolbar: true
        },
        quote: {
          class: Quote,
          inlineToolbar: true,
          config: {
            quotePlaceholder: 'Enter a quote',
            captionPlaceholder: 'Quote\'s author'
          }
        },
        code: {
          class: Code,
          config: {
            placeholder: 'Enter code here...'
          }
        },
        delimiter: Delimiter,
        table: {
          class: Table,
          inlineToolbar: true,
          config: {
            rows: 2,
            cols: 3
          }
        },
        linkTool: {
          class: LinkTool,
          config: {
            endpoint: '/api/link' // This would need a backend endpoint
          }
        },
        embed: {
          class: Embed,
          config: {
            services: {
              youtube: true,
              coub: true,
              codepen: true
            }
          }
        },
        marker: {
          class: Marker,
          shortcut: 'CMD+SHIFT+M'
        },
        inlineCode: {
          class: InlineCode,
          shortcut: 'CMD+SHIFT+C'
        }
      },
      placeholder: 'Let\'s write an awesome document!',
      autofocus: true
    });
  };

  const createFolder = () => {
    if (!newFolderName.trim()) return;

    const newFolder: DocumentFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      color: folderColors[folders.length % folderColors.length],
      isPrivate: false,
      createdAt: new Date()
    };

    const newFolders = [...folders, newFolder];
    saveFolders(newFolders);
    setExpandedFolders(prev => new Set([...prev, newFolder.id]));
    setNewFolderName('');
    setIsCreatingFolder(false);
  };

  const createDocument = () => {
    const newDocument: Document = {
      id: Date.now().toString(),
      title: 'Untitled Document',
      content: {
        blocks: [
          {
            type: 'paragraph',
            data: {
              text: ''
            }
          }
        ]
      },
      folderId: selectedFolderId || undefined,
      isPrivate: false,
      isFavorite: false,
      tags: [],
      createdBy: currentUser?.name || 'Unknown',
      lastEditedBy: currentUser?.name || 'Unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      wordCount: 0,
      readTime: 0
    };
    setEditingDocument(newDocument);
    setIsEditing(true);
  };

  const editDocument = (document: Document) => {
    setEditingDocument({ ...document });
    setIsEditing(true);
  };

  const saveDocument = async () => {
    if (!editingDocument.title?.trim()) return;
    if (!editorRef.current) return;

    setIsLoading(true);

    try {
      const editorData = await editorRef.current.save();
      const wordCount = calculateWordCount(editorData);
      const readTime = Math.ceil(wordCount / 200); // Average reading speed

      const documentToSave: Document = {
        id: editingDocument.id || Date.now().toString(),
        title: editingDocument.title || 'Untitled Document',
        content: editorData,
        folderId: editingDocument.folderId,
        isPrivate: editingDocument.isPrivate || false,
        isFavorite: editingDocument.isFavorite || false,
        tags: editingDocument.tags || [],
        createdBy: editingDocument.createdBy || currentUser?.name || 'Unknown',
        lastEditedBy: currentUser?.name || 'Unknown',
        createdAt: editingDocument.createdAt || new Date(),
        updatedAt: new Date(),
        wordCount,
        readTime
      };

      const existingIndex = documents.findIndex(d => d.id === documentToSave.id);
      let newDocuments;
      
      if (existingIndex >= 0) {
        newDocuments = [...documents];
        newDocuments[existingIndex] = documentToSave;
      } else {
        newDocuments = [documentToSave, ...documents];
      }

      saveDocuments(newDocuments);
      setIsEditing(false);
      setEditingDocument({});
      setSelectedDocument(documentToSave);
    } catch (error) {
      console.error('Failed to save document:', error);
      alert('Failed to save document');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWordCount = (editorData: any): number => {
    let wordCount = 0;
    
    if (editorData.blocks) {
      editorData.blocks.forEach((block: any) => {
        if (block.data && block.data.text) {
          const text = block.data.text.replace(/<[^>]*>/g, ''); // Remove HTML tags
          wordCount += text.split(/\s+/).filter(word => word.length > 0).length;
        }
      });
    }
    
    return wordCount;
  };

  const deleteDocument = (documentId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const newDocuments = documents.filter(d => d.id !== documentId);
      saveDocuments(newDocuments);
      if (selectedDocument?.id === documentId) {
        setSelectedDocument(null);
      }
    }
  };

  const toggleFavorite = (documentId: string) => {
    const newDocuments = documents.map(doc => {
      if (doc.id === documentId) {
        const updatedDoc = { ...doc, isFavorite: !doc.isFavorite, updatedAt: new Date() };
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(updatedDoc);
        }
        return updatedDoc;
      }
      return doc;
    });
    saveDocuments(newDocuments);
  };

  const togglePrivate = (documentId: string) => {
    const newDocuments = documents.map(doc => {
      if (doc.id === documentId) {
        const updatedDoc = { ...doc, isPrivate: !doc.isPrivate, updatedAt: new Date() };
        if (selectedDocument?.id === documentId) {
          setSelectedDocument(updatedDoc);
        }
        return updatedDoc;
      }
      return doc;
    });
    saveDocuments(newDocuments);
  };

  const toggleFolderExpanded = (folderId: string) => {
    setExpandedFolders(prev => {
      const newSet = new Set(prev);
      if (newSet.has(folderId)) {
        newSet.delete(folderId);
      } else {
        newSet.add(folderId);
      }
      return newSet;
    });
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'favorites' && doc.isFavorite) ||
                         (filterBy === 'private' && doc.isPrivate) ||
                         (filterBy === 'recent' && new Date().getTime() - doc.updatedAt.getTime() < 7 * 24 * 60 * 60 * 1000);
    
    return matchesSearch && matchesFilter;
  });

  // Group documents by folder
  const groupedDocuments = folders.reduce((acc, folder) => {
    acc[folder.id] = filteredDocuments.filter(doc => doc.folderId === folder.id);
    return acc;
  }, {} as Record<string, Document[]>);

  const ungroupedDocuments = filteredDocuments.filter(doc => !doc.folderId);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const totalDocuments = documents.length;
  const favoriteDocuments = documents.filter(d => d.isFavorite).length;
  const privateDocuments = documents.filter(d => d.isPrivate).length;
  const recentDocuments = documents.filter(d => 
    new Date().getTime() - d.updatedAt.getTime() < 7 * 24 * 60 * 60 * 1000
  ).length;

  useEffect(() => {
    if (isEditing && editingDocument.content) {
      setTimeout(() => {
        initializeEditor(editingDocument.content);
      }, 100);
    }
  }, [isEditing, editingDocument.content]);

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
          <div className="flex items-center justify-between w-full">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-violet-400" />
              Documents
            </h1>
            <ShareComponent appType="documents" appName="Documents" />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Total Documents</p>
                <p className="text-2xl font-bold text-white">{totalDocuments}</p>
              </div>
              <BookOpen className="w-8 h-8 text-violet-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Favorites</p>
                <p className="text-2xl font-bold text-white">{favoriteDocuments}</p>
              </div>
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Private</p>
                <p className="text-2xl font-bold text-white">{privateDocuments}</p>
              </div>
              <Lock className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Recent</p>
                <p className="text-2xl font-bold text-white">{recentDocuments}</p>
              </div>
              <Clock className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-22rem)]">
          {/* Sidebar */}
          <div className="lg:col-span-1 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Folders</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsCreatingFolder(true)}
                  className="p-2 rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors"
                  title="Create Folder"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
                <button
                  onClick={createDocument}
                  className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                  title="New Document"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Create Folder Form */}
            {isCreatingFolder && (
              <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                <input
                  type="text"
                  placeholder="Enter folder name..."
                  value={newFolderName}
                  onChange={(e) => setNewFolderName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createFolder()}
                  className="w-full p-2 bg-slate-600/50 border border-slate-500/50 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={createFolder}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingFolder(false);
                      setNewFolderName('');
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
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
              />
            </div>

            {/* Filter Dropdown */}
            <div className="mb-4">
              <select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value as any)}
                className="w-full p-2 bg-slate-700/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
              >
                <option value="all">All Documents</option>
                <option value="recent">Recent (7 days)</option>
                <option value="favorites">Favorites</option>
                <option value="private">Private</option>
              </select>
            </div>

            <div className="space-y-3 max-h-[calc(100%-16rem)] overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
              {/* Folders */}
              {folders.map((folder) => {
                const folderDocuments = groupedDocuments[folder.id] || [];
                const isExpanded = expandedFolders.has(folder.id);
                
                return (
                  <div key={folder.id} className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                      <button
                        onClick={() => toggleFolderExpanded(folder.id)}
                        className="flex items-center gap-2 text-white hover:text-slate-300 transition-colors flex-1"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${folder.color}`} />
                        <span className="font-medium">{folder.name}</span>
                        <span className="text-xs text-slate-400">({folderDocuments.length})</span>
                      </button>
                    </div>
                    
                    {isExpanded && (
                      <div className="ml-4 space-y-1">
                        {folderDocuments.map((doc) => (
                          <DocumentItem
                            key={doc.id}
                            document={doc}
                            isSelected={selectedDocument?.id === doc.id}
                            onSelect={setSelectedDocument}
                            onToggleFavorite={toggleFavorite}
                            onTogglePrivate={togglePrivate}
                            formatDate={formatDate}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Ungrouped Documents */}
              {ungroupedDocuments.length > 0 && (
                <div className="space-y-2">
                  <div className="p-2 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-2 text-white">
                      <Folder className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">No Folder</span>
                      <span className="text-xs text-slate-400">({ungroupedDocuments.length})</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    {ungroupedDocuments.map((doc) => (
                      <DocumentItem
                        key={doc.id}
                        document={doc}
                        isSelected={selectedDocument?.id === doc.id}
                        onSelect={setSelectedDocument}
                        onToggleFavorite={toggleFavorite}
                        onTogglePrivate={togglePrivate}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            {isEditing ? (
              <DocumentEditor
                editingDocument={editingDocument}
                setEditingDocument={setEditingDocument}
                folders={folders}
                onSave={saveDocument}
                onCancel={() => {
                  setIsEditing(false);
                  setEditingDocument({});
                  if (editorRef.current) {
                    editorRef.current.destroy();
                    editorRef.current = null;
                  }
                }}
                isLoading={isLoading}
              />
            ) : selectedDocument ? (
              <DocumentViewer
                document={selectedDocument}
                onEdit={() => editDocument(selectedDocument)}
                onDelete={() => deleteDocument(selectedDocument.id)}
                onToggleFavorite={() => toggleFavorite(selectedDocument.id)}
                onTogglePrivate={() => togglePrivate(selectedDocument.id)}
                formatDate={formatDate}
              />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No document selected</h3>
                  <p className="text-slate-300 mb-4">Select a document from the sidebar or create a new one</p>
                  <button
                    onClick={createDocument}
                    className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors flex items-center gap-2 mx-auto"
                  >
                    <Plus className="w-4 h-4" />
                    New Document
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Document Item Component
interface DocumentItemProps {
  document: Document;
  isSelected: boolean;
  onSelect: (document: Document) => void;
  onToggleFavorite: (documentId: string) => void;
  onTogglePrivate: (documentId: string) => void;
  formatDate: (date: Date) => string;
}

const DocumentItem: React.FC<DocumentItemProps> = ({
  document,
  isSelected,
  onSelect,
  onToggleFavorite,
  onTogglePrivate,
  formatDate
}) => {
  return (
    <div
      onClick={() => onSelect(document)}
      className={`p-3 rounded-lg cursor-pointer transition-colors ${
        isSelected
          ? 'bg-violet-600/30 border border-violet-500/50'
          : 'bg-slate-700/30 hover:bg-slate-700/50'
      }`}
    >
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-medium text-white truncate flex-1">{document.title}</h3>
        <div className="flex gap-1 ml-2">
          {document.isFavorite && <Star className="w-3 h-3 text-yellow-400 fill-current" />}
          {document.isPrivate && <Lock className="w-3 h-3 text-red-400" />}
        </div>
      </div>
      
      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{document.wordCount} words • {document.readTime} min read</span>
        <span>{formatDate(document.updatedAt)}</span>
      </div>
      
      {document.tags.length > 0 && (
        <div className="flex gap-1 mt-2">
          {document.tags.slice(0, 2).map((tag, index) => (
            <span key={index} className="px-2 py-1 bg-violet-600/30 text-violet-200 rounded text-xs">
              {tag}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

// Document Editor Component
interface DocumentEditorProps {
  editingDocument: Partial<Document>;
  setEditingDocument: (document: Partial<Document>) => void;
  folders: DocumentFolder[];
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

const DocumentEditor: React.FC<DocumentEditorProps> = ({
  editingDocument,
  setEditingDocument,
  folders,
  onSave,
  onCancel,
  isLoading
}) => {
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-white">
          {editingDocument.id ? 'Edit Document' : 'New Document'}
        </h2>
        <div className="flex gap-2">
          <button
            onClick={onSave}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Save
              </>
            )}
          </button>
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-600 hover:bg-slate-700 disabled:opacity-50 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Cancel
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-4">
        <div className="lg:col-span-2">
          <input
            type="text"
            placeholder="Document title..."
            value={editingDocument.title || ''}
            onChange={(e) => setEditingDocument({ ...editingDocument, title: e.target.value })}
            className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-500 text-xl font-semibold"
          />
        </div>
        
        <div>
          <select
            value={editingDocument.folderId || ''}
            onChange={(e) => setEditingDocument({ ...editingDocument, folderId: e.target.value || undefined })}
            className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
          >
            <option value="">No Folder</option>
            {folders.map((folder) => (
              <option key={folder.id} value={folder.id}>
                {folder.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex gap-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isFavorite"
              checked={editingDocument.isFavorite || false}
              onChange={(e) => setEditingDocument({ ...editingDocument, isFavorite: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isFavorite" className="text-sm text-slate-300">Favorite</label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPrivate"
              checked={editingDocument.isPrivate || false}
              onChange={(e) => setEditingDocument({ ...editingDocument, isPrivate: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="isPrivate" className="text-sm text-slate-300">Private</label>
          </div>
        </div>
      </div>

      {/* Editor Container */}
      <div className="flex-1 bg-slate-700/30 rounded-lg p-4 overflow-hidden">
        <div 
          id="editor-container" 
          className="h-full overflow-y-auto prose prose-invert max-w-none"
          style={{ minHeight: '400px' }}
        />
      </div>
    </div>
  );
};

// Document Viewer Component
interface DocumentViewerProps {
  document: Document;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFavorite: () => void;
  onTogglePrivate: () => void;
  formatDate: (date: Date) => string;
}

const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  onEdit,
  onDelete,
  onToggleFavorite,
  onTogglePrivate,
  formatDate
}) => {
  const renderContent = (content: any) => {
    if (!content || !content.blocks) return null;

    return content.blocks.map((block: any, index: number) => {
      switch (block.type) {
        case 'header':
          const HeaderTag = `h${block.data.level}` as keyof JSX.IntrinsicElements;
          return (
            <HeaderTag key={index} className="text-white font-bold mb-4">
              {block.data.text}
            </HeaderTag>
          );
        case 'paragraph':
          return (
            <p key={index} className="text-slate-200 mb-4 leading-relaxed" dangerouslySetInnerHTML={{ __html: block.data.text }} />
          );
        case 'list':
          const ListTag = block.data.style === 'ordered' ? 'ol' : 'ul';
          return (
            <ListTag key={index} className="text-slate-200 mb-4 ml-6">
              {block.data.items.map((item: string, itemIndex: number) => (
                <li key={itemIndex} className="mb-1" dangerouslySetInnerHTML={{ __html: item }} />
              ))}
            </ListTag>
          );
        case 'quote':
          return (
            <blockquote key={index} className="border-l-4 border-violet-500 pl-4 italic text-slate-300 mb-4">
              <p dangerouslySetInnerHTML={{ __html: block.data.text }} />
              {block.data.caption && (
                <cite className="text-sm text-slate-400">— {block.data.caption}</cite>
              )}
            </blockquote>
          );
        case 'code':
          return (
            <pre key={index} className="bg-slate-800 p-4 rounded-lg mb-4 overflow-x-auto">
              <code className="text-green-400">{block.data.code}</code>
            </pre>
          );
        case 'delimiter':
          return <hr key={index} className="border-slate-600 my-8" />;
        default:
          return null;
      }
    });
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-5 h-5 text-slate-400" />
          <span className="text-sm text-slate-300">
            Created {formatDate(document.createdAt)}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onToggleFavorite}
            className={`p-2 rounded-lg transition-colors ${
              document.isFavorite 
                ? 'bg-yellow-600 hover:bg-yellow-700 text-white' 
                : 'bg-slate-600 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {document.isFavorite ? <Star className="w-4 h-4 fill-current" /> : <StarOff className="w-4 h-4" />}
          </button>
          <button
            onClick={onTogglePrivate}
            className={`p-2 rounded-lg transition-colors ${
              document.isPrivate 
                ? 'bg-red-600 hover:bg-red-700 text-white' 
                : 'bg-slate-600 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {document.isPrivate ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
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
        <h1 className="text-3xl font-bold text-white mb-4 flex items-center gap-3">
          {document.title}
          {document.isFavorite && <Star className="w-6 h-6 text-yellow-400 fill-current" />}
          {document.isPrivate && <Lock className="w-6 h-6 text-red-400" />}
        </h1>

        <div className="flex items-center gap-4 mb-6 text-sm text-slate-400">
          <div className="flex items-center gap-1">
            <User className="w-4 h-4" />
            <span>By {document.createdBy}</span>
          </div>
          <div className="flex items-center gap-1">
            <FileText className="w-4 h-4" />
            <span>{document.wordCount} words</span>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{document.readTime} min read</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>Updated {formatDate(document.updatedAt)}</span>
          </div>
        </div>

        {document.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-6">
            <Tag className="w-4 h-4 text-slate-400" />
            {document.tags.map((tag, index) => (
              <span key={index} className="bg-violet-600/30 text-violet-200 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="prose prose-invert max-w-none">
          {renderContent(document.content)}
        </div>
      </div>
    </div>
  );
};

export default DocumentsApp;