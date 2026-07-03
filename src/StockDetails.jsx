import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './StockDetails.css';

const StockDetails = () => {
    const location = useLocation();
    const selectedStock = location.state;

    const [isMuted, setIsMuted] = useState(true);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const videoRef = useRef(null);

    if (!selectedStock) {
        return (
            <div className="stock-detail-page error-state">
                <div className="breadcrumb-nav">
                    <Link to="/" className="back-link">← Back to Collections</Link>
                </div>
                <div className="error-message-box">
                    <h2>No Product Selected</h2>
                    <p>Please select a product from the home page catalog to view its details.</p>
                </div>
            </div>
        );
    }

    const isVideo = selectedStock.image?.endsWith('.mp4') || selectedStock.mediaType === 'video';

    useEffect(() => {
        if (isVideo && videoRef.current) {
            videoRef.current.muted = isMuted;
            const playPromise = videoRef.current.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.warn("Autoplay setup: ", error);
                });
            }
        }
    }, [isVideo, isMuted]);

    const whatsappBaseUrl = "https://wa.me/917709008441";
    const encodedMessage = encodeURIComponent(
        `Hi Rashi Worldwide, I would like to request a bulk lot quote and inventory sheet for: ${selectedStock.title || "Premium Apparel Lot"}.`
    );
    const whatsappLink = `${whatsappBaseUrl}?text=${encodedMessage}`;

    return (
        <div className="stock-detail-page compact-container">
            {/* Top Navigation Row */}
            <div className="breadcrumb-nav">
                <Link to="/" className="back-link">
                    <span className="arrow">←</span> Back to Global Collections
                </Link>
            </div>

            <div className="stock-main-layout standard-split">
                
                {/* LEFT COLUMN: Clean Visual Focus Frame */}
                <section className="media-showcase layout-locked">
                    <div className="main-display-box premium-shadow">
                        {!isVideo ? (
                            <div className="image-viewer-container">
                                <img
                                    src={selectedStock.image || "/assets/placeholder.jpeg"}
                                    alt={selectedStock.title}
                                    className="active-media image-clickable"
                                    onClick={() => setIsLightboxOpen(true)}
                                />
                                <span className="zoom-hint">🔍 Click image to view raw texture detail</span>
                            </div>
                        ) : (
                            <div className="video-player-wrapper">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    muted={isMuted}
                                    loop
                                    playsInline
                                    className="active-media"
                                >
                                    <source src={selectedStock.image} type="video/mp4" />
                                    Your browser does not support HTML5 video playback loop.
                                </video>
                                <button
                                    type="button"
                                    className="sound-toggle-btn"
                                    onClick={() => setIsMuted(!isMuted)}
                                >
                                    {isMuted ? "🔈 Unmute Fabric Loop" : "🔊 Audio On"}
                                </button>
                            </div>
                        )}
                    </div>
                </section>

                {/* RIGHT COLUMN: Highly Detailed Specifications Stack */}
                <section className="info-specification structured-panel">
                    <div className="product-header">
                        <div className="status-tags">
                            <span className="export-badge premium-gold">✨ Verified Export Lot</span>
                        </div>
                        <h1 className="stock-main-title">{selectedStock.title}</h1>
                    </div>

                    {/* Lot Catalog Overview Narrative fetched dynamically from description column */}
                    {selectedStock.description ? (
                        <div className="description-wrapper refined-narrative-box">
                            <h3>Full Commercial Description</h3>
                            <p className="line-break-text">{selectedStock.description}</p>
                        </div>
                    ) : (
                        <div className="description-wrapper refined-narrative-box">
                            <h3>Full Commercial Description</h3>
                            <p className="line-break-text" style={{ color: '#aaa', fontStyle: 'italic' }}>
                                No product description provided for this catalog entry.
                            </p>
                        </div>
                    )}

                    {/* High-Impact Request Button */}
                    <div className="action-footer-panel">
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="clean-text-action-btn"
                        >
                            Submit Bulk Inquiry & Get Price Quote
                        </a>
                        <p className="commercial-notice">⚡ Freight calculations, packing lists, and custom shipping details compiled instantly upon allocation lookup.</p>
                    </div>
                </section>
            </div>

            {/* LIGHTBOX MODAL FRAME */}
            {isLightboxOpen && !isVideo && (
                <div className="lightbox-portal" onClick={() => setIsLightboxOpen(false)}>
                    <div className="lightbox-stage" onClick={(e) => e.stopPropagation()}>
                        <button type="button" className="close-portal-btn" onClick={() => setIsLightboxOpen(false)}>×</button>
                        <img src={selectedStock.image} alt={selectedStock.title} className="lightbox-img" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default StockDetails;