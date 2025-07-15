import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Edit3, Trash2, Save, X, Calendar, Tag } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import ShareComponent from './ShareComponent';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const NotesApp: React.FC = () => {
  const navigate = useNavigate();
  const { currentToken } = useAuth();
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingNote, setEditingNote] = useState<Partial<Note>>({});

  useEffect(() => {
    // Load notes from token-specific localStorage
    const savedNotes = localStorage.getItem(`private_hub_notes_${currentToken}`);
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt)
      }));
      setNotes(parsedNotes);
    }
  }, [currentToken]);

  const saveNotes = (newNotes: Note[]) => {
    setNotes(newNotes);
    localStorage.setItem(`private_hub_notes_${currentToken}`, JSON.stringify(newNotes));
  };

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      tags: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setEditingNote(newNote);
    setIsEditing(true);
  };

  const editNote = (note: Note) => {
    setEditingNote({ ...note });
    setIsEditing(true);
  };

  const saveNote = () => {
    if (!editingNote.title?.trim()) return;

    const noteToSave: Note = {
      id: editingNote.id || Date.now().toString(),
      title: editingNote.title || '',
      content: editingNote.content || '',
      tags: editingNote.tags || [],
      createdAt: editingNote.createdAt || new Date(),
      updatedAt: new Date()
    };

    const existingIndex = notes.findIndex(n => n.id === noteToSave.id);
    let newNotes;
    
    if (existingIndex >= 0) {
      newNotes = [...notes];
      newNotes[existingIndex] = noteToSave;
    } else {
      newNotes = [noteToSave, ...notes];
    }

    saveNotes(newNotes);
    setIsEditing(false);
    setEditingNote({});
    setSelectedNote(noteToSave);
  };

  const deleteNote = (noteId: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      const newNotes = notes.filter(n => n.id !== noteId);
      saveNotes(newNotes);
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
    }
  };

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
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
          <div className="flex items-center justify-between w-full">
            <h1 className="text-3xl font-bold text-white">Notes</h1>
            <ShareComponent appType="notes" appName="Notes" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-12rem)]">
          {/* Notes List */}
          <div className="lg:col-span-1 backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Your Notes</h2>
              <button
                onClick={createNote}
                className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div className="space-y-2 max-h-[calc(100%-8rem)] overflow-y-auto">
              {filteredNotes.map((note) => (
                <div
                  key={note.id}
                  onClick={() => setSelectedNote(note)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedNote?.id === note.id
                      ? 'bg-purple-600/30 border border-purple-500/50'
                      : 'bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <h3 className="font-medium text-white truncate">{note.title}</h3>
                  <p className="text-sm text-slate-300 truncate mt-1">{note.content}</p>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-slate-400">
                      {formatDate(note.updatedAt)}
                    </span>
                    {note.tags.length > 0 && (
                      <div className="flex gap-1">
                        {note.tags.slice(0, 2).map((tag, index) => (
                          <span key={index} className="text-xs bg-blue-600/30 text-blue-200 px-2 py-1 rounded">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Note Viewer/Editor */}
          <div className="lg:col-span-2 backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-2xl p-6">
            {isEditing ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    {editingNote.id ? 'Edit Note' : 'New Note'}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={saveNote}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditingNote({});
                      }}
                      className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <X className="w-4 h-4" />
                      Cancel
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  placeholder="Note title..."
                  value={editingNote.title || ''}
                  onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                  className="w-full p-3 mb-4 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 text-xl font-semibold"
                />

                <textarea
                  placeholder="Start writing your note..."
                  value={editingNote.content || ''}
                  onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                  className="flex-1 w-full p-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>
            ) : selectedNote ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-300">
                      Updated {formatDate(selectedNote.updatedAt)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => editNote(selectedNote)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteNote(selectedNote.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <h1 className="text-2xl font-bold text-white mb-4">{selectedNote.title}</h1>
                
                {selectedNote.tags.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <Tag className="w-4 h-4 text-slate-400" />
                    {selectedNote.tags.map((tag, index) => (
                      <span key={index} className="bg-blue-600/30 text-blue-200 px-3 py-1 rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                <div className="flex-1 overflow-y-auto">
                  <div className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {selectedNote.content || 'This note is empty. Click the edit button to add content.'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Edit3 className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No note selected</h3>
                  <p className="text-slate-300">Select a note from the list or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotesApp;