import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Admin from './pages/Admin';
import Home from './pages/Home';
import Pets from './pages/Pets';
import PetDetail from './pages/PetDetail';
import Register from './pages/Register';
import Login from './pages/Login';
import Adoption from './pages/Adoption';


function App() {
    return (
        <BrowserRouter>
            <Navbar />

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/pets" element={<Pets />} />
                <Route path="/pets/:id" element={<PetDetail />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<Admin />} />
                <Route path="/adoption/:id" element={<Adoption />} />
            </Routes>

            <Footer />
        </BrowserRouter>
    );
}

export default App;