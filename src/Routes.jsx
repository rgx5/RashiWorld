import { Routes, Route } from "react-router-dom";
import Contact from './Contact';
import StockDetails from './StockDetails';
import Home from './Home';
import Welcome from "./Welcome";
import AdminDashboard from "./AdminDashboard";

const AppRoutes = () => {
    return (
        <Routes>
            {/* 1. Make Home the PARENT route. It will always stay on screen. */}
            <Route path="/" element={<Home />}>
                
                {/* 2. These are CHILD routes. They will load inside Home's <Outlet /> */}                
                <Route index element={<Welcome />} /> 
                <Route path="stockDetails" element={<StockDetails />} />
                <Route path="contact" element={<Contact />} />
                <Route path="adminDashboard" element={<AdminDashboard />} />
                
            </Route>
        </Routes>
    );
};

export default AppRoutes;