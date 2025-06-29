import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { collection, query, where, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import { PlusIcon } from '../components/Icons';

const ProjectDetailView = ({ userId, projectId, projectName, onNavigate }) => {
    const [tasks, setTasks] = useState([]);
    const [notes, setNotes] = useState([]);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [isNoteModalOpen, setIsNoteModalOpen] = useState(false);
    const [newTaskTitle, setNewTaskTitle] = useState('');
    const [newTaskDeadline, setNewTaskDeadline] = useState('');
    const [newNoteSubject, setNewNoteSubject] = useState('');
    const [newNoteContent, setNewNoteContent] = useState('');

    const tasksPath = `/artifacts/${appId}/users/${userId}/tasks`;
    const notesPath = `/artifacts/${appId}/users/${userId}/notes`;

    useEffect(() => {
        if (!userId || !projectId) return;
        const qTasks = query(collection(db, tasksPath), where("userId", "==", userId), where("projectId", "==", projectId));
        const unsubTasks = onSnapshot(qTasks, (snapshot) => {
            setTasks(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        
        const qNotes = query(collection(db, notesPath), where("userId", "==", userId), where("projectId", "==", projectId));
        const unsubNotes = onSnapshot(qNotes, (snapshot) => {
            setNotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });

        return () => { unsubTasks(); unsubNotes(); };
    }, [userId, projectId]);

    const handleAddTask = async () => {
        if (newTaskTitle.trim() === '') return;
        await addDoc(collection(db, tasksPath), {
            userId, projectId, title: newTaskTitle, deadline: newTaskDeadline,
            status: 'Belum Dikerjakan', priority: 'Sedang', createdAt: serverTimestamp(),
        });
        setIsTaskModalOpen(false); setNewTaskTitle(''); setNewTaskDeadline('');
    };
    
    const handleAddNote = async () => {
        if (newNoteSubject.trim() === '') return;
        await addDoc(collection(db, notesPath), {
            userId, projectId, subject: newNoteSubject, content: newNoteContent, createdAt: serverTimestamp(),
        });
        setIsNoteModalOpen(false); setNewNoteSubject(''); setNewNoteContent('');
    };

    return (
        <div>
            <button onClick={() => onNavigate('projects')} className="text-blue-400 hover:underline mb-4">&lt; Kembali ke semua proyek</button>
            <h2 className="text-3xl font-bold text-white mb-2">{projectName}</h2>
            <p className="text-gray-400 mb-6">Ruang kerja terfokus untuk proyek Anda.</p>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-bold">Tugas Proyek</h3>
                        <button onClick={() => setIsTaskModalOpen(true)} className="p-1 bg-blue-600 rounded-md"><PlusIcon/></button>
                    </div>
                    {tasks.length > 0 ? tasks.map(t => <div key={t.id} className="text-white bg-gray-700 p-2 rounded-md mb-2">{t.title}</div>) : <EmptyState message="Tidak ada tugas"/>}
                </div>
                 <div className="bg-gray-800 p-4 rounded-xl">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="text-xl font-bold">Catatan Proyek</h3>
                        <button onClick={() => setIsNoteModalOpen(true)} className="p-1 bg-blue-600 rounded-md"><PlusIcon/></button>
                    </div>
                    {notes.length > 0 ? notes.map(n => <div key={n.id} className="text-white bg-gray-700 p-2 rounded-md mb-2">{n.subject}</div>) : <EmptyState message="Tidak ada catatan"/>}
                </div>
            </div>
            
            <Modal isOpen={isTaskModalOpen} onClose={() => setIsTaskModalOpen(false)} title="Tambah Tugas Proyek">
                 <div className="space-y-4">
                    <input type="text" value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="Nama Tugas" className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600"/>
                    <input type="date" value={newTaskDeadline} onChange={e => setNewTaskDeadline(e.target.value)} className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600"/>
                    <button onClick={handleAddTask} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Tambah</button>
                </div>
            </Modal>
            <Modal isOpen={isNoteModalOpen} onClose={() => setIsNoteModalOpen(false)} title="Tambah Catatan Proyek">
                <div className="space-y-4">
                    <input type="text" value={newNoteSubject} onChange={e => setNewNoteSubject(e.target.value)} placeholder="Judul Catatan" className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600"/>
                    <textarea value={newNoteContent} onChange={e => setNewNoteContent(e.target.value)} placeholder="Isi catatan..." className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 h-24 resize-none"></textarea>
                    <button onClick={handleAddNote} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-lg">Simpan</button>
                </div>
            </Modal>
        </div>
    )
};

export default ProjectDetailView;