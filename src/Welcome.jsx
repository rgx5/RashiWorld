import React, { useState, useEffect } from 'react';
import './Welcome.css';

const Welcome = () => {
    // Array of dynamic headings to rotate through or display based on stock updates
    const headingOptions = [
        "New Arrivals: Global Drop '26",
        "Just In: Minimalist Aesthetics",
        "Fresh Collection: Borderless Style",
        "Now Live: Premium Essentials"
    ];
    
    const [currentHeading, setCurrentHeading] = useState(headingOptions[0]);

    // Simulating dynamic update mechanism (rotates headings every 5 seconds for demonstration)
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentHeading(prev => {
                const currentIndex = headingOptions.indexOf(prev);
                const nextIndex = (currentIndex + 1) % headingOptions.length;
                return headingOptions[nextIndex];
            });
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    // Catalog items updated with prices in Rupees (₹)
    const newArrivals = [
        {
            id: 1,
            title: "Classic Slim-Fit Twill Shirt",
            tag: "Best Seller",
            price: "₹3,150",
            image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=600&q=80"
        },
        {
            id: 2,
            title: "Premium Pima Cotton Set",
            tag: "New",
            price: "₹1,799",
            image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=600&q=80"
        },
        {
            id: 3,
            title: "Pure Linen Breathable Formal Shirt",
            tag: "Limited",
            price: "₹4,199",
            image: "https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=600&q=80"
        },
        {
            id: 4,
            title: "Classic Silk Slip Dress",
            tag: "Best Seller",
            price: "₹9,199",
            image: "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=600&q=80"
        }
    ];

    return (
        <div className="storefront-container">
            {/* Brand Header Header Grid (Logo, Name, Tagline) */}
            <div className="brand-header-strip">
                <div className="brand-branding">
                    <div className="brand-logo">R</div>
                    <div>
                        <h2 className="brand-main-title">Rashi Worldwide</h2>
                        <p className="brand-tagline">anything anytime anywhere</p>
                    </div>
                </div>
            </div>

            {/* Cinematic Hero Section */}
            <header className="hero-banner">
                <div className="hero-overlay">
                    <span className="hero-subtitle">GLOBAL COUTURE</span>
                    <blockquote className="brand-quote">
                        "Fashion is a universal language. We weave comfort, culture, and timeless luxury into garments that speak to the world."
                    </blockquote>
                    <button className="hero-btn">Explore Lookbook</button>
                </div>
            </header>

            {/* New Arrivals Section with Dynamic H1 */}
            <section className="catalog-section">
                <div className="section-header">
                    <h1 className="dynamic-h1">{currentHeading}</h1>
                    <p className="section-subtitle">Handpicked aesthetics updated in real-time across our international warehouses.</p>
                </div>

                <div className="products-grid">
                    {newArrivals.map((item) => (
                        <div key={item.id} className="product-card">
                            <div className="image-wrapper">
                                <span className="product-badge">{item.tag}</span>
                                <img src={item.image} alt={item.title} className="product-img" />
                                {/* 💡 REMOVED: card-hover-overlay container and Add to Cart button */}
                            </div>
                            <div className="product-details">
                                <h3 className="product-title">{item.title}</h3>
                                <p className="product-price">{item.price}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Floating Sticky WhatsApp Button */}
            <a 
                href="https://wa.me/1234567890?text=Hi%20Rashi%20Worldwide!%20I%27m%20interested%20in%20your%20new%20arrivals." 
                className="whatsapp-sticky-btn"
                target="_blank" 
                rel="noopener noreferrer"
                title="Chat with us"
            >
                <img 
                    src="https://cdn-icons-png.flaticon.com/512/733/733585.png" 
                    alt="WhatsApp support" 
                />
                <span className="whatsapp-badge">Support Online</span>
            </a>
        </div>
    );
};

export default Welcome;