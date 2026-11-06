
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
    collection,
    onSnapshot,
    query,
    where,
    doc,
    updateDoc
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../firebase';

function Pets() {
    const [pets, setPets] = useState([]);
    const [adoptions, setAdoptions] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedType, setSelectedType] = useState('Tất cả');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'pets'),
            (snapshot) => {
                setPets(snapshot.docs.map((item) => ({
                    id: item.id,
                    ...item.data()
                })));
                setLoading(false);
            },
            (error) => {
                setError(error.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        let unsubscribeData = null;

        const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
            if (unsubscribeData) {
                unsubscribeData();
                unsubscribeData = null;
            }

            if (!user) {
                setAdoptions([]);
                return;
            }

            const q = query(
                collection(db, 'adoptions'),
                where('userId', '==', user.uid)
            );

            unsubscribeData = onSnapshot(
                q,
                (snapshot) => {
                    setAdoptions(snapshot.docs.map((item) => ({
                        id: item.id,
                        ...item.data()
                    })));
                },
                (error) => {
                    console.error(error);
                }
            );
        });

        return () => {
            unsubscribeAuth();
            if (unsubscribeData) unsubscribeData();
        };
    }, []);

    // Hủy đơn nhận nuôi
    const handleCancelAdoption = async (item) => {
        const confirmed = window.confirm(
            'Bạn có chắc chắn muốn hủy đơn nhận nuôi này không?'
        );

        if (!confirmed) return;

        try {
            setCancellingId(item.id);

            await updateDoc(doc(db, 'adoptions', item.id), {
                status: 'cancelled'
            });

            alert('Đã hủy đơn nhận nuôi thành công!');
        } catch (error) {
            alert('Không thể hủy đơn: ' + error.message);
        } finally {
            setCancellingId(null);
        }
    };

    const filteredPets = pets.filter((pet) => {
        const keyword = search.toLowerCase();

        const matchSearch =
            (pet.name || '').toLowerCase().includes(keyword) ||
            (pet.breed || '').toLowerCase().includes(keyword) ||
            (pet.location || '').toLowerCase().includes(keyword);

        const matchType =
            selectedType === 'Tất cả' || pet.type === selectedType;

        return matchSearch && matchType;
    });

    const getStatus = (status) => {
        if (status === 'approved') return 'Đã duyệt';
        if (status === 'rejected') return 'Đã từ chối';
        if (status === 'cancelled') return 'Đã hủy';
        return 'Chờ duyệt';
    };

    const getStatusColor = (status) => {
        if (status === 'approved') return 'text-success';
        if (status === 'rejected') return 'text-danger';
        if (status === 'cancelled') return 'text-secondary';
        return 'text-warning';
    };

    return (
        <div className="container py-5">
            <div className="text-center mb-5">
                <h1 className="fw-bold">Tìm Thú Cưng Của Bạn</h1>
                <p className="text-muted">
                    Những người bạn nhỏ đang chờ một gia đình mới.
                </p>
            </div>

            <div className="row mb-4">
                <div className="col-md-8 mb-3">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Tìm theo tên, giống hoặc địa điểm..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>

                <div className="col-md-4 mb-3">
                    <select
                        className="form-select"
                        value={selectedType}
                        onChange={(e) => setSelectedType(e.target.value)}
                    >
                        <option>Tất cả</option>
                        <option>Chó</option>
                        <option>Mèo</option>
                    </select>
                </div>
            </div>

            {loading && <p className="text-center">Đang tải thú cưng...</p>}

            {error && <div className="alert alert-danger">{error}</div>}

            {!loading && !error && (
                <div className="row">
                    {filteredPets.length > 0 ? (
                        filteredPets.map((pet) => (
                            <div className="col-md-4 mb-4" key={pet.id}>
                                <div className="card h-100 shadow-sm border-0">
                                    {pet.image ? (
                                        <img
                                            src={pet.image}
                                            alt={pet.name}
                                            className="card-img-top"
                                            style={{
                                                height: '250px',
                                                objectFit: 'cover'
                                            }}
                                        />
                                    ) : (
                                        <div
                                            className="bg-light d-flex align-items-center justify-content-center"
                                            style={{ height: '250px' }}
                                        >
                                            <span className="text-muted">
                                                Chưa có hình ảnh
                                            </span>
                                        </div>
                                    )}

                                    <div className="card-body">
                                        <h4 className="fw-bold">{pet.name}</h4>
                                        <p className="text-muted mb-2">
                                            {pet.breed}
                                        </p>
                                        <p className="mb-1">Loài: {pet.type}</p>
                                        <p className="mb-1">Tuổi: {pet.age}</p>
                                        <p className="mb-3">
                                            Giới tính: {pet.gender}
                                        </p>

                                        {pet.adopted === true && (
                                            <span className="badge bg-secondary mb-3">
                                                Đã được nhận nuôi
                                            </span>
                                        )}

                                        <Link
                                            to={`/pets/${pet.id}`}
                                            className="btn btn-success w-100"
                                        >
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-5">
                            <h4>Không tìm thấy thú cưng!</h4>
                            <p className="text-muted">
                                Bạn hãy thử từ khóa hoặc bộ lọc khác nhé.
                            </p>
                        </div>
                    )}
                </div>
            )}

            <hr className="my-5" />

            <h3 className="fw-bold mb-4">Đơn nhận nuôi của tôi</h3>

            {!auth.currentUser ? (
                <p className="text-muted">
                    Vui lòng <Link to="/login">đăng nhập</Link> để xem đơn nhận nuôi.
                </p>
            ) : adoptions.length === 0 ? (
                <p className="text-muted">
                    Bạn chưa gửi đơn nhận nuôi nào.
                </p>
            ) : (
                <div className="row g-3">
                    {adoptions.map((item) => {
                        const pet = pets.find((p) => p.id === item.petId);

                        return (
                            <div className="col-md-6" key={item.id}>
                                <div className="card p-3 shadow-sm h-100">
                                    <h5 className="fw-bold">
                                        {pet ? pet.name : 'Thú cưng'}
                                    </h5>

                                    <p>Số điện thoại: {item.phone}</p>
                                    <p>Địa chỉ: {item.address}</p>

                                    <p className="mb-2">
                                        Trạng thái:{' '}
                                        <strong className={getStatusColor(item.status)}>
                                            {getStatus(item.status)}
                                        </strong>
                                    </p>

                                    {item.status === 'pending' && (
                                        <button
                                            className="btn btn-outline-danger mt-2"
                                            disabled={cancellingId === item.id}
                                            onClick={() => handleCancelAdoption(item)}
                                        >
                                            {cancellingId === item.id
                                                ? 'Đang hủy...'
                                                : 'Hủy đơn'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default Pets;
