import React from "react";
import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import "./Home.css"; // We will add global container styles here

function Home() {
    return (
        <div className="app-layout">
            <Navbar />
            <main className="page-content">
                {/* Your e-commerce store content drops right here */}
                <Outlet />
            </main>
        </div>
    );
}

export default Home;