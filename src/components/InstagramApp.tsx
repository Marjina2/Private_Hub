import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Edit3, Trash2, Save, X, Instagram, Calendar } from 'lucide-react';
import Header from './Header';

interface InstagramContact {
  id: string;
  title: string;
  instagramId: string;
  createdAt: Date;
  updatedAt: Date;
}

const InstagramApp: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<InstagramContact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<InstagramContact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContact, setEditingContact] = useState<Partial<InstagramContact>>({});

  useEffect(() => {
    const savedContacts = localStorage.getItem('private_hub_instagram_contacts');
    if (savedContacts) {
      const parsedContacts = JSON.parse(savedContacts).map((contact: any) => ({
        ...contact,
        createdAt: new Date(contact.createdAt),
        updatedAt: new Date(contact.updatedAt)
      }));
      setContacts(parsedContacts);
    }
  }, []);

  const saveContacts = (newContacts: InstagramContact[]) => {
    setContacts(newContacts);
    localStorage.setItem('private_hub_instagram_contacts', JSON.stringify(newContacts));
  };

  const createContact = () => {
    const newContact: InstagramContact = {
      id: Date.now().toString(),
      title: '',
      instagramId: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setEditingContact(newContact);
    setIsEditing(true);
  };

  const editContact = (contact: InstagramContact) => {
    setEditingContact({ ...contact });
    setIsEditing(true);
  };

  const saveContact = () => {
    if (!editingContact.title?.trim() || !editingContact.instagramId?.trim()) return;

    const contactToSave: InstagramContact = {
      id: editingContact.id || Date.now().toString(),
      title: editingContact.title || '',
      instagramId: editingContact.instagramId || '',
      createdAt: editingContact.createdAt || new Date(),
      updatedAt: new Date()
    };

    const existingIndex = contacts.findIndex(c => c.id === contactToSave.id);
    let newContacts;
    
    if (existingIndex >= 0) {
      newContacts = [...contacts];
      newContacts[existingIndex] = contactToSave;
    } else {
      newContacts = [contactToSave, ...contacts];
    }

    saveContacts(newContacts);
    setIsEditing(false);
    setEditingContact({});
    setSelectedContact(contactToSave);
  };

  const deleteContact = (contactId: string) => {
    if (window.confirm('Are you sure you want to delete this Instagram contact?')) {
      const newContacts = contacts.filter(c => c.id !== contactId);
      saveContacts(newContacts);
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }
    }
  };

  const openInstagramProfile = (username: string) => {
    const cleanUsername = username.replace('@', '');
    window.open(`https://instagram.com/${cleanUsername}`, '_blank', 'noopener,noreferrer');
  };

  const filteredContacts = contacts.filter(contact =>
    contact.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.instagramId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
            <Instagram className="w-8 h-8 text-pink-400" />
            Instagram Contacts
          </h1>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Total Instagram Contacts</p>
                <p className="text-2xl font-bold text-white">{contacts.length}</p>
              </div>
              <Instagram className="w-8 h-8 text-pink-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Recent Additions</p>
                <p className="text-2xl font-bold text-white">
                  {contacts.filter(c => {
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return c.createdAt > weekAgo;
                  }).length}
                </p>
              </div>
              <Calendar className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-18rem)]">
          {/* Contacts List */}
          <div className="lg:col-span-1 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Instagram Users</h2>
              <button
                onClick={createContact}
                className="p-2 rounded-lg bg-pink-600 hover:bg-pink-700 text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search Instagram contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div className="space-y-2 max-h-[calc(100%-8rem)] overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
              {filteredContacts.map((contact) => (
                <div
                  key={contact.id}
                  onClick={() => setSelectedContact(contact)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedContact?.id === contact.id
                      ? 'bg-pink-600/30 border border-pink-500/50'
                      : 'bg-slate-700/30 hover:bg-slate-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      <Instagram className="w-5 h-5" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-white truncate">{contact.title}</h3>
                      <p className="text-sm text-pink-300 truncate">@{contact.instagramId}</p>
                      <p className="text-xs text-slate-400 truncate mt-1">
                        {formatDate(contact.updatedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Viewer/Editor */}
          <div className="lg:col-span-2 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            {isEditing ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    {editingContact.id ? 'Edit Instagram Contact' : 'New Instagram Contact'}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={saveContact}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditingContact({});
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
                      Title / Name *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter a title or name for this contact..."
                      value={editingContact.title || ''}
                      onChange={(e) => setEditingContact({ ...editingContact, title: e.target.value })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500 text-xl font-semibold"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Instagram Username *
                    </label>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Enter Instagram username (without @)..."
                        value={editingContact.instagramId || ''}
                        onChange={(e) => setEditingContact({ ...editingContact, instagramId: e.target.value.replace('@', '') })}
                        className="w-full pl-10 pr-4 p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            ) : selectedContact ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-300">
                      Added {formatDate(selectedContact.createdAt)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => openInstagramProfile(selectedContact.instagramId)}
                      className="px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Instagram className="w-4 h-4" />
                      View Profile
                    </button>
                    <button
                      onClick={() => editContact(selectedContact)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteContact(selectedContact.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
                  {/* Contact Header */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      <Instagram className="w-8 h-8" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">{selectedContact.title}</h1>
                      <p className="text-slate-300">Instagram Contact</p>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-4 bg-slate-700/30 rounded-lg">
                      <Instagram className="w-6 h-6 text-pink-400" />
                      <div className="flex-1">
                        <p className="text-sm text-slate-400">Instagram Username</p>
                        <div className="flex items-center gap-2">
                          <p className="text-lg text-pink-300 font-medium">@{selectedContact.instagramId}</p>
                          <button
                            onClick={() => openInstagramProfile(selectedContact.instagramId)}
                            className="text-pink-300 hover:text-pink-200 transition-colors text-sm underline"
                          >
                            View Profile
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-700/50">
                    Last updated: {formatDate(selectedContact.updatedAt)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Instagram className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Instagram contact selected</h3>
                  <p className="text-slate-300">Select a contact from the list or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramApp;