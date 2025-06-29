import React, { useState, useEffect, useRef } from 'react';
import { 
    ChevronLeft, 
    ChevronRight, 
    Calendar, 
    Clock, 
    BookOpen, 
    Plus,
    X,
    CheckCircle,
    AlertCircle,
    Edit2,
    Trash2,
    Filter,
    Search
} from 'lucide-react';

// Mock Firebase functions for demo
const mockDb = {
    tasks: [
        { id: 1, title: "Ujian Matematika", deadline: "2025-07-02", priority: "Tinggi", status: "Belum Dikerjakan", type: "exam", userId: "user1" },
        { id: 2, title: "Tugas Fisika Lab", deadline: "2025-07-05", priority: "Sedang", status: "Dikerjakan", type: "assignment", userId: "user1" },
        { id: 3, title: "Presentasi Kimia", deadline: "2025-07-08", priority: "Tinggi", status: "Belum Dikerjakan", type: "presentation", userId: "user1" },
        { id: 4, title: "Quiz Biologi", deadline: "2025-07-15", priority: "Rendah", status: "Belum Dikerjakan", type: "quiz", userId: "user1" },
        { id: 5, title: "Project Akhir Semester", deadline: "2025-07-20", priority: "Tinggi", status: "Dikerjakan", type: "project", userId: "user1" }
    ]
};

