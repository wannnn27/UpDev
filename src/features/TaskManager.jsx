import React, { useState, useEffect, useRef } from 'react';
import { db, appId } from '../firebase';
import { 
    collection, 
    query, 
    where, 
    onSnapshot, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc, 
    serverTimestamp 
} from 'firebase/firestore';

const TaskManager = ({ userId }) => {
    const [tasks, setTasks] = useState([]);
    const [title, setTitle] = useState('');
    const [deadline, setDeadline] = useState('');
    const [priority, setPriority] = useState('Sedang');
    const formRef = useRef(null);
    
    const collectionPath = `/artifacts/${appId}/users/${userId}/tasks`;

    useEffect(() => {
        if (!userId || !db) return;
        
        try {
            const q = query(collection(db, collectionPath), where("userId", "==", userId));
            const unsubscribe = onSnapshot(q, (querySnapshot) => {
                const tasksData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                tasksData.sort((a, b) => (a.deadline && b.deadline) ? new Date(a.deadline) - new Date(b.deadline) : 0);
                setTasks(tasksData);
            });
            return () => unsubscribe();
        } catch (error) {
            console.error("Error setting up tasks listener:", error);
        }
    }, [userId]);

    const addTask = async (e) => {
        e.preventDefault();
        if (title.trim() === '' || deadline === '') return;
        
        try {
            await addDoc(collection(db, collectionPath), {
                userId, 
                title, 
                deadline, 
                priority, 
                status: 'Belum Dikerjakan', 
                createdAt: serverTimestamp(),
            });
            setTitle(''); 
            setDeadline(''); 
            setPriority('Sedang');
        } catch (error) {
            console.error("Error adding task:", error);
        }
    };

    const updateStatus = async (id, newStatus) => {
        try {
            await updateDoc(doc(db, collectionPath, id), { 
                status: newStatus,
                ...(newStatus === 'Selesai' ? { completedAt: serverTimestamp() } : {})
            });
        } catch (error) {
            console.error("Error updating task:", error);
        }
    };
    
    const deleteTask = async (id) => {
        try {
            await deleteDoc(doc(db, collectionPath, id));
        } catch (error) {
            console.error("Error deleting task:", error);
        }
    };

    const priorityColor = { 
        'Tinggi': 'bg-red-500', 
        'Sedang': 'bg-yellow-500', 
        'Rendah': 'bg-green-500' 
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-white">Manajer Tugas</h2>
            <form ref={formRef} onSubmit={addTask} className="bg-gray-800 p-4 rounded-xl mb-6 flex flex-wrap gap-4 items-end shadow-lg">
                <div className="flex-grow">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Nama Tugas</label>
                    <input 
                        type="text" 
                        value={title} 
                        onChange={(e) => setTitle(e.target.value)} 
                        placeholder="Contoh: Mengerjakan esai Kalkulus" 
                        className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Deadline</label>
                    <input 
                        type="date" 
                        value={deadline} 
                        onChange={(e) => setDeadline(e.target.value)} 
                        className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500" 
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Prioritas</label>
                    <select 
                        value={priority} 
                        onChange={(e) => setPriority(e.target.value)} 
                        className="bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:ring-2 focus:ring-blue-500"
                    >
                        <option>Rendah</option>
                        <option>Sedang</option>
                        <option>Tinggi</option>
                    </select>
                </div>
                <button 
                    type="submit" 
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors shadow-md hover:shadow-blue-500/50"
                >
                    Tambah
                </button>
            </form>
            <div className="space-y-4">
                {tasks.length > 0 ? (
                    tasks.map(task => (
                        <div key={task.id} className={`bg-gray-800 p-4 rounded-xl flex items-center justify-between transition-all duration-300 shadow-md ${task.status === 'Selesai' ? 'opacity-50' : ''}`}>
                            <div className="flex items-center gap-4">
                                <span className={`w-4 h-4 rounded-full ${priorityColor[task.priority]} border-2 border-gray-900`}></span>
                                <div>
                                    <p className={`font-semibold text-white ${task.status === 'Selesai' ? 'line-through' : ''}`}>{task.title}</p>
                                    <p className="text-sm text-gray-400">Deadline: {new Date(task.deadline).toLocaleDateString('id-ID')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <select 
                                    value={task.status} 
                                    onChange={(e) => updateStatus(task.id, e.target.value)} 
                                    className="bg-gray-700 text-white text-sm p-1 rounded-md border border-gray-600"
                                >
                                    <option>Belum Dikerjakan</option>
                                    <option>Dikerjakan</option>
                                    <option>Selesai</option>
                                </select>
                                <button 
                                    onClick={() => deleteTask(task.id)} 
                                    className="text-red-500/70 hover:text-red-500 p-1 transition-colors"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-gray-400 py-8">
                        <p>Belum ada tugas yang ditambahkan</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TaskManager;