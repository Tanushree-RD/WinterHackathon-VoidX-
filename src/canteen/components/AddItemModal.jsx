import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Plus, Check, Link } from 'lucide-react';
import { addItem, updateItem } from '../../shared/services/menuService';
import './AddItemModal.css';

import { useToast } from '../../shared/context/ToastContext';

export default function AddItemModal({ onClose, itemToEdit }) {
    const { success, error } = useToast();
    const [name, setName] = useState(itemToEdit ? itemToEdit.name : '');
    const [price, setPrice] = useState(itemToEdit ? itemToEdit.price : '');
    const [tags, setTags] = useState(itemToEdit ? itemToEdit.tags : []);
    const [imageFile, setImageFile] = useState(null);
    const [imageUrl, setImageUrl] = useState(itemToEdit ? itemToEdit.imageUrl : '');
    const [inputType, setInputType] = useState('url'); // 'file' or 'url' - default to url as requested
    const [imagePreview, setImagePreview] = useState(itemToEdit ? itemToEdit.imageUrl : null);
    const [isLoading, setIsLoading] = useState(false);

    // Tag Adding UI State
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTagInput, setNewTagInput] = useState('');

    const fileInputRef = useRef(null);

    // Validation
    const isValid = name.trim() !== '' && price !== '' && tags.length > 0;

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                error("Image size must be less than 5MB");
                return;
            }
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
    };

    const handleUrlChange = (e) => {
        const url = e.target.value;
        setImageUrl(url);
        setImagePreview(url);
        setImageFile(null); // Clear file if URL is used
    };

    const handleAddTagStart = () => {
        setIsAddingTag(true);
        setNewTagInput('');
    };

    const handleConfirmTag = () => {
        const trimmed = newTagInput.trim();
        if (trimmed && !tags.includes(trimmed)) {
            setTags([...tags, trimmed]);
        }
        setIsAddingTag(false);
        setNewTagInput('');
    };

    const handleCancelTag = () => {
        setIsAddingTag(false);
        setNewTagInput('');
    };

    const removeTag = (tagToRemove) => {
        setTags(tags.filter(t => t !== tagToRemove));
    };

    const handleSubmit = async () => {
        if (!isValid) return;

        setIsLoading(true);
        try {
            if (itemToEdit) {
                await updateItem(itemToEdit.id, itemToEdit, { name, price: Number(price), tags }, inputType === 'file' ? imageFile : null, inputType === 'url' ? imageUrl : undefined);
                success("Item updated successfully!");
            } else {
                await addItem(name, price, tags, inputType === 'file' ? imageFile : null, inputType === 'url' ? imageUrl : null);
                success("New item added successfully!");
            }
            onClose();
        } catch (err) {
            console.error("Error saving item:", err);
            error("Failed to save item. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">{itemToEdit ? 'Edit Item' : 'Add New Item'}</div>

                <div className="modal-body">
                    {/* Left Column: Image Upload */}
                    <div className="form-column">
                        <div className="field-group">
                            <label>Item Image (Optional)</label>

                            <div className="image-input-tabs">
                                <button
                                    className={`tab-btn ${inputType === 'url' ? 'active' : ''}`}
                                    onClick={() => {
                                        setInputType('url');
                                        setImagePreview(imageUrl);
                                        setImageFile(null);
                                    }}
                                >
                                    <Link size={14} /> URL
                                </button>
                                <button
                                    className={`tab-btn ${inputType === 'file' ? 'active' : ''}`}
                                    onClick={() => {
                                        setInputType('file');
                                        if (!imageFile) setImagePreview(null);
                                    }}
                                >
                                    <ImageIcon size={14} /> Upload
                                </button>
                            </div>

                            {inputType === 'file' ? (
                                <div
                                    className="image-upload-area"
                                    onClick={() => fileInputRef.current.click()}
                                    style={{
                                        backgroundImage: imagePreview ? `url(${imagePreview})` : 'none',
                                        backgroundSize: 'cover',
                                        backgroundPosition: 'center'
                                    }}
                                >
                                    {!imagePreview && (
                                        <>
                                            <ImageIcon size={32} />
                                            <span style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>Click to upload image</span>
                                        </>
                                    )}
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        hidden
                                        accept="image/*"
                                        onChange={handleImageSelect}
                                    />
                                </div>
                            ) : (
                                <div className="url-input-container">
                                    <input
                                        type="text"
                                        placeholder="Paste image URL here..."
                                        value={imageUrl}
                                        onChange={handleUrlChange}
                                        className="image-url-input"
                                    />
                                    {imagePreview && (
                                        <div className="url-preview" style={{ backgroundImage: `url(${imagePreview})` }} />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Details */}
                    <div className="form-column">
                        <div className="field-group">
                            <label>Item Name</label>
                            <input
                                type="text"
                                placeholder="e.g., Chicken Biryani"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>

                        <div className="field-group">
                            <label>Price (₹)</label>
                            <input
                                type="number"
                                placeholder="0.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                        </div>

                        <div className="tags-section">
                            <label className="tags-label">Tags (Min 1 required)</label>

                            <div className="tags-list">
                                {tags.map(tag => (
                                    <span key={tag} className="tag-chip">
                                        {tag}
                                        <X size={14} className="tag-remove-icon" onClick={() => removeTag(tag)} />
                                    </span>
                                ))}
                            </div>

                            {!isAddingTag ? (
                                <button className="add-tag-btn" onClick={handleAddTagStart}>+ Add Tag</button>
                            ) : (
                                <div className="add-tag-input-container">
                                    <input
                                        type="text"
                                        value={newTagInput}
                                        onChange={(e) => setNewTagInput(e.target.value)}
                                        placeholder="Tag Name"
                                        className="tag-input-mini"
                                        autoFocus
                                    />
                                    <div className="tag-actions-mini">
                                        <button className="tag-confirm-btn" onClick={handleConfirmTag} type="button">
                                            <Check size={18} color="white" strokeWidth={3} />
                                        </button>
                                        <button className="tag-cancel-btn" onClick={handleCancelTag} type="button">
                                            <X size={18} color="white" strokeWidth={3} />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button className="btn-cancel" onClick={onClose} disabled={isLoading}>Cancel</button>
                    <button
                        className="btn-confirm primary"
                        onClick={handleSubmit}
                        disabled={isLoading || !isValid}
                        style={{ opacity: (isLoading || !isValid) ? 0.6 : 1, cursor: (isLoading || !isValid) ? 'not-allowed' : 'pointer' }}
                    >
                        {isLoading ? 'Saving...' : (itemToEdit ? 'Update Item' : 'Confirm Item')}
                    </button>
                </div>
            </div>
        </div>
    );
}