const IntegratedCalendarTask = ({ userId = "user1" }) => {
    const [tasks, setTasks] = useState(mockDb.tasks);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [showAddTask, setShowAddTask] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [filterPriority, setFilterPriority] = useState('Semua');
    const [filterStatus, setFilterStatus] = useState('Semua');
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('calendar'); // calendar, list
    
    // Form states
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [priority, setPriority] = useState('Sedang');
    const [taskType, setTaskType] = useState('assignment');
    const [status, setStatus] = useState('Belum Dikerjakan');
    
    const formRef = useRef(null);

    // Simulate Firebase effect
    useEffect(() => {
        console.log('Listening for tasks for user:', userId);
        // In real app, this would be Firebase onSnapshot
    }, [userId]);

    // Calendar calculations
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startDate.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
        const day = new Date(startDate);
        day.setDate(startDate.getDate() + i);
        days.push(day);
    }
    
    const changeMonth = (offset) => {
        setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1));
        setSelectedDate(null);
    };

    const getTasksByDate = (date) => {
        return tasks.filter(task => {
            if (!task.deadline) return false;
            const taskDate = new Date(task.deadline);
            return taskDate.toDateString() === date.toDateString();
        });
    };

    const getFilteredTasks = () => {
        return tasks.filter(task => {
            const matchesPriority = filterPriority === 'Semua' || task.priority === filterPriority;
            const matchesStatus = filterStatus === 'Semua' || task.status === filterStatus;
            const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesPriority && matchesStatus && matchesSearch;
        }).sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'Tinggi': return 'bg-red-500/80 border-red-400 text-white';
            case 'Sedang': return 'bg-yellow-500/80 border-yellow-400 text-white';
            case 'Rendah': return 'bg-green-500/80 border-green-400 text-white';
            default: return 'bg-blue-500/80 border-blue-400 text-white';
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Selesai': return 'bg-green-600/20 border-green-500 text-green-300';
            case 'Dikerjakan': return 'bg-blue-600/20 border-blue-500 text-blue-300';
            case 'Belum Dikerjakan': return 'bg-gray-600/20 border-gray-500 text-gray-300';
            default: return 'bg-gray-600/20 border-gray-500 text-gray-300';
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'exam': return <BookOpen className="w-4 h-4" />;
            case 'assignment': return <Edit2 className="w-4 h-4" />;
            case 'presentation': return <Calendar className="w-4 h-4" />;
            case 'quiz': return <AlertCircle className="w-4 h-4" />;
            case 'project': return <CheckCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const addTask = async (e) => {
        e.preventDefault();
        if (title.trim() === '' || deadline === '') return;
        
        const newTask = {
            id: Date.now(),
            userId,
            title,
            deadline,
            priority,
            type: taskType,
            status,
            createdAt: new Date()
        };
        
        setTasks(prev => [...prev, newTask]);
        resetForm();
        setShowAddTask(false);
    };

    const updateTask = async (e) => {
        e.preventDefault();
        if (!editingTask || title.trim() === '' || deadline === '') return;
        
        setTasks(prev => prev.map(task => 
            task.id === editingTask.id 
                ? { ...task, title, deadline, priority, type: taskType, status }
                : task
        ));
        
        resetForm();
        setEditingTask(null);
    };

    const updateStatus = async (id, newStatus) => {
        setTasks(prev => prev.map(task => 
            task.id === id 
                ? { ...task, status: newStatus, ...(newStatus === 'Selesai' ? { completedAt: new Date() } : {}) }
                : task
        ));
    };
    
    const deleteTask = async (id) => {
        setTasks(prev => prev.filter(task => task.id !== id));
    };

    const startEdit = (task) => {
        setEditingTask(task);
        setTitle(task.title);
        setDeadline(task.deadline);
        setPriority(task.priority);
        setTaskType(task.type);
        setStatus(task.status);
        setShowAddTask(true);
    };

    const resetForm = () => {
        setTitle('');
        setDeadline('');
        setPriority('Sedang');
        setTaskType('assignment');
        setStatus('Belum Dikerjakan');
        setEditingTask(null);
    };

    const monthNames = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];

    const dayNames = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

    const typeOptions = [
        { value: 'exam', label: 'Ujian' },
        { value: 'assignment', label: 'Tugas' },
        { value: 'presentation', label: 'Presentasi' },
        { value: 'quiz', label: 'Kuis' },
        { value: 'project', label: 'Proyek' }
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-4">
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl shadow-lg">
                            <Calendar className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                                Kalender Akademik
                            </h1>
                            <p className="text-gray-400 mt-1">Kelola jadwal akademik Anda dengan mudah</p>
                        </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
                        {/* View Mode Toggle */}
                        <div className="flex bg-white/10 backdrop-blur-sm rounded-xl p-1 border border-white/20">
                            <button 
                                onClick={() => setViewMode('calendar')}
                                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                                    viewMode === 'calendar' 
                                        ? 'bg-purple-600 text-white shadow-lg' 
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Calendar className="w-4 h-4" />
                            </button>
                            <button 
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 rounded-lg transition-all duration-200 ${
                                    viewMode === 'list' 
                                        ? 'bg-purple-600 text-white shadow-lg' 
                                        : 'text-gray-300 hover:text-white hover:bg-white/10'
                                }`}
                            >
                                <Filter className="w-4 h-4" />
                            </button>
                        </div>

                        {/* Add Task Button */}
                        <button 
                            onClick={() => setShowAddTask(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                        >
                            <Plus className="w-5 h-5" />
                            <span className="hidden sm:inline">Tambah Tugas</span>
                        </button>
                    </div>
                </div>

                {/* Calendar View */}
                {viewMode === 'calendar' && (
                    <>
                        {/* Month Navigation */}
                        <div className="flex items-center justify-center gap-2 bg-white/10 backdrop-blur-sm rounded-xl p-2 border border-white/20 mb-6">
                            <button 
                                onClick={() => changeMonth(-1)}
                                className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 group"
                            >
                                <ChevronLeft className="w-5 h-5 text-gray-300 group-hover:text-white" />
                            </button>
                            <div className="px-6 py-2 text-center min-w-[200px]">
                                <h2 className="text-xl font-semibold text-white">
                                    {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                                </h2>
                            </div>
                            <button 
                                onClick={() => changeMonth(1)}
                                className="p-2 rounded-lg hover:bg-white/20 transition-all duration-200 group"
                            >
                                <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-white" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                            {/* Calendar Grid */}
                            <div className="xl:col-span-3">
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 overflow-hidden shadow-2xl">
                                    {/* Day Headers */}
                                    <div className="grid grid-cols-7 bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-b border-white/20">
                                        {dayNames.map(day => (
                                            <div key={day} className="p-4 text-center">
                                                <span className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                                                    {day.slice(0, 3)}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {/* Calendar Days */}
                                    <div className="grid grid-cols-7">
                                        {days.map((day, index) => {
                                            const tasksOnDay = getTasksByDate(day);
                                            const isToday = day.toDateString() === new Date().toDateString();
                                            const isCurrentMonth = day.getMonth() === currentMonth.getMonth();
                                            const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();
                                            
                                            return (
                                                <div 
                                                    key={index}
                                                    onClick={() => setSelectedDate(day)}
                                                    className={`h-32 p-3 border-r border-b border-white/10 cursor-pointer transition-all duration-300 hover:bg-white/10 ${
                                                        !isCurrentMonth ? 'opacity-40' : ''
                                                    } ${isSelected ? 'bg-purple-600/30 ring-2 ring-purple-400' : ''}`}
                                                >
                                                    <div className="flex flex-col h-full">
                                                        {/* Date Number */}
                                                        <div className="flex justify-between items-start mb-2">
                                                            <span className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all duration-200 ${
                                                                isToday 
                                                                    ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg' 
                                                                    : 'text-gray-300 hover:bg-white/20'
                                                            }`}>
                                                                {day.getDate()}
                                                            </span>
                                                            {tasksOnDay.length > 0 && (
                                                                <span className="text-xs bg-purple-500/60 text-white px-1.5 py-0.5 rounded-full">
                                                                    {tasksOnDay.length}
                                                                </span>
                                                            )}
                                                        </div>
                                                        
                                                        {/* Tasks */}
                                                        <div className="flex-1 overflow-hidden">
                                                            <div className="space-y-1">
                                                                {tasksOnDay.slice(0, 2).map(task => (
                                                                    <div 
                                                                        key={task.id}
                                                                        className={`text-xs p-1.5 rounded-md border border-opacity-50 backdrop-blur-sm transition-all duration-200 hover:scale-105 cursor-pointer ${getPriorityColor(task.priority)}`}
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            startEdit(task);
                                                                        }}
                                                                    >
                                                                        <div className="flex items-center gap-1">
                                                                            {getTypeIcon(task.type)}
                                                                            <span className="truncate font-medium">{task.title}</span>
                                                                        </div>
                                                                    </div>
                                                                ))}
                                                                {tasksOnDay.length > 2 && (
                                                                    <div className="text-xs text-gray-400 text-center py-1">
                                                                        +{tasksOnDay.length - 2} lainnya
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>

                            {/* Sidebar */}
                            <div className="xl:col-span-1 space-y-6">
                                {/* Today's Tasks */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-2xl">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        <Clock className="w-5 h-5 text-purple-400" />
                                        Tugas Hari Ini
                                    </h3>
                                    <div className="space-y-3">
                                        {getTasksByDate(new Date()).length > 0 ? (
                                            getTasksByDate(new Date()).map(task => (
                                                <div key={task.id} className={`p-3 rounded-lg border transition-all duration-200 hover:scale-105 cursor-pointer ${getPriorityColor(task.priority)}`}
                                                    onClick={() => startEdit(task)}>
                                                    <div className="flex items-center gap-2">
                                                        {getTypeIcon(task.type)}
                                                        <span className="font-medium">{task.title}</span>
                                                    </div>
                                                    <div className={`text-xs mt-1 px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                                                        {task.status}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <p className="text-gray-400 text-center py-4">Tidak ada tugas hari ini</p>
                                        )}
                                    </div>
                                </div>

                                {/* Selected Date Tasks */}
                                {selectedDate && (
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-2xl">
                                        <h3 className="text-lg font-semibold text-white mb-4">
                                            {selectedDate.toLocaleDateString('id-ID', { 
                                                weekday: 'long', 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </h3>
                                        <div className="space-y-3">
                                            {getTasksByDate(selectedDate).length > 0 ? (
                                                getTasksByDate(selectedDate).map(task => (
                                                    <div key={task.id} className={`p-3 rounded-lg border transition-all duration-200 hover:scale-105 cursor-pointer ${getPriorityColor(task.priority)}`}
                                                        onClick={() => startEdit(task)}>
                                                        <div className="flex items-center gap-2">
                                                            {getTypeIcon(task.type)}
                                                            <span className="font-medium">{task.title}</span>
                                                        </div>
                                                        <div className={`text-xs mt-1 px-2 py-1 rounded ${getStatusColor(task.status)}`}>
                                                            {task.status}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <p className="text-gray-400 text-center py-4">Tidak ada tugas</p>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Legend */}
                                <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-2xl">
                                    <h3 className="text-lg font-semibold text-white mb-4">Prioritas</h3>
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded bg-red-500"></div>
                                            <span className="text-gray-300">Tinggi</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded bg-yellow-500"></div>
                                            <span className="text-gray-300">Sedang</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <div className="w-4 h-4 rounded bg-green-500"></div>
                                            <span className="text-gray-300">Rendah</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* List View */}
                {viewMode === 'list' && (
                    <div className="space-y-6">
                        {/* Filters */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-2xl">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Cari Tugas</label>
                                    <div className="relative">
                                        <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            placeholder="Cari tugas..."
                                            className="w-full bg-gray-700/50 text-white pl-10 pr-4 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Filter Prioritas</label>
                                    <select
                                        value={filterPriority}
                                        onChange={(e) => setFilterPriority(e.target.value)}
                                        className="w-full bg-gray-700/50 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option>Semua</option>
                                        <option>Tinggi</option>
                                        <option>Sedang</option>
                                        <option>Rendah</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Filter Status</label>
                                    <select
                                        value={filterStatus}
                                        onChange={(e) => setFilterStatus(e.target.value)}
                                        className="w-full bg-gray-700/50 text-white p-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option>Semua</option>
                                        <option>Belum Dikerjakan</option>
                                        <option>Dikerjakan</option>
                                        <option>Selesai</option>
                                    </select>
                                </div>
                                <div className="flex items-end">
                                    <button
                                        onClick={() => {
                                            setFilterPriority('Semua');
                                            setFilterStatus('Semua');
                                            setSearchTerm('');
                                        }}
                                        className="w-full px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                    >
                                        Reset Filter
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Task List */}
                        <div className="bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 p-6 shadow-2xl">
                            <h3 className="text-xl font-semibold text-white mb-6">Daftar Tugas</h3>
                            <div className="space-y-4">
                                {getFilteredTasks().length > 0 ? (
                                    getFilteredTasks().map(task => (
                                        <div key={task.id} className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${task.status === 'Selesai' ? 'opacity-60' : ''} bg-gray-800/50 border-gray-700`}>
                                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                                <div className="flex items-start gap-4">
                                                    <div className={`p-2 rounded-lg ${getPriorityColor(task.priority).split(' ')[0]}`}>
                                                        {getTypeIcon(task.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className={`font-semibold text-white text-lg ${task.status === 'Selesai' ? 'line-through' : ''}`}>
                                                            {task.title}
                                                        </h4>
                                                        <p className="text-gray-400 text-sm mt-1">
                                                            Deadline: {new Date(task.deadline).toLocaleDateString('id-ID', { 
                                                                weekday: 'long', 
                                                                year: 'numeric', 
                                                                month: 'long', 
                                                                day: 'numeric' 
                                                            })}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-2">
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                                                                {task.priority}
                                                            </span>
                                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                                {task.status}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <select 
                                                        value={task.status} 
                                                        onChange={(e) => updateStatus(task.id, e.target.value)} 
                                                        className="bg-gray-700/50 text-white text-sm p-2 rounded-lg border border-gray-600"
                                                    >
                                                        <option>Belum Dikerjakan</option>
                                                        <option>Dikerjakan</option>
                                                        <option>Selesai</option>
                                                    </select>
                                                    <button 
                                                        onClick={() => startEdit(task)}
                                                        className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button 
                                                        onClick={() => deleteTask(task.id)} 
                                                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center text-gray-400 py-12">
                                        <Clock className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                        <p className="text-lg">Tidak ada tugas yang ditemukan</p>
                                        <p className="text-sm mt-2">Coba ubah filter atau tambah tugas baru</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Add/Edit Task Modal */}
                {showAddTask && (
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-800/95 backdrop-blur-sm rounded-2xl border border-white/20 p-6 w-full max-w-md shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-semibold text-white">
                                    {editingTask ? 'Edit Tugas' : 'Tambah Tugas Baru'}
                                </h3>
                                <button 
                                    onClick={() => {
                                        setShowAddTask(false);
                                        resetForm();
                                    }}
                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            
                            <form ref={formRef} onSubmit={editingTask ? updateTask : addTask} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Nama Tugas</label>
                                    <input 
                                        type="text" 
                                        value={title} 
                                        onChange={(e) => setTitle(e.target.value)} 
                                        placeholder="Contoh: Mengerjakan esai Kalkulus" 
                                        className="w-full bg-gray-700/50 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                                        required
                                    />
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Deadline</label>
                                    <input 
                                        type="date" 
                                        value={deadline} 
                                        onChange={(e) => setDeadline(e.target.value)} 
                                        className="w-full bg-gray-700/50 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500 focus:border-transparent" 
                                        required
                                    />
                                </div>
                                
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Prioritas</label>
                                        <select 
                                            value={priority} 
                                            onChange={(e) => setPriority(e.target.value)} 
                                            className="w-full bg-gray-700/50 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                                        >
                                            <option value="Rendah">Rendah</option>
                                            <option value="Sedang">Sedang</option>
                                            <option value="Tinggi">Tinggi</option>
                                        </select>
                                    </div>
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-300 mb-2">Jenis</label>
                                        <select 
                                            value={taskType} 
                                            onChange={(e) => setTaskType(e.target.value)} 
                                            className="w-full bg-gray-700/50 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                                        >
                                            {typeOptions.map(option => (
                                                <option key={option.value} value={option.value}>
                                                    {option.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                
                                <div>
                                    <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                                    <select 
                                        value={status} 
                                        onChange={(e) => setStatus(e.target.value)} 
                                        className="w-full bg-gray-700/50 text-white p-3 rounded-lg border border-gray-600 focus:ring-2 focus:ring-purple-500"
                                    >
                                        <option value="Belum Dikerjakan">Belum Dikerjakan</option>
                                        <option value="Dikerjakan">Dikerjakan</option>
                                        <option value="Selesai">Selesai</option>
                                    </select>
                                </div>
                                
                                <div className="flex gap-3 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            setShowAddTask(false);
                                            resetForm();
                                        }}
                                        className="flex-1 px-4 py-3 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit" 
                                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-xl"
                                    >
                                        {editingTask ? 'Update' : 'Tambah'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default IntegratedCalendarTask;