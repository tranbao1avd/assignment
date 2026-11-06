
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    addDoc,
    collection,
    serverTimestamp,
    doc,
    getDoc
} from 'firebase/firestore';
import { auth, db } from '../firebase';

function Adoption() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        phone: '',
        address: '',
        reason: ''
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm({
            ...form,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!auth.currentUser) {
            alert('Vui lòng đăng nhập trước khi gửi đơn!');
            navigate('/login');
            return;
        }

        setLoading(true);

        try {
            // Kiểm tra ID thú cưng
            if (!id) {
                throw new Error('Không tìm thấy ID thú cưng trên URL!');
            }

            // Lấy thông tin thú cưng
            const petRef = doc(db, 'pets', id);
            const petSnap = await getDoc(petRef);

            console.log('Pet ID:', id);
            console.log('Pet tồn tại:', petSnap.exists());

            if (!petSnap.exists()) {
                throw new Error('Không tìm thấy thú cưng!');
            }

            const petData = petSnap.data();

            console.log('Pet data:', petData);
            console.log('User ID:', auth.currentUser.uid);

            // Kiểm tra thú cưng đã được nhận nuôi chưa
            if (petData.adopted === true) {
                alert('Thú cưng này đã được nhận nuôi!');
                navigate('/pets');
                return;
            }

            // Kiểm tra dữ liệu trước khi gửi
            const adoptionData = {
                petId: id,
                userId: auth.currentUser.uid,
                email: auth.currentUser.email || '',
                phone: form.phone.trim(),
                address: form.address.trim(),
                reason: form.reason.trim(),
                status: 'pending',
                createdAt: serverTimestamp()
            };

            console.log('Dữ liệu chuẩn bị gửi:', adoptionData);
            console.log('Bắt đầu gửi đơn nhận nuôi...');

            // Gửi đơn lên Firestore
            const result = await addDoc(
                collection(db, 'adoptions'),
                adoptionData
            );

            console.log('Gửi đơn thành công! Document ID:', result.id);

            alert('Gửi đơn nhận nuôi thành công!');
            navigate('/pets');

        } catch (error) {
            console.error('LỖI GỬI ĐƠN:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);

            alert(
                'Không thể gửi đơn: ' +
                error.message +
                '\nMã lỗi: ' +
                (error.code || 'Không xác định')
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container py-5">
            <div className="row justify-content-center">
                <div className="col-md-7">
                    <div className="card shadow-sm border-0 p-4">
                        <h2 className="fw-bold text-success mb-4">
                            Đăng ký nhận nuôi
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">
                                    Số điện thoại
                                </label>

                                <input
                                    type="tel"
                                    name="phone"
                                    className="form-control"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Địa chỉ
                                </label>

                                <input
                                    type="text"
                                    name="address"
                                    className="form-control"
                                    value={form.address}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Lý do muốn nhận nuôi
                                </label>

                                <textarea
                                    name="reason"
                                    className="form-control"
                                    rows="4"
                                    value={form.reason}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className="btn btn-success w-100"
                                disabled={loading}
                            >
                                {loading
                                    ? 'Đang gửi...'
                                    : 'Gửi đơn nhận nuôi'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Adoption;
