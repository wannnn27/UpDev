import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { ProjectIcon, PlusIcon } from '../components/Icons';

const ProjectView = ({ userId, onNavigate }) => {
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [newProjectName, setNewProjectName] = useState('');
    const [newProjectDesc, setNewProjectDesc] = useState('');
    const projectsPath = `/artifacts/${appId}/users/${userId}/projects`;

    useEffect(() => {
        if (!userId || !db) return;
        const q = query(collection(db, projectsPath), where("userId", "==", userId));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return unsubscribe;
    }, [userId]);

    const handleCreateProject = async () => {
        if (newProjectName.trim() === '') return;
        await addDoc(collection(db, projectsPath), {
            userId, name: newProjectName, description: newProjectDesc, createdAt: serverTimestamp(),
        });
        setIsModalOpen(false);
        setNewProjectName('');
        setNewProjectDesc('');
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h2 className="text-3xl font-bold text-white">Proyek Saya</h2>
                 <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-blue-500/50">
                    <PlusIcon/> Buat Proyek Baru
                </button>
            </div>
            {projects.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map(p => (
                        <div key={p.id} onClick={() => onNavigate('projectDetail', { projectId: p.id, projectName: p.name })} className="bg-gray-800 p-6 rounded-xl shadow-lg hover:shadow-purple-500/20 border border-gray-700 hover:border-purple-500 cursor-pointer transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center gap-3 mb-3"><ProjectIcon/><h3 className="text-xl font-bold text-white truncate">{p.name}</h3></div>
                            <p className="text-gray-400 text-sm line-clamp-2">{p.description || "Tidak ada deskripsi."}</p>
                        </div>
                    ))}
                </div>
            ) : (<EmptyState message="Anda belum punya proyek" actionText="Buat Proyek Pertama Anda" onActionClick={() => setIsModalOpen(true)} />)}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Buat Proyek Baru">
                <div className="space-y-4">
                    <input type="text" value={newProjectName} onChange={e => setNewProjectName(e.target.value)} placeholder="Nama Proyek (e.g., Skripsi Bab 1)" className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600"/>
                    <textarea value={newProjectDesc} onChange={e => setNewProjectDesc(e.target.value)} placeholder="Deskripsi singkat proyek (opsional)" className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 h-24 resize-none"></textarea>
                    <button onClick={handleCreateProject} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Simpan Proyek</button>
                </div>
            </Modal>
        </div>
    );
};

export default ProjectView;