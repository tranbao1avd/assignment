
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div>
            <section className="bg-success text-white py-5">
                <div className="container py-5">
                    <div className="row align-items-center">
                        <div className="col-md-6">
                            <h1 className="display-4 fw-bold">
                                Tìm Người Bạn Nhỏ Của Bạn
                            </h1>
                            <p className="lead mt-3">
                                Mỗi thú cưng đều xứng đáng có một mái ấm.
                                Hãy mở rộng trái tim và trao cho các bé
                                một gia đình tràn đầy yêu thương.
                            </p>
                            <Link to="/pets" className="btn btn-light btn-lg mt-3">
                                Tìm thú cưng ngay
                            </Link>
                        </div>

                        <div className="col-md-6 text-center mt-4 mt-md-0">
                            <img
                                src="https://petlike.com.vn/wp-content/uploads/2024/04/cham-soc-thu-cung-khoe-manh.jpg  "
                                alt="Chú chó đáng yêu"
                                className="img-fluid rounded-4 shadow"
                            />
                        </div>
                    </div>
                </div>
            </section>

            <section className="container py-5 text-center">
                <h2 className="fw-bold">Tại sao nên nhận nuôi?</h2>
                <p className="text-muted mt-3">
                    Nhận nuôi là trao cho thú cưng cơ hội được yêu thương.
                </p>

                <div className="row mt-4">
                    <div className="col-md-4 mb-3">
                        <h1>❤️</h1>
                        <h5>Cứu lấy một sinh mệnh</h5>
                        <p>Giúp những thú cưng bị bỏ rơi có cơ hội sống tốt hơn.</p>
                    </div>
                    <div className="col-md-4 mb-3">
                        <h1>🏡</h1>
                        <h5>Tìm một người bạn</h5>
                        <p>Đón một người bạn trung thành về với gia đình bạn.</p>
                    </div>
                    <div className="col-md-4 mb-3">
                        <h1>🐾</h1>
                        <h5>Lan tỏa yêu thương</h5>
                        <p>Cùng xây dựng một cộng đồng yêu thương động vật.</p>
                    </div>
                </div>
            </section>

            <section className="bg-light py-5 text-center">
                <div className="container">
                    <h2 className="fw-bold">Các bé đang tìm mái ấm</h2>
                    <p className="text-muted mt-2">
                        Rất nhiều người bạn nhỏ đang chờ được gặp bạn.
                    </p>
                    <Link to="/pets" className="btn btn-success mt-3">
                        Xem danh sách thú cưng
                    </Link>
                </div>
            </section>
        </div>
    );
}

export default Home;
