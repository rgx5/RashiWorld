import React from 'react';
import { Link } from "react-router-dom";
import "./Navbar.css";

const Navbar = () => {
    return (
        <>
            <nav className="nav">
                <ul className='ul'>
                    <li><Link to="/">Home</Link></li>
                    <li><Link to="/stockDetails">Stock Details</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                    <li><Link to="/adminDashboard">Admin</Link></li>
                </ul>
            </nav>


        </>
    );
};

export default Navbar;
