import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Search, Edit3, Trash2, Save, X, CheckSquare, Square, Calendar, AlertTriangle, Flag, Clock, FolderPlus, Folder, ChevronDown, ChevronRight } from 'lucide-react';
import Header from './Header';

interface TodoGroup {
  id: string;
  name: string;
  color: string;
  createdAt: Date;
}

interface Todo {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  groupId?: string;
  stepNumber?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

const TodosApp: React.FC = () => {
  const navigate = useNavigate();
  const [todos, setTodos] = useState<Todo[]>([]);
  const [groups, setGroups] = useState<TodoGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTodo, setEditingTodo] = useState<Partial<Todo>>({});
  const [filter, setFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

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
    // Load todos and groups from localStorage
    const savedTodos = localStorage.getItem('private_hub_todos');
    const savedGroups = localStorage.getItem('private_hub_todo_groups');
    
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos).map((todo: any) => ({
        ...todo,
        createdAt: new Date(todo.createdAt),
        updatedAt: new Date(todo.updatedAt),
        completedAt: todo.completedAt ? new Date(todo.completedAt) : undefined
      }));
      setTodos(parsedTodos);
    }

    if (savedGroups) {
      const parsedGroups = JSON.parse(savedGroups).map((group: any) => ({
        ...group,
        createdAt: new Date(group.createdAt)
      }));
      setGroups(parsedGroups);
      setExpandedGroups(new Set(parsedGroups.map((g: TodoGroup) => g.id)));
    }
  }, []);

  const saveTodos = (newTodos: Todo[]) => {
    setTodos(newTodos);
    localStorage.setItem(`private_hub_todos_${currentToken}`, JSON.stringify(newTodos));
  };

  const saveGroups = (newGroups: TodoGroup[]) => {
    setGroups(newGroups);
    localStorage.setItem(`private_hub_todo_groups_${currentToken}`, JSON.stringify(newGroups));
  };

  const createGroup = () => {
    if (!newGroupName.trim()) return;

    const newGroup: TodoGroup = {
      id: Date.now().toString(),
      name: newGroupName.trim(),
      color: groupColors[groups.length % groupColors.length],
      createdAt: new Date()
    };

    const newGroups = [...groups, newGroup];
    saveGroups(newGroups);
    setExpandedGroups(prev => new Set([...prev, newGroup.id]));
    setNewGroupName('');
    setIsCreatingGroup(false);
  };

  const deleteGroup = (groupId: string) => {
    if (window.confirm('Are you sure you want to delete this group? All tasks in this group will be moved to "No Group".')) {
      // Move todos from deleted group to no group
      const updatedTodos = todos.map(todo => 
        todo.groupId === groupId ? { ...todo, groupId: undefined, stepNumber: undefined } : todo
      );
      saveTodos(updatedTodos);

      // Remove the group
      const newGroups = groups.filter(g => g.id !== groupId);
      saveGroups(newGroups);
      
      setExpandedGroups(prev => {
        const newSet = new Set(prev);
        newSet.delete(groupId);
        return newSet;
      });
    }
  };

  const createTodo = () => {
    const newTodo: Todo = {
      id: Date.now().toString(),
      title: 'New Task',
      description: '',
      priority: 'medium',
      completed: false,
      groupId: selectedGroupId || undefined,
      stepNumber: selectedGroupId ? getNextStepNumber(selectedGroupId) : undefined,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setEditingTodo(newTodo);
    setIsEditing(true);
  };

  const getNextStepNumber = (groupId: string): number => {
    const groupTodos = todos.filter(t => t.groupId === groupId);
    const maxStep = Math.max(0, ...groupTodos.map(t => t.stepNumber || 0));
    return maxStep + 1;
  };

  const editTodo = (todo: Todo) => {
    setEditingTodo({ ...todo });
    setIsEditing(true);
  };

  const saveTodo = () => {
    if (!editingTodo.title?.trim()) return;

    const todoToSave: Todo = {
      id: editingTodo.id || Date.now().toString(),
      title: editingTodo.title || '',
      description: editingTodo.description || '',
      priority: editingTodo.priority || 'medium',
      completed: editingTodo.completed || false,
      groupId: editingTodo.groupId,
      stepNumber: editingTodo.groupId ? (editingTodo.stepNumber || getNextStepNumber(editingTodo.groupId)) : undefined,
      createdAt: editingTodo.createdAt || new Date(),
      updatedAt: new Date(),
      completedAt: editingTodo.completedAt
    };

    const existingIndex = todos.findIndex(t => t.id === todoToSave.id);
    let newTodos;
    
    if (existingIndex >= 0) {
      newTodos = [...todos];
      newTodos[existingIndex] = todoToSave;
    } else {
      newTodos = [todoToSave, ...todos];
    }

    saveTodos(newTodos);
    setIsEditing(false);
    setEditingTodo({});
    setSelectedTodo(todoToSave);
  };

  const toggleTodoComplete = (todoId: string) => {
    const newTodos = todos.map(todo => {
      if (todo.id === todoId) {
        const updatedTodo = {
          ...todo,
          completed: !todo.completed,
          updatedAt: new Date(),
          completedAt: !todo.completed ? new Date() : undefined
        };
        if (selectedTodo?.id === todoId) {
          setSelectedTodo(updatedTodo);
        }
        return updatedTodo;
      }
      return todo;
    });
    saveTodos(newTodos);
  };

  const deleteTodo = (todoId: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      const newTodos = todos.filter(t => t.id !== todoId);
      saveTodos(newTodos);
      if (selectedTodo?.id === todoId) {
        setSelectedTodo(null);
      }
    }
  };

  const clearCompleted = () => {
    if (window.confirm('Are you sure you want to remove all completed tasks?')) {
      const newTodos = todos.filter(t => !t.completed);
      saveTodos(newTodos);
      if (selectedTodo?.completed) {
        setSelectedTodo(null);
      }
    }
  };

  const toggleGroupExpanded = (groupId: string) => {
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

  const filteredTodos = todos.filter(todo => {
    const matchesSearch = todo.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         todo.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filter === 'all' || 
                         (filter === 'active' && !todo.completed) ||
                         (filter === 'completed' && todo.completed);
    
    return matchesSearch && matchesFilter;
  });

  // Group todos by group
  const groupedTodos = groups.reduce((acc, group) => {
    acc[group.id] = filteredTodos
      .filter(todo => todo.groupId === group.id)
      .sort((a, b) => (a.stepNumber || 0) - (b.stepNumber || 0));
    return acc;
  }, {} as Record<string, Todo[]>);

  const ungroupedTodos = filteredTodos.filter(todo => !todo.groupId);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-400 bg-red-500/20';
      case 'medium': return 'text-yellow-400 bg-yellow-500/20';
      case 'low': return 'text-green-400 bg-green-500/20';
      default: return 'text-slate-400 bg-slate-500/20';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return AlertTriangle;
      case 'medium': return Flag;
      case 'low': return Clock;
      default: return Flag;
    }
  };

  const completedCount = todos.filter(t => t.completed).length;
  const activeCount = todos.filter(t => !t.completed).length;

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
          <h1 className="text-3xl font-bold text-white">Tasks</h1>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Active Tasks</p>
                <p className="text-2xl font-bold text-white">{activeCount}</p>
              </div>
              <Square className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Completed</p>
                <p className="text-2xl font-bold text-white">{completedCount}</p>
              </div>
              <CheckSquare className="w-8 h-8 text-green-400" />
            </div>
          </div>
          <div className="backdrop-blur-lg bg-white/10 dark:bg-black/20 border border-white/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-300 text-sm">Total Groups</p>
                <p className="text-2xl font-bold text-white">{groups.length}</p>
              </div>
              <Folder className="w-8 h-8 text-purple-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-20rem)]">
          {/* Tasks List */}
          <div className="lg:col-span-1 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">Your Tasks</h2>
              <div className="flex gap-2">
                <button
                  onClick={() => setIsCreatingGroup(true)}
                  className="p-2 rounded-lg bg-purple-600 hover:bg-purple-700 text-white transition-colors"
                  title="Create Group"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
                <button
                  onClick={createTodo}
                  className="p-2 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors"
                  title="Create Task"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Create Group Form */}
            {isCreatingGroup && (
              <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                <input
                  type="text"
                  placeholder="Enter group name..."
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && createGroup()}
                  className="w-full p-2 bg-slate-600/50 border border-slate-500/50 rounded text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
                  autoFocus
                />
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
                placeholder="Search tasks..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex mb-4 bg-slate-700/30 rounded-lg p-1">
              {[
                { key: 'all', label: 'All' },
                { key: 'active', label: 'Active' },
                { key: 'completed', label: 'Done' }
              ].map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setFilter(tab.key as any)}
                  className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all ${
                    filter === tab.key
                      ? 'bg-green-600 text-white shadow-lg'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="space-y-3 max-h-[calc(100%-16rem)] overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
              {/* Grouped Tasks */}
              {groups.map((group) => {
                const groupTodos = groupedTodos[group.id] || [];
                const isExpanded = expandedGroups.has(group.id);
                
                return (
                  <div key={group.id} className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-700/30 rounded-lg">
                      <button
                        onClick={() => toggleGroupExpanded(group.id)}
                        className="flex items-center gap-2 text-white hover:text-slate-300 transition-colors"
                      >
                        {isExpanded ? (
                          <ChevronDown className="w-4 h-4" />
                        ) : (
                          <ChevronRight className="w-4 h-4" />
                        )}
                        <div className={`w-3 h-3 rounded-full bg-gradient-to-r ${group.color}`} />
                        <span className="font-medium">{group.name}</span>
                        <span className="text-xs text-slate-400">({groupTodos.length})</span>
                      </button>
                      <button
                        onClick={() => deleteGroup(group.id)}
                        className="p-1 text-slate-400 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    
                    {isExpanded && groupTodos.map((todo) => {
                      const PriorityIcon = getPriorityIcon(todo.priority);
                      return (
                        <div
                          key={todo.id}
                          onClick={() => setSelectedTodo(todo)}
                          className={`ml-4 p-3 rounded-lg cursor-pointer transition-colors ${
                            selectedTodo?.id === todo.id
                              ? 'bg-green-600/30 border border-green-500/50'
                              : 'bg-slate-700/30 hover:bg-slate-700/50'
                          } ${todo.completed ? 'opacity-60' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleTodoComplete(todo.id);
                              }}
                              className="mt-1 text-green-400 hover:text-green-300 transition-colors"
                            >
                              {todo.completed ? (
                                <CheckSquare className="w-5 h-5" />
                              ) : (
                                <Square className="w-5 h-5" />
                              )}
                            </button>
                            
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                {todo.stepNumber && (
                                  <span className="text-xs bg-slate-600/50 text-slate-300 px-2 py-1 rounded">
                                    Step {todo.stepNumber}
                                  </span>
                                )}
                                <h3 className={`font-medium text-white truncate ${todo.completed ? 'line-through' : ''}`}>
                                  {todo.title}
                                </h3>
                              </div>
                              <p className="text-sm text-slate-300 truncate mt-1">{todo.description}</p>
                              <div className="flex items-center justify-between mt-2">
                                <span className="text-xs text-slate-400">
                                  {formatDate(todo.updatedAt)}
                                </span>
                                <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getPriorityColor(todo.priority)}`}>
                                  <PriorityIcon className="w-3 h-3" />
                                  {todo.priority}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

              {/* Ungrouped Tasks */}
              {ungroupedTodos.length > 0 && (
                <div className="space-y-2">
                  <div className="p-2 bg-slate-700/30 rounded-lg">
                    <div className="flex items-center gap-2 text-white">
                      <Folder className="w-4 h-4 text-slate-400" />
                      <span className="font-medium">No Group</span>
                      <span className="text-xs text-slate-400">({ungroupedTodos.length})</span>
                    </div>
                  </div>
                  
                  {ungroupedTodos.map((todo) => {
                    const PriorityIcon = getPriorityIcon(todo.priority);
                    return (
                      <div
                        key={todo.id}
                        onClick={() => setSelectedTodo(todo)}
                        className={`p-3 rounded-lg cursor-pointer transition-colors ${
                          selectedTodo?.id === todo.id
                            ? 'bg-green-600/30 border border-green-500/50'
                            : 'bg-slate-700/30 hover:bg-slate-700/50'
                        } ${todo.completed ? 'opacity-60' : ''}`}
                      >
                        <div className="flex items-start gap-3">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTodoComplete(todo.id);
                            }}
                            className="mt-1 text-green-400 hover:text-green-300 transition-colors"
                          >
                            {todo.completed ? (
                              <CheckSquare className="w-5 h-5" />
                            ) : (
                              <Square className="w-5 h-5" />
                            )}
                          </button>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className={`font-medium text-white truncate ${todo.completed ? 'line-through' : ''}`}>
                              {todo.title}
                            </h3>
                            <p className="text-sm text-slate-300 truncate mt-1">{todo.description}</p>
                            <div className="flex items-center justify-between mt-2">
                              <span className="text-xs text-slate-400">
                                {formatDate(todo.updatedAt)}
                              </span>
                              <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${getPriorityColor(todo.priority)}`}>
                                <PriorityIcon className="w-3 h-3" />
                                {todo.priority}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {completedCount > 0 && (
              <div className="mt-4 pt-4 border-t border-slate-700/50">
                <button
                  onClick={clearCompleted}
                  className="w-full py-2 px-4 bg-red-600/20 hover:bg-red-600/30 text-red-200 rounded-lg transition-colors text-sm"
                >
                  Clear Completed ({completedCount})
                </button>
              </div>
            )}
          </div>

          {/* Task Viewer/Editor */}
          <div className="lg:col-span-2 backdrop-blur-lg bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6">
            {isEditing ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-white">
                    {editingTodo.id ? 'Edit Task' : 'New Task'}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={saveTodo}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Save
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditingTodo({});
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
                      Task Title *
                    </label>
                    <input
                      type="text"
                      placeholder="Enter task title..."
                      value={editingTodo.title || ''}
                      onChange={(e) => setEditingTodo({ ...editingTodo, title: e.target.value })}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 text-xl font-semibold"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Priority Level
                      </label>
                      <select
                        value={editingTodo.priority || 'medium'}
                        onChange={(e) => setEditingTodo({ ...editingTodo, priority: e.target.value as any })}
                        className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="low" className="bg-slate-800">Low Priority</option>
                        <option value="medium" className="bg-slate-800">Medium Priority</option>
                        <option value="high" className="bg-slate-800">High Priority</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Group
                      </label>
                      <select
                        value={editingTodo.groupId || ''}
                        onChange={(e) => setEditingTodo({ 
                          ...editingTodo, 
                          groupId: e.target.value || undefined,
                          stepNumber: e.target.value ? getNextStepNumber(e.target.value) : undefined
                        })}
                        className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      >
                        <option value="" className="bg-slate-800">No Group</option>
                        {groups.map((group) => (
                          <option key={group.id} value={group.id} className="bg-slate-800">
                            {group.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {editingTodo.groupId && (
                    <div>
                      <label className="block text-sm font-medium text-slate-200 mb-2">
                        Step Number
                      </label>
                      <input
                        type="number"
                        min="1"
                        placeholder="Enter step number..."
                        value={editingTodo.stepNumber || ''}
                        onChange={(e) => setEditingTodo({ ...editingTodo, stepNumber: parseInt(e.target.value) || undefined })}
                        className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">
                      Description
                    </label>
                    <textarea
                      placeholder="Enter task description..."
                      value={editingTodo.description || ''}
                      onChange={(e) => setEditingTodo({ ...editingTodo, description: e.target.value })}
                      rows={6}
                      className="w-full p-3 bg-slate-700/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    />
                  </div>
                </div>
              </div>
            ) : selectedTodo ? (
              <div className="h-full flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-slate-400" />
                    <span className="text-sm text-slate-300">
                      Created {formatDate(selectedTodo.createdAt)}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => toggleTodoComplete(selectedTodo.id)}
                      className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        selectedTodo.completed
                          ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      {selectedTodo.completed ? (
                        <>
                          <Square className="w-4 h-4" />
                          Mark Incomplete
                        </>
                      ) : (
                        <>
                          <CheckSquare className="w-4 h-4" />
                          Mark Complete
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => editTodo(selectedTodo)}
                      className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => deleteTodo(selectedTodo.id)}
                      className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-track-slate-800 scrollbar-thumb-slate-600">
                  <div className="flex items-center gap-3 mb-4">
                    <button
                      onClick={() => toggleTodoComplete(selectedTodo.id)}
                      className="text-green-400 hover:text-green-300 transition-colors"
                    >
                      {selectedTodo.completed ? (
                        <CheckSquare className="w-6 h-6" />
                      ) : (
                        <Square className="w-6 h-6" />
                      )}
                    </button>
                    <h1 className={`text-2xl font-bold text-white ${selectedTodo.completed ? 'line-through opacity-60' : ''}`}>
                      {selectedTodo.title}
                    </h1>
                  </div>
                  
                  <div className="flex items-center gap-4 mb-4">
                    {(() => {
                      const PriorityIcon = getPriorityIcon(selectedTodo.priority);
                      return (
                        <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${getPriorityColor(selectedTodo.priority)}`}>
                          <PriorityIcon className="w-4 h-4" />
                          <span className="font-medium capitalize">{selectedTodo.priority} Priority</span>
                        </div>
                      );
                    })()}

                    {selectedTodo.groupId && (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-purple-500/20 text-purple-300">
                        <Folder className="w-4 h-4" />
                        <span className="font-medium">
                          {groups.find(g => g.id === selectedTodo.groupId)?.name || 'Unknown Group'}
                        </span>
                        {selectedTodo.stepNumber && (
                          <span className="text-sm">- Step {selectedTodo.stepNumber}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {selectedTodo.completed && selectedTodo.completedAt && (
                    <div className="mb-4 p-3 bg-green-500/20 border border-green-500/30 rounded-lg">
                      <div className="flex items-center gap-2 text-green-200">
                        <CheckSquare className="w-4 h-4" />
                        <span className="text-sm">
                          Completed on {formatDate(selectedTodo.completedAt)}
                        </span>
                      </div>
                    </div>
                  )}

                  {selectedTodo.description && (
                    <div className="mb-4">
                      <h3 className="text-lg font-semibold text-white mb-2">Description</h3>
                      <div className="text-slate-200 whitespace-pre-wrap leading-relaxed p-3 bg-slate-700/30 rounded-lg">
                        {selectedTodo.description}
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-slate-400 mt-4">
                    Last updated: {formatDate(selectedTodo.updatedAt)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <CheckSquare className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No task selected</h3>
                  <p className="text-slate-300">Select a task from the list or create a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TodosApp;