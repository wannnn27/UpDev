import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    getDocs, 
    addDoc, 
    serverTimestamp 
} from 'firebase/firestore';
import { SparkleIcon, LoadingSpinner } from '../components/Icons';
import Modal from '../components/Modal';

const FinanceManager = ({ userId }) => {
    const [transactions, setTransactions] = useState([]);
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('pengeluaran');
    const [analysis, setAnalysis] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [geminiLoading, setGeminiLoading] = useState(false);

    const collectionPath = `/artifacts/${appId}/users/${userId}/transactions`;

    useEffect(() => {
        if (!userId || !db) return;
        
        try {
            const q = query(collection(db, collectionPath), where("userId", "==", userId));
            const unsubscribe = onSnapshot(q, (snapshot) => {
                const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                data.sort((a,b) => (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0));
                setTransactions(data);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Error setting up transactions listener:", error);
        }
    }, [userId]);

    const addTransaction = async (e) => {
        e.preventDefault();
        if (description.trim() === '' || !amount || amount <= 0) return;
        
        try {
            await addDoc(collection(db, collectionPath), { 
                userId, 
                description, 
                amount: parseFloat(amount), 
                type, 
                createdAt: serverTimestamp() 
            });
            setDescription(''); 
            setAmount('');
        } catch (error) {
            console.error("Error adding transaction:", error);
        }
    };

    const getFinancialAnalysis = async () => {
        setGeminiLoading(true); 
        setIsModalOpen(true); 
        setAnalysis('');
        
        const expenses = transactions.filter(t => t.type === 'pengeluaran');
        if (expenses.length === 0) {
            setAnalysis("Belum ada data pengeluaran untuk dianalisis.");
            setGeminiLoading(false); 
            return;
        }
        
        const expensesText = expenses.map(t => `- ${t.description}: Rp ${t.amount.toLocaleString('id-ID')}`).join('\n');
        const prompt = `Anda adalah seorang penasihat keuangan yang ramah untuk mahasiswa. Berikut adalah daftar pengeluaran saya:\n${expensesText}\n\nBerikan analisis singkat tentang pola pengeluaran saya dan 2-3 tips praktis untuk berhemat. Jawab dalam Bahasa Indonesia dengan format markdown yang rapi.`;
        
        try {
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = "AIzaSyBBwG2lahbsAEuFjrJcFZVskZHDqAdSpqM"; 
            
            if (!apiKey) {
                setAnalysis("API key Gemini belum dikonfigurasi. Silakan tambahkan API key untuk menggunakan fitur analisis AI.");
                setGeminiLoading(false);
                return;
            }
            
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { 
                method: 'POST', 
                headers: { 'Content-Type': 'application/json' }, 
                body: JSON.stringify(payload) 
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            setAnalysis(result.candidates?.[0]?.content?.parts?.[0]?.text || "Maaf, gagal mendapatkan analisis.");
        } catch(error) { 
            console.error("Error getting financial analysis:", error); 
            setAnalysis("Terjadi kesalahan saat menghubungi AI. Periksa koneksi internet dan API key."); 
        } finally { 
            setGeminiLoading(false); 
        }
    };
    
    const totalPemasukan = transactions.filter(t => t.type === 'pemasukan').reduce((sum, t) => sum + t.amount, 0);
    const totalPengeluaran = transactions.filter(t => t.type === 'pengeluaran').reduce((sum, t) => sum + t.amount, 0);
    const sisaSaldo = totalPemasukan - totalPengeluaran;

    const EmptyState = ({ message }) => (
        <div className="text-center text-gray-400 py-8">
            <p>{message}</p>
        </div>
    );

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white">Manajemen Keuangan</h2>
                <button 
                    onClick={getFinancialAnalysis} 
                    disabled={transactions.filter(t=>t.type==='pengeluaran').length === 0} 
                    className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SparkleIcon/> Analisis AI
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-green-500/20 to-gray-800/10 p-6 rounded-xl border border-green-500/50 shadow-lg">
                    <p className="text-sm text-green-300">Total Pemasukan</p>
                    <p className="text-3xl font-bold text-white">Rp {totalPemasukan.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-gradient-to-br from-red-500/20 to-gray-800/10 p-6 rounded-xl border border-red-500/50 shadow-lg">
                    <p className="text-sm text-red-300">Total Pengeluaran</p>
                    <p className="text-3xl font-bold text-white">Rp {totalPengeluaran.toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-gray-800/10 p-6 rounded-xl border border-blue-500/50 shadow-lg">
                    <p className="text-sm text-blue-300">Sisa Saldo</p>
                    <p className={`text-3xl font-bold ${sisaSaldo < 0 ? 'text-red-400' : 'text-white'}`}>
                        Rp {sisaSaldo.toLocaleString('id-ID')}
                    </p>
                </div>
            </div>
            
            <form onSubmit={addTransaction} className="bg-gray-800 p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-end shadow-lg">
                <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Deskripsi</label>
                    <input 
                        type="text" 
                        value={description} 
                        onChange={e => setDescription(e.target.value)} 
                        placeholder="Contoh: Beli buku" 
                        className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Jumlah (Rp)</label>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(e.target.value)} 
                        placeholder="50000" 
                        className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Tipe</label>
                    <select 
                        value={type} 
                        onChange={e => setType(e.target.value)} 
                        className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="pengeluaran">Pengeluaran</option>
                        <option value="pemasukan">Pemasukan</option>
                    </select>
                </div>
                <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors shadow-md hover:shadow-blue-500/50"
                >
                    Catat
                </button>
            </form>
            
            <div className="bg-gray-800 p-4 rounded-xl shadow-lg">
                <h3 className="font-bold text-lg mb-4 text-white">Riwayat Transaksi</h3>
                <div className="space-y-3">
                    {transactions.length > 0 ? (
                        transactions.map(t => (
                            <div key={t.id} className="flex justify-between items-center bg-gray-700/50 p-3 rounded-lg hover:bg-gray-700 transition-colors">
                                <div>
                                    <p className="font-medium text-white">{t.description}</p>
                                    <p className="text-xs text-gray-400">
                                        {t.createdAt?.toDate().toLocaleString('id-ID')}
                                    </p>
                                </div>
                                <p className={`font-semibold text-lg ${t.type === 'pemasukan' ? 'text-green-400' : 'text-red-400'}`}>
                                    {t.type === 'pemasukan' ? '+' : '-'} Rp {t.amount.toLocaleString('id-ID')}
                                </p>
                            </div>
                        ))
                    ) : (
                        <EmptyState message="Belum ada transaksi" />
                    )}
                </div>
            </div>
            
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Analisis Keuangan AI">
                <div className="prose prose-invert prose-p:text-gray-300 prose-headings:text-white prose-strong:text-white max-h-[60vh] overflow-y-auto">
                   {geminiLoading ? (
                       <div className="flex justify-center items-center h-40">
                           <LoadingSpinner/>
                       </div>
                   ) : (
                       <div dangerouslySetInnerHTML={{ 
                           __html: analysis?.replace(/\n/g, '<br/>')
                               .replace(/### (.*?)<br\/>/g, '<h3>$1</h3>')
                               .replace(/\*\* (.*?) \*\*/g, '<strong>$1</strong>')
                               .replace(/<\/strong>:/g, '</strong>')
                               .replace(/\* (.*?)<br\/>/g, '<li>$1</li>') 
                       }}></div>
                   )}
                </div>
            </Modal>
        </div>
    );
};

export default FinanceManager;