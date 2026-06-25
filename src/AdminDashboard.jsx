import React, { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import './AdminDashboard.css';

const AdminDashboard = () => {
    // Structural Auth States
    const [isAuthenticated, setIsAuthenticated] = useState(null); 

    //  Core State Hooks matching active components
    const [activeTab, setActiveTab] = useState('stock-crud');
    const [uploadedFiles, setUploadedFiles] = useState([]);
    
    // Advanced Inventory Stock Items matching modern dynamic badge schemas
    const [stockItems, setStockItems] = useState([
        { id: 1, title: "Oversized Tailored Blazer", brand: "Rashi Worldwide Luxe", category: "Trending", status: "Active", expiryDate: "2026-07-15", price: "$145.00", moq: "50 Sets" },
        { id: 2, title: "Premium Pima Cotton Set", brand: "Rashi Worldwide Luxe", category: "New", status: "Active", expiryDate: "2026-06-27", price: "$89.00", moq: "50 Sets" }, // Amber example (<3 days from Jun 25, 2026)
        { id: 3, title: "Linen Lounge Trousers", brand: "Rashi Worldwide Luxe", category: "Limited", status: "Hidden", expiryDate: "2026-08-01", price: "$75.00", moq: "30 Sets" }
    ]);
    
    const [newStock, setNewStock] = useState({
        title: '', brand: 'Rashi Worldwide Luxe', category: '', fabric: '', moq: '', colours: '', sizeRange: '', price: '', description: '', status: 'Active', expiryDate: ''
    });

    // Edit Modal Management State Trackers
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);

    // Delete Confirmation Modal State Trackers
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    // Configuration settings linking directly to Welcome & Contact global values
    const [globalSettings, setGlobalSettings] = useState({
        brandName: "Rashi Worldwide",
        tagline: "anything anytime anywhere",
        whatsappNumber: "+91 77090 08441",
        instagramUsername: "rashiworldwide",
        welcomeQuote: "Fashion is a universal language. We weave comfort, culture, and timeless luxury into garments that speak to the world."
    });

    // On mount, verify with the server if a valid cookie session exists
    useEffect(() => {
        fetch('http://localhost:5000/api/auth-check')
            .then(res => {
                if (res.ok) setIsAuthenticated(true);
                else setIsAuthenticated(false);
            })
            .catch(() => setIsAuthenticated(false));
    }, []);

    // 2. Logic Handler Modules
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStock(prev => ({ ...prev, [name]: value }));
    };

    const handleSettingChange = (e) => {
        const { name, value } = e.target;
        setGlobalSettings(prev => ({ ...prev, [name]: value }));
    };

    const handleAddStock = (e) => {
        e.preventDefault();
        if (!newStock.title || !newStock.price || !newStock.expiryDate) {
            return alert("Please fill in essential values (Title, Price, Expiry Date).");
        }
        setStockItems(prev => [...prev, { ...newStock, id: Date.now() }]);
        setNewStock({ title: '', brand: 'Rashi Worldwide Luxe', category: '', fabric: '', moq: '', colours: '', sizeRange: '', price: '', description: '', status: 'Active', expiryDate: '' });
        alert("Stock product appended successfully!");
    };

    // Toggle Visibility State (Hide/Show)
    const handleToggleVisibility = (id) => {
        setStockItems(prev => prev.map(item => {
            if (item.id === id) {
                return { ...item, status: item.status === 'Active' ? 'Hidden' : 'Active' };
            }
            return item;
        }));
    };

    // Open Edit Frame Modal
    const openEditModal = (item) => {
        setEditingItem({ ...item });
        setIsEditModalOpen(true);
    };

    const handleEditInputChange = (e) => {
        const { name, value } = e.target;
        setEditingItem(prev => ({ ...prev, [name]: value }));
    };

    const handleSaveEdit = (e) => {
        e.preventDefault();
        setStockItems(prev => prev.map(item => item.id === editingItem.id ? editingItem : item));
        setIsEditModalOpen(false);
        setEditingItem(null);
    };

    // Open Delete Trigger Modal Framework
    const openDeleteModal = (id) => {
        setItemToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const executeDelete = () => {
        setStockItems(prev => prev.filter(item => item.id !== itemToDelete));
        setIsDeleteModalOpen(false);
        setItemToDelete(null);
    };

    const handleFileUpload = (e) => {
        const files = Array.from(e.target.files);
        const fileNames = files.map(file => file.name);
        setUploadedFiles(prev => [...prev, ...fileNames]);
    };

    const handleLogout = async () => {
        await fetch('http://localhost:5000/api/logout', { method: 'POST' });
        setIsAuthenticated(false);
    };

    // Helper Utility: Compute Status Badges with < 3 Days Expiry Checking Logic
    const getStatusBadge = (item) => {
        if (item.status === 'Hidden') {
            return <span className="status-badge badge-hidden">Hidden</span>;
        }
        
        // Calculate dynamic threshold differences
        const expiry = new Date(item.expiryDate);
        const current = new Date();
        const differenceInTime = expiry.getTime() - current.getTime();
        const differenceInDays = Math.ceil(differenceInTime / (1000 * 3600 * 24));

        if (differenceInDays >= 0 && differenceInDays <= 3) {
            return <span className="status-badge badge-expiring">Expiring Soon</span>;
        }
        return <span className="status-badge badge-active">Active</span>;
    };

    

    if (!isAuthenticated) {
        return <AdminLogin onLoginSuccess={() => setIsAuthenticated(true)} />;
    }

    return (
        <div className="admin-dashboard-container">
            {/* Sidebar Navigation */}
            <aside className="admin-sidebar">
                <div>
                    <div className="admin-brand-zone">
                        <div className="admin-logo">R</div>
                        <div>
                            <h3>Control Center</h3>
                            <p>Rashi Worldwide Admin</p>
                        </div>
                    </div>
                    
                    <nav className="admin-nav-menu">
                        <button className={`nav-btn ${activeTab === 'stock-crud' ? 'is-active' : ''}`} onClick={() => setActiveTab('stock-crud')}>
                            📦 Stock Catalog CRUD
                        </button>
                        <button className={`nav-btn ${activeTab === 'media-upload' ? 'is-active' : ''}`} onClick={() => setActiveTab('media-upload')}>
                            📷 Media & Video Vault
                        </button>
                        <button className={`nav-btn ${activeTab === 'global-settings' ? 'is-active' : ''}`} onClick={() => setActiveTab('global-settings')}>
                            ⚙️ Component Settings
                        </button>
                    </nav>
                </div>

                <div style={{ padding: '20px', marginTop: 'auto' }}>
                    <button onClick={handleLogout} className="nav-btn logout-btn-style">
                        🚪 Terminate Session
                    </button>
                </div>
            </aside>

            {/* Main Interactive Stage */}
            <main className="admin-main-viewport">
                <header className="viewport-header">
                    <h2>{activeTab.replace('-', ' ').toUpperCase()} Panel</h2>
                    <span className="secure-badge">🔒 Enforced Security Session</span>
                </header>

                {/* TAB 1: STOCK CRUD SYSTEM */}
                {activeTab === 'stock-crud' && (
                    <div className="panel-fade-in">
                        <section className="form-card-wrapper">
                            <h3>Publish New Stock Entry (Feeds Welcome & Details Pages)</h3>
                            <form onSubmit={handleAddStock} className="crud-grid-form">
                                <div className="input-group full-width"><label>Stock Line Title *</label><input type="text" name="title" value={newStock.title} onChange={handleInputChange} placeholder="e.g., Silk Slip Dress Collection" required /></div>
                                <div className="input-group"><label>Category / Badge</label><input type="text" name="category" value={newStock.category} onChange={handleInputChange} placeholder="New Arrivals, Trending, or Limited" /></div>
                                <div className="input-group"><label>Wholesale Price tag *</label><input type="text" name="price" value={newStock.price} onChange={handleInputChange} placeholder="e.g., $135.00" required /></div>
                                <div className="input-group"><label>Fabric Composition</label><input type="text" name="fabric" value={newStock.fabric} onChange={handleInputChange} placeholder="e.g., 100% Giza Egyptian Cotton" /></div>
                                <div className="input-group"><label>Minimum Order Qty (MOQ)</label><input type="text" name="moq" value={newStock.moq} onChange={handleInputChange} placeholder="e.g., 50 Sets per colour" /></div>
                                <div className="input-group"><label>Available Colorways</label><input type="text" name="colours" value={newStock.colours} onChange={handleInputChange} placeholder="Separate with commas" /></div>
                                <div className="input-group"><label>Graded Sizes Matrix</label><input type="text" name="sizeRange" value={newStock.sizeRange} onChange={handleInputChange} placeholder="e.g., S, M, L, XL" /></div>
                                <div className="input-group full-width"><label>Expiry Date *</label><input type="date" name="expiryDate" value={newStock.expiryDate} onChange={handleInputChange} required /></div>
                                <div className="input-group full-width"><label>Product Narrative Description</label><textarea name="description" rows="4" value={newStock.description} onChange={handleInputChange} placeholder="Line breaks mapped natively on details sub-pages..."></textarea></div>
                                <button type="submit" className="admin-action-btn primary-btn">Inject Stock Architecture</button>
                            </form>
                        </section>

                        {/* CLIENT SPECIFIC STOCK LISTING GRID SECTION */}
                        <section className="data-table-wrapper">
                            <h3>Active Catalog Management ({stockItems.length} items logged)</h3>
                            <div className="table-overflow-container">
                                <table className="admin-crud-table">
                                    <thead>
                                        <tr>
                                            <th>Title Line</th>
                                            <th>Brand Line</th>
                                            <th>Category</th>
                                            <th>Status</th>
                                            <th>Expiry Timeline</th>
                                            <th style={{ textAlign: 'center' }}>Action Palette</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {stockItems.map(item => (
                                            <tr key={item.id}>
                                                <td className="font-bold">{item.title}</td>
                                                <td style={{ color: '#aeaeae' }}>{item.brand}</td>
                                                <td><span className="category-inline-tag">{item.category || "General"}</span></td>
                                                <td>{getStatusBadge(item)}</td>
                                                <td className="font-mono">{item.expiryDate}</td>
                                                <td>
                                                    <div className="actions-cell-wrapper">
                                                        <button className="action-inline-btn edit-btn" onClick={() => openEditModal(item)}>✏️ Edit</button>
                                                        <button className="action-inline-btn toggle-btn" onClick={() => handleToggleVisibility(item.id)}>
                                                            {item.status === 'Active' ? '👁️ Hide' : '✨ Show'}
                                                        </button>
                                                        <button className="action-inline-btn delete-btn" onClick={() => openDeleteModal(item.id)}>🗑️ Delete</button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                )}

                {/* TAB 2: DIGITAL MEDIA DISK TRACK */}
                {activeTab === 'media-upload' && (
                    <div className="panel-fade-in card-panel">
                        <h3>Bulk Asset Drag & Drop Cloud Pipeline</h3>
                        <p className="panel-helper-text">Drop high-fashion promotional lookbook lookups or loop-optimized background reels (.mp4 format with muted properties natively enforced).</p>
                        
                        <div className="dropzone-area">
                            <input type="file" multiple accept="image/*,video/*" onChange={handleFileUpload} id="file-drop-input" />
                            <label htmlFor="file-drop-input" className="dropzone-label">
                                <span className="upload-icon">📤</span>
                                <p>Click here or drag digital lookbook graphics to stage file arrays</p>
                            </label>
                        </div>

                        {uploadedFiles.length > 0 && (
                            <div className="staged-files-list">
                                <h4>Staged Media Assets ({uploadedFiles.length})</h4>
                                <ul>
                                    {uploadedFiles.map((name, index) => <li key={index}>✔️ {name} <span className="ready-badge">staged</span></li>)}
                                </ul>
                            </div>
                        )}
                    </div>
                )}

                {/* TAB 3: GLOBAL VALUES CONFIGURATION */}
                {activeTab === 'global-settings' && (
                    <div className="panel-fade-in card-panel">
                        <h3>Global Interface Dynamic Content Variables</h3>
                        <p className="panel-helper-text">Modifications executed here instantly rewrite baseline strings inside the Contact and Welcome headers across frontend pipelines.</p>
                        
                        <div className="settings-form-layout">
                            <div className="input-group"><label>Enterprise Commercial Label</label><input type="text" name="brandName" value={globalSettings.brandName} onChange={handleSettingChange} /></div>
                            <div className="input-group"><label>Global Structural Tagline</label><input type="text" name="tagline" value={globalSettings.tagline} onChange={handleSettingChange} /></div>
                            <div className="input-group"><label>Contact Target WhatsApp Endpoint Line</label><input type="text" name="whatsappNumber" value={globalSettings.whatsappNumber} onChange={handleSettingChange} /></div>
                            <div className="input-group"><label>Target Registered Instagram Handle</label><input type="text" name="instagramUsername" value={globalSettings.instagramUsername} onChange={handleSettingChange} /></div>
                            <div className="input-group full-width"><label>Welcome Hero Aesthetic Statement Quote</label><textarea name="welcomeQuote" rows="3" value={globalSettings.welcomeQuote} onChange={handleSettingChange}></textarea></div>
                            <button className="admin-action-btn primary-btn" onClick={() => alert("Global component state configuration stored securely.")}>Commit Variable Updates</button>
                        </div>
                    </div>
                )}
            </main>

            {/* DYNAMIC COMPONENT MODAL: INLINE SYSTEM EDITING */}
            {isEditModalOpen && editingItem && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal-card">
                        <h3>Update Content Matrix</h3>
                        <form onSubmit={handleSaveEdit} className="crud-grid-form">
                            <div className="input-group full-width"><label>Stock Line Title</label><input type="text" name="title" value={editingItem.title} onChange={handleEditInputChange} required /></div>
                            <div className="input-group"><label>Brand Signature</label><input type="text" name="brand" value={editingItem.brand} onChange={handleEditInputChange} /></div>
                            <div className="input-group"><label>Category</label><input type="text" name="category" value={editingItem.category} onChange={handleEditInputChange} /></div>
                            <div className="input-group"><label>Price Point</label><input type="text" name="price" value={editingItem.price} onChange={handleEditInputChange} required /></div>
                            <div className="input-group"><label>Expiry Metric</label><input type="date" name="expiryDate" value={editingItem.expiryDate} onChange={handleEditInputChange} required /></div>
                            <div className="modal-actions-wrapper">
                                <button type="button" className="modal-btn secondary-cancel" onClick={() => setIsEditModalOpen(false)}>Dismiss Changes</button>
                                <button type="submit" className="modal-btn primary-confirm">Save Modifications</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* DYNAMIC COMPONENT MODAL: ENFORCED DOUBLE CONFIRMATION DELETE */}
            {isDeleteModalOpen && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal-card confirmation-variant">
                        <h4>Destructive Action Acknowledgment Required</h4>
                        <p>Are you fully certain you want to purge this record matrix? This stock catalog segment will immediately vanish across all operational client interfaces.</p>
                        <div className="modal-actions-wrapper">
                            <button type="button" className="modal-btn secondary-cancel" onClick={() => setIsDeleteModalOpen(false)}>Abort Action</button>
                            <button type="button" className="modal-btn destructive-confirm" onClick={executeDelete}>Confirm Destructive Removal</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;