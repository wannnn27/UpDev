import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs, deleteDoc, doc, updateDoc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase';
import { NoteIcon, PlusIcon, SearchIcon, EmptyIcon } from '../components/Icons';

const NoteTaking = ({ userId }) => {
    const [notes, setNotes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAddNote, setShowAddNote] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [editingNote, setEditingNote] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    // Form state
    const [noteForm, setNoteForm] = useState({
        title: '',
        content: '',
        category: 'personal',
        tags: ''
    });

    const categories = [
        { id: 'all', name: 'Semua', color: 'gray' },
        { id: 'personal', name: 'Pribadi', color: 'blue' },
        { id: 'work', name: 'Kerja', color: 'green' },
        { id: 'study', name: 'Belajar', color: 'purple' },
        { id: 'ideas', name: 'Ide', color: 'yellow' },
        { id: 'other', name: 'Lainnya', color: 'red' }
    ];

    const getCategoryColor = (category) => {
        const cat = categories.find(c => c.id === category);
        const colorMap = {
            blue: 'bg-blue-600',
            green: 'bg-green-600',
            purple: 'bg-purple-600',
            yellow: 'bg-yellow-600',
            red: 'bg-red-600',
            gray: 'bg-gray-600'
        };
        return colorMap[cat?.color] || 'bg-gray-600';
    };

    const getCategoryColorText = (category) => {
        const cat = categories.find(c => c.id === category);
        const colorMap = {
            blue: 'text-blue-400',
            green: 'text-green-400',
            purple: 'text-purple-400',
            yellow: 'text-yellow-400',
            red: 'text-red-400',
            gray: 'text-gray-400'
        };
        return colorMap[cat?.color] || 'text-gray-400';
    };

    useEffect(() => {
        if (userId) {
            fetchNotes();
        }
    }, [userId]);

    const fetchNotes = async () => {
        try {
            setIsLoading(true);
            const notesRef = collection(db, 'notes');
            const q = query(
                notesRef,
                where('userId', '==', userId),
                orderBy('updatedAt', 'desc')
            );
            const querySnapshot = await getDocs(q);
            const notesData = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                notesData.push({ 
                    id: doc.id, 
                    ...data,
                    // Ensure tags is always an array
                    tags: Array.isArray(data.tags) ? data.tags : []
                });
            });
            setNotes(notesData);
        } catch (error) {
            console.error('Error fetching notes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!noteForm.title.trim() || !noteForm.content.trim()) return;

        try {
            setIsSaving(true);
            const now = new Date();
            const tagsArray = noteForm.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            const noteData = {
                title: noteForm.title.trim(),
                content: noteForm.content.trim(),
                category: noteForm.category,
                tags: tagsArray,
                userId,
                createdAt: now,
                updatedAt: now
            };

            if (editingNote) {
                await updateDoc(doc(db, 'notes', editingNote.id), {
                    ...noteData,
                    createdAt: editingNote.createdAt // Keep original creation date
                });
                
                // Update local state immediately
                setNotes(prevNotes => 
                    prevNotes.map(note => 
                        note.id === editingNote.id 
                            ? { ...note, ...noteData, createdAt: editingNote.createdAt }
                            : note
                    )
                );
            } else {
                const docRef = await addDoc(collection(db, 'notes'), noteData);
                
                // Add to local state immediately
                setNotes(prevNotes => [
                    { id: docRef.id, ...noteData },
                    ...prevNotes
                ]);
            }

            setNoteForm({ title: '', content: '', category: 'personal', tags: '' });
            setShowAddNote(false);
            setEditingNote(null);
        } catch (error) {
            console.error('Error saving note:', error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = (note) => {
        setEditingNote(note);
        setNoteForm({
            title: note.title,
            content: note.content,
            category: note.category,
            tags: Array.isArray(note.tags) ? note.tags.join(', ') : ''
        });
        setShowAddNote(true);
    };

    const handleDelete = async (noteId) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus catatan ini?')) {
            try {
                await deleteDoc(doc(db, 'notes', noteId));
                
                // Remove from local state immediately
                setNotes(prevNotes => prevNotes.filter(note => note.id !== noteId));
            } catch (error) {
                console.error('Error deleting note:', error);
            }
        }
    };

    const filteredNotes = notes.filter(note => {
        const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            (Array.isArray(note.tags) && note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
        const matchesCategory = selectedCategory === 'all' || note.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const formatDate = (timestamp) => {
        if (!timestamp) return '';
        try {
            const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
            return date.toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'short',
                year: 'numeric'
            });
        } catch (error) {
            return '';
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                <span className="ml-3 text-gray-400">Memuat catatan...</span>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-2 sm:px-4 lg:px-0">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 lg:mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 sm:p-3 rounded-xl">
                        <NoteIcon />
                    </div>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-white">Catatan</h2>
                        <p className="text-gray-400 text-sm sm:text-base">Kelola catatan dan ide Anda</p>
                    </div>
                </div>
                <button
                    onClick={() => {
                        setShowAddNote(true);
                        setEditingNote(null);
                        setNoteForm({ title: '', content: '', category: 'personal', tags: '' });
                    }}
                    className="bg-blue-600 hover:bg-blue-700 px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm sm:text-base w-full sm:w-auto"
                >
                    <PlusIcon />
                    <span className="sm:inline">Catatan Baru</span>
                </button>
            </div>

            {/* Search and Filter */}
            <div className="mb-6 space-y-4">
                <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                        <SearchIcon />
                    </div>
                    <input
                        type="text"
                        placeholder="Cari catatan, tag, atau konten..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-gray-800 border border-gray-700 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                    />
                </div>

                <div className="flex gap-2 flex-wrap">
                    {categories.map(category => {
                        const count = category.id === 'all' ? notes.length : notes.filter(note => note.category === category.id).length;
                        return (
                            <button
                                key={category.id}
                                onClick={() => setSelectedCategory(category.id)}
                                className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center gap-1 ${
                                    selectedCategory === category.id
                                        ? `${getCategoryColor(category.id)} text-white`
                                        : `bg-gray-800 text-gray-400 hover:bg-gray-700`
                                }`}
                            >
                                {category.name}
                                <span className="text-xs opacity-75 bg-black/20 px-1.5 py-0.5 rounded">
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Add/Edit Note Modal */}
            {showAddNote && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-800 rounded-xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg sm:text-xl font-bold text-white mb-4">
                            {editingNote ? 'Edit Catatan' : 'Catatan Baru'}
                        </h3>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Judul
                                </label>
                                <input
                                    type="text"
                                    value={noteForm.title}
                                    onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                                    placeholder="Masukkan judul catatan..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Kategori
                                </label>
                                <select
                                    value={noteForm.category}
                                    onChange={(e) => setNoteForm({...noteForm, category: e.target.value})}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                                >
                                    {categories.slice(1).map(category => (
                                        <option key={category.id} value={category.id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Konten
                                </label>
                                <textarea
                                    value={noteForm.content}
                                    onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 h-32 sm:h-40 resize-none text-sm sm:text-base"
                                    placeholder="Tulis catatan Anda di sini..."
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-gray-300 text-sm font-medium mb-2">
                                    Tag (pisahkan dengan koma)
                                </label>
                                <input
                                    type="text"
                                    value={noteForm.tags}
                                    onChange={(e) => setNoteForm({...noteForm, tags: e.target.value})}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-sm sm:text-base"
                                    placeholder="penting, kerja, ide..."
                                />
                            </div>

                            <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                <button
                                    type="submit"
                                    disabled={isSaving}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 px-6 py-2 rounded-lg text-white font-medium transition-colors text-sm sm:text-base flex items-center justify-center gap-2"
                                >
                                    {isSaving && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    )}
                                    {editingNote ? 'Update' : 'Simpan'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowAddNote(false);
                                        setEditingNote(null);
                                    }}
                                    className="bg-gray-600 hover:bg-gray-700 px-6 py-2 rounded-lg text-white font-medium transition-colors text-sm sm:text-base"
                                >
                                    Batal
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Notes Grid */}
            {filteredNotes.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                    <div className="flex justify-center mb-4">
                        <EmptyIcon />
                    </div>
                    <h3 className="text-lg sm:text-xl font-semibold text-gray-400 mb-2">
                        {searchTerm || selectedCategory !== 'all' ? 'Tidak ada catatan yang cocok' : 'Belum ada catatan'}
                    </h3>
                    <p className="text-gray-500 mb-6 text-sm sm:text-base px-4">
                        {searchTerm || selectedCategory !== 'all' 
                            ? 'Coba ubah filter atau kata kunci pencarian'
                            : 'Mulai buat catatan pertama Anda'
                        }
                    </p>
                    {!searchTerm && selectedCategory === 'all' && (
                        <button
                            onClick={() => setShowAddNote(true)}
                            className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-lg text-white font-medium transition-colors text-sm sm:text-base"
                        >
                            Buat Catatan Pertama
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {filteredNotes.map(note => (
                        <div
                            key={note.id}
                            className="bg-gray-800 rounded-xl p-4 sm:p-6 border border-gray-700 hover:border-gray-600 transition-all group"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base sm:text-lg font-semibold text-white mb-2 line-clamp-2 break-words">
                                        {note.title}
                                    </h3>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                                        <span className={`px-2 py-1 rounded text-xs font-medium ${getCategoryColor(note.category)} text-white w-fit`}>
                                            {categories.find(c => c.id === note.category)?.name}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                            {formatDate(note.updatedAt)}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-gray-300 text-xs sm:text-sm mb-4 line-clamp-3 break-words">
                                {note.content}
                            </p>

                            {Array.isArray(note.tags) && note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-4">
                                    {note.tags.slice(0, 3).map((tag, index) => (
                                        <span
                                            key={index}
                                            className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded truncate max-w-20"
                                            title={tag}
                                        >
                                            #{tag}
                                        </span>
                                    ))}
                                    {note.tags.length > 3 && (
                                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                                            +{note.tags.length - 3}
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                    onClick={() => handleEdit(note)}
                                    className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white text-xs rounded transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => handleDelete(note.id)}
                                    className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-colors"
                                >
                                    Hapus
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NoteTaking;