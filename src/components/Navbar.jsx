import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebase';

function Navbar() {
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });

        return () => unsubscribe();
    }, []);

    const handleLogout = async () => {
        try {
            await signOut(auth);
            alert('Đăng xuất thành công!');
            navigate('/login');
        } catch (error) {
            alert(error.message);
        }
    };

    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
            <div className="container">
                <Link className="navbar-brand fw-bold text-success fs-4" to="/">
                    🐾 Nhận Nuôi Thú Cưng
                </Link>

                <div className="navbar-nav ms-auto align-items-center">
                    <Link className="nav-link" to="/">Trang chủ</Link>
                    <Link className="nav-link" to="/pets">Thú cưng</Link>

                    {user ? (
                        <button
                            className="btn btn-danger ms-2"
                            onClick={handleLogout}
                        >
                            Đăng xuất
                        </button>
                    ) : (
                        <>
                            <Link className="nav-link" to="/login">
                                Đăng nhập
                            </Link>
                            <Link className="btn btn-success ms-2" to="/register">
                                Đăng ký
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;