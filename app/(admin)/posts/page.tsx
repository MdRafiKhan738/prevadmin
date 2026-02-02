"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
    Search, LayoutGrid, Eye, CheckCircle, XCircle, Trash2,
    ImageIcon, User, Phone, MapPin, ExternalLink,
    Loader2, Check, HelpCircle, Calendar, AlertCircle, X,
    Edit3, Save, RotateCcw, ArrowLeft, Plus, Edit2, CheckCircle2, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { API_BASE_URL } from '../../../utils/apiConfig';
import toast from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface Ad {
    _id: string;
    headline: string;
    description: string;
    category: string;
    subCategory?: string;
    location: string;
    subLocation?: string;
    locations?: string[];
    phone: string;
    hidePhone: boolean;
    url: string; // Action URL
    actionType: string;
    images: string[];
    adType: string;
    status: 'active' | 'pending' | 'rejected' | 'expired';
    createdAt: string;
    price?: number;
    merchantID?: string;
    pwrTarget?: string[];
    targetD?: string;
    notificationDialogue?: string;
    showTill?: string;
    updatedAt?: string;
    rep?: string;
    lgs?: string;
    senBy?: string;
    edBy?: string;
    note?: string;
    user: {
        _id: string;
        name: string;
        email: string;
        mobile: string;
    };
    views: number;
    deliveryCount: number;
    targetValue: number;
    photoStatus: 'pending' | 'approved' | 'rejected';
}

interface Category {
    _id: string;
    name: string;
    subcategories: { name: string }[];
}

interface Location {
    _id: string;
    name: string;
    subLocations: { name: string }[];
}

