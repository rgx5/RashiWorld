import React, { useState, useEffect } from 'react';
import { useNavigate } from "react-router-dom";
import { createClient } from '@supabase/supabase-js'; 
import './Welcome.css';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

const Welcome = () => {
    const navigate = useNavigate();

    const headingOptions = [
        "New Arrivals: Global Drop '26",
        "Just In: Minimalist Aesthetics",
        "Fresh Collection: Borderless Style",
        "Now Live: Premium Essentials"
    ];

    const [currentHeading, setCurrentHeading] = useState(headingOptions[0]);
    const [fadeState, setFadeState] = useState('fade-in');
    const [viewMode, setViewMode] = useState('storefront');
    const [activeLookIndex, setActiveLookIndex] = useState(0);

    const [newArrivals, setNewArrivals] = useState([]);
    const [lookbookItems, setLookbookItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStorefrontData() {
            try {
                // 1. Fetch data from your 'products' table (only including valid columns)
                const { data: productsData, error: productsError } = await supabase
                    .from('products') 
                    .select('id, title, tag, image_url, description'); // description added safely here

                if (productsError) throw productsError;

                if (productsData) {
                    const mappedProducts = productsData.map(item => {
                        let finalImageUrl = item.image_url;

                        if (item.image_url && !item.image_url.startsWith('http')) {
                            const { data } = supabase.storage
                                .from('images')
                                .getPublicUrl(item.image_url);
                            
                            finalImageUrl = data.publicUrl;
                        }

                        return {
                            id: item.id,
                            title: item.title,
                            tag: item.tag || "New",
                            image: finalImageUrl,
                            description: item.description // Map description dynamically from the DB
                        };
                    });

                    setNewArrivals(mappedProducts);
                }

                // 2. Fetch lookbook slider records from 'lookbook_table'
                const { data: lookData, error: lookError } = await supabase
                    .from('lookbook_table') 
                    .select('title, description, image_url'); 

                if (lookError) throw lookError;

                if (lookData) {
                    setLookbookItems(lookData.map(look => {
                        let finalLookUrl = look.image_url;
                        
                        if (look.image_url && !look.image_url.startsWith('http')) {
                            const { data } = supabase.storage
                                .from('images')
                                .getPublicUrl(look.image_url);
                            
                            finalLookUrl = data.publicUrl;
                        }

                        return {
                            title: look.title,
                            desc: look.description, 
                            image: finalLookUrl
                        };
                    }));
                }

            } catch (error) {
                console.error("Database connection error:", error.message);
            } finally {
                setLoading(false);
            }
        }

        fetchStorefrontData();
    }, []);

    useEffect(() => {
        if (viewMode !== 'storefront') return;
        const interval = setInterval(() => {
            setFadeState('fade-out');
            setTimeout(() => {
                setCurrentHeading(prev => {
                    const currentIndex = headingOptions.indexOf(prev);
                    const nextIndex = (currentIndex + 1) % headingOptions.length;
                    return headingOptions[nextIndex];
                });
                setFadeState('fade-in');
            }, 300);
        }, 5000);
        return () => clearInterval(interval);
    }, [viewMode]);

    const nextLook = () => {
        if (lookbookItems.length === 0) return;
        setActiveLookIndex((prev) => (prev + 1) % lookbookItems.length);
    };

    const prevLook = () => {
        if (lookbookItems.length === 0) return;
        setActiveLookIndex((prev) => (prev - 1 + lookbookItems.length) % lookbookItems.length);
    };

    const currentLook = lookbookItems[activeLookIndex];

    if (loading) {
        return <div className="storefront-container" style={{ color: '#fff', padding: '3rem' }}>Syncing with Storefront...</div>;
    }

    return (
        <div className="storefront-container">
            {viewMode === 'storefront' ? (
                <div className="view-fade-wrapper">
                    <header className="hero-banner">
                        <div className="hero-overlay">
                            <span className="hero-subtitle">GLOBAL COUTURE</span>
                            <blockquote className="brand-quote">
                                "Fashion is a universal language. We weave comfort, culture, and timeless luxury into garments that speak to the world."
                            </blockquote>
                            <button className="hero-btn" onClick={() => { setViewMode('lookbook'); setActiveLookIndex(0); }}>
                                View All New Stocks
                            </button>
                        </div>
                    </header>

                    <section className="catalog-section">
                        <div className="section-header">
                            <h1 className={`dynamic-h1 ${fadeState}`}>{currentHeading}</h1>
                        </div>

                        <div className="products-grid">
                            {newArrivals.map((item, index) => (
                                <div
                                    key={item.id}
                                    className="product-card"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                    onClick={() =>
                                        navigate("/StockDetails", {
                                            state: {
                                                image: item.image, 
                                                title: item.title,
                                                tag: item.tag,
                                                description: item.description // Forwarding description to details page
                                            },
                                        })
                                    }
                                >
                                    <div className="image-wrapper">
                                        <span className="product-badge">{item.tag}</span>
                                        <img src={item.image} alt={item.title} className="product-img" />
                                    </div>
                                    <div className="product-details">
                                        <h3 className="product-title">{item.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>
            ) : (
                <div className="fullscreen-lookbook-view">
                    <div className="lookbook-top-bar">
                        <button className="minimal-close-btn" onClick={() => setViewMode('storefront')}>
                            ✕ Close
                        </button>
                        <div className="lookbook-pagination">
                            0{activeLookIndex + 1} <span>/ 0{lookbookItems.length}</span>
                        </div>
                    </div>

                    {currentLook ? (
                        <div className="lookbook-magazine-stage" key={activeLookIndex}>
                            <div className="magazine-media-pane">
                                <img src={currentLook.image} alt={currentLook.title} className="magazine-img" />
                            </div>

                            <div className="magazine-content-pane">
                                <div className="content-inner-wrapper">
                                    <span className="textile-spec-badge">TEXTILE SPECIFICATION</span>
                                    <h1 className="magazine-cloth-title">{currentLook.title}</h1>
                                    <p className="magazine-cloth-desc">{currentLook.desc}</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div style={{ color: '#fff', textAlign: 'center', marginTop: '20vh' }}>No Lookbook entries setup.</div>
                    )}

                    <button className="nav-arrow-control prev-arrow" onClick={prevLook} aria-label="Previous look">
                        ‹
                    </button>
                    <button className="nav-arrow-control next-arrow" onClick={nextLook} aria-label="Next look">
                        ›
                    </button>
                </div>
            )}
        </div>
    );
};

export default Welcome;