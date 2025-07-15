import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Plus, Search, Edit3, Trash2, Save, X, Users, Calendar, 
  Clock, Flag, AlertTriangle, CheckSquare, Square, User, MessageCircle,
  MoreHorizontal, Filter, SortAsc, Eye, Bell, Share2, Settings,
  Kanban, List, Grid3x3, Target, Zap, TrendingUp, Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import Header from './Header';
import ShareComponent from './ShareComponent';

interface TeamMember {
  id: string;
  name: string;
  avatar: string;
  role: string;
  isOnline: boolean;
}

interface TaskComment {
  id: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: Date;
}

interface CollaborativeTask {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string[];
  createdBy: string;
  dueDate?: Date;
  tags: string[];
  comments: TaskComment[];
  attachments: string[];
  estimatedHours?: number;
  actualHours?: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  members: string[];
  createdAt: Date;
}

const CollaborativeTasksApp: React.FC = () => {
  const navigate = useNavigate();
  const { currentToken, currentUser } = useAuth();
  const [tasks, setTasks] = useState<CollaborativeTask[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('');
  const [selectedTask, setSelectedTask] = useState<CollaborativeTask | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTask, setEditingTask] = useState<Partial<CollaborativeTask>>({});
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState<string>('all');
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newComment, setNewComment] = useState('');

  const statusColumns = [
    { id: 'todo', title: 'To Do', color: 'bg-slate-500', count: 0 },
    { id: 'in-progress', title: 'In Progress', color: 'bg-blue-500', count: 0 },
    { id: 'review', title: 'Review', color: 'bg-yellow-500', count: 0 },
    { id: 'done', title: 'Done', color: 'bg-green-500', count: 0 }
  ];

  const priorityColors = {
    low: 'text-green-400 bg-green-500/20',
    medium: 'text-yellow-400 bg-yellow-500/20',
    high: 'text-orange-400 bg-orange-500/20',
    urgent: 'text-red-400 bg-red-500/20'
  };

  const projectColors = [
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
    // Load data from token-specific localStorage
    const savedTasks = localStorage.getItem(`private_hub_collaborative_tasks_${currentToken}`);
    const savedProjects = localStorage.getItem(`private_hub_projects_${currentToken}`);
    const savedMembers = localStorage.getItem(`private_hub_team_members_${currentToken}`);
    
    if (savedTasks) {
      const parsedTasks = JSON.parse(savedTasks).map((task: any) => ({
        ...task,
        createdAt: new Date(task.createdAt),
        updatedAt: new Date(task.updatedAt),
        dueDate: task.dueDate ? new Date(task.dueDate) : undefined,
        comments: task.comments.map((comment: any) => ({
          ...comment,
          createdAt: new Date(comment.createdAt)
        }))
      }));
      setTasks(parsedTasks);
    }

    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects).map((project: any) => ({
        ...project,
        createdAt: new Date(project.createdAt)
      }));
      setProjects(parsedProjects);
    }

    if (savedMembers) {
      setTeamMembers(JSON.parse(savedMembers));
    } else {
      // Initialize with current user
      const initialMember: TeamMember = {
        id: currentUser?.id || 'current',
        name: currentUser?.name || 'You',
        avatar: '',
        role: 'Owner',
        isOnline: true
      };
      setTeamMembers([initialMember]);
    }
  }, [currentToken, currentUser]);

  const saveTasks = (newTasks: CollaborativeTask[]) => {
    setTasks(newTasks);
    localStorage.setItem(`private_hub_collaborative_tasks_${currentToken}`, JSON.stringify(newTasks));
  };

  const saveProjects = (newProjects: Project[]) => {
    setProjects(newProjects);
    localStorage.setItem(`private_hub_projects_${currentToken}`, JSON.stringify(newProjects));
  };

  const saveTeamMembers = (newMembers: TeamMember[]) => {
    setTeamMembers(newMembers);
    localStorage.setItem(`private_hub_team_members_${currentToken}`, JSON.stringify(newMembers));
  };

  const createProject = () => {
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: Date.now().toString(),
      name: newProjectName.trim(),
      description: '',
      color: projectColors[projects.length % projectColors.length],
      members: [currentUser?.id || 'current'],
      createdAt: new Date()
    };

    const newProjects = [...projects, newProject];
    saveProjects(newProjects);
    setNewProjectName('');
    setIsCreatingProject(false);
    setSelectedProject(newProject.id);
  };

  const createTask = () => {
    const newTask: CollaborativeTask = {
      id: Date.now().toString(),
      title: 'New Task',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignedTo: [currentUser?.id || 'current'],
      createdBy: currentUser?.id || 'current',
      tags: [],
      comments: [],
      attachments: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setEditingTask(newTask);
    setIsEditing(true);
  };

  const editTask = (task: CollaborativeTask) => {
    setEditingTask({ ...task });
    setIsEditing(true);
  };

  const saveTask = () => {
    if (!editingTask.title?.trim()) return;

    const taskToSave: CollaborativeTask = {
      id: editingTask.id || Date.now().toString(),
      title: editingTask.title || '',
      description: editingTask.description || '',
      status: editingTask.status || 'todo',
      priority: editingTask.priority || 'medium',
      assignedTo: editingTask.assignedTo || [currentUser?.id || 'current'],
      createdBy: editingTask.createdBy || currentUser?.id || 'current',
      dueDate: editingTask.dueDate,
      tags: editingTask.tags || [],
      comments: editingTask.comments || [],
      attachments: editingTask.attachments || [],
      estimatedHours: editingTask.estimatedHours,
      actualHours: editingTask.actualHours,
      createdAt: editingTask.createdAt || new Date(),
      updatedAt: new Date()
    };

    const existingIndex = tasks.findIndex(t => t.id === taskToSave.id);
    let newTasks;
    
    if (existingIndex >= 0) {
      newTasks = [...tasks];
      newTasks[existingIndex] = taskToSave;
    } else {
      newTasks = [taskToSave, ...tasks];
    }

    saveTasks(newTasks);
    setIsEditing(false);
    setEditingTask({});
    setSelectedTask(taskToSave);
  };

  const updateTaskStatus = (taskId: string, newStatus: string) => {
    const newTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus as any, updatedAt: new Date() }
        : task
    );
    saveTasks(newTasks);
  };

  const deleteTask = (taskId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const newTasks = tasks.filter(t => t.id !== taskId);
      saveTasks(newTasks);
      if (selectedTask?.id === taskId) {
        setSelectedTask(null);
      }
    }
  };

  const addComment = (taskId: string) => {
    if (!newComment.trim()) return;

    const comment: TaskComment = {
      id: Date.now().toString(),
      userId: currentUser?.id || 'current',
      userName: currentUser?.name || 'You',
      content: newComment.trim(),
      createdAt: new Date()
    };

    const newTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, comments: [...task.comments, comment], updatedAt: new Date() }
        : task
    );
    
    saveTasks(newTasks);
    setNewComment('');
    
    if (selectedTask?.id === taskId) {
      setSelectedTask({ ...selectedTask, comments: [...selectedTask.comments, comment] });
    }
  };

  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         task.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || task.status === filterStatus;
    const matchesAssignee = filterAssignee === 'all' || task.assignedTo.includes(filterAssignee);
    const matchesProject = !selectedProject || task.assignedTo.some(id => 
      projects.find(p => p.id === selectedProject)?.members.includes(id)
    );
    
    return matchesSearch && matchesStatus && matchesAssignee && matchesProject;
  });

  const getTasksByStatus = (status: string) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getMemberName = (memberId: string) => {
    const member = teamMembers.find(m => m.id === memberId);
    return member ? member.name : 'Unknown';
  };

  const getProjectStats = () => {
    const totalTasks = filteredTasks.length;
    const completedTasks = filteredTasks.filter(t => t.status === 'done').length;
    const inProgressTasks = filteredTasks.filter(t => t.status === 'in-progress').length;
    const overdueTasks = filteredTasks.filter(t => 
      t.dueDate && t.dueDate < new Date() && t.status !== 'done'
    ).length;

    return { totalTasks, completedTasks, inProgressTasks, overdueTasks };
  };

  const stats = getProjectStats();

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
              <Users className="w-8 h-8 text-emerald-400" />
              Team Tasks
            </h1>
            <ShareComponent appType="collaborative-tasks" appName="Team Tasks" />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Total Tasks</p>
                <p className="text-2xl font-bold text-white">{stats.totalTasks}</p>
              </div>
              <Target className="w-8 h-8 text-emerald-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">In Progress</p>
                <p className="text-2xl font-bold text-white">{stats.inProgressTasks}</p>
              </div>
              <Activity className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completedTasks}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Overdue</p>
                <p className="text-2xl font-bold text-white">{stats.overdueTasks}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-red-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[calc(100vh-22rem)]">
          {/* Sidebar */}
          <div className="lg:col-span-1 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Projects</h2>
              <button
                onClick={() => setIsCreatingProject(true)}
                className="p-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                title="Create Project"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Create Project Form */}
            {isCreatingProject && (
              <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                <input
                  type="text"
                  placeholder="Enter project name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createProject()}
                  className="w-full p-2 bg-slate-600/50 border border-slate-500/50 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 mb-2"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={createProject}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded text-sm transition-colors"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingProject(false);
                      setNewProjectName('');
                    }}
                    className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white rounded text-sm transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {/* Projects List */}
            <div className="space-y-2 mb-6">
              <button
                onClick={() => setSelectedProject('')}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedProject === '' 
                    ? 'bg-emerald-600/30 border border-emerald-500/50 text-white'
                    : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-gradient-to-r from-slate-500 to-slate-600" />
                  <span className="font-medium">All Projects</span>
                  <span className="text-xs bg-slate-600/50 px-2 py-1 rounded ml-auto">
                    {tasks.length}
                  </span>
                </div>
              </button>

              {projects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project.id)}
                  className={`w-full text-left p-3 rounded-lg transition-colors ${
                    selectedProject === project.id 
                      ? 'bg-emerald-600/30 border border-emerald-500/50 text-white'
                      : 'bg-slate-700/30 hover:bg-slate-700/50 text-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${project.color}`} />
                    <span className="font-medium">{project.name}</span>
                    <span className="text-xs bg-slate-600/50 px-2 py-1 rounded ml-auto">
                      {tasks.filter(t => t.assignedTo.some(id => project.members.includes(id))).length}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* View Mode Toggle */}
            <div className="mb-4">
              <h3 className="text-sm font-medium text-slate-300 mb-2">View Mode</h3>
              <div className="flex gap-1 bg-slate-700/30 rounded-lg p-1">
                {[
                  { key: 'kanban', icon: Kanban, label: 'Board' },
                  { key: 'list', icon: List, label: 'List' },
                  { key: 'calendar', icon: Calendar, label: 'Calendar' }
                ].map((mode) => {
                  const IconComponent = mode.icon;
                  return (
                    <button
                      key={mode.key}
                      onClick={() => setViewMode(mode.key as any)}
                      className={`flex-1 flex items-center justify-center gap-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                        viewMode === mode.key
                          ? 'bg-emerald-600 text-white shadow-lg'
                          : 'text-slate-300 hover:text-white'
                      }`}
                    >
                      <IconComponent className="w-4 h-4" />
                      <span className="hidden sm:inline">{mode.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Team Members */}
            <div>
              <h3 className="text-sm font-medium text-slate-300 mb-2">Team Members</h3>
              <div className="space-y-2">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center gap-2 p-2 bg-slate-700/30 rounded-lg">
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {member.name.charAt(0)}
                      </div>
                      {member.isOnline && (
                        <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 border-2 border-slate-800 rounded-full" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">{member.name}</p>
                      <p className="text-xs text-slate-400">{member.role}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            {/* Header Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="p-2 bg-slate-700/50 border border-slate-600/50 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="all">All Status</option>
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <button
                onClick={createTask}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                New Task
              </button>
            </div>

            {/* Kanban Board */}
            {viewMode === 'kanban' && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 h-[calc(100%-8rem)] overflow-auto">
                {statusColumns.map((column) => {
                  const columnTasks = getTasksByStatus(column.id);
                  return (
                    <div key={column.id} className="flex flex-col">
                      <div className="flex items-center gap-2 mb-4 p-3 bg-slate-700/30 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${column.color}`} />
                        <h3 className="font-medium text-white">{column.title}</h3>
                        <span className="text-xs bg-slate-600/50 text-slate-300 px-2 py-1 rounded">
                          {columnTasks.length}
                        </span>
                      </div>

                      <div className="flex-1 space-y-3 overflow-y-auto">
                        {columnTasks.map((task) => (
                          <div
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className="p-4 bg-slate-700/50 border border-slate-600/30 rounded-lg cursor-pointer hover:border-slate-500/50 transition-colors"
                          >
                            <div className="flex items-start justify-between mb-2">
                              <h4 className="font-medium text-white truncate">{task.title}</h4>
                              <div className={`px-2 py-1 rounded text-xs ${priorityColors[task.priority]}`}>
                                {task.priority}
                              </div>
                            </div>
                            
                            {task.description && (
                              <p className="text-sm text-slate-300 mb-3 line-clamp-2">{task.description}</p>
                            )}

                            <div className="flex items-center justify-between">
                              <div className="flex -space-x-2">
                                {task.assignedTo.slice(0, 3).map((memberId, index) => (
                                  <div
                                    key={index}
                                    className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-slate-700"
                                    title={getMemberName(memberId)}
                                  >
                                    {getMemberName(memberId).charAt(0)}
                                  </div>
                                ))}
                                {task.assignedTo.length > 3 && (
                                  <div className="w-6 h-6 bg-slate-600 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-slate-700">
                                    +{task.assignedTo.length - 3}
                                  </div>
                                )}
                              </div>

                              {task.dueDate && (
                                <div className="flex items-center gap-1 text-xs text-slate-400">
                                  <Clock className="w-3 h-3" />
                                  {task.dueDate.toLocaleDateString()}
                                </div>
                              )}
                            </div>

                            {task.comments.length > 0 && (
                              <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                                <MessageCircle className="w-3 h-3" />
                                {task.comments.length} comments
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="space-y-2 h-[calc(100%-8rem)] overflow-auto">
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTask(task)}
                    className="p-4 bg-slate-700/30 border border-slate-600/30 rounded-lg cursor-pointer hover:border-slate-500/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className={`w-3 h-3 rounded-full ${statusColumns.find(c => c.id === task.status)?.color}`} />
                        <div className="flex-1">
                          <h4 className="font-medium text-white">{task.title}</h4>
                          <p className="text-sm text-slate-300 truncate">{task.description}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className={`px-2 py-1 rounded text-xs ${priorityColors[task.priority]}`}>
                          {task.priority}
                        </div>
                        
                        <div className="flex -space-x-2">
                          {task.assignedTo.slice(0, 2).map((memberId, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold border-2 border-slate-700"
                              title={getMemberName(memberId)}
                            >
                              {getMemberName(memberId).charAt(0)}
                            </div>
                          ))}
                        </div>

                        {task.dueDate && (
                          <div className="text-xs text-slate-400">
                            {task.dueDate.toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Calendar View Placeholder */}
            {viewMode === 'calendar' && (
              <div className="h-[calc(100%-8rem)] flex items-center justify-center">
                <div className="text-center">
                  <Calendar className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">Calendar View</h3>
                  <p className="text-slate-300">Calendar view coming soon!</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Task Detail Modal */}
        {selectedTask && !isEditing && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">{selectedTask.title}</h2>
                <div className="flex gap-2">
                  <button
                    onClick={() => editTask(selectedTask)}
                    className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteTask(selectedTask.id)}
                    className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setSelectedTask(null)}
                    className="p-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className={`px-3 py-1 rounded ${priorityColors[selectedTask.priority]}`}>
                    {selectedTask.priority} priority
                  </div>
                  <div className={`px-3 py-1 rounded text-white ${statusColumns.find(c => c.id === selectedTask.status)?.color}`}>
                    {statusColumns.find(c => c.id === selectedTask.status)?.title}
                  </div>
                </div>

                {selectedTask.description && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-2">Description</h3>
                    <p className="text-slate-200 whitespace-pre-wrap">{selectedTask.description}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Assigned To</h3>
                  <div className="flex gap-2">
                    {selectedTask.assignedTo.map((memberId, index) => (
                      <div key={index} className="flex items-center gap-2 px-3 py-1 bg-slate-700/50 rounded-lg">
                        <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {getMemberName(memberId).charAt(0)}
                        </div>
                        <span className="text-sm text-white">{getMemberName(memberId)}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTask.dueDate && (
                  <div>
                    <h3 className="text-sm font-medium text-slate-300 mb-2">Due Date</h3>
                    <p className="text-slate-200">{formatDate(selectedTask.dueDate)}</p>
                  </div>
                )}

                <div>
                  <h3 className="text-sm font-medium text-slate-300 mb-2">Comments ({selectedTask.comments.length})</h3>
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                    {selectedTask.comments.map((comment) => (
                      <div key={comment.id} className="p-3 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                            {comment.userName.charAt(0)}
                          </div>
                          <span className="text-sm font-medium text-white">{comment.userName}</span>
                          <span className="text-xs text-slate-400">{formatDate(comment.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-200">{comment.content}</p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex gap-2 mt-3">
                    <input
                      type="text"
                      placeholder="Add a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addComment(selectedTask.id)}
                      className="flex-1 p-2 bg-slate-700/50 border border-slate-600/50 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                    <button
                      onClick={() => addComment(selectedTask.id)}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded transition-colors"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Task Edit Modal */}
        {isEditing && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 max-w-2xl mx-4 w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold text-white">
                  {editingTask.id ? 'Edit Task' : 'New Task'}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={saveTask}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditingTask({});
                    }}
                    className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg transition-colors flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    placeholder="Enter task title..."
                    value={editingTask.title || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, title: e.target.value })}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Description
                  </label>
                  <textarea
                    placeholder="Enter task description..."
                    value={editingTask.description || ''}
                    onChange={(e) => setEditingTask({ ...editingTask, description: e.target.value })}
                    rows={4}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Status
                    </label>
                    <select
                      value={editingTask.status || 'todo'}
                      onChange={(e) => setEditingTask({ ...editingTask, status: e.target.value as any })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="todo">To Do</option>
                      <option value="in-progress">In Progress</option>
                      <option value="review">Review</option>
                      <option value="done">Done</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Priority
                    </label>
                    <select
                      value={editingTask.priority || 'medium'}
                      onChange={(e) => setEditingTask({ ...editingTask, priority: e.target.value as any })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-200 mb-2">
                    Due Date
                  </label>
                  <input
                    type="datetime-local"
                    value={editingTask.dueDate ? editingTask.dueDate.toISOString().slice(0, 16) : ''}
                    onChange={(e) => setEditingTask({ 
                      ...editingTask, 
                      dueDate: e.target.value ? new Date(e.target.value) : undefined 
                    })}
                    className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CollaborativeTasksApp;