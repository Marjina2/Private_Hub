import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Edit3, Trash2, Save, X, Users, Phone, Mail, MapPin, User, Calendar, Building, Globe, MessageCircle } from 'lucide-react';
import Header from './Header';

interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  company: string;
  jobTitle: string;
  website: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const ContactsApp: React.FC = () => {
  const navigate = useNavigate();
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingContact, setEditingContact] = useState<Partial<Contact>>({});

  useEffect(() => {
    // Load contacts from localStorage
    const savedContacts = localStorage.getItem('private_hub_contacts');
    if (savedContacts) {
      const parsedContacts = JSON.parse(savedContacts).map((contact: any) => ({
        ...contact,
        createdAt: new Date(contact.createdAt),
        updatedAt: new Date(contact.updatedAt)
      }));
      setContacts(parsedContacts);
    }
  }, []);

  const saveContacts = (newContacts: Contact[]) => {
    setContacts(newContacts);
    localStorage.setItem('private_hub_contacts', JSON.stringify(newContacts));
  };

  const createContact = () => {
    const newContact: Contact = {
      id: Date.now().toString(),
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      company: '',
      jobTitle: '',
      website: '',
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setEditingContact(newContact);
    setIsEditing(true);
  };

  const editContact = (contact: Contact) => {
    setEditingContact({ ...contact });
    setIsEditing(true);
  };

  const saveContact = () => {
    if (!editingContact.firstName?.trim() && !editingContact.lastName?.trim()) return;

    const contactToSave: Contact = {
      id: editingContact.id || Date.now().toString(),
      firstName: editingContact.firstName || '',
      lastName: editingContact.lastName || '',
      email: editingContact.email || '',
      phone: editingContact.phone || '',
      address: editingContact.address || '',
      company: editingContact.company || '',
      jobTitle: editingContact.jobTitle || '',
      website: editingContact.website || '',
      notes: editingContact.notes || '',
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
    if (window.confirm('Are you sure you want to delete this contact?')) {
      const newContacts = contacts.filter(c => c.id !== contactId);
      saveContacts(newContacts);
      if (selectedContact?.id === contactId) {
        setSelectedContact(null);
      }
    }
  };

  const filteredContacts = contacts.filter(contact => {
    const fullName = `${contact.firstName} ${contact.lastName}`.toLowerCase();
    const searchLower = searchTerm.toLowerCase();
    
    return fullName.includes(searchLower) ||
           contact.email.toLowerCase().includes(searchLower) ||
           contact.phone.includes(searchTerm) ||
           contact.company.toLowerCase().includes(searchLower) ||
           contact.jobTitle.toLowerCase().includes(searchLower);
  });

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatPhoneNumber = (phone: string) => {
    // Simple phone number formatting
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    }
    return phone;
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
          <h1 className="text-3xl font-bold text-white">Contacts</h1>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Total Contacts</p>
                <p className="text-2xl font-bold text-white">{contacts.length}</p>
              </div>
              <Users className="w-8 h-8 text-indigo-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">With Email</p>
                <p className="text-2xl font-bold text-white">{contacts.filter(c => c.email).length}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-18rem)]">
          {/* Contacts List */}
          <div className="lg:col-span-1 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Your Contacts</h2>
              <button
                onClick={createContact}
                className="p-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search contacts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2 max-h-[calc(100%-8rem)] overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
              {filteredContacts.map((contact) => {
                const fullName = `${contact.firstName} ${contact.lastName}`.trim();
                const displayName = fullName || 'Unnamed Contact';
                
                return (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      selectedContact?.id === contact.id
                        ? 'bg-indigo-600/30 border border-indigo-500/50'
                        : 'bg-slate-700/30 hover:bg-slate-700/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {contact.firstName || contact.lastName ? 
                          getInitials(contact.firstName, contact.lastName) : 
                          <User className="w-5 h-5" />
                        }
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-white truncate">{displayName}</h3>
                        {contact.company && (
                          <p className="text-sm text-slate-300 truncate">{contact.company}</p>
                        )}
                        {contact.email && (
                          <p className="text-xs text-indigo-300 truncate">{contact.email}</p>
                        )}
                        {contact.phone && (
                          <p className="text-xs text-slate-400 truncate">{formatPhoneNumber(contact.phone)}</p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Contact Viewer/Editor */}
          <div className="lg:col-span-2 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            {isEditing ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    {editingContact.id ? 'Edit Contact' : 'New Contact'}
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      First Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter first name..."
                      value={editingContact.firstName || ''}
                      onChange={(e) => setEditingContact({ ...editingContact, firstName: e.target.value })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Last Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter last name..."
                      value={editingContact.lastName || ''}
                      onChange={(e) => setEditingContact({ ...editingContact, lastName: e.target.value })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      placeholder="Enter email address..."
                      value={editingContact.email || ''}
                      onChange={(e) => setEditingContact({ ...editingContact, email: e.target.value })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter phone number..."
                      value={editingContact.phone || ''}
                      onChange={(e) => setEditingContact({ ...editingContact, phone: e.target.value })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Company
                    </label>
                    <input
                      type="text"
                      placeholder="Enter company name..."
                      value={editingContact.company || ''}
                      onChange={(e) => setEditingContact({ ...editingContact, company: e.target.value })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Job Title
                    </label>
                    <input
                      type="text"
                      placeholder="Enter job title..."
                      value={editingContact.jobTitle || ''}
                      onChange={(e) => setEditingContact({ ...editingContact, jobTitle: e.target.value })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Website
                    </label>
                    <input
                      type="url"
                      placeholder="Enter website URL..."
                      value={editingContact.website || ''}
                      onChange={(e) => setEditingContact({ ...editingContact, website: e.target.value })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      placeholder="Enter address..."
                      value={editingContact.address || ''}
                      onChange={(e) => setEditingContact({ ...editingContact, address: e.target.value })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Notes
                    </label>
                    <textarea
                      placeholder="Enter notes about this contact..."
                      value={editingContact.notes || ''}
                      onChange={(e) => setEditingContact({ ...editingContact, notes: e.target.value })}
                      rows={4}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
                    />
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
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                      {selectedContact.firstName || selectedContact.lastName ? 
                        getInitials(selectedContact.firstName, selectedContact.lastName) : 
                        <User className="w-8 h-8" />
                      }
                    </div>
                    <div>
                      <h1 className="text-2xl font-bold text-white">
                        {`${selectedContact.firstName} ${selectedContact.lastName}`.trim() || 'Unnamed Contact'}
                      </h1>
                      {selectedContact.jobTitle && selectedContact.company && (
                        <p className="text-slate-300">{selectedContact.jobTitle} at {selectedContact.company}</p>
                      )}
                      {selectedContact.jobTitle && !selectedContact.company && (
                        <p className="text-slate-300">{selectedContact.jobTitle}</p>
                      )}
                      {!selectedContact.jobTitle && selectedContact.company && (
                        <p className="text-slate-300">{selectedContact.company}</p>
                      )}
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-4">
                    {selectedContact.email && (
                      <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-400" />
                        <div>
                          <p className="text-sm text-slate-400">Email</p>
                          <a
                            href={`mailto:${selectedContact.email}`}
                            className="text-blue-300 hover:text-blue-200 transition-colors"
                          >
                            {selectedContact.email}
                          </a>
                        </div>
                      </div>
                    )}

                    {selectedContact.phone && (
                      <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <Phone className="w-5 h-5 text-green-400" />
                        <div>
                          <p className="text-sm text-slate-400">Phone</p>
                          <a
                            href={`tel:${selectedContact.phone}`}
                            className="text-green-300 hover:text-green-200 transition-colors"
                          >
                            {formatPhoneNumber(selectedContact.phone)}
                          </a>
                        </div>
                      </div>
                    )}

                    {selectedContact.address && (
                      <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <MapPin className="w-5 h-5 text-red-400 mt-1" />
                        <div>
                          <p className="text-sm text-slate-400">Address</p>
                          <p className="text-slate-200">{selectedContact.address}</p>
                        </div>
                      </div>
                    )}

                    {selectedContact.company && (
                      <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <Building className="w-5 h-5 text-purple-400" />
                        <div>
                          <p className="text-sm text-slate-400">Company</p>
                          <p className="text-slate-200">{selectedContact.company}</p>
                        </div>
                      </div>
                    )}

                    {selectedContact.website && (
                      <div className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <Globe className="w-5 h-5 text-cyan-400" />
                        <div>
                          <p className="text-sm text-slate-400">Website</p>
                          <a
                            href={selectedContact.website.startsWith('http') ? selectedContact.website : `https://${selectedContact.website}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-cyan-300 hover:text-cyan-200 transition-colors"
                          >
                            {selectedContact.website}
                          </a>
                        </div>
                      </div>
                    )}

                    {selectedContact.notes && (
                      <div className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg">
                        <MessageCircle className="w-5 h-5 text-yellow-400 mt-1" />
                        <div>
                          <p className="text-sm text-slate-400 mb-2">Notes</p>
                          <p className="text-slate-200 whitespace-pre-wrap leading-relaxed">
                            {selectedContact.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="text-xs text-slate-400 mt-6 pt-4 border-t border-slate-700/50">
                    Last updated: {formatDate(selectedContact.updatedAt)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Users className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No contact selected</h3>
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

export default ContactsApp;