import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { collection, query, where, onSnapshot, getDocs } from 'firebase/firestore';
import { SparkleIcon, LoadingSpinner, TaskIcon, ProjectIcon, FinanceIcon, CalendarIcon, CheckCircleIcon, ClockIcon, TrendingUpIcon, TrendingDownIcon } from '../components/Icons';
import Modal from '../components/Modal';

const Dashboard = ({ userId, onNavigate }) => {
    const [tasks, setTasks] = useState([]);
    const [projects, setProjects] = useState([]);
    const [finances, setFinances] = useState([]);
    const [quote, setQuote] = useState({ text: "...", author: "..." });
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportContent, setReportContent] = useState('');
    const [isReportLoading, setIsReportLoading] = useState(false);
    const [stats, setStats] = useState({
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        totalProjects: 0,
        activeProjects: 0,
        completedProjects: 0,
        totalIncome: 0,
        totalExpense: 0,
        balance: 0,
        productivity: 0
    });

    useEffect(() => {
        if (!userId || !db) return;

        // Listen to tasks
        const taskCollectionPath = `/artifacts/${appId}/users/${userId}/tasks`;
        const qTasks = query(collection(db, taskCollectionPath), where("userId", "==", userId));
        const unsubscribeTasks = onSnapshot(qTasks, (snapshot) => {
            const allTasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setTasks(allTasks);
            
            const completedTasks = allTasks.filter(task => task.status === "Selesai");
            const pendingTasks = allTasks.filter(task => task.status !== "Selesai");
            
            setStats(prev => ({
                ...prev,
                totalTasks: allTasks.length,
                completedTasks: completedTasks.length,
                pendingTasks: pendingTasks.length,
                productivity: allTasks.length > 0 ? Math.round((completedTasks.length / allTasks.length) * 100) : 0
            }));
        });

        // Listen to projects
        const projectCollectionPath = `/artifacts/${appId}/users/${userId}/projects`;
        const qProjects = query(collection(db, projectCollectionPath), where("userId", "==", userId));
        const unsubscribeProjects = onSnapshot(qProjects, (snapshot) => {
            const allProjects = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setProjects(allProjects);
            
            const activeProjects = allProjects.filter(project => project.status !== "Selesai");
            const completedProjects = allProjects.filter(project => project.status === "Selesai");
            
            setStats(prev => ({
                ...prev,
                totalProjects: allProjects.length,
                activeProjects: activeProjects.length,
                completedProjects: completedProjects.length
            }));
        });

        // Listen to finances
        const financeCollectionPath = `/artifacts/${appId}/users/${userId}/finances`;
        const qFinances = query(collection(db, financeCollectionPath), where("userId", "==", userId));
        const unsubscribeFinances = onSnapshot(qFinances, (snapshot) => {
            const allFinances = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setFinances(allFinances);
            
            const income = allFinances
                .filter(item => item.type === "income")
                .reduce((sum, item) => sum + (item.amount || 0), 0);
            const expense = allFinances
                .filter(item => item.type === "expense")
                .reduce((sum, item) => sum + (item.amount || 0), 0);
            
            setStats(prev => ({
                ...prev,
                totalIncome: income,
                totalExpense: expense,
                balance: income - expense
            }));
        });

        // Random quote
        const quotes = [
            { text: "Pendidikan adalah senjata paling ampuh yang bisa kamu gunakan untuk mengubah dunia.", author: "Nelson Mandela" },
            { text: "Satu-satunya sumber pengetahuan adalah pengalaman.", author: "Albert Einstein" },
            { text: "Kesuksesan adalah hasil dari persiapan, kerja keras, dan belajar dari kegagalan.", author: "Colin Powell" },
            { text: "Masa depan milik mereka yang percaya pada keindahan impian mereka.", author: "Eleanor Roosevelt" },
            { text: "Jangan tunggu kesempatan yang tepat, ciptakan kesempatan itu.", author: "George Bernard Shaw" }
        ];
        setQuote(quotes[Math.floor(Math.random() * quotes.length)]);

        return () => { 
            unsubscribeTasks(); 
            unsubscribeProjects();
            unsubscribeFinances();
        };
    }, [userId]);

    const generateWeeklyReport = async () => {
        setIsReportModalOpen(true);
        setIsReportLoading(true);
        try {
            const taskCollectionPath = `/artifacts/${appId}/users/${userId}/tasks`;
            const q = query(collection(db, taskCollectionPath), where("userId", "==", userId));
            const snapshot = await getDocs(q);
            const allTasks = snapshot.docs.map(d => d.data());
            
            const sevenDaysAgo = new Date();
            sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
            const completedTasks = allTasks.filter(d => d.status === "Selesai" && d.completedAt && d.completedAt.toDate() >= sevenDaysAgo);
            
            if (completedTasks.length === 0) {
                setReportContent("Anda belum menyelesaikan tugas apapun dalam seminggu terakhir. Mari mulai minggu ini dengan semangat baru!");
                setIsReportLoading(false);
                return;
            }

            const taskList = completedTasks.map(t => `- ${t.title} (diselesaikan pada ${new Date(t.completedAt.toDate()).toLocaleDateString('id-ID')})`).join('\n');
            const prompt = `Anda adalah seorang pelatih produktivitas AI yang berpengalaman. Analisis daftar tugas yang diselesaikan oleh seorang mahasiswa dalam seminggu terakhir. Berikan laporan komprehensif yang berisi:

1. **Ringkasan Pencapaian**: Jumlah tugas yang diselesaikan dan apresiasi atas usaha yang telah dilakukan
2. **Analisis Pola Produktivitas**: Identifikasi hari atau waktu yang paling produktif berdasarkan data
3. **Insight dan Refleksi**: Temuan menarik dari pola kerja yang terlihat
4. **Rekomendasi Strategis**: Saran konkret dan dapat ditindaklanjuti untuk meningkatkan produktivitas minggu depan
5. **Motivasi dan Dorongan**: Kata-kata penyemangat yang personal dan relevan

Jawab dalam Bahasa Indonesia dengan format markdown yang rapi dan tone yang supportif namun profesional.

Data tugas yang selesai:\n${taskList}`;
            
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = "AIzaSyBBwG2lahbsAEuFjrJcFZVskZHDqAdSpqM";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            setReportContent(result.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, gagal membuat laporan. Silakan coba lagi nanti.");
        } catch (e) {
            console.error(e);
            setReportContent("Terjadi kesalahan saat membuat laporan AI. Pastikan koneksi internet Anda stabil.");
        } finally {
            setIsReportLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    const getRecentTasks = () => {
        return tasks
            .filter(task => task.status !== "Selesai")
            .sort((a, b) => {
                if (a.priority && b.priority) {
                    const priorityOrder = { "Tinggi": 3, "Sedang": 2, "Rendah": 1 };
                    return priorityOrder[b.priority] - priorityOrder[a.priority];
                }
                return new Date(b.createdAt?.toDate() || 0) - new Date(a.createdAt?.toDate() || 0);
            })
            .slice(0, 5);
    };

    const getActiveProjects = () => {
        return projects
            .filter(project => project.status !== "Selesai")
            .sort((a, b) => new Date(b.createdAt?.toDate() || 0) - new Date(a.createdAt?.toDate() || 0))
            .slice(0, 3);
    };

    const getRecentFinances = () => {
        return finances
            .sort((a, b) => new Date(b.date?.toDate() || 0) - new Date(a.date?.toDate() || 0))
            .slice(0, 5);
    };

    const StatCard = ({ title, value, subtitle, icon, color, onClick, trend }) => (
        <div 
            onClick={onClick}
            className={`bg-gradient-to-br ${color} p-6 rounded-2xl shadow-lg border border-white/10 hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:scale-105`}
        >
            <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-white/20 rounded-xl">
                    {icon}
                </div>
                {trend && (
                    <div className={`flex items-center gap-1 text-sm ${trend > 0 ? 'text-green-300' : 'text-red-300'}`}>
                        {trend > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />}
                        <span>{Math.abs(trend)}%</span>
                    </div>
                )}
            </div>
            <h3 className="text-2xl font-bold text-white mb-1">{value}</h3>
            <p className="text-white/80 text-sm">{title}</p>
            {subtitle && <p className="text-white/60 text-xs mt-1">{subtitle}</p>}
        </div>
    );

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
                    <p className="text-gray-400">Selamat datang kembali! Lihat ringkasan aktivitas Anda hari ini.</p>
                </div>
                <button 
                    onClick={generateWeeklyReport} 
                    className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 shadow-lg hover:shadow-purple-500/50 transform hover:scale-105"
                >
                    <SparkleIcon/> 
                    <span>Laporan Mingguan AI</span>
                </button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Tugas"
                    value={stats.totalTasks}
                    subtitle={`${stats.completedTasks} selesai, ${stats.pendingTasks} pending`}
                    icon={<TaskIcon />}
                    color="from-blue-500/80 to-blue-600/80"
                    onClick={() => onNavigate('tasks')}
                />
                <StatCard
                    title="Proyek Aktif"
                    value={stats.activeProjects}
                    subtitle={`${stats.completedProjects} proyek selesai`}
                    icon={<ProjectIcon />}
                    color="from-green-500/80 to-green-600/80"
                    onClick={() => onNavigate('projects')}
                />
                <StatCard
                    title="Saldo Keuangan"
                    value={formatCurrency(stats.balance)}
                    subtitle={`Pemasukan: ${formatCurrency(stats.totalIncome)}`}
                    icon={<FinanceIcon />}
                    color={stats.balance >= 0 ? "from-emerald-500/80 to-emerald-600/80" : "from-red-500/80 to-red-600/80"}
                    onClick={() => onNavigate('finance')}
                />
                <StatCard
                    title="Produktivitas"
                    value={`${stats.productivity}%`}
                    subtitle="Tingkat penyelesaian tugas"
                    icon={<CheckCircleIcon />}
                    color="from-purple-500/80 to-purple-600/80"
                    trend={stats.productivity > 75 ? 5 : stats.productivity < 50 ? -3 : 0}
                />
            </div>

            {/* Quote Section */}
            <div className="bg-gradient-to-r from-purple-600/30 to-blue-600/30 p-8 rounded-2xl text-center shadow-lg border border-purple-500/50 backdrop-blur-sm">
                <p className="text-xl italic text-white mb-3">"{quote.text}"</p>
                <p className="font-semibold text-purple-300">— {quote.author}</p>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Tasks */}
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <TaskIcon />
                            Tugas Terbaru
                        </h2>
                        <button 
                            onClick={() => onNavigate('tasks')}
                            className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                            Lihat Semua
                        </button>
                    </div>
                    <div className="space-y-3">
                        {getRecentTasks().length > 0 ? getRecentTasks().map((task, index) => (
                            <div key={index} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-white font-medium text-sm mb-1 truncate">{task.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                task.priority === 'Tinggi' ? 'bg-red-500/20 text-red-300' :
                                                task.priority === 'Sedang' ? 'bg-yellow-500/20 text-yellow-300' :
                                                'bg-green-500/20 text-green-300'
                                            }`}>
                                                {task.priority || 'Normal'}
                                            </span>
                                            {task.deadline && (
                                                <span className="text-gray-400 text-xs flex items-center gap-1">
                                                    <ClockIcon />
                                                    {new Date(task.deadline.toDate()).toLocaleDateString('id-ID')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-center py-8">Tidak ada tugas pending saat ini</p>
                        )}
                    </div>
                </div>

                {/* Active Projects */}
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <ProjectIcon />
                            Proyek Aktif
                        </h2>
                        <button 
                            onClick={() => onNavigate('projects')}
                            className="text-green-400 hover:text-green-300 text-sm transition-colors"
                        >
                            Lihat Semua
                        </button>
                    </div>
                    <div className="space-y-3">
                        {getActiveProjects().length > 0 ? getActiveProjects().map((project, index) => (
                            <div key={index} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
                                <h3 className="text-white font-medium text-sm mb-2 truncate">{project.title}</h3>
                                <p className="text-gray-400 text-xs mb-2 line-clamp-2">{project.description}</p>
                                <div className="flex items-center justify-between">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                        project.status === 'Berlangsung' ? 'bg-blue-500/20 text-blue-300' :
                                        'bg-yellow-500/20 text-yellow-300'
                                    }`}>
                                        {project.status || 'Berlangsung'}
                                    </span>
                                    {project.deadline && (
                                        <span className="text-gray-400 text-xs">
                                            {new Date(project.deadline.toDate()).toLocaleDateString('id-ID')}
                                        </span>
                                    )}
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-center py-8">Tidak ada proyek aktif</p>
                        )}
                    </div>
                </div>

                {/* Recent Finances */}
                <div className="bg-gray-800/50 p-6 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FinanceIcon />
                            Transaksi Terbaru
                        </h2>
                        <button 
                            onClick={() => onNavigate('finance')}
                            className="text-emerald-400 hover:text-emerald-300 text-sm transition-colors"
                        >
                            Lihat Semua
                        </button>
                    </div>
                    <div className="space-y-3">
                        {getRecentFinances().length > 0 ? getRecentFinances().map((finance, index) => (
                            <div key={index} className="bg-gray-700/50 p-4 rounded-lg border border-gray-600/50">
                                <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-white font-medium text-sm mb-1 truncate">{finance.description}</h3>
                                        <span className="text-gray-400 text-xs">
                                            {finance.category} • {new Date(finance.date?.toDate()).toLocaleDateString('id-ID')}
                                        </span>
                                    </div>
                                    <span className={`font-bold text-sm ${
                                        finance.type === 'income' ? 'text-green-400' : 'text-red-400'
                                    }`}>
                                        {finance.type === 'income' ? '+' : '-'}{formatCurrency(finance.amount)}
                                    </span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-gray-400 text-center py-8">Belum ada transaksi</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal for AI Report */}
            <Modal isOpen={isReportModalOpen} onClose={() => setIsReportModalOpen(false)} title="Laporan Produktivitas Mingguan AI">
                <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white max-h-[70vh] overflow-y-auto">
                    {isReportLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <LoadingSpinner/>
                        </div>
                    ) : (
                        <div dangerouslySetInnerHTML={{ 
                            __html: reportContent
                                ?.replace(/\n/g, '<br/>')
                                .replace(/### (.*?)<br\/>/g, '<h3>$1</h3>')
                                .replace(/## (.*?)<br\/>/g, '<h2>$1</h2>')
                                .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                .replace(/<\/strong>:/g, '</strong>:')
                                .replace(/\* (.*?)<br\/>/g, '<li>$1</li>')
                                .replace(/- (.*?)<br\/>/g, '<li>$1</li>')
                        }}></div>
                    )}
                </div>
            </Modal>
        </div>
    );
};

export default Dashboard;