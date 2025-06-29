import React, { useState, useEffect } from 'react';
import { db, appId } from '../firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { LoadingSpinner } from './Icons';

const PomodoroTimer = ({ userId }) => {
    const [time, setTime] = useState(25 * 60);
    const [isActive, setIsActive] = useState(false);
    const [mode, setMode] = useState('focus');
    const [suggestion, setSuggestion] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        let interval = null;
        if (isActive && time > 0) {
            interval = setInterval(() => setTime(t => t - 1), 1000);
        } else if (isActive && time === 0) {
            setIsActive(false);
            new Audio("https://actions.google.com/sounds/v1/alarms/alarm_clock.ogg").play();
            setMode(m => m === 'focus' ? 'break' : 'focus');
            setTime(mode === 'focus' ? 5 * 60 : 25 * 60);
        }
        return () => clearInterval(interval);
    }, [isActive, time, mode]);

    const getFocusSuggestion = async () => {
        setIsLoading(true); setSuggestion(null);
        try {
            const tasksPath = `/artifacts/${appId}/users/${userId}/tasks`;
            const q = query(collection(db, tasksPath), where("userId", "==", userId));
            const snapshot = await getDocs(q);
            const tasks = snapshot.docs.map(d => d.data()).filter(task => task.status !== "Selesai");
            if (tasks.length === 0) {
                setSuggestion("Tidak ada tugas aktif. Waktu yang tepat untuk merencanakan!"); 
                setIsLoading(false);
                return;
            }
            const taskList = tasks.map(t => `- ${t.title} (Prioritas: ${t.priority})`).join('\n');
            const prompt = `Analisis daftar tugas mahasiswa ini dan berikan SATU saran tugas paling penting untuk dikerjakan sekarang dalam satu kalimat. Daftar Tugas:\n${taskList}\n\nSaran Anda (dalam Bahasa Indonesia):`;
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = "";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
            const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const result = await response.json();
            setSuggestion(result.candidates?.[0]?.content?.parts?.[0]?.text || "Mari fokus!");
        } catch (e) { console.error(e); setSuggestion("Gagal mendapat saran, tapi Anda tetap bisa mulai!");
        } finally { setIsLoading(false); }
    };

    useEffect(() => {
        if(userId && db) getFocusSuggestion();
    }, [userId]);
    
    const minutes = Math.floor(time / 60); const seconds = time % 60;

    return (
        <div className="bg-gray-800 p-4 rounded-lg mt-4 text-center">
            <h4 className="font-semibold text-white mb-2">Timer Fokus</h4>
            <p className="text-4xl font-bold font-mono my-2">{`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`}</p>
            <div className="text-xs text-purple-300 mb-3 h-8 flex items-center justify-center px-2">
                {isLoading ? <LoadingSpinner/> : <p><span className="font-bold">Saran AI:</span> {suggestion}</p>}
            </div>
            <button onClick={() => setIsActive(!isActive)} className={`w-full py-2 rounded-lg font-bold ${isActive ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'}`}>
                {isActive ? 'Jeda' : 'Mulai Fokus'}
            </button>
        </div>
    );
};

export default PomodoroTimer;