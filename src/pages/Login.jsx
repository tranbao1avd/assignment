
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase';

function Login() {
    const navigate = useNavigate();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const userCredential = await signInWithEmailAndPassword(
                auth,
                email,
                password
            );

            const user = userCredential.user;

            const userRef = doc(db, 'users', user.uid);
            const userDoc = await getDoc(userRef);

            // Tao ho so neu tai khoan chua co du lieu trong Firestore
            if (!userDoc.exists()) {
                await setDoc(userRef, {
                    name: '',
                    email: user.email,
                    phone: '',
                    role: 'user',
                    createdAt: serverTimestamp()
                });
            }

            alert('Đăng nhập thành công!');
            navigate('/');
        } catch (error) {
            setError('Email hoặc mật khẩu không chính xác. Vui lòng thử lại.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-5">
                    <div className="card shadow-sm border-0 p-4">
                        <h2 className="text-center fw-bold mb-4">
                            Đăng nhập
                        </h2>

                        {error && (
                            <div className="alert alert-danger">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Email</label>
                                <input
                                    type="email"
                                    className="form-control"
                                    placeholder="Nhập email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Mật khẩu</label>
                                <input
                                    type="password"
                                    className="form-control"
                                    placeholder="Nhập mật khẩu"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-success w-100"
                                disabled={loading}
                            >
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </button>
                        </form>

                        <p className="text-center mt-3 mb-0">
                            Chưa có tài khoản?{' '}
                            <Link to="/register">Đăng ký ngay</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Login;
