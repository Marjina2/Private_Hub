import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StickyNote, Plus, Grid3x3, Globe, CheckSquare, Users, Hash, Instagram, Youtube, Image as ImageIcon, Target } from 'lucide-react';
import Header from './Header';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();

  const tools = [
    {
      id: 'notes',
      title: 'Notes',
      description: 'Create and manage your private notes',
      icon: StickyNote,
      color: 'from-amber-500 to-orange-600',
      onClick: () => navigate('/notes')
    },
    {
      id: 'websites',
      title: 'Websites',
      description: 'Manage your favorite websites and bookmarks',
      icon: Globe,
      color: 'from-blue-500 to-cyan-600',
      onClick: () => navigate('/websites')
    },
    {
      id: 'todos',
      title: 'Tasks',
      description: 'Organize your tasks and track progress',
      icon: CheckSquare,
      color: 'from-green-500 to-emerald-600',
      onClick: () => navigate('/todos')
    },
    {
      id: 'contacts',
      title: 'Contacts',
      description: 'Save and manage your contact information',
      icon: Users,
      color: 'from-indigo-500 to-purple-600',
      onClick: () => navigate('/contacts')
    },
    {
      id: 'discord',
      title: 'Discord',
      description: 'Manage your Discord contacts',
      icon: Hash,
      color: 'from-indigo-500 to-indigo-600',
      onClick: () => navigate('/discord')
    },
    {
      id: 'instagram',
      title: 'Instagram',
      description: 'Manage your Instagram contacts',
      icon: Instagram,
      color: 'from-pink-500 to-pink-600',
      onClick: () => navigate('/instagram')
    },
    {
      id: 'youtube',
      title: 'YouTube',
      description: 'Save important videos with transcriptions',
      icon: Youtube,
      color: 'from-red-500 to-red-600',
      onClick: () => navigate('/youtube')
    },
    {
      id: 'photos',
      title: 'Photo Gallery',
      description: 'Secure photo storage with advanced features',
      icon: ImageIcon,
      color: 'from-purple-500 to-purple-600',
      onClick: () => navigate('/photos')
    },
    {
      id: 'osint',
      title: 'OSINT',
      description: 'Open Source Intelligence gathering tools',
      icon: Target,
      color: 'from-red-500 to-red-600',
      onClick: () => navigate('/osint')
    }
  ];

  return (
    <div className="min-h-screen">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome to Private Hub</h1>
          <p className="text-slate-300">Your secure toolkit dashboard</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool) => {
            const IconComponent = tool.icon;
            return (
              <div
                key={tool.id}
                onClick={tool.onClick}
                className="group backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-105 hover:bg-white/15 hover:border-white/30"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl mb-4 group-hover:scale-110 transition-transform`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-semibold text-white mb-2">{tool.title}</h3>
                <p className="text-slate-300 text-sm">{tool.description}</p>
                
                <div className="mt-4 flex items-center text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  <Grid3x3 className="w-4 h-4 mr-1" />
                  Click to access
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;