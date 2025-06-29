import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
} from 'firebase/auth';
import { LoadingSpinner } from '../components/Icons';

const AuthPage = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                await createUserWithEmailAndPassword(auth, email, password);
            }
        } catch (err) {
            switch (err.code) {
                case 'auth/user-not-found':
                    setError('Email tidak ditemukan. Silakan daftar terlebih dahulu.');
                    break;
                case 'auth/wrong-password':
                    setError('Password salah. Silakan coba lagi.');
                    break;
                case 'auth/email-already-in-use':
                    setError('Email ini sudah terdaftar. Silakan login.');
                    break;
                case 'auth/weak-password':
                    setError('Password terlalu lemah. Gunakan minimal 6 karakter.');
                    break;
                default:
                    setError('Terjadi kesalahan. Silakan coba lagi.');
                    break;
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center font-sans p-4">
            <div className="w-full max-w-md p-8 space-y-8 bg-gray-800 rounded-2xl shadow-2xl">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-white">
                        {isLogin ? 'Selamat Datang Kembali' : 'Buat Akun Baru'}
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-400">
                        {isLogin ? 'Masuk ke akun UpDev Anda' : 'Mulai perjalanan produktivitas Anda'}
                    </p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                id="email-address"
                                name="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm rounded-t-md"
                                placeholder="Alamat Email"
                            />
                        </div>
                        <div>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-3 border border-gray-700 bg-gray-900 text-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm rounded-b-md"
                                placeholder="Password (minimal 6 karakter)"
                            />
                        </div>
                    </div>
                    
                    {error && (<p className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded-md">{error}</p>)}

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                        >
                            {loading ? <LoadingSpinner /> : (isLogin ? 'Masuk' : 'Daftar')}
                        </button>
                    </div>
                </form>
                <div className="text-sm text-center">
                    <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-medium text-blue-400 hover:text-blue-300">
                        {isLogin ? 'Belum punya akun? Daftar sekarang' : 'Sudah punya akun? Masuk'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;