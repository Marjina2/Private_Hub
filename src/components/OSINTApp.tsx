import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Search, Globe, User, MapPin, Phone, Mail, Hash, 
  Instagram, Twitter, Facebook, Linkedin, Github, Youtube,
  Shield, Eye, Wifi, Server, Database, Camera, Image as ImageIcon,
  ExternalLink, Copy, AlertTriangle, Info, CheckCircle, Clock,
  Smartphone, Monitor, Fingerprint, Key, Lock, Unlock, Zap,
  Target, Crosshair, Radar, Satellite, Navigation, Compass
} from 'lucide-react';
import Header from './Header';

interface OSINTTool {
  id: string;
  name: string;
  description: string;
  category: string;
  url: string;
  icon: React.ComponentType<any>;
  color: string;
  isPremium?: boolean;
  tags: string[];
}

interface SearchResult {
  id: string;
  tool: string;
  query: string;
  result: string;
  timestamp: Date;
  category: string;
}

const OSINTApp: React.FC = () => {
  const navigate = useNavigate();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState<SearchResult[]>([]);
  const [activeQuery, setActiveQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  const categories = [
    { id: 'all', name: 'All Tools', icon: Globe },
    { id: 'social', name: 'Social Media', icon: User },
    { id: 'network', name: 'Network & IP', icon: Wifi },
    { id: 'domain', name: 'Domain & DNS', icon: Server },
    { id: 'email', name: 'Email & Phone', icon: Mail },
    { id: 'username', name: 'Username', icon: Hash },
    { id: 'image', name: 'Image & Visual', icon: ImageIcon },
    { id: 'geolocation', name: 'Geolocation', icon: MapPin },
    { id: 'breach', name: 'Data Breaches', icon: Shield },
    { id: 'metadata', name: 'Metadata', icon: Database }
  ];

  const osintTools: OSINTTool[] = [
    // Social Media OSINT
    {
      id: 'sherlock',
      name: 'Sherlock',
      description: 'Hunt down social media accounts by username across social networks',
      category: 'username',
      url: 'https://sherlock-project.github.io/',
      icon: User,
      color: 'from-blue-500 to-blue-600',
      tags: ['username', 'social media', 'accounts']
    },
    {
      id: 'whatsmyname',
      name: 'WhatsMyName',
      description: 'Unified data required to perform user enumeration on various websites',
      category: 'username',
      url: 'https://whatsmyname.app/',
      icon: Hash,
      color: 'from-green-500 to-green-600',
      tags: ['username', 'enumeration', 'social']
    },
    {
      id: 'namechk',
      name: 'Namechk',
      description: 'Check username availability across 100+ social networks',
      category: 'username',
      url: 'https://namechk.com/',
      icon: CheckCircle,
      color: 'from-purple-500 to-purple-600',
      tags: ['username', 'availability', 'social']
    },
    {
      id: 'social-searcher',
      name: 'Social Searcher',
      description: 'Free social media search engine',
      category: 'social',
      url: 'https://www.social-searcher.com/',
      icon: Search,
      color: 'from-pink-500 to-pink-600',
      tags: ['social media', 'search', 'monitoring']
    },
    {
      id: 'pipl',
      name: 'Pipl',
      description: 'People search engine for finding personal information',
      category: 'social',
      url: 'https://pipl.com/',
      icon: User,
      color: 'from-indigo-500 to-indigo-600',
      tags: ['people search', 'personal info', 'identity']
    },

    // Network & IP OSINT
    {
      id: 'shodan',
      name: 'Shodan',
      description: 'Search engine for Internet-connected devices',
      category: 'network',
      url: 'https://www.shodan.io/',
      icon: Radar,
      color: 'from-red-500 to-red-600',
      tags: ['iot', 'devices', 'network', 'security']
    },
    {
      id: 'censys',
      name: 'Censys',
      description: 'Internet-wide scanning and analysis platform',
      category: 'network',
      url: 'https://censys.io/',
      icon: Satellite,
      color: 'from-blue-500 to-blue-600',
      tags: ['scanning', 'certificates', 'network']
    },
    {
      id: 'ipinfo',
      name: 'IPinfo',
      description: 'IP address geolocation and network information',
      category: 'network',
      url: 'https://ipinfo.io/',
      icon: MapPin,
      color: 'from-green-500 to-green-600',
      tags: ['ip', 'geolocation', 'network']
    },
    {
      id: 'whatismyipaddress',
      name: 'WhatIsMyIPAddress',
      description: 'IP lookup and geolocation service',
      category: 'network',
      url: 'https://whatismyipaddress.com/',
      icon: Globe,
      color: 'from-yellow-500 to-yellow-600',
      tags: ['ip', 'location', 'isp']
    },
    {
      id: 'virustotal',
      name: 'VirusTotal',
      description: 'Analyze suspicious files, URLs, domains and IP addresses',
      category: 'network',
      url: 'https://www.virustotal.com/',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      tags: ['malware', 'security', 'analysis']
    },

    // Domain & DNS OSINT
    {
      id: 'whois',
      name: 'Whois Lookup',
      description: 'Domain registration information lookup',
      category: 'domain',
      url: 'https://whois.net/',
      icon: Server,
      color: 'from-blue-500 to-blue-600',
      tags: ['domain', 'registration', 'ownership']
    },
    {
      id: 'dnslytics',
      name: 'DNSlytics',
      description: 'DNS and domain analysis tools',
      category: 'domain',
      url: 'https://dnslytics.com/',
      icon: Database,
      color: 'from-purple-500 to-purple-600',
      tags: ['dns', 'domain', 'analysis']
    },
    {
      id: 'securitytrails',
      name: 'SecurityTrails',
      description: 'DNS and domain intelligence platform',
      category: 'domain',
      url: 'https://securitytrails.com/',
      icon: Fingerprint,
      color: 'from-indigo-500 to-indigo-600',
      tags: ['dns', 'history', 'intelligence']
    },
    {
      id: 'builtwith',
      name: 'BuiltWith',
      description: 'Website technology profiler',
      category: 'domain',
      url: 'https://builtwith.com/',
      icon: Monitor,
      color: 'from-green-500 to-green-600',
      tags: ['technology', 'website', 'analysis']
    },

    // Email & Phone OSINT
    {
      id: 'hunter',
      name: 'Hunter.io',
      description: 'Find professional email addresses',
      category: 'email',
      url: 'https://hunter.io/',
      icon: Mail,
      color: 'from-orange-500 to-orange-600',
      tags: ['email', 'finder', 'professional']
    },
    {
      id: 'truecaller',
      name: 'Truecaller',
      description: 'Phone number lookup and caller identification',
      category: 'email',
      url: 'https://www.truecaller.com/',
      icon: Phone,
      color: 'from-blue-500 to-blue-600',
      tags: ['phone', 'caller id', 'lookup']
    },
    {
      id: 'emailrep',
      name: 'EmailRep',
      description: 'Email reputation and intelligence lookup',
      category: 'email',
      url: 'https://emailrep.io/',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      tags: ['email', 'reputation', 'security']
    },
    {
      id: 'phonebook',
      name: 'PhoneBook.cz',
      description: 'Search for domains, URLs, and email addresses',
      category: 'email',
      url: 'https://phonebook.cz/',
      icon: Database,
      color: 'from-purple-500 to-purple-600',
      tags: ['email', 'domain', 'search']
    },

    // Image & Visual OSINT
    {
      id: 'tineye',
      name: 'TinEye',
      description: 'Reverse image search engine',
      category: 'image',
      url: 'https://tineye.com/',
      icon: Eye,
      color: 'from-green-500 to-green-600',
      tags: ['reverse image', 'search', 'verification']
    },
    {
      id: 'google-images',
      name: 'Google Images',
      description: 'Google reverse image search',
      category: 'image',
      url: 'https://images.google.com/',
      icon: Camera,
      color: 'from-blue-500 to-blue-600',
      tags: ['reverse image', 'google', 'search']
    },
    {
      id: 'yandex-images',
      name: 'Yandex Images',
      description: 'Yandex reverse image search (often better than Google)',
      category: 'image',
      url: 'https://yandex.com/images/',
      icon: ImageIcon,
      color: 'from-red-500 to-red-600',
      tags: ['reverse image', 'yandex', 'search']
    },
    {
      id: 'exifdata',
      name: 'ExifData',
      description: 'Extract metadata from images',
      category: 'metadata',
      url: 'https://exifdata.com/',
      icon: Database,
      color: 'from-purple-500 to-purple-600',
      tags: ['exif', 'metadata', 'images']
    },

    // Geolocation OSINT
    {
      id: 'wigle',
      name: 'WiGLE',
      description: 'Wireless network mapping and geolocation',
      category: 'geolocation',
      url: 'https://wigle.net/',
      icon: Wifi,
      color: 'from-blue-500 to-blue-600',
      tags: ['wifi', 'wireless', 'mapping']
    },
    {
      id: 'google-earth',
      name: 'Google Earth',
      description: 'Satellite imagery and 3D mapping',
      category: 'geolocation',
      url: 'https://earth.google.com/',
      icon: Satellite,
      color: 'from-green-500 to-green-600',
      tags: ['satellite', 'mapping', 'imagery']
    },
    {
      id: 'openstreetmap',
      name: 'OpenStreetMap',
      description: 'Free and open-source mapping platform',
      category: 'geolocation',
      url: 'https://www.openstreetmap.org/',
      icon: MapPin,
      color: 'from-orange-500 to-orange-600',
      tags: ['mapping', 'open source', 'location']
    },

    // Data Breach OSINT
    {
      id: 'haveibeenpwned',
      name: 'Have I Been Pwned',
      description: 'Check if email has been compromised in data breaches',
      category: 'breach',
      url: 'https://haveibeenpwned.com/',
      icon: Shield,
      color: 'from-red-500 to-red-600',
      tags: ['breach', 'email', 'security']
    },
    {
      id: 'dehashed',
      name: 'DeHashed',
      description: 'Search engine for leaked databases',
      category: 'breach',
      url: 'https://dehashed.com/',
      icon: Key,
      color: 'from-purple-500 to-purple-600',
      tags: ['breach', 'database', 'leaked']
    },
    {
      id: 'leakcheck',
      name: 'LeakCheck',
      description: 'Data breach search engine',
      category: 'breach',
      url: 'https://leakcheck.io/',
      icon: AlertTriangle,
      color: 'from-yellow-500 to-yellow-600',
      tags: ['breach', 'leak', 'search']
    },

    // Additional Specialized Tools
    {
      id: 'wayback-machine',
      name: 'Wayback Machine',
      description: 'Internet archive for historical website snapshots',
      category: 'domain',
      url: 'https://web.archive.org/',
      icon: Clock,
      color: 'from-blue-500 to-blue-600',
      tags: ['archive', 'history', 'website']
    },
    {
      id: 'maltego',
      name: 'Maltego CE',
      description: 'Link analysis and data mining application',
      category: 'network',
      url: 'https://www.maltego.com/',
      icon: Target,
      color: 'from-indigo-500 to-indigo-600',
      tags: ['link analysis', 'investigation', 'visualization']
    },
    {
      id: 'spyse',
      name: 'Spyse',
      description: 'Internet assets search engine',
      category: 'network',
      url: 'https://spyse.com/',
      icon: Crosshair,
      color: 'from-red-500 to-red-600',
      tags: ['assets', 'reconnaissance', 'search']
    },
    {
      id: 'intelx',
      name: 'Intelligence X',
      description: 'Search engine for leaked data and documents',
      category: 'breach',
      url: 'https://intelx.io/',
      icon: Database,
      color: 'from-purple-500 to-purple-600',
      tags: ['intelligence', 'leaked data', 'documents']
    },
    {
      id: 'osintframework',
      name: 'OSINT Framework',
      description: 'Collection of OSINT tools and resources',
      category: 'all',
      url: 'https://osintframework.com/',
      icon: Compass,
      color: 'from-green-500 to-green-600',
      tags: ['framework', 'tools', 'resources']
    }
  ];

  useEffect(() => {
    // Load search history from localStorage
    const savedHistory = localStorage.getItem('private_hub_osint_history');
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory).map((item: any) => ({
        ...item,
        timestamp: new Date(item.timestamp)
      }));
      setSearchHistory(parsedHistory);
    }
  }, []);

  const saveSearchHistory = (newHistory: SearchResult[]) => {
    setSearchHistory(newHistory);
    localStorage.setItem(`private_hub_osint_history_${currentToken}`, JSON.stringify(newHistory));
  };

  const addToHistory = (tool: string, query: string, result: string, category: string) => {
    const newResult: SearchResult = {
      id: Date.now().toString(),
      tool,
      query,
      result,
      timestamp: new Date(),
      category
    };

    const newHistory = [newResult, ...searchHistory.slice(0, 49)]; // Keep last 50 searches
    saveSearchHistory(newHistory);
  };

  const clearHistory = () => {
    if (window.confirm('Are you sure you want to clear all search history?')) {
      saveSearchHistory([]);
    }
  };

  const openTool = (tool: OSINTTool, query?: string) => {
    let url = tool.url;
    
    // Add query parameters for specific tools
    if (query) {
      switch (tool.id) {
        case 'sherlock':
          // Sherlock is a command-line tool, provide instructions
          addToHistory(tool.name, query, 'Command-line tool - see documentation for usage', tool.category);
          break;
        case 'whatsmyname':
          url = `${tool.url}?q=${encodeURIComponent(query)}`;
          addToHistory(tool.name, query, `Searched for username: ${query}`, tool.category);
          break;
        case 'namechk':
          url = `${tool.url}/${encodeURIComponent(query)}`;
          addToHistory(tool.name, query, `Checked username availability: ${query}`, tool.category);
          break;
        case 'social-searcher':
          url = `${tool.url}/search?q=${encodeURIComponent(query)}`;
          addToHistory(tool.name, query, `Social media search: ${query}`, tool.category);
          break;
        case 'shodan':
          url = `${tool.url}/search?query=${encodeURIComponent(query)}`;
          addToHistory(tool.name, query, `Device search: ${query}`, tool.category);
          break;
        case 'censys':
          url = `${tool.url}/search?q=${encodeURIComponent(query)}`;
          addToHistory(tool.name, query, `Network scan: ${query}`, tool.category);
          break;
        case 'ipinfo':
          url = `${tool.url}/${encodeURIComponent(query)}`;
          addToHistory(tool.name, query, `IP lookup: ${query}`, tool.category);
          break;
        case 'whois':
          url = `${tool.url}/${encodeURIComponent(query)}`;
          addToHistory(tool.name, query, `Domain lookup: ${query}`, tool.category);
          break;
        case 'hunter':
          url = `${tool.url}/search/${encodeURIComponent(query)}`;
          addToHistory(tool.name, query, `Email search: ${query}`, tool.category);
          break;
        case 'haveibeenpwned':
          url = `${tool.url}/unifiedsearch/${encodeURIComponent(query)}`;
          addToHistory(tool.name, query, `Breach check: ${query}`, tool.category);
          break;
        case 'tineye':
          // TinEye requires image upload, provide instructions
          addToHistory(tool.name, query, 'Upload image on TinEye website for reverse search', tool.category);
          break;
        case 'google-images':
          url = `${tool.url}?tbs=sbi:${encodeURIComponent(query)}`;
          addToHistory(tool.name, query, `Reverse image search: ${query}`, tool.category);
          break;
        default:
          addToHistory(tool.name, query, `Searched: ${query}`, tool.category);
      }
    }

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const performSearch = async (tool: OSINTTool) => {
    if (!activeQuery.trim()) {
      alert('Please enter a search query');
      return;
    }

    setIsSearching(true);
    
    // Simulate search delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    openTool(tool, activeQuery);
    setIsSearching(false);
    setActiveQuery('');
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      alert('Copied to clipboard');
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const filteredTools = osintTools.filter(tool => {
    const matchesCategory = selectedCategory === 'all' || tool.category === selectedCategory;
    const matchesSearch = tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         tool.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

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
            <Target className="w-8 h-8 text-red-400" />
            OSINT Toolkit
          </h1>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Total Tools</p>
                <p className="text-2xl font-bold text-white">{osintTools.length}</p>
              </div>
              <Target className="w-8 h-8 text-red-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Categories</p>
                <p className="text-2xl font-bold text-white">{categories.length - 1}</p>
              </div>
              <Globe className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Search History</p>
                <p className="text-2xl font-bold text-white">{searchHistory.length}</p>
              </div>
              <Clock className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Free Tools</p>
                <p className="text-2xl font-bold text-white">{osintTools.filter(t => !t.isPremium).length}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Categories & Search */}
          <div className="lg:col-span-1 space-y-6">
            {/* Quick Search */}
            <div className="backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Search</h2>
              
              <div className="space-y-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Enter target (IP, domain, email, username...)"
                    value={activeQuery}
                    onChange={(e) => setActiveQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => performSearch(osintTools.find(t => t.id === 'shodan')!)}
                    disabled={isSearching || !activeQuery.trim()}
                    className="px-3 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white rounded text-sm transition-colors"
                  >
                    Shodan
                  </button>
                  <button
                    onClick={() => performSearch(osintTools.find(t => t.id === 'haveibeenpwned')!)}
                    disabled={isSearching || !activeQuery.trim()}
                    className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white rounded text-sm transition-colors"
                  >
                    HIBP
                  </button>
                  <button
                    onClick={() => performSearch(osintTools.find(t => t.id === 'whois')!)}
                    disabled={isSearching || !activeQuery.trim()}
                    className="px-3 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded text-sm transition-colors"
                  >
                    Whois
                  </button>
                  <button
                    onClick={() => performSearch(osintTools.find(t => t.id === 'sherlock')!)}
                    disabled={isSearching || !activeQuery.trim()}
                    className="px-3 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded text-sm transition-colors"
                  >
                    Sherlock
                  </button>
                </div>
              </div>
            </div>

            {/* Categories */}
            <div className="backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
              <h2 className="text-lg font-semibold text-white mb-4">Categories</h2>
              
              <div className="space-y-2">
                {categories.map((category) => {
                  const IconComponent = category.icon;
                  const toolCount = category.id === 'all' ? osintTools.length : osintTools.filter(t => t.category === category.id).length;
                  
                  return (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-red-600/30 border border-red-500/50 text-white'
                          : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300'
                      }`}
                    >
                      <IconComponent className="w-5 h-5" />
                      <span className="flex-1 text-left">{category.name}</span>
                      <span className="text-xs bg-slate-600/50 px-2 py-1 rounded">{toolCount}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Search History */}
            <div className="backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Recent Searches</h2>
                {searchHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    Clear
                  </button>
                )}
              </div>
              
              <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
                {searchHistory.length === 0 ? (
                  <p className="text-slate-400 text-sm">No searches yet</p>
                ) : (
                  searchHistory.slice(0, 10).map((item) => (
                    <div key={item.id} className="p-2 bg-slate-700/30 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-white truncate">{item.tool}</span>
                        <button
                          onClick={() => copyToClipboard(item.query)}
                          className="text-slate-400 hover:text-white transition-colors"
                        >
                          <Copy className="w-3 h-3" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-300 truncate">{item.query}</p>
                      <p className="text-xs text-slate-400 mt-1">{formatDate(item.timestamp)}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Tools Grid */}
          <div className="lg:col-span-3">
            {/* Search Bar */}
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search OSINT tools..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
            </div>

            {/* Tools Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredTools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  <div
                    key={tool.id}
                    className="group backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4 hover:border-slate-600/50 transition-all duration-300"
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <div className={`inline-flex items-center justify-center w-10 h-10 bg-gradient-to-br ${tool.color} rounded-lg group-hover:scale-110 transition-transform`}>
                        <IconComponent className="w-5 h-5 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-semibold text-white mb-1">{tool.name}</h3>
                        <p className="text-sm text-slate-300 leading-relaxed">{tool.description}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {tool.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-slate-700/50 text-slate-300 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openTool(tool)}
                        className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Open Tool
                      </button>
                      
                      <button
                        onClick={() => copyToClipboard(tool.url)}
                        className="px-3 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {filteredTools.length === 0 && (
              <div className="text-center py-12">
                <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">No tools found</h3>
                <p className="text-slate-300">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        </div>

        {/* Security Warning */}
        <div className="mt-8 backdrop-blur-lg bg-red-900/20 border border-red-500/30 rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 flex-shrink-0 mt-1" />
            <div>
              <h3 className="text-lg font-semibold text-red-200 mb-2">⚠️ ETHICAL USE ONLY</h3>
              <p className="text-red-300 text-sm leading-relaxed">
                These OSINT tools are provided for educational, research, and legitimate security purposes only. 
                Always ensure you have proper authorization before investigating any targets. Respect privacy laws, 
                terms of service, and ethical guidelines. Unauthorized surveillance or data collection may be illegal 
                in your jurisdiction.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OSINTApp;