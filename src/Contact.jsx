import React from 'react';
import { contactDetails } from './contactData';
import './Contact.css';

const Contact = () => {
    const { phone, whatsappNumber, whatsappMessage, instagramUsername } = contactDetails;

    const channels = [
        {
            name: "WhatsApp",
            icon: "https://cdn-icons-png.flaticon.com/512/733/733585.png",
            // Fixed the URL path by explicitly adding the trailing forward slash
            url: `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`,
            color: "#25D366",
            subtitle: "Instant Chat Support",
            actionText: "Inquire Now →"
        },
        {
            name: "Instagram",
            icon: "https://cdn-icons-png.flaticon.com/512/174/174855.png",
            // Fixed the profile redirect path 
            url: `https://instagram.com/${instagramUsername}`,
            color: "#E1306C",
            subtitle: `@${instagramUsername}`,
            actionText: "View Lookbook →"
        },
        {
            name: "Call Mobile",
            icon: "https://cdn-icons-png.flaticon.com/512/597/597177.png",
            url: `tel:${phone}`,
            color: "#007AFF",
            subtitle: phone,
            actionText: "Call Directly →"
        }
    ];

    return (
        <div className="contact-page-wrapper">
            {/* Upper Presentation Panel */}
            <div className="contact-hero-panel">
                <div className="hero-glow-element"></div>
                
                {/* Brand Identity elements embedded natively */}
                <div className="contact-brand-header">
                    <div className="contact-brand-logo">R</div>
                    <h1 className="contact-company-title">Rashi Worldwide</h1>
                    <p className="contact-brand-tagline">anything anytime anywhere</p>
                </div>

                <p className="contact-blurb-text">
                    An elite international apparel exporter with over 10+ years of industrial expertise. We specialize in luxury premium manufacturing and scale logistics to reliably ship worldwide.
                </p>
            </div>
            
            {/* Interactive Grid Distribution */}
            <div className="contact-links-panel">
                <div className="contact-grid">
                    {channels.map((channel, index) => (
                        <a 
                            key={index} 
                            href={channel.url} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className={`contact-card ${channel.name === "WhatsApp" ? "primary-highlight-card" : ""}`}
                            style={{ '--hover-color': channel.color }}
                        >
                            <div className="icon-wrapper">
                                <img src={channel.icon} alt={`${channel.name} icon`} className="contact-icon" />
                            </div>
                            <div className="card-info">
                                <span className="channel-name">{channel.name}</span>
                                <span className="channel-subtitle">{channel.subtitle}</span>
                                <span className="channel-action" style={{ color: channel.color }}>
                                    {channel.actionText}
                                </span>
                            </div>
                        </a>
                    ))}
                </div>
            </div>

            <div className="contact-disclaimer-bar">
                * Zero contact forms required. Secure B2B purchase distribution is processed entirely via our encrypted active communication channels.
            </div>
        </div>
    );
};

export default Contact;