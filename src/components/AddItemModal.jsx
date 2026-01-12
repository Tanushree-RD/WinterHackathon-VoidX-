import React, { useState, useRef } from 'react';
import { X, Image as ImageIcon, Plus, Check } from 'lucide-react';
import { addItem, updateItem } from '../utils/menuService';
import './AddItemModal.css';

export default function AddItemModal({ onClose, itemToEdit }) {
    const [name, setName] = useState(itemToEdit ? itemToEdit.name : '');
    const [price, setPrice] = useState(itemToEdit ? itemToEdit.price : '');
    const [tags, setTags] = useState(itemToEdit ? itemToEdit.tags : []);
    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState(itemToEdit ? itemToEdit.imageUrl : null);
    const [isLoading, setIsLoading] = useState(false);

    // Tag Adding UI State
    const [isAddingTag, setIsAddingTag] = useState(false);
    const [newTagInput, setNewTagInput] = useState('');

    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result);
            reader.readAsDataURL(file);
        }
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
        if (!name || !price || tags.length === 0) {
            alert('Please fill in Name, Price, and at least one Tag.');
            return;
        }

        setIsLoading(true);
        try {
            if (itemToEdit) {
                await updateItem(itemToEdit.id, itemToEdit, { name, price: Number(price), tags }, imageFile);
            } else {
                await addItem(name, price, tags, imageFile);
            }
            onClose();
        } catch (error) {
            console.error("Error saving item:", error);
            alert("Failed to save item. See console.");
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
                        disabled={isLoading}
                    >
                        {isLoading ? 'Saving...' : (itemToEdit ? 'Update Item' : 'Confirm Item')}
                    </button>
                </div>
            </div>
        </div>
    );
}
