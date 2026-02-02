"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Users, User, Plus, Search, Edit2, Trash2, X, Check,
    MoreHorizontal, MapPin, Tag, ShieldCheck, Mail,
    Phone, Store, Calendar, HelpCircle, Loader2, AlertCircle,
    ArrowLeft, XCircle, PlusCircle, MessageSquare, ImageIcon,
    Minus, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Cookies from 'js-cookie';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { API_BASE_URL } from '../../../utils/apiConfig';
import toast from 'react-hot-toast';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

const API_BASE = `${API_BASE_URL}/api/admins/users`;

interface UserFormData {
    name: string;
    email: string;
    password?: string;
    dob: string;
    gender: string;
    mobile: string;
    mobileVerified: boolean;
    education: string;
    educationIn: string;
    currentJob: string;
    jobExperience: string;
    note: string;
    storeName: string;
    actionType: string;
    accountStatus: string;
    verifiedBy: string;
    location: string;
    category: string;
    pageName: string;
    merchantType: string;
    rating: number | string;
    storeBannerStatus: string;
    storeLogoStatus: string;
    photoStatus: string;
    photo?: string;
    storeLogo?: string;
    storeBanner?: string;
    merchantVerifiedBy: string;
    additionalMobiles?: string[];
}

export default function UserManagement() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [userTypeFilter, setUserTypeFilter] = useState('both');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [formLoading, setFormLoading] = useState(false);
    const [error, setError] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [selectedFiles, setSelectedFiles] = useState<{ [key: string]: File }>({});
    const [locations, setLocations] = useState<any[]>([]);
    const [categories, setCategories] = useState<any[]>([]);

    const [formData, setFormData] = useState<UserFormData>({
        name: '',
        email: '',
        password: '',
        dob: '',
        gender: '',
        mobile: '',
        mobileVerified: true,
        education: '',
        educationIn: '',
        currentJob: '',
        jobExperience: '',
        note: '',
        storeName: '',
        actionType: 'call',
        accountStatus: 'review',
        verifiedBy: 'Mobile',
        location: '',
        category: '',
        pageName: '',
        merchantType: 'Free',
        rating: '',
        storeBannerStatus: 'pending',
        storeLogoStatus: 'pending',
        photoStatus: 'pending',
        photo: '',
        storeLogo: '',
        storeBanner: '',
        merchantVerifiedBy: 'Mobile',
        additionalMobiles: []
    });
    const [tempMobile, setTempMobile] = useState('');

    useEffect(() => {
        fetchUsers();
        fetchMeta();
    }, []);

    const fetchMeta = async () => {
        try {
            const [locRes, catRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/locations`),
                axios.get(`${API_BASE_URL}/api/categories`)
            ]);
            setLocations(locRes.data.data || []);
            setCategories(catRes.data.data || []);
        } catch (err) {
            console.error("Failed to fetch meta data", err);
        }
    };

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('adminToken');
            const res = await axios.get(API_BASE, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(res.data);
        } catch (err: any) {
            console.error("Failed to fetch users", err);
            setError(`Failed to fetch users: ${err.message}`);
        } finally {
            setLoading(false);
            setSelectedUsers([]);
        }
    };

    const handleOpenModal = (user: any = null) => {
        setError('');
        if (user) {
            setEditingUser(user);
            setFormData({
                name: user.name || '',
                email: user.email || '',
                password: '',
                dob: user.dob ? new Date(user.dob).toISOString().split('T')[0] : '',
                gender: user.gender || '',
                mobile: user.mobile || '',
                mobileVerified: user.mobileVerified ?? true,
                education: user.education || '',
                educationIn: user.educationIn || '',
                currentJob: user.currentJob || '',
                jobExperience: user.jobExperience || '',
                note: user.note || '',
                storeName: user.storeName || '',
                actionType: user.actionType || 'call',
                accountStatus: user.accountStatus || 'review',
                verifiedBy: user.verifiedBy || 'Mobile',
                location: user.location || '',
                category: user.category || '',
                pageName: user.pageName || '',
                merchantType: user.merchantType || 'Free',
                rating: user.rating || '',
                storeBannerStatus: user.storeBannerStatus || 'pending',
                storeLogoStatus: user.storeLogoStatus || 'pending',
                photoStatus: user.photoStatus || 'pending',
                photo: user.photo || '',
                storeLogo: user.storeLogo || '',
                storeBanner: user.storeBanner || '',
                merchantVerifiedBy: user.merchantVerifiedBy || 'Mobile',
                additionalMobiles: user.additionalMobiles || []
            });
            setTempMobile('');
        } else {
            setEditingUser(null);
            setFormData({
                name: '',
                email: '',
                password: '',
                dob: '',
                gender: '',
                mobile: '',
                mobileVerified: true,
                education: '',
                educationIn: '',
                currentJob: '',
                jobExperience: '',
                note: '',
                storeName: '',
                actionType: 'call',
                accountStatus: 'review',
                verifiedBy: 'Mobile',
                location: '',
                category: '',
                pageName: '',
                merchantType: 'Free',
                rating: '',
                storeBannerStatus: 'pending',
                storeLogoStatus: 'pending',
                photoStatus: 'pending',
                photo: '',
                storeLogo: '',
                storeBanner: '',
                merchantVerifiedBy: 'Mobile',
                additionalMobiles: []
            });
            setTempMobile('');
        }
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({
            name: '',
            email: '',
            password: '',
            dob: '',
            gender: '',
            mobile: '',
            mobileVerified: true,
            education: '',
            educationIn: '',
            currentJob: '',
            jobExperience: '',
            note: '',
            storeName: '',
            actionType: 'call',
            accountStatus: 'review',
            verifiedBy: 'Mobile',
            location: '',
            category: '',
            pageName: '',
            merchantType: 'Free',
            rating: '',
            storeBannerStatus: 'pending',
            storeLogoStatus: 'pending',
            photoStatus: 'pending',
            photo: '',
            storeLogo: '',
            storeBanner: '',
            merchantVerifiedBy: 'Mobile',
            additionalMobiles: []
        });
        setTempMobile('');
        setSelectedFiles({});
    };

    const handleInputChange = (field: keyof UserFormData, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFiles(prev => ({ ...prev, [field]: file }));

            // Preview
            const reader = new FileReader();
            reader.onload = (event) => {
                handleInputChange(field as keyof UserFormData, event.target?.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setError('');
        try {
            const token = Cookies.get('adminToken');

            // Use FormData for image upload
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                const value = formData[key as keyof UserFormData];
                if (value !== undefined && key !== 'photo' && key !== 'storeLogo' && key !== 'storeBanner' && key !== 'additionalMobiles') {
                    data.append(key, String(value));
                }
            });

            // Append additionalMobiles
            if (formData.additionalMobiles && formData.additionalMobiles.length > 0) {
                formData.additionalMobiles.forEach(m => data.append('additionalMobiles[]', m));
            }

            // Append actual files
            if (selectedFiles.photo) data.append('photo', selectedFiles.photo);
            if (selectedFiles.storeLogo) data.append('storeLogo', selectedFiles.storeLogo);
            if (selectedFiles.storeBanner) data.append('storeBanner', selectedFiles.storeBanner);

            if (editingUser) {
                await axios.put(`${API_BASE}/${editingUser._id}`, data, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('User updated successfully');
            } else {
                await axios.post(API_BASE, data, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'multipart/form-data'
                    }
                });
                toast.success('User created successfully');
            }
            fetchUsers();
            handleCloseModal();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Operation failed');
            toast.error(err.response?.data?.message || 'Operation failed');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            const token = Cookies.get('adminToken');
            await axios.delete(`${API_BASE}/${id}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            setUsers(users.filter(u => u._id !== id));
            setSelectedUsers(prev => prev.filter(userId => userId !== id));
        } catch (err) {
            console.error("Failed to delete user", err);
        }
    };

    const handleBulkDelete = async () => {
        if (selectedUsers.length === 0) return;
        if (!confirm(`Are you sure you want to delete ${selectedUsers.length} selected users?`)) return;

        try {
            const token = Cookies.get('adminToken');
            // Assuming the backend supports bulk delete or we loop
            await Promise.all(selectedUsers.map(id =>
                axios.delete(`${API_BASE}/${id}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                })
            ));

            setUsers(users.filter(u => !selectedUsers.includes(u._id)));
            setSelectedUsers([]);
        } catch (err) {
            console.error("Failed to delete selected users", err);
            setError("Some users could not be deleted.");
        }
    };

    const toggleSelectUser = (id: string) => {
        setSelectedUsers(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => u._id));
        }
    };

    const filteredUsers = users.filter(user => {
        const matchesSearch =
            user.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.storeName?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesType =
            userTypeFilter === 'both' ||
            (userTypeFilter === 'seller' && user.merchantType !== 'User') ||
            (userTypeFilter === 'customer' && user.merchantType === 'User');

        return matchesSearch && matchesType;
    });

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'inactive': return 'bg-slate-100 text-slate-700 border-slate-200';
            case 'review':
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'active_message': return 'bg-teal-100 text-teal-700 border-teal-200';
            case 'inactive_message': return 'bg-orange-100 text-orange-700 border-orange-200';
            case 'r_delete': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-slate-100 text-slate-600 border-slate-200';
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return 'Active';
            case 'inactive': return 'Inactive';
            case 'review':
            case 'pending': return 'Review';
            case 'active_message': return 'Active & Message';
            case 'inactive_message': return 'Inactive & Message';
            case 'r_delete': return 'R-Delete';
            default: return status;
        }
    };

    return (
        <div className="bg-[#f1f5f9] min-h-screen font-['Tahoma','Verdana',sans-serif] text-xs p-2 flex flex-col gap-1">
            {/* Header / Nav Bar */}
            <div className="bg-white border border-slate-200 p-2 flex items-center justify-between rounded-t-sm shadow-sm">
                <div className="flex items-center gap-10">
                    <div className="flex items-center gap-2">
                        <button className="text-rose-500"><ArrowLeft className="w-3.5 h-3.5" strokeWidth={3} /></button>
                        <span className="font-bold text-blue-600 text-xs">Users</span>
                    </div>
                    <div className="text-slate-700 font-bold text-xs">Total Users ({users.length})</div>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex bg-slate-100 p-0.5 rounded-sm overflow-hidden border border-slate-200">
                        <button onClick={() => setUserTypeFilter('both')} className={cn("px-2 py-1 text-xs font-bold rounded-sm transition-colors", userTypeFilter === 'both' ? "bg-rose-500 text-white" : "text-slate-600")}>⇋ Both</button>
                        <button onClick={() => setUserTypeFilter('seller')} className={cn("px-2 py-1 text-xs font-bold rounded-sm transition-colors", userTypeFilter === 'seller' ? "bg-emerald-600 text-white" : "text-slate-600")}>Seller</button>
                        <button onClick={() => setUserTypeFilter('customer')} className={cn("px-2 py-1 text-xs font-bold rounded-sm transition-colors", userTypeFilter === 'customer' ? "bg-emerald-600 text-white" : "text-slate-600")}>Customer</button>
                    </div>
                    <button
                        onClick={handleBulkDelete}
                        className={cn(
                            "p-1.5 rounded-sm transition-all",
                            selectedUsers.length > 0 ? "bg-rose-600 text-white scale-110 shadow-lg" : "bg-rose-400 text-rose-100 cursor-not-allowed"
                        )}
                        disabled={selectedUsers.length === 0}
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => setShowSearchModal(true)} className="p-1.5 bg-emerald-600 text-white rounded-sm"><Search className="w-3.5 h-3.5" /></button>
                    <button onClick={() => handleOpenModal()} className="px-3 py-1.5 bg-indigo-600 text-white rounded-sm font-bold flex items-center gap-1 shadow-sm">+ Create User</button>
                </div>
            </div>

            {/* User List Table */}
            <div className="bg-white border-x border-b border-slate-200 shadow-sm overflow-hidden flex-1 no-scrollbar">
                <table className="w-full border-collapse">
                    <thead className="sticky top-0 bg-white z-10">
                        <tr className="border-b border-slate-200">
                            <th className="px-2 py-2 text-left w-10">
                                <input
                                    type="checkbox"
                                    className="w-3 h-3 cursor-pointer"
                                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                    onChange={toggleSelectAll}
                                />
                            </th>
                            <th className="px-2 py-2 text-left font-bold text-slate-700 uppercase tracking-tight">Id</th>
                            <th className="px-2 py-2 text-left font-bold text-slate-700 uppercase tracking-tight">M Name</th>
                            <th className="px-2 py-2 text-left font-bold text-slate-700 uppercase tracking-tight">Categorie</th>
                            <th className="px-2 py-2 text-left font-bold text-slate-700 uppercase tracking-tight">Location</th>
                            <th className="px-2 py-2 text-left font-bold text-slate-700 uppercase tracking-tight">Created Date</th>
                            <th className="px-2 py-2 text-left font-bold text-slate-700 uppercase tracking-tight w-28">Status</th>
                            <th className="px-2 py-2 text-center font-bold text-slate-700 uppercase tracking-tight">Rating</th>
                            <th className="px-2 py-2 text-center font-bold text-slate-700 uppercase tracking-tight">Edit by</th>
                            <th className="px-2 py-2 text-center font-bold text-slate-700 uppercase tracking-tight">Edit</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {loading ? (
                            <tr><td colSpan={10} className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600" /></td></tr>
                        ) : filteredUsers.map((user) => (
                            <tr key={user._id} className={cn("hover:bg-slate-50 transition-colors", selectedUsers.includes(user._id) && "bg-rose-50/50")}>
                                <td className="px-2 py-1.5">
                                    <input
                                        type="checkbox"
                                        className="w-3 h-3 cursor-pointer"
                                        checked={selectedUsers.includes(user._id)}
                                        onChange={() => toggleSelectUser(user._id)}
                                    />
                                </td>
                                <td className="px-2 py-1.5 font-bold text-xs text-slate-600">{user._id.slice(-8)}</td>
                                <td className="px-2 py-1.5 font-bold text-slate-800">{user.name}</td>
                                <td className="px-2 py-1.5 text-slate-600">{user.category}</td>
                                <td className="px-2 py-1.5 text-slate-600">{user.location}</td>
                                <td className="px-2 py-1.5 text-slate-600">{new Date(user.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'numeric', year: '2-digit' })}</td>
                                <td className="px-2 py-1.5">
                                    <select
                                        className="border border-slate-300 rounded-sm h-6 text-xs font-bold outline-none px-1 w-full bg-white"
                                        value={user.accountStatus}
                                        onChange={(e) => { }} // Handle status update
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">UnActive</option>
                                        <option value="review">Review</option>
                                        <option value="atv_msg">Atv & Msg</option>
                                        <option value="unatv_msg">UnA & Msg</option>
                                        <option value="r_delete">R-Delete</option>
                                    </select>
                                </td>
                                <td className="px-2 py-1.5 text-center font-bold text-slate-700">{user.rating || ''}</td>
                                <td className="px-2 py-1.5 text-center text-slate-500">Admin</td>
                                <td className="px-2 py-1.5 text-center">
                                    <button onClick={() => handleOpenModal(user)} className="text-blue-500 font-bold hover:underline">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* SEARCH MODAL */}
            <AnimatePresence>
                {
                    showSearchModal && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSearchModal(false)} className="absolute inset-0 bg-black/10" />
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white border border-slate-900 w-full max-w-4xl rounded-sm shadow-2xl relative z-10 p-4 font-['Tahoma','Verdana',sans-serif]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-bold text-slate-400">Searching</span>
                                    <button onClick={() => setShowSearchModal(false)}><X className="w-4 h-4 text-slate-400" /></button>
                                </div>

                                <div className="border border-slate-200 p-3 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                                        <div className="flex bg-slate-100 p-0.5 rounded-sm overflow-hidden border border-slate-200">
                                            <button className="px-2 py-1 bg-rose-500 text-white text-xs font-bold rounded-sm">Both</button>
                                            <button className="px-2 py-1 text-slate-600 text-xs font-bold">Seller</button>
                                            <button className="px-2 py-1 text-slate-600 text-xs font-bold">Customer</button>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <button className="p-1 bg-rose-500 text-white rounded-sm"><Trash2 className="w-3 h-3" /></button>
                                            <button className="p-1 bg-emerald-600 text-white rounded-sm"><Plus className="w-3 h-3" /></button>
                                            <button className="p-1 bg-emerald-600 text-white rounded-sm"><Search className="w-3 h-3" /></button>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-6 gap-3">
                                        {[
                                            { label: 'Seller ID', placeholder: 'ID...', value: searchQuery, onChange: setSearchQuery },
                                            { label: 'Mobile', placeholder: 'Mobile...', value: searchQuery, onChange: setSearchQuery },
                                            { label: 'Categorie', placeholder: 'Select', type: 'select' },
                                            { label: 'Sub Categorie', placeholder: 'Select', type: 'select' },
                                            { label: 'Sub Location', placeholder: 'Select', type: 'select' },
                                            { label: 'Active Status', placeholder: 'Select', type: 'select' }
                                        ].map((f, i) => (
                                            <div key={i} className="flex flex-col gap-0.5 border border-slate-200 p-1.5 rounded-sm">
                                                <label className="text-xs font-bold text-slate-400 uppercase leading-none">{f.label}</label>
                                                {f.type === 'select' ? (
                                                    <select className="text-xs font-bold text-slate-700 outline-none w-full bg-transparent h-4">
                                                        <option>{f.placeholder}</option>
                                                    </select>
                                                ) : (
                                                    <input
                                                        className="text-xs font-bold text-slate-700 outline-none w-full bg-transparent h-4"
                                                        placeholder={f.placeholder}
                                                        value={f.value || ''}
                                                        onChange={(e) => f.onChange?.(e.target.value)}
                                                    />
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-4 gap-3">
                                        {['Registration Date To', 'Registration Date From', 'Login Date from', 'Login Date till'].map((label, i) => (
                                            <div key={label} className="flex flex-col gap-0.5 border border-slate-200 p-1 rounded-sm">
                                                <label className="text-xs font-bold text-slate-400 uppercase leading-none">{label}</label>
                                                <div className="flex items-center gap-2 h-5">
                                                    <Calendar className="w-3 h-3 text-slate-300" />
                                                    <input type="text" className="text-xs font-bold text-slate-700 outline-none bg-transparent w-full" placeholder="15.8.21" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex bg-slate-100 p-0.5 rounded-sm overflow-hidden border border-slate-200">
                                            <button className="px-2 py-1 bg-slate-600 text-white text-xs font-bold rounded-sm"> Both</button>
                                            <button className="px-2 py-1 text-slate-600 text-xs font-bold">Seller</button>
                                            <button className="px-2 py-1 text-slate-600 text-xs font-bold">Customer</button>
                                        </div>
                                        <div className="flex gap-2">
                                            <button onClick={() => setShowSearchModal(false)} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-600 text-white text-xs font-bold rounded-sm shadow-sm"><X className="w-3 h-3" /> Hide Search</button>
                                            <button onClick={() => setShowSearchModal(false)} className="flex items-center gap-1.5 px-6 py-1.5 bg-emerald-600 text-white text-xs font-bold rounded-sm shadow-sm"><Search className="w-3 h-3" /> Search</button>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence>

            {/* ADD/EDIT MODAL */}
            <AnimatePresence>
                {
                    isModalOpen && (
                        <div className="fixed inset-0 z-[110] flex items-center justify-center p-2">
                            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleCloseModal} className="absolute inset-0 bg-black/10" />
                            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-white border border-slate-900 w-full max-w-5xl rounded-sm shadow-2xl relative z-10 flex flex-col max-h-[98vh] overflow-hidden font-['Tahoma','Verdana',sans-serif]">
                                <div className="bg-indigo-50/50 px-4 py-2 border-b border-slate-200">
                                    <span className="text-xs font-bold text-slate-500 uppercase">User Info <span className="text-slate-400 capitalize font-normal">(Edit or Add)</span></span>
                                </div>

                                <form onSubmit={handleSubmit} className="p-2.5 space-y-2.5 overflow-y-auto no-scrollbar">
                                    {/* Top Row: Basic Info and Mobile Info Combined for Horizontal Flow */}
                                    <div className="grid grid-cols-[1fr_1fr_1fr_1.2fr_1fr] gap-2">
                                        <div className="flex flex-col gap-0.5 border border-slate-200 p-1.5 rounded-sm relative">
                                            <label className="text-xs font-bold text-slate-400 uppercase leading-none">Person Name</label>
                                            <input className="text-xs font-bold text-slate-800 outline-none w-full bg-transparent h-5" value={formData.name} onChange={(e) => handleInputChange('name', e.target.value)} />
                                        </div>
                                        <div className="flex flex-col gap-0.5 border border-slate-200 p-1.5 rounded-sm bg-white">
                                            <label className="text-xs font-bold text-slate-400 uppercase leading-none">Account Status</label>
                                            <select className="text-xs font-bold text-slate-800 outline-none w-full bg-transparent h-5 appearance-none" value={formData.accountStatus} onChange={(e) => handleInputChange('accountStatus', e.target.value)}>
                                                <option value="active">Active</option>
                                                <option value="inactive">UnActive</option>
                                                <option value="review">Review</option>
                                                <option value="atv_msg">Atv & Msg</option>
                                                <option value="unatv_msg">UnA & Msg</option>
                                                <option value="r_delete">R-Delete</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-0.5 border border-slate-200 p-1.5 rounded-sm">
                                            <label className="text-xs font-bold text-slate-400 uppercase leading-none">Email</label>
                                            <input className="text-xs font-bold text-slate-800 outline-none w-full bg-transparent h-5" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
                                        </div>
                                        <div className="flex flex-col gap-0.5 border border-slate-200 p-1.5 rounded-sm bg-white">
                                            <div className="flex items-center gap-1 mb-0.5">
                                                <span className="text-xs font-bold text-slate-900 leading-none">Verified By</span>
                                                <div className="flex bg-slate-100 p-0.5 rounded-sm">
                                                    <span className="px-1 py-0.5 bg-blue-500 text-white text-xs font-bold rounded-[1px]">Select</span>
                                                </div>
                                            </div>
                                            <select className="text-xs font-bold text-slate-600 outline-none w-full bg-transparent h-4" value={formData.verifiedBy} onChange={(e) => handleInputChange('verifiedBy', e.target.value)}>
                                                <option value="Mobile">Mobile</option>
                                                <option value="Email">Email</option>
                                                <option value="Google">Google</option>
                                                <option value="Facebook">Facebook</option>
                                            </select>
                                        </div>
                                        <div className="flex flex-col gap-0.5 border border-slate-200 p-1.5 rounded-sm bg-white">
                                            <label className="text-xs font-bold text-slate-400 uppercase leading-none">Location</label>
                                            <select className="text-xs font-bold text-slate-800 outline-none w-full bg-transparent h-5 appearance-none" value={formData.location} onChange={(e) => handleInputChange('location', e.target.value)}>
                                                <option value="">Select Location</option>
                                                {locations.map(loc => (
                                                    <option key={loc._id} value={loc.name}>{loc.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    {/* Middle Row: Combined Grid for More Horizontal Spread */}
                                    <div className="grid grid-cols-[repeat(6,1fr)_1.5fr_1.5fr] gap-2">
                                        {/* DOB - Date Picker */}
                                        <div className="flex flex-col gap-0.5 border border-slate-200 p-1.5 rounded-sm bg-white">
                                            <label className="text-xs font-bold text-slate-400 uppercase leading-none">DOB</label>
                                            <input
                                                type="date"
                                                className="text-xs font-bold text-slate-800 outline-none w-full bg-transparent h-4 p-0 appearance-none"
                                                value={formData.dob}
                                                onChange={(e) => handleInputChange('dob', e.target.value)}
                                            />
                                        </div>

                                        {[
                                            { label: 'Gender', key: 'gender', type: 'select', opts: ['Male', 'Female', 'Other'] },
                                            { label: 'Edu', key: 'education', type: 'select', opts: ['Select', 'BSC', 'MSC', 'HSC', 'SSC'] },
                                            { label: 'In', key: 'educationIn', type: 'select', opts: ['Select', 'CSE', 'EEE', 'BBA'] },
                                            { label: 'Job', key: 'currentJob', type: 'select', opts: ['Select', 'Developer', 'Designer', 'Manager'] },
                                            { label: 'Exp', key: 'jobExperience', type: 'select', opts: ['Select', '1 Year', '2 Years', '5+ Years'] }
                                        ].map((f) => (
                                            <div key={f.key} className="flex flex-col gap-0.5 border border-slate-200 p-1.5 rounded-sm bg-white">
                                                <label className="text-xs font-bold text-slate-400 uppercase leading-none">{f.label}</label>
                                                <select
                                                    className="text-xs font-bold text-slate-800 outline-none w-full bg-transparent h-4 appearance-none"
                                                    value={formData[f.key as keyof UserFormData] as string}
                                                    onChange={(e) => handleInputChange(f.key as keyof UserFormData, e.target.value)}
                                                >
                                                    {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                                                </select>
                                            </div>
                                        ))}

                                        {/* Editable Verified Mobile */}
                                        <div className="flex flex-col gap-0.5 border border-slate-200 p-1.5 rounded-sm bg-white">
                                            <label className="text-xs font-bold text-slate-400 uppercase leading-none">Verified Mobile</label>
                                            <div className="flex items-center justify-between h-4 px-0.5">
                                                <div className="flex items-center gap-1 text-blue-500 font-bold text-xs w-full">
                                                    <ShieldCheck className="w-2.5 h-2.5 shrink-0" />
                                                    <input
                                                        className="w-full bg-transparent outline-none text-blue-600 font-bold"
                                                        value={formData.mobile}
                                                        onChange={(e) => handleInputChange('mobile', e.target.value)}
                                                        placeholder="017..."
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Editable Password */}
                                        <div className="flex flex-col gap-0.5 border border-slate-200 p-1.5 rounded-sm bg-white">
                                            <label className="text-xs font-bold text-slate-400 uppercase leading-none italic font-serif">Password</label>
                                            <input
                                                type="text"
                                                value={formData.password}
                                                onChange={(e) => handleInputChange('password', e.target.value)}
                                                placeholder="******"
                                                className="text-xs font-bold text-slate-800 outline-none w-full bg-transparent h-4"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-[1fr_2fr] gap-3">
                                        <div className="flex flex-col gap-0.5 border border-slate-200 p-1.5 rounded-sm bg-white h-12">
                                            <label className="text-xs font-bold text-slate-400 uppercase leading-none">Note</label>
                                            <textarea className="text-xs font-bold text-slate-700 outline-none w-full bg-transparent h-full resize-none leading-tight" value={formData.note} onChange={(e) => handleInputChange('note', e.target.value)} />
                                        </div>

                                        <div className="flex flex-col gap-0.5 border border-slate-200 p-1.5 rounded-sm bg-white min-h-[48px]">
                                            <label className="text-xs font-bold text-slate-400 uppercase leading-none">New Mobile number</label>

                                            {/* List of additional numbers */}
                                            {formData.additionalMobiles && formData.additionalMobiles.length > 0 && (
                                                <div className="flex flex-wrap gap-1 mt-1 mb-1">
                                                    {formData.additionalMobiles.map((m, i) => (
                                                        <span key={i} className="px-1.5 py-0.5 bg-slate-100 text-xs font-bold rounded flex items-center gap-1">
                                                            {m}
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    const newMobiles = [...(formData.additionalMobiles || [])];
                                                                    newMobiles.splice(i, 1);
                                                                    setFormData(prev => ({ ...prev, additionalMobiles: newMobiles }));
                                                                }}
                                                            >
                                                                <X className="w-2 h-2 text-rose-500" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}

                                            <div className="flex items-center gap-2 mt-auto">
                                                <input
                                                    className="text-xs font-bold text-slate-800 outline-none w-full bg-transparent border-b border-slate-100"
                                                    placeholder="01XXX XXXXXX"
                                                    value={tempMobile}
                                                    onChange={(e) => setTempMobile(e.target.value)}
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => {
                                                        if (tempMobile) {
                                                            setFormData(prev => ({
                                                                ...prev,
                                                                additionalMobiles: [...(prev.additionalMobiles || []), tempMobile]
                                                            }));
                                                            setTempMobile('');
                                                        }
                                                    }}
                                                    className="text-emerald-600 bg-emerald-50 p-1 rounded-full flex-shrink-0"
                                                >
                                                    <PlusCircle className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Merchant Section: Compact Heading */}
                                    <div className="bg-slate-100 px-3 py-1 border-y border-slate-200 mx-[-0.625rem]">
                                        <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
                                            <Store className="w-3 h-3" /> Merchant Information
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-[1.2fr_1fr_1fr_1fr_1fr_0.8fr] gap-2">
                                        <div className="border border-slate-200 p-1.5 rounded-sm relative bg-white">
                                            <label className="text-xs font-bold text-slate-300 uppercase absolute top-[-4px] left-1.5 bg-white px-0.5">Store Name</label>
                                            <input className="text-xs font-bold text-slate-800 outline-none w-full h-5 mt-1" value={formData.storeName} onChange={(e) => handleInputChange('storeName', e.target.value)} />
                                        </div>
                                        <div className="border border-slate-200 p-1.5 rounded-sm relative flex flex-col justify-center gap-0.5 bg-white">
                                            <label className="text-xs font-bold text-slate-400 uppercase absolute top-[-4px] left-1.5 bg-white px-0.5">Show Button</label>
                                            <select
                                                className="text-xs font-bold text-slate-700 outline-none w-full bg-transparent mt-1"
                                                value={formData.actionType}
                                                onChange={(e) => handleInputChange('actionType', e.target.value)}
                                            >
                                                <option value="call">Call Only</option>
                                                <option value="chat">Chat Only</option>
                                                <option value="both">Call & Chat</option>
                                            </select>
                                        </div>
                                        <div className="border border-slate-200 p-1.5 rounded-sm relative bg-white flex flex-col justify-center">
                                            <label className="text-xs font-bold text-slate-400 uppercase absolute top-[-4px] left-1.5 bg-white px-0.5">M-Verified By</label>
                                            <select className="text-xs font-bold text-slate-700 outline-none bg-transparent mt-1" value={formData.merchantVerifiedBy} onChange={(e) => handleInputChange('merchantVerifiedBy', e.target.value)}>
                                                <option value="Mobile">Mobile</option>
                                                <option value="NID">NID</option>
                                            </select>
                                        </div>
                                        <div className="border border-slate-200 p-1.5 rounded-sm relative bg-white flex flex-col justify-center">
                                            <label className="text-xs font-bold text-slate-400 uppercase absolute top-[-4px] left-1.5 bg-white px-0.5">Type</label>
                                            <select className="text-xs font-bold text-slate-700 outline-none bg-transparent mt-1" value={formData.merchantType} onChange={(e) => handleInputChange('merchantType', e.target.value)}>
                                                <option>Free</option>
                                                <option>Premium</option>
                                            </select>
                                        </div>
                                        <div className="border border-slate-200 p-1.5 rounded-sm relative bg-white flex flex-col justify-center">
                                            <label className="text-xs font-bold text-slate-400 uppercase absolute top-[-4px] left-1.5 bg-white px-0.5">Category</label>
                                            <select className="text-xs font-bold text-slate-700 outline-none bg-transparent mt-1" value={formData.category} onChange={(e) => handleInputChange('category', e.target.value)}>
                                                <option value="">Select</option>
                                                {categories.map(cat => (
                                                    <option key={cat._id} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="border border-slate-200 p-1.5 rounded-sm relative flex flex-col justify-center bg-white">
                                            <label className="text-xs font-bold text-slate-300 uppercase absolute top-[-4px] left-1.5 bg-white px-0.5">Rating</label>
                                            <input className="text-xs font-bold text-slate-800 outline-none w-full h-5 mt-1" value={formData.rating} onChange={(e) => handleInputChange('rating', e.target.value)} />
                                        </div>
                                    </div>

                                    <div className="border border-slate-200 p-1.5 rounded-sm relative flex items-center gap-2 bg-white">
                                        <label className="text-xs font-bold text-slate-400 uppercase absolute top-[-5px] left-2 bg-white px-1">Page Username</label>
                                        <span className="text-xs text-slate-400 italic">shadamon.com/</span>
                                        <input className="text-xs font-bold text-slate-800 outline-none flex-1 border-b border-slate-100 bg-transparent h-5" value={formData.pageName} onChange={(e) => handleInputChange('pageName', e.target.value)} />
                                        <div className="flex gap-1">
                                            <button className="bg-slate-50 text-slate-600 px-2 py-0.5 rounded-[1px] text-xs font-bold border border-slate-200 hover:bg-slate-100 transition-colors">Change</button>
                                            <button className="bg-indigo-600 text-white px-3 py-0.5 rounded-[1px] text-xs font-bold shadow-sm">Save</button>
                                        </div>
                                    </div>

                                    {/* Upload Area: Very Compact */}
                                    <div className="flex items-center gap-6 justify-between border border-slate-100 p-2 rounded-sm bg-slate-50/30">
                                        <div className="flex items-center gap-4">
                                            {[
                                                { label: 'User Image', key: 'photo' },
                                                { label: 'Shop Logo', key: 'storeLogo' },
                                                { label: 'Shop Banner', key: 'storeBanner' }
                                            ].map(u => (
                                                <div key={u.label} className="flex items-center gap-2">
                                                    <div className="flex flex-col">
                                                        <span className="text-xs font-bold text-slate-400 leading-none mb-1">{u.label}</span>
                                                        <label className="w-[80px] h-[50px] border border-dashed border-slate-300 rounded-sm bg-white flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-blue-400 transition-colors">
                                                            <input
                                                                type="file"
                                                                className="hidden"
                                                                accept="image/*"
                                                                onChange={(e) => handleFileChange(e, u.key)}
                                                            />
                                                            {formData[u.key as keyof UserFormData] ? (
                                                                <img
                                                                    src={formData[u.key as keyof UserFormData]?.toString().startsWith('data:') ? formData[u.key as keyof UserFormData] as string : `${API_BASE_URL}${formData[u.key as keyof UserFormData]}`}
                                                                    alt={u.label}
                                                                    className="w-full h-full object-cover"
                                                                    onError={(e) => {
                                                                        const target = e.target as HTMLImageElement;
                                                                        target.onerror = null;
                                                                        target.src = 'https://via.placeholder.com/80x50?text=Error';
                                                                    }}
                                                                />
                                                            ) : (
                                                                <ImageIcon className="w-5 h-5 text-slate-300 group-hover:text-blue-400" />
                                                            )}
                                                            <div className="absolute top-0.5 right-0.5 flex gap-0.5">
                                                                <div className="bg-slate-200 text-white p-0.5 rounded-full"><Minus className="w-2 h-2" /></div>
                                                                <div className="bg-blue-400 text-white p-0.5 rounded-full"><CheckCircle2 className="w-2 h-2" /></div>
                                                            </div>
                                                        </label>
                                                    </div>
                                                    <div className="flex flex-col gap-1">
                                                        <label className="flex items-center gap-1 cursor-pointer text-xs font-bold"><input type="radio" className="w-2 h-2" name={u.label + "status"} checked={formData[(u.key + 'Status') as keyof UserFormData] === 'approved'} onChange={() => handleInputChange((u.key + 'Status') as keyof UserFormData, 'approved')} /> ACC</label>
                                                        <label className="flex items-center gap-1 cursor-pointer text-xs font-bold text-rose-500"><input type="radio" className="w-2 h-2" name={u.label + "status"} checked={formData[(u.key + 'Status') as keyof UserFormData] === 'rejected'} onChange={() => handleInputChange((u.key + 'Status') as keyof UserFormData, 'rejected')} /> DEC</label>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-2 h-10 items-end">
                                            <button type="button" onClick={handleCloseModal} className="px-5 py-2 bg-[#d9534f] text-white font-black rounded-[2px] text-xs shadow-sm uppercase">Cancel</button>
                                            <button type="submit" className="px-10 py-2 bg-[#00a65a] text-white font-black rounded-[2px] text-xs shadow-sm uppercase flex items-center justify-center gap-2">
                                                {formLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-white" /> : 'Save Profile'}
                                            </button>
                                        </div>
                                    </div>
                                </form>
                            </motion.div>
                        </div>
                    )
                }
            </AnimatePresence>

            <style jsx global>{`
                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>
        </div>
    );
}
