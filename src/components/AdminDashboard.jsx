'use client';

import { useState, useEffect } from 'react';
import AdminLogin from './AdminLogin';
import '@/styles/admin-dashboard.css';
import { supabase } from '@/lib/supabaseClient';
import { compressImages } from '@/lib/imageCompress';

const AdminDashboard = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [activeTab, setActiveTab] = useState('stock-crud');

    // Initialized as an empty array; populated from Supabase
    const [stockItems, setStockItems] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Hero slider - images shown in rotation on the public homepage banner
    const [heroSlides, setHeroSlides] = useState([]);
    const [isHeroLoading, setIsHeroLoading] = useState(false);
    const [isUploadingHero, setIsUploadingHero] = useState(false);

    // Form inputs mapped to all stock schema columns
    const [newStock, setNewStock] = useState({
        title: '', brand: '', status: 'active', expiry_date: '',
        category: '', description: '', colors: '', sizes: '', moq: '', fabric: '', video_url: ''
    });
    const [newStockImages, setNewStockImages] = useState([]);
    const [newStockVideo, setNewStockVideo] = useState(null);
    const [editImages, setEditImages] = useState([]);
    const [editVideo, setEditVideo] = useState(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null); // Holds the string "title"
    const [isAddFormOpen, setIsAddFormOpen] = useState(false);

    const [globalSettings, setGlobalSettings] = useState({
        brandName: "Rashi Worldwide",
        tagline: "anything anytime anywhere",
        whatsappNumber: "+91 77090 08441",
        instagramUsername: "rashiworldwide",
        welcomeQuote: "Fashion is a universal language. We weave comfort, culture, and timeless luxury into garments that speak to the world."
    });

    // Native Supabase Session Observer Hook
    useEffect(() => {
        // 1. Check current fallback token validity state on initial mount
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                setIsAuthenticated(true);
                fetchStockItems();
                fetchHeroSlides();
            } else {
                setIsAuthenticated(false);
            }
        });

        // 2. Continuous structural listener for active token expirations or auth updates
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (session) {
                setIsAuthenticated(true);
                fetchStockItems();
                fetchHeroSlides();
            } else {
                setIsAuthenticated(false);
                setStockItems([]);
                setHeroSlides([]);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    // --- SUPABASE API CRUD OPERATIONS ---

    // READ
    const fetchStockItems = async () => {
        setIsLoading(true);
        const { data, error } = await supabase
            .from('stocks')
            .select('*')
            .order('title', { ascending: true }); // Sorting by title column

        if (error) {
            console.error("Fetch Error:", error.message);
            alert("Could not load catalog: " + error.message);
        } else {
            setStockItems(data || []);
        }
        setIsLoading(false);
    };

    // CREATE
    const handleAddStock = async (e) => {
        e.preventDefault();
        if (!newStock.title) {
            return alert("Product Title is required.");
        }

        const generatedSlug = newStock.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

        let uploadedPhotos = [];
        let uploadedVideoUrl = newStock.video_url || null;

        if (newStockImages.length > 0) {
            setIsLoading(true);
            try {
                const files = await compressImages(newStockImages, { maxDimension: 1920, quality: 0.85 });
                for (const file of files) {
                    const path = `stocks/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
                    const { error: uploadError } = await supabase.storage.from('images').upload(path, file);
                    if (!uploadError) uploadedPhotos.push(path);
                }
            } catch (err) {
                console.error("Photos upload error:", err);
            }
            setIsLoading(false);
        }

        if (newStockVideo) {
            setIsLoading(true);
            try {
                const path = `stocks/videos/${Date.now()}-${newStockVideo.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
                const { error: uploadError } = await supabase.storage.from('images').upload(path, newStockVideo);
                if (!uploadError) {
                    const { data } = supabase.storage.from('images').getPublicUrl(path);
                    uploadedVideoUrl = data.publicUrl;
                }
            } catch (err) {
                console.error("Video upload error:", err);
            }
            setIsLoading(false);
        }

        const colorsArray = typeof newStock.colors === 'string' && newStock.colors.trim() !== ''
            ? newStock.colors.split(',').map(s => s.trim()).filter(Boolean)
            : newStock.colors || null;

        const sizesArray = typeof newStock.sizes === 'string' && newStock.sizes.trim() !== ''
            ? newStock.sizes.split(',').map(s => s.trim()).filter(Boolean)
            : newStock.sizes || null;

        const { data, error } = await supabase
            .from('stocks')
            .insert([{
                title: newStock.title, slug: generatedSlug, brand: newStock.brand || null,
                status: newStock.status, expiry_date: newStock.expiry_date || null,
                category: newStock.category || null, description: newStock.description || null,
                colors: colorsArray, sizes: sizesArray,
                moq: newStock.moq || null, fabric: newStock.fabric || null,
                video_url: uploadedVideoUrl,
                photos: uploadedPhotos.length > 0 ? uploadedPhotos : null,
            }]).select();

        if (error) {
            console.error("Error inserting data:", error.message);
            alert("Failed to add entry: " + error.message);
        } else {
            if (data && data.length > 0) setStockItems(prev => [data[0], ...prev]);
            setNewStock({ title: '', brand: '', status: 'active', expiry_date: '', category: '', description: '', colors: '', sizes: '', moq: '', fabric: '', video_url: '' });
            setNewStockImages([]);
            setNewStockVideo(null);
            e.target.reset();
            setIsAddFormOpen(false);
        }
    };

    // UPDATE (Visibility Switcher)
    const handleToggleVisibility = async (productTitle, currentStatus) => {
        const nextStatus = currentStatus === 'active' ? 'hidden' : 'active';

        const { error } = await supabase
            .from('stocks')
            .update({ status: nextStatus })
            .eq('title', productTitle);

        if (error) {
            console.error("Update Visibility Error:", error.message);
            alert("Failed to change status: " + error.message);
        } else {
            setStockItems(prev => prev.map(item => item.title === productTitle ? { ...item, status: nextStatus } : item));
        }
    };

    // UPDATE (Full item modification)
    const handleSaveEdit = async (e) => {
        e.preventDefault();

        let newUploadedPhotos = [];
        let newUploadedVideoUrl = editingItem.video_url;

        if (editImages && editImages.length > 0) {
            setIsLoading(true);
            try {
                const files = await compressImages(editImages, { maxDimension: 1920, quality: 0.85 });
                for (const file of files) {
                    const path = `stocks/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
                    const { error: uploadError } = await supabase.storage.from('images').upload(path, file);
                    if (!uploadError) newUploadedPhotos.push(path);
                }
            } catch (err) {
                console.error("Photos upload error:", err);
            }
            setIsLoading(false);
        }

        if (editVideo) {
            setIsLoading(true);
            try {
                const path = `stocks/videos/${Date.now()}-${editVideo.name.replace(/[^a-zA-Z0-9.\-_]/g, '')}`;
                const { error: uploadError } = await supabase.storage.from('images').upload(path, editVideo);
                if (!uploadError) {
                    const { data } = supabase.storage.from('images').getPublicUrl(path);
                    newUploadedVideoUrl = data.publicUrl;
                }
            } catch (err) {
                console.error("Video upload error:", err);
            }
            setIsLoading(false);
        }

        const parseArray = (val) => {
            if (Array.isArray(val)) return val;
            if (typeof val === 'string' && val.trim() !== '') return val.split(',').map(s => s.trim()).filter(Boolean);
            return null;
        };

        const updatedData = {
            brand: editingItem.brand || null,
            status: editingItem.status,
            expiry_date: editingItem.expiry_date || null,
            category: editingItem.category || null,
            description: editingItem.description || null,
            colors: parseArray(editingItem.colors),
            sizes: parseArray(editingItem.sizes),
            moq: editingItem.moq || null,
            fabric: editingItem.fabric || null,
            video_url: newUploadedVideoUrl || null,
        };

        if (newUploadedPhotos.length > 0) {
            updatedData.photos = newUploadedPhotos;
            editingItem.photos = newUploadedPhotos;
        }

        const { error } = await supabase
            .from('stocks')
            .update(updatedData)
            .eq('title', editingItem.title); // Matches using exact primary key string

        if (error) {
            console.error("Error updating item:", error.message);
            alert("Failed to update record: " + error.message);
        } else {
            setStockItems(prev => prev.map(item => item.title === editingItem.title ? editingItem : item));
            setIsEditModalOpen(false);
            setEditingItem(null);
            setEditImages([]);
            setEditVideo(null);
        }
    };

    // DELETE
    const executeDelete = async () => {
        const { error } = await supabase
            .from('stocks')
            .delete()
            .eq('title', itemToDelete); // target deletion via primary key

        if (error) {
            console.error("Error deleting data:", error.message);
            alert("Failed to clear record: " + error.message);
        } else {
            setStockItems(prev => prev.filter(item => item.title !== itemToDelete));
            setIsDeleteModalOpen(false);
            setItemToDelete(null);
        }
    };

    // --- FORM INPUT UTILITIES ---

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewStock(prev => ({ ...prev, [name]: value }));
    };

    const handleSettingChange = (e) => {
        const { name, value } = e.target;
        setGlobalSettings(prev => ({ ...prev, [name]: value }));
    };

    const openEditModal = (item) => { setEditingItem({ ...item }); setEditImages([]); setIsEditModalOpen(true); };
    const openDeleteModal = (productTitle) => { setItemToDelete(productTitle); setIsDeleteModalOpen(true); };

    // --- HERO SLIDER (public homepage banner) ---

    // READ
    const fetchHeroSlides = async () => {
        setIsHeroLoading(true);
        const { data, error } = await supabase
            .from('hero_slides')
            .select('*')
            .order('sort_order', { ascending: true });

        if (error) {
            console.error("Hero slides fetch error:", error.message);
        } else {
            setHeroSlides(data || []);
        }
        setIsHeroLoading(false);
    };

    const getHeroPublicUrl = (path) => {
        if (!path) return '';
        if (path.startsWith('http')) return path;
        const { data } = supabase.storage.from('images').getPublicUrl(path);
        return data.publicUrl;
    };

    // CREATE (upload image(s) to storage, then insert row per slide)
    const handleHeroUpload = async (e) => {
        const rawFiles = Array.from(e.target.files || []);
        if (rawFiles.length === 0) return;

        setIsUploadingHero(true);
        try {
            // Downscale + re-encode to WebP client-side before it ever hits
            // storage - cuts upload size (and future bandwidth) with no
            // visible quality loss.
            const files = await compressImages(rawFiles, { maxDimension: 1920, quality: 0.85 });

            let nextOrder = heroSlides.length > 0
                ? Math.max(...heroSlides.map(s => s.sort_order ?? 0)) + 1
                : 0;

            for (const file of files) {
                const path = `hero/${Date.now()}-${file.name}`;
                const { error: uploadError } = await supabase.storage.from('images').upload(path, file);
                if (uploadError) throw uploadError;

                const { data, error: insertError } = await supabase
                    .from('hero_slides')
                    .insert([{ image_path: path, sort_order: nextOrder }])
                    .select();
                if (insertError) throw insertError;

                if (data && data.length > 0) setHeroSlides(prev => [...prev, data[0]]);
                nextOrder += 1;
            }
        } catch (err) {
            console.error("Hero upload error:", err.message);
            alert("Failed to upload hero image: " + err.message);
        } finally {
            setIsUploadingHero(false);
            e.target.value = '';
        }
    };

    // DELETE
    const handleDeleteHeroSlide = async (slide) => {
        if (!confirm("Remove this hero slide? It will stop appearing on the homepage.")) return;

        const { error } = await supabase.from('hero_slides').delete().eq('id', slide.id);
        if (error) {
            console.error("Hero delete error:", error.message);
            alert("Failed to remove slide: " + error.message);
            return;
        }

        await supabase.storage.from('images').remove([slide.image_path]);
        setHeroSlides(prev => prev.filter(s => s.id !== slide.id));
    };

    // Sign out natively from Supabase, wiping the client JWT safely
    const handleLogout = async () => {
        await supabase.auth.signOut();
        setIsAuthenticated(false);
    };

    const getStatusBadge = (item) => {
        if (item.status === 'hidden') return <span className="status-badge badge-hidden">Hidden</span>;
        if (!item.expiry_date) return <span className="status-badge badge-active">Active</span>;

        const diffDays = Math.ceil((new Date(item.expiry_date) - new Date()) / (1000 * 3600 * 24));
        if (diffDays >= 0 && diffDays <= 3) {
            return <span className="status-badge badge-expiring"><span className="pulse-dot"></span>Expiring Soon</span>;
        }
        return <span className="status-badge badge-active">Active</span>;
    };

    // Graceful loading fallback while assessing token structure
    if (isAuthenticated === null) {
        return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#666' }}>Verifying Security Session...</div>;
    }

    if (!isAuthenticated) return <AdminLogin onLoginSuccess={() => { setIsAuthenticated(true); fetchStockItems(); fetchHeroSlides(); }} />;

    return (
        <div className="admin-dashboard-container">
            <aside className="admin-sidebar">
                <div className="sidebar-top">


                    <nav className="admin-nav-menu">
                        <button className={`nav-btn ${activeTab === 'stock-crud' ? 'is-active' : ''}`} onClick={() => setActiveTab('stock-crud')}>
                            <span>📦</span> Stock Catalog CRUD
                        </button>
                        <button className={`nav-btn ${activeTab === 'hero-slider' ? 'is-active' : ''}`} onClick={() => setActiveTab('hero-slider')}>
                            <span>🖼️</span> Hero Slider
                        </button>
                        <button className={`nav-btn ${activeTab === 'global-settings' ? 'is-active' : ''}`} onClick={() => setActiveTab('global-settings')}>
                            <span>⚙️</span> Component Settings
                        </button>
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <button onClick={handleLogout} className="nav-btn logout-btn-style">Log Out</button>
                </div>
            </aside>

            {/* MOBILE BOTTOM NAVBAR */}
            <nav className="mobile-bottom-nav">
                <button className={`mobile-nav-btn ${activeTab === 'stock-crud' ? 'is-active' : ''}`} onClick={() => setActiveTab('stock-crud')}>
                    <span className="icon">📦</span>
                    <span>Catalog</span>
                </button>
                <button className={`mobile-nav-btn ${activeTab === 'hero-slider' ? 'is-active' : ''}`} onClick={() => setActiveTab('hero-slider')}>
                    <span className="icon">🖼️</span>
                    <span>Slider</span>
                </button>
                <button className={`mobile-nav-btn ${activeTab === 'global-settings' ? 'is-active' : ''}`} onClick={() => setActiveTab('global-settings')}>
                    <span className="icon">⚙️</span>
                    <span>Config</span>
                </button>
                <button className="mobile-nav-btn logout-btn-style" onClick={handleLogout}>
                    <span className="icon">🚪</span>
                    <span>Exit</span>
                </button>
            </nav>

            <main className="admin-main-viewport">
                <header className="viewport-header">
                    <h2>{activeTab.replace('-', ' ').toUpperCase()}</h2>
                </header>

                <div key={activeTab} className="panel-fade-in">
                    {activeTab === 'stock-crud' && (
                        <>
                            <section className="surface-card mt-6">
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                                    <h3 style={{ margin: 0 }}>Active Catalog ({stockItems.length})</h3>
                                    <button className="admin-action-btn primary-btn" onClick={() => setIsAddFormOpen(true)}>
                                        + Add New
                                    </button>
                                </div>
                                {isLoading ? (
                                    <p style={{ padding: '1rem', color: '#888' }}>Loading</p>
                                ) : (
                                    <div className="table-overflow-container">
                                        <table className="admin-crud-table">
                                            <thead>
                                                <tr>
                                                    <th>Title</th><th>Brand</th><th>Status</th><th>Expiry</th><th style={{ textAlign: 'right' }}>Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {stockItems.map(item => (
                                                    <tr key={item.title}>
                                                        <td><div className="font-bold">{item.title}</div></td>
                                                        <td><span className="category-tag">{item.brand || "General"}</span></td>
                                                        <td>{getStatusBadge(item)}</td>
                                                        <td className="font-mono text-muted">{item.expiry_date || 'N/A'}</td>
                                                        <td className="actions-cell">
                                                            <button className="action-icon-btn" onClick={() => openEditModal(item)}>Edit</button>
                                                            <button className="action-icon-btn" onClick={() => handleToggleVisibility(item.title, item.status)}>{item.status === 'active' ? 'Hide' : 'Show'}</button>
                                                            <button className="action-icon-btn delete" onClick={() => openDeleteModal(item.title)}>Delete</button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {stockItems.length === 0 && (
                                                    <tr>
                                                        <td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No inventory matches found in stocks table.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </section>
                        </>
                    )}

                    {activeTab === 'hero-slider' && (
                        <div className="surface-card">
                            <h3>Homepage Hero Slider</h3>
                            <p className="panel-helper-text">
                                Upload photos to rotate through the homepage hero banner. If none are uploaded,
                                a default image is shown automatically.
                            </p>
                            <div className="dropzone-area">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleHeroUpload}
                                    id="hero-drop-input"
                                    disabled={isUploadingHero}
                                />
                                <label htmlFor="hero-drop-input" className="dropzone-label">
                                    <span className="upload-icon">🖼️</span>
                                    <p>{isUploadingHero ? 'Uploading…' : <>Drag hero images here or <strong>browse drive</strong></>}</p>
                                </label>
                            </div>

                            {isHeroLoading ? (
                                <p style={{ padding: '1rem', color: '#888' }}>Loading current slides...</p>
                            ) : heroSlides.length > 0 ? (
                                <div className="hero-slides-grid">
                                    {heroSlides.map((slide) => (
                                        <div className="hero-slide-thumb" key={slide.id}>
                                            <img src={getHeroPublicUrl(slide.image_path)} alt="Hero slide" />
                                            <button
                                                className="action-icon-btn delete hero-slide-remove"
                                                onClick={() => handleDeleteHeroSlide(slide)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="panel-helper-text">No custom slides yet - the homepage is showing the default image.</p>
                            )}
                        </div>
                    )}

                    {activeTab === 'global-settings' && (
                        <div className="surface-card">
                            <h3>Global Content Variables</h3>
                            <p className="panel-helper-text">Instantly updates the frontend Welcome & Contact DOM nodes.</p>
                            <div className="settings-form-layout">
                                <div className="input-group"><label>Brand Name</label><input type="text" name="brandName" value={globalSettings.brandName} onChange={handleSettingChange} /></div>
                                <div className="input-group"><label>Tagline</label><input type="text" name="tagline" value={globalSettings.tagline} onChange={handleSettingChange} /></div>
                                <div className="input-group"><label>WhatsApp Endpoint</label><input type="text" name="whatsappNumber" value={globalSettings.whatsappNumber} onChange={handleSettingChange} /></div>
                                <div className="input-group"><label>Instagram Handle</label><input type="text" name="instagramUsername" value={globalSettings.instagramUsername} onChange={handleSettingChange} /></div>
                                <div className="input-group full-width"><label>Welcome Statement Quote</label><textarea name="welcomeQuote" rows="3" value={globalSettings.welcomeQuote} onChange={handleSettingChange}></textarea></div>
                                <button className="admin-action-btn primary-btn mt-2" onClick={() => alert("Saved.")}>Update Global State</button>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* MODALS */}
            {isAddFormOpen && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal-card">
                        <h3>New Entry</h3>
                        <form onSubmit={handleAddStock} className="crud-grid-form mt-4">
                            <div className="input-group"><label>Stock Line Title *</label><input type="text" name="title" value={newStock.title} onChange={handleInputChange} placeholder="e.g., Silk Slip Dress Collection" required /></div>
                            <div className="input-group"><label>Brand</label><input type="text" name="brand" value={newStock.brand} onChange={handleInputChange} placeholder="e.g., Nike, Zara..." /></div>
                            <div className="input-group"><label>Category</label><input type="text" name="category" value={newStock.category} onChange={handleInputChange} placeholder="e.g., Dresses" /></div>
                            <div className="input-group"><label>Expiry Date</label><input type="date" name="expiry_date" value={newStock.expiry_date} onChange={handleInputChange} /></div>
                            <div className="input-group"><label>Colors (comma sep)</label><input type="text" name="colors" value={newStock.colors} onChange={handleInputChange} placeholder="Red, Blue" /></div>
                            <div className="input-group"><label>Sizes (comma sep)</label><input type="text" name="sizes" value={newStock.sizes} onChange={handleInputChange} placeholder="S, M, L" /></div>
                            <div className="input-group"><label>MOQ</label><input type="text" name="moq" value={newStock.moq} onChange={handleInputChange} placeholder="e.g., 50" /></div>
                            <div className="input-group"><label>Fabric</label><input type="text" name="fabric" value={newStock.fabric} onChange={handleInputChange} placeholder="e.g., Silk" /></div>
                            <div className="input-group full-width"><label>Product Video</label><input type="file" accept="video/*" onChange={(e) => setNewStockVideo(e.target.files[0] || null)} /></div>
                            <div className="input-group full-width"><label>Description</label><textarea name="description" value={newStock.description} onChange={handleInputChange} placeholder="Product description..." rows="3"></textarea></div>
                            <div className="input-group full-width"><label>Product Photos</label><input type="file" multiple accept="image/*" onChange={(e) => setNewStockImages(Array.from(e.target.files || []))} /></div>

                            <div className="modal-actions-wrapper full-width">
                                <button type="button" className="modal-btn cancel" onClick={() => setIsAddFormOpen(false)}>Cancel</button>
                                <button type="submit" className="modal-btn confirm" disabled={isLoading}>{isLoading ? 'Saving...' : 'Save'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isEditModalOpen && editingItem && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal-card">
                        <h3>Update Content Matrix</h3>
                        <form onSubmit={handleSaveEdit} className="crud-grid-form mt-4">
                            <div className="input-group full-width">
                                <label>Product Title (Primary Key Bound)</label>
                                <input type="text" value={editingItem.title} disabled style={{ background: '#eee', cursor: 'not-allowed' }} />
                            </div>
                            <div className="input-group">
                                <label>Brand</label>
                                <input type="text" value={editingItem.brand || ''} onChange={(e) => setEditingItem(prev => ({ ...prev, brand: e.target.value }))} />
                            </div>
                            <div className="input-group">
                                <label>Status</label>
                                <select value={editingItem.status || 'active'} onChange={(e) => setEditingItem(prev => ({ ...prev, status: e.target.value }))}>
                                    <option value="active">Active</option>
                                    <option value="hidden">Hidden</option>
                                </select>
                            </div>
                            <div className="input-group">
                                <label>Category</label>
                                <input type="text" value={editingItem.category || ''} onChange={(e) => setEditingItem(prev => ({ ...prev, category: e.target.value }))} />
                            </div>
                            <div className="input-group">
                                <label>Expiry Date</label>
                                <input type="date" value={editingItem.expiry_date || ''} onChange={(e) => setEditingItem(prev => ({ ...prev, expiry_date: e.target.value }))} />
                            </div>
                            <div className="input-group">
                                <label>Colors</label>
                                <input type="text" value={editingItem.colors || ''} onChange={(e) => setEditingItem(prev => ({ ...prev, colors: e.target.value }))} />
                            </div>
                            <div className="input-group">
                                <label>Sizes</label>
                                <input type="text" value={editingItem.sizes || ''} onChange={(e) => setEditingItem(prev => ({ ...prev, sizes: e.target.value }))} />
                            </div>
                            <div className="input-group full-width">
                                <label>Description</label>
                                <textarea value={editingItem.description || ''} onChange={(e) => setEditingItem(prev => ({ ...prev, description: e.target.value }))} rows="3"></textarea>
                            </div>
                            <div className="input-group full-width">
                                <label>Replace Photos (Leaves existing if empty)</label>
                                <input type="file" multiple accept="image/*" onChange={(e) => setEditImages(Array.from(e.target.files || []))} />
                            </div>
                            <div className="input-group full-width">
                                <label>Replace Video (Leaves existing if empty)</label>
                                <input type="file" accept="video/*" onChange={(e) => setEditVideo(e.target.files[0] || null)} />
                            </div>
                            <div className="modal-actions-wrapper full-width">
                                <button type="button" className="modal-btn cancel" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                <button type="submit" className="modal-btn confirm">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {isDeleteModalOpen && (
                <div className="dashboard-modal-overlay">
                    <div className="dashboard-modal-card destructive-variant">
                        <h4>Destructive Action</h4>
                        <p>Are you certain? The record <strong>"{itemToDelete}"</strong> will be permanently purged from client endpoints.</p>
                        <div className="modal-actions-wrapper">
                            <button type="button" className="modal-btn cancel" onClick={() => setIsDeleteModalOpen(false)}>Abort</button>
                            <button type="button" className="modal-btn destructive" onClick={executeDelete}>Purge Record</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;