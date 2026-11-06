
import { useEffect, useState } from 'react';
import {
    collection,
    onSnapshot,
    addDoc,
    doc,
    updateDoc,
    deleteDoc,
    runTransaction
} from 'firebase/firestore';
import { db } from '../firebase';

function Admin() {
    const [pets, setPets] = useState([]);
    const [adoptions, setAdoptions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const emptyForm = {
        name: '',
        type: '',
        breed: '',
        age: '',
        gender: '',
        location: '',
        description: '',
        image: ''
    };

    const [form, setForm] = useState(emptyForm);

    // Lấy danh sách thú cưng
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
                alert(error.message);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    // Lấy danh sách đơn nhận nuôi
    useEffect(() => {
        const unsubscribe = onSnapshot(
            collection(db, 'adoptions'),
            (snapshot) => {
                setAdoptions(snapshot.docs.map((item) => ({
                    id: item.id,
                    ...item.data()
                })));
            },
            (error) => {
                alert('Không thể tải đơn nhận nuôi: ' + error.message);
            }
        );

        return () => unsubscribe();
    }, []);
// Tự động đồng bộ thú cưng đã được duyệt từ trước
useEffect(() => {
    const syncApprovedPets = async () => {
        const approvedPetIds = [
            ...new Set(
                adoptions
                    .filter((item) => item.status === 'approved')
                    .map((item) => item.petId)
            )
        ];

        for (const petId of approvedPetIds) {
            const pet = pets.find((item) => item.id === petId);

            if (pet && pet.adopted !== true) {
                await updateDoc(doc(db, 'pets', petId), {
                    adopted: true
                });
            }
        }
    };

    if (pets.length > 0 && adoptions.length > 0) {
        syncApprovedPets().catch((error) => {
            console.error('Lỗi đồng bộ thú cưng:', error);
        });
    }
}, [pets, adoptions]);
    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    // Thêm hoặc cập nhật thú cưng
    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (editingId) {
                await updateDoc(doc(db, 'pets', editingId), form);
                alert('Cập nhật thú cưng thành công!');
            } else {
                await addDoc(collection(db, 'pets'), {
                    ...form,
                    adopted: false
                });
                alert('Thêm thú cưng thành công!');
            }

            setForm(emptyForm);
            setEditingId(null);
        } catch (error) {
            alert('Có lỗi xảy ra: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    // Chỉnh sửa thú cưng
    const handleEdit = (pet) => {
        setEditingId(pet.id);

        setForm({
            name: pet.name || '',
            type: pet.type || '',
            breed: pet.breed || '',
            age: pet.age || '',
            gender: pet.gender || '',
            location: pet.location || '',
            description: pet.description || '',
            image: pet.image || ''
        });

        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    // Xóa thú cưng
    const handleDelete = async (id) => {
        const confirmed = window.confirm(
            'Bạn có chắc chắn muốn xóa thú cưng này không?'
        );

        if (!confirmed) return;

        try {
            await deleteDoc(doc(db, 'pets', id));
            alert('Xóa thú cưng thành công!');

            if (editingId === id) {
                setEditingId(null);
                setForm(emptyForm);
            }
        } catch (error) {
            alert('Không thể xóa: ' + error.message);
        }
    };

    const handleCancel = () => {
        setEditingId(null);
        setForm(emptyForm);
    };

    // Duyệt hoặc từ chối đơn nhận nuôi
    const handleUpdateAdoption = async (id, status) => {
        const adoption = adoptions.find((item) => item.id === id);

        if (!adoption) return;

        const message = status === 'approved'
            ? 'Bạn có chắc chắn muốn duyệt đơn này?'
            : 'Bạn có chắc chắn muốn từ chối đơn này?';

        if (!window.confirm(message)) return;

        try {
            const adoptionRef = doc(db, 'adoptions', id);

            if (status === 'approved') {
                const petRef = doc(db, 'pets', adoption.petId);

                await runTransaction(db, async (transaction) => {
                    const petSnap = await transaction.get(petRef);
                    const adoptionSnap = await transaction.get(adoptionRef);

                    if (!petSnap.exists()) {
                        throw new Error('Không tìm thấy thú cưng!');
                    }

                    if (!adoptionSnap.exists() ||
                        adoptionSnap.data().status !== 'pending') {
                        throw new Error(
                            'Đơn này không còn ở trạng thái chờ duyệt!'
                        );
                    }

                    if (petSnap.data().adopted === true) {
                        throw new Error(
                            'Thú cưng này đã được nhận nuôi!'
                        );
                    }

                    transaction.update(petRef, {
                        adopted: true
                    });

                    transaction.update(adoptionRef, {
                        status: 'approved'
                    });
                });
            } else {
                await updateDoc(adoptionRef, {
                    status: 'rejected'
                });
            }

            alert('Cập nhật trạng thái đơn thành công!');
        } catch (error) {
            alert('Không thể cập nhật đơn: ' + error.message);
        }
    };

    const getStatus = (status) => {
        if (status === 'approved') return 'Đã duyệt';
        if (status === 'rejected') return 'Đã từ chối';
        return 'Chờ duyệt';
    };

    return (
        <div className="container py-5">
            <h2 className="fw-bold text-success mb-4">
                Trang quản trị
            </h2>

            {/* Thống kê */}
            <div className="row g-3 mb-4">
                <div className="col-md-6">
                    <div className="card shadow-sm border-0 p-4">
                        <h5>Tổng số thú cưng</h5>
                        <h2 className="text-success">{pets.length}</h2>
                    </div>
                </div>

                <div className="col-md-6">
                    <div className="card shadow-sm border-0 p-4">
                        <h5>Tổng số đơn nhận nuôi</h5>
                        <h2 className="text-primary">{adoptions.length}</h2>
                    </div>
                </div>
            </div>

            {/* Form thêm và sửa thú cưng */}
            <div className="card shadow-sm border-0 p-4 mb-5">
                <h4 className="fw-bold mb-4">
                    {editingId
                        ? 'Chỉnh sửa thú cưng'
                        : 'Thêm thú cưng mới'}
                </h4>

                <form onSubmit={handleSubmit}>
                    <div className="row g-3">
                        {[
                            ['name', 'Tên thú cưng'],
                            ['type', 'Loài'],
                            ['breed', 'Giống'],
                            ['age', 'Tuổi'],
                            ['gender', 'Giới tính'],
                            ['location', 'Địa điểm']
                        ].map(([field, label]) => (
                            <div className="col-md-6" key={field}>
                                <label className="form-label">
                                    {label}
                                </label>
                                <input
                                    type="text"
                                    name={field}
                                    className="form-control"
                                    value={form[field]}
                                    onChange={handleChange}
                                    required
                                />
                            </div>
                        ))}

                        <div className="col-12">
                            <label className="form-label">
                                URL hình ảnh
                            </label>
                            <input
                                type="url"
                                name="image"
                                className="form-control"
                                placeholder="https://example.com/pet.jpg"
                                value={form.image}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-12">
                            <label className="form-label">
                                Mô tả
                            </label>
                            <textarea
                                name="description"
                                className="form-control"
                                rows="3"
                                value={form.description}
                                onChange={handleChange}
                                required
                            />
                        </div>

                        <div className="col-12">
                            <button
                                type="submit"
                                className="btn btn-success me-2"
                                disabled={saving}
                            >
                                {saving
                                    ? 'Đang lưu...'
                                    : editingId
                                        ? 'Cập nhật'
                                        : 'Thêm thú cưng'}
                            </button>

                            {editingId && (
                                <button
                                    type="button"
                                    className="btn btn-secondary"
                                    onClick={handleCancel}
                                >
                                    Hủy
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>

            {/* Danh sách thú cưng */}
            <h4 className="fw-bold mb-3">
                Danh sách thú cưng
            </h4>

            {loading ? (
                <p>Đang tải dữ liệu...</p>
            ) : (
                <div className="row g-4 mb-5">
                    {pets.map((pet) => (
                        <div className="col-md-4" key={pet.id}>
                            <div className="card shadow-sm h-100 p-3">
                                {pet.image && (
                                    <img
                                        src={pet.image}
                                        alt={pet.name}
                                        className="card-img-top mb-3"
                                        style={{
                                            height: '200px',
                                            objectFit: 'cover'
                                        }}
                                    />
                                )}

                                <h5 className="text-success">
                                    {pet.name}
                                </h5>

                                {pet.adopted === true && (
                                    <span className="badge bg-secondary mb-2">
                                        Đã được nhận nuôi
                                    </span>
                                )}

                                <p>Loài: {pet.type}</p>
                                <p>Giống: {pet.breed}</p>
                                <p>Tuổi: {pet.age}</p>
                                <p>Giới tính: {pet.gender}</p>
                                <p>Địa điểm: {pet.location}</p>
                                <p>{pet.description}</p>

                                <div className="mt-auto d-flex gap-2">
                                    <button
                                        className="btn btn-warning flex-fill"
                                        onClick={() => handleEdit(pet)}
                                    >
                                        Sửa
                                    </button>

                                    <button
                                        className="btn btn-danger flex-fill"
                                        onClick={() => handleDelete(pet.id)}
                                    >
                                        Xóa
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Quản lý đơn nhận nuôi */}
            <h4 className="fw-bold mb-3">
                Quản lý đơn nhận nuôi
            </h4>

            {adoptions.length === 0 ? (
                <p className="text-muted">
                    Chưa có đơn nhận nuôi nào.
                </p>
            ) : (
                <div className="row g-4">
                    {adoptions.map((adoption) => {
                        const pet = pets.find(
                            (item) => item.id === adoption.petId
                        );

                        return (
                            <div className="col-md-6" key={adoption.id}>
                                <div className="card shadow-sm border-0 h-100 p-4">
                                    <h5 className="fw-bold text-success">
                                        {pet
                                            ? pet.name
                                            : 'Thú cưng không còn tồn tại'}
                                    </h5>

                                    <p>
                                        <strong>Email:</strong>{' '}
                                        {adoption.email}
                                    </p>

                                    <p>
                                        <strong>Số điện thoại:</strong>{' '}
                                        {adoption.phone}
                                    </p>

                                    <p>
                                        <strong>Địa chỉ:</strong>{' '}
                                        {adoption.address}
                                    </p>

                                    <p>
                                        <strong>Lý do:</strong>{' '}
                                        {adoption.reason}
                                    </p>

                                    <p>
                                        <strong>Trạng thái:</strong>{' '}
                                        <span className={
                                            adoption.status === 'approved'
                                                ? 'text-success fw-bold'
                                                : adoption.status === 'rejected'
                                                    ? 'text-danger fw-bold'
                                                    : 'text-warning fw-bold'
                                        }>
                                            {getStatus(adoption.status)}
                                        </span>
                                    </p>

                                    {adoption.status === 'pending' && (
                                        <div className="d-flex gap-2 mt-auto">
                                            <button
                                                className="btn btn-success flex-fill"
                                                onClick={() =>
                                                    handleUpdateAdoption(
                                                        adoption.id,
                                                        'approved'
                                                    )
                                                }
                                            >
                                                Duyệt đơn
                                            </button>

                                            <button
                                                className="btn btn-danger flex-fill"
                                                onClick={() =>
                                                    handleUpdateAdoption(
                                                        adoption.id,
                                                        'rejected'
                                                    )
                                                }
                                            >
                                                Từ chối
                                            </button>
                                        </div>
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

export default Admin;