export default function PostManagement() {
    const [ads, setAds] = useState<Ad[]>([]);
    const [filteredAds, setFilteredAds] = useState<Ad[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedAd, setSelectedAd] = useState<Ad | null>(null);
    const [selectedAds, setSelectedAds] = useState<string[]>([]);

    // Edit State
    const [categories, setCategories] = useState<Category[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [editFormData, setEditFormData] = useState<Partial<Ad>>({});
    const [saveLoading, setSaveLoading] = useState(false);

    // New Modal States
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showShortViewModal, setShowShortViewModal] = useState(false);
    const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'today' | 'running'>('all');
    const [searchKeys, setSearchKeys] = useState<any>({
        categoryId: '',
        subCategoryId: '',
        locationId: '',
        subLocationId: '',
        status: '',
        condition: '',
    });
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    // Fetch Ads
    useEffect(() => {
        fetchAds();
        fetchMeta();
    }, []);

    const fetchMeta = async () => {
        try {
            const [catRes, subCatRes, locRes, subLocRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/categories`),
                axios.get(`${API_BASE_URL}/api/categories/sub`),
                axios.get(`${API_BASE_URL}/api/locations`),
                axios.get(`${API_BASE_URL}/api/locations/sub`)
            ]);

            const cats = (catRes.data.data || []).map((c: any) => ({
                ...c,
                subcategories: (subCatRes.data.data || []).filter((sc: any) => (sc.category?._id || sc.category) === c._id)
            }));
            setCategories(cats);

            const locs = (locRes.data.data || []).map((l: any) => ({
                ...l,
                subLocations: (subLocRes.data.data || []).filter((sl: any) => (sl.location?._id || sl.location) === l._id)
            }));
            setLocations(locs);
        } catch (error) {
            console.error("Failed to fetch meta", error);
        }
    };

    const fetchAds = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('adminToken');
            const res = await axios.get(`${API_BASE_URL}/api/ads/admin/all`, {
                headers: { 'x-auth-token': token }
            });
            if (res.data.success) {
                setAds(res.data.data);
                setFilteredAds(res.data.data);
            }
        } catch (error) {
            console.error("Failed to fetch ads", error);
        } finally {
            setLoading(false);
        }
    };

    // Search & Tab Filter
    useEffect(() => {
        let filtered = ads;

        // Apply Tab Filter
        if (activeTab === 'pending') {
            // Unapproved ads
            filtered = filtered.filter(ad => ad.status === 'pending');
        } else if (activeTab === 'today') {
            // Today Promoted
            const today = new Date().toISOString().split('T')[0];
            filtered = filtered.filter(ad =>
                ad.adType === 'Promoted' &&
                ad.createdAt && ad.createdAt.split('T')[0] === today
            );
        } else if (activeTab === 'running') {
            // Currently Running Promotion
            filtered = filtered.filter(ad =>
                ad.adType === 'Promoted' &&
                ad.status === 'active'
            );
        }

        // Apply Search Query
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(ad =>
                ad.headline.toLowerCase().includes(query) ||
                ad.description.toLowerCase().includes(query) ||
                ad.user?.name.toLowerCase().includes(query) ||
                ad.phone.includes(query)
            );
        }

        setFilteredAds(filtered);
    }, [searchQuery, ads, activeTab]);

    // Handle Status Update
    const updateStatus = async (id: string, newStatus: string) => {
        try {
            const token = Cookies.get('adminToken');
            await axios.put(`${API_BASE_URL}/api/ads/admin/${id}/status`, { status: newStatus }, {
                headers: { 'x-auth-token': token }
            });
            // Update UI
            setAds(prev => prev.map(ad => ad._id === id ? { ...ad, status: newStatus as any } : ad));
            if (selectedAd && selectedAd._id === id) {
                setSelectedAd(prev => prev ? { ...prev, status: newStatus as any } : null);
            }
        } catch (error) {
            console.error("Update failed", error);
            alert("Failed to update status");
        }
    };

    // Handle Inline Field Update
    const updateAdField = async (id: string, field: string, value: any) => {
        try {
            const token = Cookies.get('adminToken');
            await axios.put(`${API_BASE_URL}/api/ads/admin/${id}/update`, { [field]: value }, {
                headers: { 'x-auth-token': token }
            });
            // Update UI
            setAds(prev => prev.map(ad => ad._id === id ? { ...ad, [field]: value } : ad));
        } catch (error) {
            console.error("Update failed", error);
            alert(`Failed to update ${field}`);
        }
    };

    // Handle Image Delete
    const deleteImage = async (adId: string, imageUrl: string) => {
        if (!confirm("Are you sure you want to remove this image?")) return;

        try {
            const token = Cookies.get('adminToken');
            await axios.delete(`${API_BASE_URL}/api/ads/admin/${adId}/image`, {
                headers: { 'x-auth-token': token },
                data: { imageUrl } // Send body in delete request
            });

            // Update UI
            setAds(prev => prev.map(ad => {
                if (ad._id === adId) {
                    return { ...ad, images: ad.images.filter(img => img !== imageUrl) };
                }
                return ad;
            }));

            if (selectedAd && selectedAd._id === adId) {
                setSelectedAd(prev => prev ? { ...prev, images: prev.images.filter(img => img !== imageUrl) } : null);
            }
            if (editFormData && selectedAd?._id === adId) {
                setEditFormData(prev => ({ ...prev, images: prev.images?.filter(img => img !== imageUrl) }));
            }
            alert("Image removed successfully");
        } catch (error) {
            console.error("Image delete failed", error);
            alert("Failed to remove image");
        }
    };

    const deleteAd = async (id: string) => {
        if (!confirm("Are you sure you want to delete this ad?")) return;
        try {
            const token = Cookies.get('adminToken');
            await axios.delete(`${API_BASE_URL}/api/ads/admin/${id}`, {
                headers: { 'x-auth-token': token }
            });
            setAds(prev => prev.filter(ad => ad._id !== id));
            setSelectedAds(prev => prev.filter(adId => adId !== id));
            setShowEditModal(false);
            setShowShortViewModal(false);
            setSelectedAd(null);
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete ad");
        }
    };

    const handleBulkDelete = async () => {
        if (selectedAds.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedAds.length} selected ads?`)) return;

        try {
            const token = Cookies.get('adminToken');
            await Promise.all(selectedAds.map(id =>
                axios.delete(`${API_BASE_URL}/api/ads/admin/${id}`, {
                    headers: { 'x-auth-token': token }
                })
            ));

            setAds(prev => prev.filter(ad => !selectedAds.includes(ad._id)));
            setSelectedAds([]);
        } catch (error) {
            console.error("Bulk delete failed", error);
            alert("Some ads could not be deleted.");
        }
    };

    const toggleSelectAd = (id: string) => {
        setSelectedAds(prev =>
            prev.includes(id) ? prev.filter(adId => adId !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedAds.length === filteredAds.length) {
            setSelectedAds([]);
        } else {
            setSelectedAds(filteredAds.map(ad => ad._id));
        }
    };

    const startEdit = () => {
        if (!selectedAd) return;
        setEditFormData({
            headline: selectedAd.headline,
            description: selectedAd.description,
            category: selectedAd.category,
            subCategory: selectedAd.subCategory,
            location: selectedAd.location,
            subLocation: selectedAd.subLocation,
            phone: selectedAd.phone,
            hidePhone: selectedAd.hidePhone,
            url: selectedAd.url,
            actionType: selectedAd.actionType,
            adType: selectedAd.adType,
            photoStatus: selectedAd.photoStatus,
            images: [...selectedAd.images]
        });
        setIsEditing(true);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            // 5MB Limit Check
            if (file.size > 5 * 1024 * 1024) {
                toast.error("File is too large! Max 5MB allowed.");
                e.target.value = ''; // Reset input
                return;
            }

            const newFiles = [...selectedFiles];
            newFiles[index] = file;
            setSelectedFiles(newFiles);

            // Generate preview
            const reader = new FileReader();
            reader.onload = (event) => {
                const newImages = [...(editFormData.images || [])];
                newImages[index] = event.target?.result as string;
                setEditFormData({ ...editFormData, images: newImages });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleEditChange = (name: string, value: any) => {
        setEditFormData(prev => ({ ...prev, [name]: value }));

        // Reset sub fields if parent changes
        if (name === 'category') setEditFormData(prev => ({ ...prev, subCategory: '' }));
        if (name === 'location') setEditFormData(prev => ({ ...prev, subLocation: '' }));
    };

    const handleSaveEdit = async () => {
        setSaveLoading(true);
        try {
            const token = Cookies.get('adminToken');

            // Use FormData for image upload
            const formData = new FormData();
            Object.keys(editFormData).forEach(key => {
                if (key !== 'images' && key !== 'user') {
                    const value = editFormData[key as keyof Ad];
                    if (value !== undefined) {
                        formData.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
                    }
                }
            });

            // Append images
            selectedFiles.forEach((file) => {
                if (file) formData.append('images', file);
            });

            let res;
            if (selectedAd?._id) {
                // UPDATE
                res = await axios.put(`${API_BASE_URL}/api/ads/admin/${selectedAd._id}/update`, formData, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                // CREATE
                res = await axios.post(`${API_BASE_URL}/api/ads/admin/create`, formData, {
                    headers: {
                        'x-auth-token': token,
                        'Content-Type': 'multipart/form-data'
                    }
                });
            }

            if (res.data.success) {
                const updatedAd = res.data.data;
                if (selectedAd?._id) {
                    setAds(prev => prev.map(a => a._id === updatedAd._id ? updatedAd : a));
                } else {
                    setAds(prev => [updatedAd, ...prev]);
                }
                setFilteredAds(prev => {
                    if (selectedAd?._id) return prev.map(a => a._id === updatedAd._id ? updatedAd : a);
                    return [updatedAd, ...prev];
                });
                setShowEditModal(false);
                setSelectedFiles([]);
                toast.success(selectedAd?._id ? "Ad updated successfully!" : "Ad created successfully!");
                fetchAds();
            }
        } catch (error) {
            console.error("Save failed", error);
            toast.error("Failed to save ad details");
        } finally {
            setSaveLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'rejected': return 'bg-rose-100 text-rose-700 border-rose-200';
            case 'expired': return 'bg-slate-100 text-slate-700 border-slate-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    return (
        <div className="bg-[#f1f5f9] min-h-[calc(100vh-4rem)] p-2 font-['Tahoma','Verdana',sans-serif] overflow-y-auto text-xs">
            {/* Top Navigation & Status Bar */}
            <div className="bg-white rounded-t-md border border-slate-200 p-2 flex items-center justify-between shadow-sm mb-1">
                <div className="flex items-center gap-4">
                    <button className="text-rose-500 hover:opacity-80 transition-opacity">
                        <ArrowLeft className="w-4 h-4 stroke-[3]" />
                    </button>

                    <div className="flex items-center gap-4 text-xs font-bold">
                        <button
                            onClick={() => setActiveTab('all')}
                            className={cn("hover:text-indigo-600 transition-colors", activeTab === 'all' && "text-indigo-600 border-b-2 border-indigo-600")}
                        >
                            All Post ({ads.length})
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={cn("hover:text-indigo-600 transition-colors", activeTab === 'pending' && "text-indigo-600 border-b-2 border-indigo-600")}
                        >
                            Inapprove ({ads.filter(a => a.status === 'pending').length})
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                            onClick={() => setActiveTab('today')}
                            className={cn("hover:text-indigo-600 transition-colors", activeTab === 'today' && "text-indigo-600 border-b-2 border-indigo-600")}
                        >
                            Today Promote ({
                                ads.filter(a =>
                                    a.adType === 'Promoted' &&
                                    a.createdAt?.split('T')[0] === new Date().toISOString().split('T')[0]
                                ).length
                            })
                        </button>
                        <span className="text-slate-300">|</span>
                        <button
                            onClick={() => setActiveTab('running')}
                            className={cn("hover:text-indigo-600 transition-colors", activeTab === 'running' && "text-indigo-600 border-b-2 border-indigo-600")}
                        >
                            Running Promote ({
                                ads.filter(a =>
                                    a.adType === 'Promoted' &&
                                    a.status === 'active'
                                ).length
                            })
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-1.5">
                    <button
                        onClick={handleBulkDelete}
                        disabled={selectedAds.length === 0}
                        className={cn(
                            "p-1.5 rounded-sm transition-all shadow-sm",
                            selectedAds.length > 0 ? "bg-rose-600 text-white scale-110 shadow-lg" : "bg-rose-400 text-rose-100 cursor-not-allowed"
                        )}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => {
                            setSelectedAd(null);
                            setEditFormData({});
                            setShowEditModal(true);
                        }}
                        className="bg-emerald-500 text-white p-1.5 rounded-sm hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                        <Plus className="w-3.5 h-3.5" />
                    </button>
                    <button
                        onClick={() => setShowSearchModal(true)}
                        className="bg-emerald-500 text-white p-1.5 rounded-sm hover:bg-emerald-600 transition-colors shadow-sm"
                    >
                        <Search className="w-3.5 h-3.5" />
                    </button>
                </div>
            </div>

            {/* Ads Table */}
            <div className="bg-white border border-slate-200 overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white text-slate-900 border-b border-slate-200 text-xs">
                                <th className="px-2 py-2 w-8">
                                    <input
                                        type="checkbox"
                                        className="w-3 h-3 cursor-pointer"
                                        checked={selectedAds.length === filteredAds.length && filteredAds.length > 0}
                                        onChange={toggleSelectAll}
                                    />
                                </th>
                                <th className="px-2 py-2 font-extrabold uppercase whitespace-nowrap">Product Picture</th>
                                <th className="px-2 py-2 font-extrabold uppercase whitespace-nowrap">Product ID</th>
                                <th className="px-2 py-2 font-extrabold uppercase whitespace-nowrap text-center">Produ Sts</th>
                                <th className="px-2 py-2 font-extrabold uppercase whitespace-nowrap">Categorie</th>
                                <th className="px-2 py-2 font-extrabold uppercase whitespace-nowrap">Location</th>
                                <th className="px-2 py-2 font-extrabold uppercase whitespace-nowrap">Price</th>
                                <th className="px-2 py-2 font-extrabold uppercase whitespace-nowrap">AD Type</th>
                                <th className="px-2 py-2 font-extrabold uppercase whitespace-nowrap">PWR Target</th>
                                <th className="px-2 py-2 font-extrabold uppercase whitespace-nowrap">Target/D</th>
                                <th className="px-2 py-2 font-extrabold uppercase whitespace-nowrap">Rep</th>
                                <th className="px-2 py-2 font-extrabold uppercase whitespace-nowrap">Lgs</th>
                                <th className="px-2 py-2 font-extrabold uppercase whitespace-nowrap">Sen/Ed By</th>
                                <th className="px-2 py-2 font-extrabold uppercase whitespace-nowrap">Date</th>
                                <th className="px-2 py-2 font-extrabold uppercase whitespace-nowrap text-right pr-4">Action</th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-600 font-bold text-xs">
                            {loading ? (
                                <tr>
                                    <td colSpan={14} className="py-20 text-center">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-500" />
                                    </td>
                                </tr>
                            ) : filteredAds.length === 0 ? (
                                <tr>
                                    <td colSpan={14} className="py-20 text-center text-slate-400">No posts found</td>
                                </tr>
                            ) : (
                                filteredAds.map((ad, idx) => (
                                    <tr key={ad._id} className={cn("border-b border-slate-100 hover:bg-slate-50 transition-colors h-10", selectedAds.includes(ad._id) && "bg-rose-50/50")}>
                                        <td className="px-2 py-1">
                                            <input
                                                type="checkbox"
                                                className="w-3 h-3 cursor-pointer"
                                                checked={selectedAds.includes(ad._id)}
                                                onChange={() => toggleSelectAd(ad._id)}
                                            />
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="flex items-center gap-1">
                                                {ad.images.slice(0, 3).map((img, i) => (
                                                    <div key={i} className="relative w-7 h-7 rounded-[2px] border border-slate-200 overflow-hidden shrink-0 group/img">
                                                        <img src={`${API_BASE_URL}${img}`} className="w-full h-full object-cover" />
                                                        <div className="absolute top-0 right-0 flex flex-col gap-[0.5px] p-[1px] bg-white/40 backdrop-blur-[1px] rounded-bl-sm">
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateAdField(ad._id, 'photoStatus', 'approved');
                                                                }}
                                                                className={cn(
                                                                    "flex items-center justify-center rounded-full border-[0.5px] border-white transition-all shadow-sm",
                                                                    ad.photoStatus === 'approved' ? "bg-emerald-500 w-[11px] h-[11px]" : "bg-slate-300 w-[9px] h-[9px] hover:bg-emerald-300 opacity-80"
                                                                )}
                                                            >
                                                                <Check className={cn("text-white shrink-0", ad.photoStatus === 'approved' ? "w-[8px] h-[8px]" : "w-[6px] h-[6px]")} strokeWidth={5} />
                                                            </button>
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    updateAdField(ad._id, 'photoStatus', 'rejected');
                                                                }}
                                                                className={cn(
                                                                    "flex items-center justify-center rounded-full border-[0.5px] border-white transition-all shadow-sm",
                                                                    ad.photoStatus === 'rejected' ? "bg-rose-500 w-[11px] h-[11px]" : "bg-slate-300 w-[9px] h-[9px] hover:bg-rose-300 opacity-80"
                                                                )}
                                                            >
                                                                <X className={cn("text-white shrink-0", ad.photoStatus === 'rejected' ? "w-[8px] h-[8px]" : "w-[6px] h-[6px]")} strokeWidth={5} />
                                                            </button>
                                                        </div>
                                                    </div>
                                                ))}
                                                <button className="text-slate-400 hover:text-slate-600 ml-0.5">
                                                    <ChevronRight className="w-3 h-3" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1 text-slate-800 font-bold whitespace-nowrap">{ad._id.slice(-8)}</td>
                                        <td className="px-2 py-1">
                                            <select
                                                value={ad.status}
                                                onChange={(e) => updateStatus(ad._id, e.target.value)}
                                                className="border-[1.5px] border-slate-900 rounded-px px-1 py-0 h-6 w-full max-w-[70px] bg-white text-xs font-black outline-none shadow-sm uppercase leading-none"
                                            >
                                                <option value="pending">Review</option>
                                                <option value="active">Active</option>
                                                <option value="rejected">Rejected</option>
                                                <option value="expired">Expired</option>
                                            </select>
                                        </td>
                                        <td className="px-2 py-1 leading-tight">
                                            <div className="flex flex-col gap-1">
                                                <select
                                                    value={ad.category}
                                                    onChange={(e) => updateAdField(ad._id, 'category', e.target.value)}
                                                    className="bg-transparent text-slate-900 border-none outline-none font-bold cursor-pointer w-full text-xs"
                                                >
                                                    <option value="">Select Category</option>
                                                    {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                                </select>
                                                <span className="text-slate-500 font-normal">{ad.subCategory}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1 text-slate-500 leading-tight">
                                            <div className="flex flex-col">
                                                <span>{ad.location}</span>
                                                <span className="font-normal">{ad.subLocation}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1 font-black text-rose-500">{ad.price || '00'}</td>
                                        <td className="px-2 py-1 text-emerald-600 capitalize font-black">{ad.adType}</td>
                                        <td className="px-2 py-1">
                                            <div className="flex gap-[2px] h-3 items-center">
                                                {['bg-blue-600', 'bg-yellow-400', 'bg-red-600', 'bg-green-600'].map((color, i) => (
                                                    <div key={i} className={cn("w-[2px] h-[10px] rounded-[1px]", color)} />
                                                ))}
                                            </div>
                                        </td>
                                        <td className="px-2 py-1 text-slate-500 font-bold whitespace-nowrap">
                                            {ad.adType === 'Promoted' ? `${ad.targetValue || 0}/${ad.deliveryCount || 0}` : '0'}
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="flex flex-col items-center gap-[2px]">
                                                <div className="flex gap-[1.5px]">
                                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                                                    <div className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                                                </div>
                                                <div className="w-4 h-1.5 bg-slate-100 rounded-[1px]" />
                                            </div>
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="flex flex-col items-center">
                                                <ImageIcon className="w-2.5 h-2.5 text-cyan-500" />
                                                <Save className="w-2.5 h-2.5 text-orange-500" />
                                            </div>
                                        </td>
                                        <td className="px-2 py-1 leading-[1.1]">
                                            <div className="flex flex-col text-xs">
                                                <span className="text-slate-400">{ad.senBy || 'N/A'}</span>
                                                <span className="text-slate-800">{ad.edBy || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1 whitespace-nowrap">
                                            <div className="flex flex-col text-xs leading-tight">
                                                <span>{new Date(ad.createdAt).toLocaleDateString()}</span>
                                                <span className="text-slate-400">{new Date(ad.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                        </td>
                                        <td className="px-2 py-1">
                                            <div className="flex items-center justify-end gap-1 px-1">
                                                <button
                                                    onClick={() => {
                                                        setSelectedAd(ad);
                                                        setShowShortViewModal(true);
                                                    }}
                                                    className="bg-emerald-500 text-white w-8 h-5 flex items-center justify-center rounded-sm text-xs font-black shadow-sm uppercase"
                                                >
                                                    Short
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSelectedAd(ad);
                                                        setEditFormData(ad);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="bg-emerald-600 text-white w-8 h-5 flex items-center justify-center rounded-sm text-xs font-black shadow-sm uppercase"
                                                >
                                                    Detail
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* SEARCH MODAL */}
            <AnimatePresence>
                {showSearchModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSearchModal(false)} className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white border-[1.5px] border-slate-900 w-full max-w-4xl rounded-sm shadow-2xl relative z-10">
                            <div className="p-4 border-b border-slate-200">
                                <h2 className="text-sm font-bold text-slate-900">Search By Item</h2>
                            </div>
                            <div className="p-4 grid grid-cols-5 gap-x-3 gap-y-3">
                                <div className="space-y-1">
                                    <label className="text-slate-700 font-bold block">Product Tracing ID</label>
                                    <input type="text" placeholder="Tracing ID..." className="w-full border border-slate-300 px-2 py-1 outline-none font-medium h-7 text-xs" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-700 font-bold block">Mobile</label>
                                    <input type="text" placeholder="Mobile..." className="w-full border border-slate-300 px-2 py-1 outline-none font-medium h-7 text-xs" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-700 font-bold block">Email</label>
                                    <input type="text" placeholder="Email..." className="w-full border border-slate-300 px-2 py-1 outline-none font-medium h-7 text-xs" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-700 font-bold block">Active Status</label>
                                    <select className="w-full border border-slate-300 px-1 py-1 outline-none font-medium h-7 text-xs">
                                        <option>Select</option>
                                        <option>Active</option>
                                        <option>Pending</option>
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-700 font-bold block">Categorie</label>
                                    <select
                                        className="w-full border border-slate-300 px-1 py-1 outline-none font-medium h-7 text-xs"
                                        value={searchKeys.categoryId}
                                        onChange={(e) => setSearchKeys({ ...searchKeys, categoryId: e.target.value, subCategoryId: '' })}
                                    >
                                        <option value="">Select Category</option>
                                        {categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-700 font-bold block">Sub Categorie</label>
                                    <select
                                        className="w-full border border-slate-300 px-1 py-1 outline-none font-medium h-7 text-xs"
                                        value={searchKeys.subCategoryId}
                                        onChange={(e) => setSearchKeys({ ...searchKeys, subCategoryId: e.target.value })}
                                    >
                                        <option value="">Select Sub Category</option>
                                        {categories.find(c => c.name === searchKeys.categoryId)?.subcategories.map((s, i) => (
                                            <option key={i} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-700 font-bold block">Location</label>
                                    <select
                                        className="w-full border border-slate-300 px-1 py-1 outline-none font-medium h-7 text-xs"
                                        value={searchKeys.locationId}
                                        onChange={(e) => setSearchKeys({ ...searchKeys, locationId: e.target.value, subLocationId: '' })}
                                    >
                                        <option value="">Select Location</option>
                                        {locations.map(l => <option key={l._id} value={l.name}>{l.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-700 font-bold block">Sub Location</label>
                                    <select
                                        className="w-full border border-slate-300 px-1 py-1 outline-none font-medium h-7 text-xs"
                                        value={searchKeys.subLocationId}
                                        onChange={(e) => setSearchKeys({ ...searchKeys, subLocationId: e.target.value })}
                                    >
                                        <option value="">Select Sub Location</option>
                                        {locations.find(l => l.name === searchKeys.locationId)?.subLocations.map((s, i) => (
                                            <option key={i} value={s.name}>{s.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-700 font-bold block">Registration Date From</label>
                                    <div className="flex border border-slate-300 h-7 text-xs">
                                        <input type="text" className="flex-1 px-1 outline-none font-medium" />
                                        <button className="px-1 border-l border-slate-200 bg-slate-50"><Calendar className="w-3 h-3" /></button>
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-slate-700 font-bold block">Registration Date To</label>
                                    <div className="flex border border-slate-300 h-7 text-xs">
                                        <input type="text" className="flex-1 px-1 outline-none font-medium" />
                                        <button className="px-1 border-l border-slate-200 bg-slate-50"><Calendar className="w-3 h-3" /></button>
                                    </div>
                                </div>
                            </div>
                            <div className="p-4 flex justify-end gap-2 border-t border-slate-200">
                                <button onClick={() => setShowSearchModal(false)} className="bg-slate-500 text-white px-4 py-1.5 font-bold rounded-sm text-xs shadow-sm flex items-center gap-1">
                                    <X className="w-3 h-3" /> Hide Search
                                </button>
                                <button className="bg-emerald-500 text-white px-4 py-1.5 font-bold rounded-sm text-xs shadow-sm flex items-center gap-1">
                                    <Search className="w-3 h-3" /> Search
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* ADD/EDIT MODAL */}
            <AnimatePresence>
                {showEditModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-2">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowEditModal(false)} className="absolute inset-0 bg-black/10" />
                        <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.98, opacity: 0 }} className="bg-white border-[1px] border-slate-300 w-full max-w-[1100px] rounded-sm shadow-xl relative z-10 flex flex-col max-h-[98vh] text-xs font-['Tahoma','Verdana',sans-serif]">
                            {/* Top Bar Navigation */}
                            <div className="p-1 px-2 flex items-center justify-between border-b bg-white">
                                <div className="flex items-center gap-1.5">
                                    <LayoutGrid className="w-3.5 h-3.5 text-slate-800" />
                                    <span className="text-slate-400">/</span>
                                    <span className="font-bold text-slate-600">{selectedAd?._id ? "Edit Post" : "Add Post"}</span>
                                    <span className="bg-emerald-600 text-white px-1 ml-2 rounded-[2px] text-xs py-0.5 font-bold">Publish</span>
                                </div>
                                <button onClick={() => setShowEditModal(false)} className="hover:bg-slate-100 p-0.5 rounded"><X className="w-3.5 h-3.5 text-slate-400" /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-[1.2fr_1.8fr] gap-3 bg-white">
                                {/* Left Column */}
                                <div className="flex flex-col gap-2">
                                    <div className="border border-slate-200 p-2 rounded-sm space-y-2">
                                        <input
                                            placeholder="Heading"
                                            className="w-full border border-slate-200 px-2 h-7 outline-none font-bold text-xs placeholder:text-slate-300"
                                            value={editFormData.headline || ''}
                                            onChange={(e) => handleEditChange('headline', e.target.value)}
                                        />
                                        <div className="space-y-0.5">
                                            <div className="text-xs text-slate-400">Description Present</div>
                                            <textarea
                                                className="w-full border border-slate-200 p-1.5 outline-none text-xs h-24 resize-none bg-white text-slate-400"
                                                value={editFormData.description || ''}
                                                readOnly
                                            />
                                        </div>
                                        <div className="space-y-0.5">
                                            <div className="text-xs text-slate-400">Description Edit</div>
                                            <textarea
                                                className="w-full border border-slate-200 p-1.5 outline-none text-xs h-32 resize-none bg-white"
                                                value={editFormData.description || ''}
                                                onChange={(e) => handleEditChange('description', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex items-center gap-3 justify-end text-xs text-slate-400 pr-1">
                                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" className="w-3 h-3 border-slate-300" /> Accept</label>
                                            <label className="flex items-center gap-1 cursor-pointer"><input type="checkbox" className="w-3 h-3 border-slate-300" /> Reject</label>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2">
                                        {['category', 'subCategory', 'location', 'subLocation'].map((name) => (
                                            <select
                                                key={name}
                                                className="border border-slate-200 h-7 outline-none text-xs bg-white px-1"
                                                value={editFormData[name as keyof typeof editFormData] as string || ''}
                                                onChange={(e) => handleEditChange(name, e.target.value)}
                                            >
                                                <option value="">{name === 'category' ? 'Categorie' : name === 'subCategory' ? 'Sub Catagoeie' : name === 'location' ? 'Location' : 'Sub Location'}</option>
                                                {name === 'category' && categories.map(c => <option key={c._id} value={c.name}>{c.name}</option>)}
                                                {name === 'subCategory' && categories.find(c => c.name === editFormData.category)?.subcategories.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                                                {name === 'location' && locations.map(l => <option key={l._id} value={l.name}>{l.name}</option>)}
                                                {name === 'subLocation' && locations.find(l => l.name === editFormData.location)?.subLocations.map((s, i) => <option key={i} value={s.name}>{s.name}</option>)}
                                            </select>
                                        ))}
                                    </div>

                                    <div className="border border-slate-200 p-2 rounded-sm space-y-2">
                                        <div className="flex gap-1.5 items-center">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    className="border border-slate-200 h-7 outline-none text-xs w-48 px-2 bg-slate-50 font-bold text-slate-500"
                                                    value={selectedAd ? (selectedAd._id) : "Auto Value"}
                                                    readOnly
                                                />
                                                <span className="absolute -top-3 left-0 text-xs text-slate-400">Merchant ID (Auto)</span>
                                            </div>
                                            <div className="ml-0.5 flex items-center justify-center h-7 text-slate-400 font-bold text-lg">+</div>
                                            <div className="ml-4 flex-1 grid grid-cols-2 gap-1.5">
                                                <input
                                                    placeholder="Price (Payble)"
                                                    className="border border-slate-200 h-7 px-2 outline-none text-xs w-full"
                                                    value={editFormData.price || ''}
                                                    onChange={(e) => handleEditChange('price', e.target.value)}
                                                />
                                                <input
                                                    placeholder="Price (Old)"
                                                    className="border border-slate-200 h-7 px-2 outline-none text-xs w-full"
                                                />
                                            </div>
                                        </div>
                                        <div className="text-center text-slate-400 font-bold border-t border-dashed pt-1 cursor-pointer hover:text-slate-600 text-xs">
                                            + catagory wise another feature
                                        </div>
                                    </div>

                                    <div className="flex gap-2 pt-1">
                                        <button onClick={() => setShowEditModal(false)} className="flex-1 bg-[#d9534f] text-white py-2 font-bold rounded-sm text-xs uppercase">Cancel</button>
                                        <button
                                            onClick={() => selectedAd && deleteAd(selectedAd._id)}
                                            className="flex-1 bg-[#f0ad4e] text-white py-2 font-bold rounded-sm text-xs uppercase"
                                        >
                                            Delete
                                        </button>
                                        <button onClick={handleSaveEdit} className="grow-[1.5] bg-[#5cb85c] text-white py-2 font-bold rounded-sm text-xs uppercase flex items-center justify-center gap-2">
                                            {saveLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Save'}
                                        </button>
                                    </div>
                                </div>

                                {/* Right Column */}
                                <div className="flex flex-col gap-2">
                                    <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-2 border border-slate-200 p-2 rounded-sm bg-white">
                                        <div className="flex flex-col gap-0.5">
                                            <label className="text-xs text-slate-400 font-bold italic">Show Till (Date)</label>
                                            <input
                                                type="date"
                                                className="border border-slate-200 h-6 outline-none text-xs px-1 w-full"
                                                value={editFormData.showTill ? new Date(editFormData.showTill).toISOString().split('T')[0] : ''}
                                                onChange={(e) => handleEditChange('showTill', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <label className="text-xs text-slate-400">Post Entry</label>
                                            <div className="text-xs font-bold text-slate-900 leading-tight">
                                                {selectedAd?._id ? (
                                                    <>
                                                        {new Date(selectedAd.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}<br />
                                                        {new Date(selectedAd.createdAt).toLocaleDateString()}
                                                    </>
                                                ) : (
                                                    <>
                                                        {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}<br />
                                                        {new Date().toLocaleDateString()}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <label className="text-xs text-slate-400">Post Modify</label>
                                            <div className="text-xs font-bold text-slate-900 leading-tight">
                                                {selectedAd?.updatedAt ? (
                                                    <>
                                                        {new Date(selectedAd.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}<br />
                                                        {new Date(selectedAd.updatedAt).toLocaleDateString()}
                                                    </>
                                                ) : selectedAd?._id ? (
                                                    <>
                                                        {new Date(selectedAd.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}<br />
                                                        {new Date(selectedAd.createdAt).toLocaleDateString()}
                                                    </>
                                                ) : (
                                                    <span className="text-slate-300 font-normal">--:--<br />--/--/--</span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-0.5 relative">
                                            <label className="text-xs text-slate-400">Promote Type</label>
                                            <select
                                                className="border border-slate-200 h-6 outline-none text-xs px-1 bg-white"
                                                value={editFormData.adType || 'Free'}
                                                onChange={(e) => handleEditChange('adType', e.target.value)}
                                            >
                                                <option value="Free">Free</option>
                                                <option value="Promoted">Promoted</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-0.5">
                                            <label className="text-xs text-slate-400 font-bold">Marchent ID</label>
                                            <div className="text-xs font-bold text-slate-800">{selectedAd?._id || 'Auto value'}</div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[1.5fr_2.5fr] gap-2 border border-slate-200 p-2 rounded-sm bg-white relative">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-col gap-0.5">
                                                <div className="flex items-center gap-1">
                                                    <span className="text-xs text-slate-400">Product Status</span>
                                                    <ArrowLeft className="w-2.5 h-2.5 text-blue-500 rotate-[30deg]" />
                                                </div>
                                                <select
                                                    value={editFormData.status || 'pending'}
                                                    onChange={(e) => handleEditChange('status', e.target.value)}
                                                    className="w-full border border-slate-300 h-7 text-xs outline-none px-1 bg-white"
                                                >
                                                    <option value="active">Active</option>
                                                    <option value="notification">Notification</option>
                                                    <option value="pause">Pause</option>
                                                    <option value="review">Review/Processing</option>
                                                    <option value="rejected">Delete (Reason)</option>
                                                    <option value="atv_msg">Product Atv+Msg</option>
                                                    <option value="unatv_msg">Prodt Unatv+Msg</option>
                                                </select>
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="flex flex-col gap-0.5">
                                                    <label className="text-xs text-slate-400">Total View</label>
                                                    <div className="h-7 border border-slate-200 flex items-center px-1.5 text-xs font-bold text-slate-600">{editFormData.views || 0}</div>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <div className="flex items-center gap-1 uppercase text-xs font-bold text-slate-400">Promot <span className="text-xs">Amount & Date List</span></div>
                                                    <div className="h-7 border border-slate-200 flex items-center justify-center gap-1 bg-slate-50">
                                                        <RotateCcw className="w-2.5 h-2.5 text-slate-400" />
                                                        <Calendar className="w-2.5 h-2.5 text-slate-400" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex flex-col gap-0.5">
                                                <label className="text-xs text-slate-400">Notification Dialogue</label>
                                                <input
                                                    className="w-full border border-slate-200 h-7 text-xs outline-none px-2"
                                                    value={editFormData.notificationDialogue || ''}
                                                    onChange={(e) => handleEditChange('notificationDialogue', e.target.value)}
                                                />
                                            </div>
                                            <div className="grid grid-cols-[1fr_1fr_0.8fr] gap-1.5">
                                                <div className="flex flex-col gap-0.5">
                                                    <label className="text-xs text-slate-400 whitespace-nowrap">View From</label>
                                                    <div className="flex border border-slate-200 h-7 items-center justify-center bg-slate-50"><Calendar className="w-3 h-3 text-slate-400" /></div>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <label className="text-xs text-slate-400 whitespace-nowrap">View Till</label>
                                                    <div className="flex border border-slate-200 h-7 items-center justify-center bg-slate-50"><Calendar className="w-3 h-3 text-slate-400" /></div>
                                                </div>
                                                <div className="flex flex-col gap-0.5">
                                                    <label className="text-xs text-slate-400">Result</label>
                                                    <div className="h-7 border border-slate-200 bg-slate-50"></div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-slate-200 p-2 rounded-sm space-y-1 bg-white">
                                        <label className="text-xs text-slate-400">Note</label>
                                        <input
                                            className="w-full border border-slate-200 h-7 text-xs outline-none px-2"
                                            value={editFormData.note || ''}
                                            onChange={(e) => handleEditChange('note', e.target.value)}
                                        />
                                    </div>

                                    <div className="border border-slate-200 p-2 rounded-sm bg-white">
                                        <div className="text-xs font-bold text-slate-800 mb-2">Photo Zone</div>
                                        <div className="flex gap-2.5 items-start">
                                            {[...Array(5)].map((_, i) => (
                                                <div key={i} className="flex flex-col gap-1">
                                                    <div className="flex items-center gap-3">
                                                        <label className="text-xs text-slate-400 cursor-pointer hover:text-emerald-600 transition-colors uppercase font-bold">
                                                            Choose File
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileChange(e, i)}
                                                            />
                                                        </label>
                                                        <label className="flex items-center gap-0.5 cursor-pointer leading-none">
                                                            <input type="checkbox" className="w-2.5 h-2.5" />
                                                            <span className="text-xs text-slate-400 whitespace-nowrap">Long Img?</span>
                                                        </label>
                                                    </div>
                                                    <div className="w-[78px] h-[52px] border border-slate-200 rounded-[1px] bg-slate-50 relative overflow-hidden flex items-center justify-center group/p">
                                                        {editFormData.images?.[i] ? (
                                                            <>
                                                                <img
                                                                    src={
                                                                        selectedFiles[i] // If a new file is present at this index, show its preview
                                                                            ? URL.createObjectURL(selectedFiles[i])
                                                                            : (editFormData.images?.[i]?.startsWith('data:')
                                                                                ? editFormData.images[i]
                                                                                : `${API_BASE_URL}${editFormData.images?.[i]}`)
                                                                    }
                                                                    className="w-full h-full object-cover"
                                                                />
                                                                <div className="absolute top-0 right-0 flex gap-0.5 p-0.5 opacity-0 group-hover/p:opacity-100 transition-opacity">
                                                                    <div className="bg-[#5cb85c] rounded-full p-0.5 border-[0.5px] border-white shadow-sm cursor-pointer whitespace-nowrap"><Check className="w-2 h-2 text-white" strokeWidth={4} /></div>
                                                                    <div
                                                                        onClick={() => {
                                                                            const newImages = [...(editFormData.images || [])];
                                                                            newImages[i] = "";
                                                                            const newFiles = [...selectedFiles];
                                                                            newFiles[i] = undefined as any;
                                                                            setEditFormData({ ...editFormData, images: newImages });
                                                                            setSelectedFiles(newFiles);
                                                                        }}
                                                                        className="bg-[#d9534f] rounded-full p-0.5 border-[0.5px] border-white shadow-sm cursor-pointer"
                                                                    >
                                                                        <X className="w-2 h-2 text-white" strokeWidth={4} />
                                                                    </div>
                                                                </div>
                                                            </>
                                                        ) : (
                                                            <ImageIcon className="w-4 h-4 text-slate-200" />
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex items-end h-[52px]">
                                                <ChevronRight className="w-4 h-4 text-slate-300 ml-1" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="border border-slate-200 p-2 rounded-sm space-y-1.5 bg-white">
                                        <div className="text-xs font-extrabold text-slate-800 uppercase">Approve photo</div>
                                        <table className="w-full text-xs">
                                            <thead>
                                                <tr className="border-b border-slate-100 italic">
                                                    <th className="text-left font-bold pb-1 w-1/4">Photo</th>
                                                    <th className="text-left font-bold pb-1 w-1/4 text-center">Type</th>
                                                    <th className="text-right font-bold pb-1 w-1/4 px-2 text-center whitespace-nowrap">Accept Request</th>
                                                    <th className="text-right font-bold pb-1 w-1/4 pr-4">#</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {editFormData.images?.map((img, i) => (
                                                    <tr key={i} className="border-b border-slate-50 last:border-0">
                                                        <td className="py-2">
                                                            <div className="w-[100px] h-[60px] border border-slate-200 rounded-[1px] overflow-hidden">
                                                                <img
                                                                    src={
                                                                        selectedFiles[i]
                                                                            ? URL.createObjectURL(selectedFiles[i])
                                                                            : (img.startsWith('data:') ? img : `${API_BASE_URL}${img}`)
                                                                    }
                                                                    className="w-full h-full object-cover"
                                                                />
                                                            </div>
                                                        </td>
                                                        <td className="py-1 text-center font-bold text-slate-800 text-xs">Product</td>
                                                        <td className="py-1 text-center px-4">
                                                            <button className="bg-[#f0ad4e] text-white px-3 py-1 rounded-[1px] font-bold text-xs w-full shadow-sm">Accept</button>
                                                        </td>
                                                        <td className="py-1 text-right pr-4">
                                                            <button
                                                                onClick={() => selectedAd && deleteImage(selectedAd._id, img)}
                                                                className="bg-[#d9534f] text-white px-2 py-1 rounded-[1px] font-bold text-xs shadow-sm"
                                                            >
                                                                Delete
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* SHORT VIEW MODAL */}
            <AnimatePresence>
                {showShortViewModal && selectedAd && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowShortViewModal(false)} className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white border-[1.5px] border-slate-900 w-full max-w-sm rounded-sm shadow-2xl relative z-10 p-4 font-['Tahoma','Verdana',sans-serif]">
                            <div className="flex items-center justify-between mb-4 pb-2 border-b">
                                <div className="flex items-center gap-2">
                                    <ArrowLeft className="w-3 h-3 text-rose-500" />
                                    <span className="text-xs font-bold text-slate-800">/ Short View</span>
                                    <span className="bg-emerald-600 text-white px-1 rounded-sm text-xs py-0.5">Publish</span>
                                </div>
                                <button onClick={() => setShowShortViewModal(false)}><X className="w-3.5 h-3.5 text-slate-400" /></button>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Heading</label>
                                    <div className="text-xs font-bold text-slate-900 border-b pb-1">{selectedAd.headline}</div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase">Description Present</label>
                                    <div className="text-xs text-slate-600 max-h-16 overflow-y-auto bg-slate-50 p-1.5 border border-slate-200">{selectedAd.description}</div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-indigo-500 uppercase italic">Description Edit</label>
                                    <div className="text-xs text-slate-600 h-16 bg-indigo-50/20 p-1.5 border border-slate-200">Present</div>
                                </div>

                                <div className="flex justify-end gap-3 text-xs font-bold">
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="short_photo_status"
                                            className="w-2.5 h-2.5"
                                            checked={selectedAd.photoStatus === 'approved'}
                                            onChange={() => updateAdField(selectedAd._id, 'photoStatus', 'approved')}
                                        />
                                        Accept
                                    </label>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="short_photo_status"
                                            className="w-2.5 h-2.5"
                                            checked={selectedAd.photoStatus === 'rejected'}
                                            onChange={() => updateAdField(selectedAd._id, 'photoStatus', 'rejected')}
                                        />
                                        Reject
                                    </label>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400">Category</label>
                                        <div className="w-full border border-slate-200 h-6 text-xs flex items-center px-1 bg-slate-50 font-bold">{selectedAd.category}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400">Sub Category</label>
                                        <div className="w-full border border-slate-200 h-6 text-xs flex items-center px-1 bg-slate-50">{selectedAd.subCategory || 'N/A'}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400">Location</label>
                                        <div className="w-full border border-slate-200 h-6 text-xs flex items-center px-1 bg-slate-50 font-bold">{selectedAd.location}</div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-slate-400">Sub Location</label>
                                        <div className="w-full border border-slate-200 h-6 text-xs flex items-center px-1 bg-slate-50">{selectedAd.subLocation || 'N/A'}</div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-xs text-slate-400">Price (Payable)</label>
                                        <div className="w-full border border-slate-200 h-6 text-xs flex items-center px-1 font-bold text-emerald-600">৳ {selectedAd.price || '0'}</div>
                                    </div>
                                </div>

                                <div className="flex gap-1.5 overflow-x-auto py-1">
                                    {selectedAd.images.map((img, i) => (
                                        <div key={i} className="w-12 h-12 border border-slate-200 rounded overflow-hidden shrink-0 relative">
                                            <img src={`${API_BASE_URL}${img}`} className="w-full h-full object-cover" />
                                            <div className="absolute top-0 right-0 p-0.5 flex gap-0.5">
                                                <div className="bg-emerald-500 w-2 h-2 rounded-full border border-white" />
                                                <div className="bg-rose-500 w-2 h-2 rounded-full border border-white" />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="flex gap-2 pt-2">
                                    <button onClick={() => setShowShortViewModal(false)} className="flex-1 bg-rose-500 text-white py-1.5 font-bold rounded-sm text-xs shadow-sm hover:bg-rose-600">Cancel</button>
                                    <button
                                        onClick={() => {
                                            if (selectedAd && confirm("Confirm delete ad?")) {
                                                const id = selectedAd._id;
                                                axios.delete(`${API_BASE_URL}/api/ads/admin/${id}`, {
                                                    headers: { 'x-auth-token': Cookies.get('adminToken') }
                                                }).then(() => {
                                                    setAds(prev => prev.filter(a => a._id !== id));
                                                    setShowShortViewModal(false);
                                                });
                                            }
                                        }}
                                        className="flex-1 bg-yellow-500 text-white py-1.5 font-bold rounded-sm text-xs shadow-sm hover:bg-yellow-600"
                                    >
                                        Delete
                                    </button>
                                    <button
                                        onClick={() => {
                                            if (selectedAd) {
                                                updateStatus(selectedAd._id, 'active');
                                                setShowShortViewModal(false);
                                            }
                                        }}
                                        className="grow-[2] bg-emerald-600 text-white py-1.5 font-bold rounded-sm text-xs shadow-sm hover:bg-emerald-700"
                                    >
                                        Publish
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar {
                    display: none;
                }
                .no-scrollbar {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
}
