import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';

function PetDetail() {
    const { id } = useParams();

    const [pet, setPet] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPet = async () => {
            try {
                const petRef = doc(db, 'pets', id);
                const petSnap = await getDoc(petRef);

                if (petSnap.exists()) {
                    setPet({
                        id: petSnap.id,
                        ...petSnap.data()
                    });
                } else {
                    setError('Không tìm thấy thú cưng!');
                }
            } catch (error) {
                setError('Không thể tải thông tin thú cưng.');
            } finally {
                setLoading(false);
            }
        };

        fetchPet();
    }, [id]);

    if (loading) {
        return <div className="container py-5">Đang tải...</div>;
    }

    if (error) {
        return (
            <div className="container py-5 text-center">
                <h4>{error}</h4>
                <Link to="/pets" className="btn btn-success mt-3">
                    Quay lại danh sách
                </Link>
            </div>
        );
    }

    return (
        <div className="container py-5">
            <div className="row g-5">
                <div className="col-md-6">
                    {pet.image ? (
                        <img
                            src={pet.image}
                            alt={pet.name}
                            className="img-fluid rounded shadow-sm w-100"
                            style={{ maxHeight: '450px', objectFit: 'cover' }}
                        />
                    ) : (
                        <div
                            className="bg-light rounded d-flex align-items-center justify-content-center"
                            style={{ height: '350px' }}
                        >
                            Chưa có hình ảnh
                        </div>
                    )}
                </div>

                <div className="col-md-6">
                    <h1 className="fw-bold text-success mb-3">
                        {pet.name}
                    </h1>

                    <p><strong>Loài:</strong> {pet.type}</p>
                    <p><strong>Giống:</strong> {pet.breed}</p>
                    <p><strong>Tuổi:</strong> {pet.age}</p>
                    <p><strong>Giới tính:</strong> {pet.gender}</p>
                    <p><strong>Địa điểm:</strong> {pet.location}</p>

                    <hr />

                    <h5 className="fw-bold">Mô tả</h5>
                    <p>{pet.description}</p>

                    <div className="d-flex gap-2 mt-4">
    {pet.adopted === true ? (
        <button className="btn btn-secondary" disabled>
            Đã được nhận nuôi
        </button>
    ) : (
        <Link
            to={`/adoption/${pet.id}`}
            className="btn btn-success"
        >
            Nhận nuôi
        </Link>
    )}

    <Link to="/pets" className="btn btn-outline-secondary">
        Quay lại danh sách
    </Link>
</div>
                </div>
            </div>
        </div>
    );
}

export default PetDetail;