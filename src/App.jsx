import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; 
import { onAuthStateChanged, signOut } from 'firebase/auth';

import AuthPage from './features/AuthPage.jsx';
import { DashboardIcon, TaskIcon, NoteIcon, FinanceIcon, LoadingSpinner, ProjectIcon, CalendarIcon, PomodoroIcon } from './components/Icons.jsx';
import Dashboard from './features/Dashboard';
import TaskManager from './features/TaskManager';
import NoteTaking from './features/NoteTaking';
import FinanceManager from './features/FinanceManager';
import PomodoroTimer from './components/PomodoroTimer.jsx';
import ProjectView from './features/ProjectView.jsx';
import ProjectDetailView from './features/ProjectDetailView.jsx';
import CalendarView from './features/CalendarView.jsx';

import './index.css';

export default function App() {
    const [user, setUser] = useState(null);
    const [isAuthLoading, setIsAuthLoading] = useState(true);
    const [error, setError] = useState(null);
    const [navigation, setNavigation] = useState({ view: 'dashboard', params: {} });
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        console.log("App component mounted");
        
        if (!auth) {
            console.error("Firebase belum terkonfigurasi.");
            setError("Firebase configuration error");
            setIsAuthLoading(false);
            return;
        }
        
        try {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                console.log("Auth state changed:", user ? "User logged in" : "No user");
                setUser(user);
                setIsAuthLoading(false);
            });
            
            return () => unsubscribe();
        } catch (err) {
            console.error("Error setting up auth listener:", err);
            setError(err.message);
            setIsAuthLoading(false);
        }
    }, []);

    // Auto-close sidebar on mobile when clicking outside
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 1024) {
                setIsSidebarOpen(false);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const handleNavigate = (view, params = {}) => {
        setNavigation({ view, params });
        // Close sidebar on mobile after navigation
        if (window.innerWidth < 1024) {
            setIsSidebarOpen(false);
        }
    };

    const handleLogout = async () => {
        await signOut(auth);
    };

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    // Error state
    if (error) {
        return (
            <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
                <div className="text-red-400 text-center">
                    <h2 className="text-xl font-bold mb-2">Error</h2>
                    <p>{error}</p>
                </div>
            </div>
        );
    }

    // Loading state
    if (isAuthLoading) {
        return (
            <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center">
                <LoadingSpinner />
                <p className="mt-3 text-lg">Memuat Aplikasi UpDev...</p>
            </div>
        );
    }

    // Jika belum login, tampilkan AuthPage
    if (!user) {
        return <AuthPage />;
    }

    // Jika sudah login, tampilkan aplikasi utama
    const userId = user?.uid;

    const components = {
        dashboard: Dashboard,
        tasks: TaskManager,
        notes: NoteTaking,
        finance: FinanceManager,
        projects: ProjectView,
        projectDetail: ProjectDetailView,
        calendar: CalendarView,
        pomodoro: PomodoroTimer,
    };
    
    const menuItems = [
        { id: 'dashboard', name: 'Dashboard', icon: <DashboardIcon /> },
        { id: 'tasks', name: 'Tugas', icon: <TaskIcon /> },
        { id: 'notes', name: 'Catatan', icon: <NoteIcon /> },
        { id: 'finance', name: 'Keuangan', icon: <FinanceIcon /> },
        { id: 'projects', name: 'Proyek', icon: <ProjectIcon /> },
        { id: 'calendar', name: 'Kalender', icon: <CalendarIcon /> },
        { id: 'pomodoro', name: 'Pomodoro', icon: <PomodoroIcon /> },
    ];

    const ActiveComponent = components[navigation.view] || Dashboard;

    console.log("Rendering MainApp for user:", user.email);
    
    try {
        return (
            <div className="bg-gray-900 text-white min-h-screen flex font-sans relative">
                {/* Mobile Header */}
                <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-800/95 backdrop-blur-sm border-b border-gray-700/50 p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                                <DashboardIcon />
                            </span>
                            <h1 className="text-xl font-bold">UpDev</h1>
                        </div>
                        <button 
                            onClick={toggleSidebar}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                            aria-label="Toggle menu"
                        >
                            <svg 
                                className="w-6 h-6" 
                                fill="none" 
                                stroke="currentColor" 
                                viewBox="0 0 24 24"
                            >
                                {isSidebarOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Overlay for mobile */}
                {isSidebarOpen && (
                    <div 
                        className="lg:hidden fixed inset-0 bg-black/50 z-40"
                        onClick={() => setIsSidebarOpen(false)}
                    />
                )}

                {/* Sidebar */}
                <nav className={`
                    fixed lg:relative z-50 lg:z-auto
                    w-72 bg-gray-800/50 backdrop-blur-sm lg:backdrop-blur-0
                    p-4 flex flex-col border-r border-gray-700/50
                    h-full lg:h-auto min-h-screen
                    transform transition-transform duration-300 ease-in-out
                    ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                `}>
                    {/* Desktop Header */}
                    <div className="hidden lg:flex items-center gap-3 mb-8 px-2">
                        <span className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                            <DashboardIcon />
                        </span>
                        <h1 className="text-xl font-bold">UpDev</h1>
                    </div>

                    {/* Mobile Header in Sidebar */}
                    <div className="lg:hidden flex items-center justify-between mb-8 px-2">
                        <div className="flex items-center gap-3">
                            <span className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg shadow-lg">
                                <DashboardIcon />
                            </span>
                            <h1 className="text-xl font-bold">UpDev</h1>
                        </div>
                        <button 
                            onClick={() => setIsSidebarOpen(false)}
                            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="flex-grow overflow-y-auto">
                        {menuItems.map(item => (
                            <button 
                                key={item.id} 
                                onClick={() => handleNavigate(item.id)} 
                                className={`w-full flex items-center gap-4 p-3 rounded-lg text-left transition-all duration-200 mb-2 ${
                                    navigation.view === item.id 
                                        ? 'bg-blue-600 shadow-md text-white' 
                                        : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                                }`}
                            >
                                <span className="flex-shrink-0">{item.icon}</span>
                                <span className="truncate">{item.name}</span>
                            </button>
                        ))}
                    </div>

                    <div className="mt-auto pt-4">
                        <div className="text-xs text-gray-500 border-t border-gray-700 pt-4 mb-4 px-2">
                            <p className="font-semibold text-gray-300 mb-1">Login sebagai:</p>
                            <p className="truncate" title={user.email}>{user.email}</p>
                        </div>
                        <button 
                            onClick={handleLogout} 
                            className="w-full flex items-center gap-4 p-3 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        >
                            <svg 
                                className="flex-shrink-0" 
                                xmlns="http://www.w3.org/2000/svg" 
                                width="24" 
                                height="24" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                stroke="currentColor" 
                                strokeWidth="2" 
                                strokeLinecap="round" 
                                strokeLinejoin="round"
                            >
                                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                                <polyline points="16 17 21 12 16 7"></polyline>
                                <line x1="21" y1="12" x2="9" y2="12"></line>
                            </svg>
                            <span className="truncate">Logout</span>
                        </button>
                    </div>
                </nav>

                {/* Main Content */}
                <main className="flex-1 min-h-screen overflow-x-hidden">
                    {/* Content wrapper with mobile padding top */}
                    <div className="pt-20 lg:pt-0 p-4 sm:p-6 lg:p-8 min-h-full">
                        <ActiveComponent 
                            user={user} 
                            userId={userId} 
                            {...navigation.params} 
                            onNavigate={handleNavigate} 
                        />
                    </div>
                </main>
            </div>
        );
    } catch (renderError) {
        console.error("Render error:", renderError);
        return (
            <div className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
                <div className="text-red-400 text-center max-w-md">
                    <h2 className="text-xl font-bold mb-2">Render Error</h2>
                    <p className="text-sm">{renderError.message}</p>
                </div>
            </div>
        );
    }
}