import { useState, useEffect } from 'react';

export default function AddItemModal({ isOpen, onClose, onConfirm, initialData = null }) {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [tags, setTags] = useState([]);
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [tagInput, setTagInput] = useState('');

    useEffect(() => {
        if (initialData) {
            setName(initialData.name);
            setPrice(initialData.price);
            setTags(initialData.tags || []);
            setImagePreview(initialData.imageUrl || '');
        } else {
            resetForm();
        }
    }, [initialData, isOpen]);

    const resetForm = () => {
        setName('');
        setPrice('');
        setImageFile(null);
        setImagePreview('');
        setTags([]);
        setIsAddingTag(false);
        setTagInput('');
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const confirmAddTag = () => {
        if (tagInput.trim()) {
            setTags([...tags, tagInput.trim()]);
            setTagInput('');
            setIsAddingTag(false);
        }
    };

    const handleSubmit = () => {
        if (!name || !price || tags.length === 0) return;
        onConfirm({ name, price, tags }, imageFile);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000
        }}>
            <div style={{
                backgroundColor: '#2a2a2a', padding: '2rem', borderRadius: '12px', width: '600px', maxWidth: '90%',
                display: 'flex', gap: '2rem', color: '#fff'
            }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div style={{
                        width: '100%', aspectRatio: '1', backgroundColor: '#333', borderRadius: '8px',
                        display: 'flex', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', border: '1px dashed #555'
                    }}>
                        {imagePreview ? <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <span>No Image</span>}
                    </div>
                    <input type="file" onChange={handleImageChange} accept="image/*" />
                </div>
                <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <h3>{initialData ? 'Edit Item' : 'Add Item'}</h3>
                    <input type="text" placeholder="Name" value={name} onChange={e => setName(e.target.value)} style={{ padding: '0.6rem', borderRadius: '4px', backgroundColor: '#1a1a1a', border: '1px solid #444', color: 'white' }} />
                    <input type="number" placeholder="Price" value={price} onChange={e => setPrice(e.target.value)} style={{ padding: '0.6rem', borderRadius: '4px', backgroundColor: '#1a1a1a', border: '1px solid #444', color: 'white' }} />
                    <div>
                        <label>Tags</label>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
                            {tags.map(tag => <span key={tag} style={{ background: '#333', padding: '2px 8px', borderRadius: '12px', fontSize: '0.8rem' }}>{tag} <span onClick={() => setTags(tags.filter(t => t !== tag))} style={{ cursor: 'pointer' }}>&times;</span></span>)}
                            <button onClick={() => setIsAddingTag(true)} style={{ fontSize: '0.8rem', padding: '2px 8px' }}>+ Tag</button>
                        </div>
                        {isAddingTag && (
                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Tag name" style={{ background: '#222', border: '1px solid #444', color: 'white' }} />
                                <button onClick={confirmAddTag}>OK</button>
                            </div>
                        )}
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', marginTop: 'auto' }}>
                        <button onClick={onClose} style={{ flex: 1, background: 'transparent', border: '1px solid #555' }}>Cancel</button>
                        <button onClick={handleSubmit} style={{ flex: 1, backgroundColor: '#646cff', color: 'white' }}>Save</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
