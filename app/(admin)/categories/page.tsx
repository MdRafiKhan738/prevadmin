"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft, Search, Plus, Trash2, Edit2, CheckCircle2,
    Shuffle, X, Calendar, CircleDot, Loader2, Home, Minus,
    CheckCircle, XCircle, ChevronLeft
} from 'lucide-react';
import axios from 'axios';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { API_BASE_URL } from '../../../utils/apiConfig';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface Feature {
    _id: string;
    name: string;
    inputType: string;
    order: number;
    status: boolean;
    buttonType?: string;
    boxFadeName?: string;
    buttonItemNames?: string[];
}

interface Category {
    _id: string;
    name: string;
    inputType: string;
    order: number;
    status: boolean;
    icon?: string;
}

interface SubCategory {
    _id: string;
    name: string;
    category: Category;
    feature?: Feature;
    buttonType?: string;
    freePost?: string;
    order: number;
    status: boolean;
    image?: string;
    tags: string[];
    createdAt: string;
    createdBy?: { adminName: string };
}

export default function CategoriesPage() {
    const [subCategories, setSubCategories] = useState<SubCategory[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [features, setFeatures] = useState<Feature[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    // Modal States
    const [showMainModal, setShowMainModal] = useState(false);
    const [showCategoryModal, setShowCategoryModal] = useState(false);
    const [showFeatureModal, setShowFeatureModal] = useState(false);

    const [editingSubCatId, setEditingSubCatId] = useState<string | null>(null);
    const [editingCatId, setEditingCatId] = useState<string | null>(null);
    const [editingFeatId, setEditingFeatId] = useState<string | null>(null);

    // Form States - SubCategory (Main Modal)
    const [subCatForm, setSubCatForm] = useState({
        name: '',
        category: '',
        feature: '',
        buttonType: 'Call, Message, Send CV',
        freePost: 'Free Post',
        order: 1,
        status: true,
        tags: [''],
        image: null as File | null,
    });

    // Form States - Category
    const [catForm, setCatForm] = useState({
        name: '',
        inputType: 'Text',
        order: 1,
        status: true,
        icon: null as File | null,
    });

    // Form States - Feature
    const [featForm, setFeatForm] = useState({
        name: '',
        inputType: 'Text',
        order: 1,
        status: true,
        buttonType: 'Call, Message, Send CV',
        boxFadeName: '',
        buttonItemNames: [''],
    });

    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        fetchAllData();
    }, []);

    const fetchAllData = async () => {
        setIsLoading(true);
        try {
            const [scRes, cRes, fRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/categories/sub`),
                axios.get(`${API_BASE_URL}/api/categories`),
                axios.get(`${API_BASE_URL}/api/categories/features`)
            ]);
            setSubCategories(scRes.data.data);
            setCategories(cRes.data.data);
            setFeatures(fRes.data.data);
        } catch (error) {
            console.error('Fetch error:', error);
            toast.error('Failed to load data');
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubCatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const token = Cookies.get('adminToken');

        try {
            const formData = new FormData();
            formData.append('name', subCatForm.name);
            formData.append('category', subCatForm.category);
            formData.append('feature', subCatForm.feature);
            formData.append('buttonType', subCatForm.buttonType);
            formData.append('freePost', subCatForm.freePost);
            formData.append('order', String(subCatForm.order));
            formData.append('status', String(subCatForm.status));
            subCatForm.tags.filter(t => t.trim()).forEach(tag => formData.append('tags', tag));
            if (subCatForm.image) formData.append('image', subCatForm.image);

            if (editingSubCatId) {
                await axios.put(`${API_BASE_URL}/api/categories/sub/${editingSubCatId}`, formData, {
                    headers: { 'x-auth-token': token }
                });
                toast.success('SubCategory updated');
            } else {
                await axios.post(`${API_BASE_URL}/api/categories/sub`, formData, {
                    headers: { 'x-auth-token': token }
                });
                toast.success('SubCategory created');
            }
            setShowMainModal(false);
            setEditingSubCatId(null);
            fetchAllData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error saving SubCategory');
        } finally {
            setIsSaving(false);
        }
    };

    const handleCatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const token = Cookies.get('adminToken');
        try {
            const formData = new FormData();
            formData.append('name', catForm.name);
            formData.append('inputType', catForm.inputType);
            formData.append('order', String(catForm.order));
            formData.append('status', String(catForm.status));
            if (catForm.icon) formData.append('icon', catForm.icon);

            if (editingCatId) {
                await axios.put(`${API_BASE_URL}/api/categories/${editingCatId}`, formData, {
                    headers: { 'x-auth-token': token }
                });
                toast.success('Category updated');
            } else {
                await axios.post(`${API_BASE_URL}/api/categories`, formData, {
                    headers: { 'x-auth-token': token }
                });
                toast.success('Category created');
            }
            setShowCategoryModal(false);
            setEditingCatId(null);
            fetchAllData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error saving Category');
        } finally {
            setIsSaving(false);
        }
    };

    const handleFeatSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        const token = Cookies.get('adminToken');
        try {
            const payload = {
                ...featForm,
                buttonItemNames: featForm.buttonItemNames.filter(n => n.trim())
            };
            if (editingFeatId) {
                await axios.put(`${API_BASE_URL}/api/categories/features/${editingFeatId}`, payload, {
                    headers: { 'x-auth-token': token }
                });
                toast.success('Feature updated');
            } else {
                await axios.post(`${API_BASE_URL}/api/categories/features`, payload, {
                    headers: { 'x-auth-token': token }
                });
                toast.success('Feature created');
            }
            setShowFeatureModal(false);
            setEditingFeatId(null);
            fetchAllData();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Error saving Feature');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string, type: 'sub' | 'cat' | 'feat') => {
        if (!confirm('Are you sure you want to delete this item?')) return;
        const token = Cookies.get('adminToken');
        const urlMap = {
            sub: `${API_BASE_URL}/api/categories/sub/${id}`,
            cat: `${API_BASE_URL}/api/categories/${id}`,
            feat: `${API_BASE_URL}/api/categories/features/${id}`
        };
        try {
            await axios.delete(urlMap[type], { headers: { 'x-auth-token': token } });
            toast.success('Deleted successfully');
            fetchAllData();
        } catch (error: any) {
            toast.error('Failed to delete');
        }
    };

    const handleEditSubCat = (sc: SubCategory) => {
        setEditingSubCatId(sc._id);
        setSubCatForm({
            name: sc.name,
            category: sc.category._id,
            feature: sc.feature?._id || '',
            buttonType: sc.buttonType || 'Call, Message, Send CV',
            freePost: sc.freePost || 'Free Post',
            order: sc.order,
            status: sc.status,
            tags: sc.tags.length > 0 ? sc.tags : [''],
            image: null,
        });
        setShowMainModal(true);
    };

    const handleEditCat = (c: Category) => {
        setEditingCatId(c._id);
        setCatForm({
            name: c.name,
            inputType: c.inputType,
            order: c.order,
            status: c.status,
            icon: null,
        });
        setShowCategoryModal(true);
    };

    const handleEditFeat = (f: Feature) => {
        setEditingFeatId(f._id);
        setFeatForm({
            name: f.name,
            inputType: f.inputType,
            order: f.order,
            status: f.status,
            buttonType: f.buttonType || 'Call, Message, Send CV',
            boxFadeName: f.boxFadeName || '',
            buttonItemNames: f.buttonItemNames?.length ? f.buttonItemNames : [''],
        });
        setShowFeatureModal(true);
    };

    const openNewSubCat = () => {
        setEditingSubCatId(null);
        setSubCatForm({
            name: '',
            category: '',
            feature: '',
            buttonType: 'Call, Message, Send CV',
            freePost: 'Free Post',
            order: 1,
            status: true,
            tags: [''],
            image: null,
        });
        setShowMainModal(true);
    };

    const openNewCat = () => {
        setEditingCatId(null);
        setCatForm({
            name: '',
            inputType: 'Text',
            order: 1,
            status: true,
            icon: null,
        });
        setShowCategoryModal(true);
    };

    const openNewFeat = () => {
        setEditingFeatId(null);
        setFeatForm({
            name: '',
            inputType: 'Text',
            order: 1,
            status: true,
            buttonType: 'Call, Message, Send CV',
            boxFadeName: '',
            buttonItemNames: [''],
        });
        setShowFeatureModal(true);
    };

    const filteredSubCategories = subCategories.filter(sc =>
        sc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.category?.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-[#f1f5f9] min-h-screen p-4 font-['Tahoma','Verdana',sans-serif]">
            {/* Breadcrumb Area */}
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mb-3 ml-1">
                <Home className="w-3 h-3" />
                <span>/</span>
                <span>Manage Categories</span>
            </div>

            {/* Header Area */}
            <div className="bg-white rounded-t-lg border border-slate-200 p-2.5 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button className="text-rose-500 hover:opacity-80 transition-opacity">
                        <ArrowLeft className="w-4 h-4 stroke-[3]" />
                    </button>
                    <span className="text-indigo-600 font-bold text-[13px] tracking-tight">Categories</span>
                </div>

                <div className="text-slate-900 text-[12px] font-medium">
                    Total Categories <span className="font-bold">({subCategories.length})</span>
                </div>

                <button
                    onClick={openNewSubCat}
                    className="bg-[#2ecc71] hover:bg-[#27ae60] text-white p-1 rounded transition-all shadow-sm"
                >
                    <Plus className="w-4 h-4 stroke-[3]" />
                </button>
            </div>

            {/* Table Area */}
            <div className="bg-white border-x border-b border-slate-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-[11px] border-collapse">
                        <thead>
                            <tr className="bg-white text-slate-800 font-bold border-b border-slate-100">
                                <th className="px-5 py-3 font-bold w-1/4">Sub Category name</th>
                                <th className="px-5 py-3 font-bold">Category name</th>
                                <th className="px-5 py-3 font-bold text-center w-24">Order</th>
                                <th className="px-5 py-3 font-bold text-center w-24">Status</th>
                                <th className="px-5 py-3 font-bold w-48">Entry date</th>
                                <th className="px-5 py-3 font-bold">Created by</th>
                                <th className="px-5 py-3 text-center w-12"><Edit2 className="w-3.5 h-3.5 mx-auto" /></th>
                                <th className="px-5 py-3 text-center w-12"><Trash2 className="w-3.5 h-3.5 mx-auto" /></th>
                            </tr>
                        </thead>
                        <tbody className="text-slate-600 font-medium">
                            {isLoading ? (
                                <tr><td colSpan={8} className="py-20 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto text-blue-500" /></td></tr>
                            ) : filteredSubCategories.length === 0 ? (
                                <tr><td colSpan={8} className="py-12 text-center text-slate-400 italic">No subcategories found</td></tr>
                            ) : filteredSubCategories.map((sc) => (
                                <tr key={sc._id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                                    <td className="px-5 py-2.5 text-slate-900 font-bold">{sc.name}</td>
                                    <td className="px-5 py-2.5 text-slate-700 font-bold">{sc.category?.name}</td>
                                    <td className="px-5 py-2.5 text-center">{sc.order}</td>
                                    <td className="px-5 py-2.5 text-center">
                                        {sc.status ? (
                                            <CheckCircle2 className="w-4 h-4 text-[#2ecc71] mx-auto fill-emerald-50" />
                                        ) : (
                                            <XCircle className="w-4 h-4 text-[#e74c3c] mx-auto fill-rose-50" />
                                        )}
                                    </td>
                                    <td className="px-5 py-2.5 text-slate-500">
                                        {new Date(sc.createdAt).toLocaleDateString('en-GB') + ' ' + new Date(sc.createdAt).toLocaleTimeString('en-GB')}
                                    </td>
                                    <td className="px-5 py-2.5 text-slate-500">{sc.createdBy?.adminName || 'System'}</td>
                                    <td className="px-5 py-2.5 text-center">
                                        <button onClick={() => handleEditSubCat(sc)} className="text-slate-400 hover:text-indigo-600 transition-colors">
                                            <Edit2 className="w-3.5 h-3.5 mx-auto" strokeWidth={2.5} />
                                        </button>
                                    </td>
                                    <td className="px-5 py-2.5 text-center">
                                        <button onClick={() => handleDelete(sc._id, 'sub')} className="text-slate-400 hover:text-rose-500 transition-colors">
                                            <Trash2 className="w-3.5 h-3.5 mx-auto" strokeWidth={2.5} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Main Modal - New Category */}
            <AnimatePresence>
                {showMainModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowMainModal(false)} className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" />

                        <motion.div
                            initial={{ scale: 0.98, opacity: 0, y: 10 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.98, opacity: 0, y: 10 }}
                            className="bg-white border-[1.5px] border-slate-900 w-full max-w-[850px] rounded-sm shadow-2xl relative z-10 flex flex-col"
                        >
                            <div className="flex justify-between items-center p-2 border-b border-slate-200 bg-slate-50">
                                <div className="flex items-center gap-2 font-bold text-[11px] text-slate-800 uppercase">
                                    <CircleDot className="w-4 h-4" /> {editingSubCatId ? 'Edit category' : 'New category'}
                                </div>
                                <button onClick={() => setShowMainModal(false)} className="hover:bg-slate-200 p-1 rounded transition-colors text-slate-400">
                                    <X className="w-4 h-4" />
                                </button>
                            </div>

                            <div className="p-4 flex gap-6 overflow-hidden">
                                {/* Left/Middle Column Form */}
                                <form onSubmit={handleSubCatSubmit} className="flex-1 grid grid-cols-2 gap-x-6 gap-y-3 text-[11px]">
                                    {/* Sub Category Name */}
                                    <div className="space-y-1 col-span-1">
                                        <label className="text-slate-500 font-bold">Sub Catagorie Name</label>
                                        <div className="flex gap-1">
                                            <input type="text" className="flex-1 border border-slate-300 px-2 py-1.5 outline-none font-medium bg-[#f9fbff]"
                                                value={subCatForm.name} onChange={e => setSubCatForm({ ...subCatForm, name: e.target.value })} required />
                                            <button type="button" className="p-1 px-2 border border-slate-900 bg-white hover:bg-slate-50"><Plus className="w-3 h-3 stroke-[3]" /></button>
                                            <button type="button" className="p-1 px-2 border border-slate-900 bg-white hover:bg-slate-50"><Minus className="w-3 h-3 stroke-[3]" /></button>
                                        </div>
                                    </div>

                                    {/* Button Type */}
                                    <div className="space-y-1 col-span-1">
                                        <label className="text-slate-500 font-bold">Button Type</label>
                                        <select className="w-full border border-slate-300 px-2 py-1.5 outline-none font-medium bg-[#f9fbff]"
                                            value={subCatForm.buttonType} onChange={e => setSubCatForm({ ...subCatForm, buttonType: e.target.value })}>
                                            <option>Call, Message, Send CV</option>
                                            <option>Call Only</option>
                                            <option>In-App Message</option>
                                        </select>
                                    </div>

                                    {/* Categories Dropdown */}
                                    <div className="space-y-1 col-span-1">
                                        <label className="text-slate-500 font-bold">Catagorie</label>
                                        <select className="w-full border border-slate-300 px-2 py-1.5 outline-none font-medium bg-white"
                                            value={subCatForm.category} onChange={e => setSubCatForm({ ...subCatForm, category: e.target.value })} required>
                                            <option value="">Select Category</option>
                                            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                        </select>
                                    </div>

                                    {/* Free Post */}
                                    <div className="space-y-1 col-span-1">
                                        <label className="text-slate-500 font-bold opacity-0 invisible">Free Post</label>
                                        <input type="text" className="w-full border border-slate-300 px-2 py-1.5 outline-none font-medium bg-[#f9fbff]"
                                            value={subCatForm.freePost} onChange={e => setSubCatForm({ ...subCatForm, freePost: e.target.value })} />
                                    </div>

                                    {/* Feature Name */}
                                    <div className="space-y-1 col-span-1">
                                        <label className="text-slate-500 font-bold">Feature Name</label>
                                        <select className="w-full border border-slate-300 px-2 py-1.5 outline-none font-medium bg-white"
                                            value={subCatForm.feature} onChange={e => setSubCatForm({ ...subCatForm, feature: e.target.value })}>
                                            <option value="">Select Feature</option>
                                            {features.map(f => <option key={f._id} value={f._id}>{f.name}</option>)}
                                        </select>
                                    </div>

                                    {/* Order */}
                                    <div className="space-y-1 col-span-1">
                                        <label className="text-slate-500 font-bold opacity-0 invisible">Order</label>
                                        <input type="number" className="w-full border border-slate-300 px-2 py-1.5 outline-none font-medium bg-[#f9fbff]"
                                            value={subCatForm.order} onChange={e => setSubCatForm({ ...subCatForm, order: Number(e.target.value) })} />
                                    </div>

                                    {/* Tag Name */}
                                    <div className="space-y-1 col-span-1">
                                        <label className="text-slate-500 font-bold">Tag Name</label>
                                        <div className="flex gap-1">
                                            <input type="text" className="flex-1 border border-slate-300 px-2 py-1.5 outline-none font-medium bg-white"
                                                value={subCatForm.tags[0]} onChange={e => {
                                                    const newTags = [...subCatForm.tags];
                                                    newTags[0] = e.target.value;
                                                    setSubCatForm({ ...subCatForm, tags: newTags });
                                                }} />
                                            <button type="button" className="p-1 px-2 border border-slate-900 bg-white hover:bg-slate-50"><Plus className="w-3 h-3 stroke-[3]" /></button>
                                            <button type="button" className="p-1 px-2 border border-slate-900 bg-white hover:bg-slate-50"><Minus className="w-3 h-3 stroke-[3]" /></button>
                                        </div>
                                    </div>

                                    {/* Date and File */}
                                    <div className="space-y-1 col-span-1 flex flex-col justify-end">
                                        <div className="bg-[#f0f0f0] border border-slate-300 text-slate-500 px-2 py-1.5 text-center mb-1">
                                            {new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB')}
                                        </div>
                                        <div className="flex gap-1">
                                            <label className="bg-white border border-slate-300 px-2 py-1 cursor-pointer hover:bg-slate-50 font-bold whitespace-nowrap">
                                                Choose File
                                                <input type="file" className="hidden" onChange={e => setSubCatForm({ ...subCatForm, image: e.target.files?.[0] || null })} />
                                            </label>
                                            <span className="text-slate-400 self-center truncate max-w-[100px]">{subCatForm.image ? subCatForm.image.name : 'No file chosen'}</span>
                                        </div>
                                    </div>

                                    {/* Status */}
                                    <div className="col-span-1"></div>
                                    <div className="col-span-1 flex items-center gap-4 py-1">
                                        <span className="text-slate-900 font-bold">Status</span>
                                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                                            <input type="radio" name="subcat-status" checked={subCatForm.status} onChange={() => setSubCatForm({ ...subCatForm, status: true })} className="w-3 h-3 accent-blue-600" /> Yes
                                        </label>
                                        <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                                            <input type="radio" name="subcat-status" checked={!subCatForm.status} onChange={() => setSubCatForm({ ...subCatForm, status: false })} className="w-3 h-3 accent-blue-600" /> No
                                        </label>
                                    </div>

                                    {/* Form Buttons */}
                                    <div className="col-span-2 pt-6 flex gap-2">
                                        <button type="submit" className="bg-[#127ef3] text-white flex-1 py-1.5 font-bold rounded-sm border border-blue-800 hover:bg-blue-600 shadow-inner">
                                            {isSaving ? 'Processing...' : 'Save'}
                                        </button>
                                        <button type="button" onClick={() => setShowMainModal(false)} className="bg-white text-slate-600 px-6 py-1.5 font-bold rounded-sm border border-slate-300 hover:bg-slate-50">
                                            Cancel
                                        </button>
                                    </div>
                                </form>

                                {/* Right Column Tables */}
                                <div className="w-[340px] flex flex-col gap-4 border-l border-slate-200 pl-6 h-full overflow-y-auto max-h-[450px] pr-2 custom-scrollbar">
                                    {/* Category Section */}
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Create Catagorie</span>
                                            <button onClick={openNewCat} className="bg-white border border-slate-400 p-0.5 px-2 hover:bg-slate-50">
                                                <Plus className="w-3 h-3 stroke-[3]" />
                                            </button>
                                        </div>
                                        <div className="border border-slate-200 rounded-sm">
                                            <table className="w-full text-[10px] text-left border-collapse">
                                                <thead className="bg-[#f8f9fa] border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-2 py-2 font-bold whitespace-nowrap">Catagorie Name</th>
                                                        <th className="px-2 py-2 font-bold">Inpute</th>
                                                        <th className="px-2 py-2 font-bold text-center">Order</th>
                                                        <th className="px-2 py-2 font-bold text-center">Status</th>
                                                        <th className="w-6 px-1 py-2 text-center"></th>
                                                        <th className="w-6 px-1 py-2 text-center"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {categories.map(c => (
                                                        <tr key={c._id}>
                                                            <td className="px-2 py-1.5 font-bold text-slate-800">{c.name}</td>
                                                            <td className="px-2 py-1.5">{c.inputType}</td>
                                                            <td className="px-2 py-1.5 text-center">{c.order}</td>
                                                            <td className="px-2 py-1.5 text-center">
                                                                <CheckCircle2 className={cn("w-3 h-3 mx-auto", c.status ? "text-green-500" : "text-slate-300")} />
                                                            </td>
                                                            <td className="px-1 py-1.5"><Edit2 onClick={() => handleEditCat(c)} className="w-3 h-3 text-slate-800 cursor-pointer" /></td>
                                                            <td className="px-1 py-1.5"><Trash2 onClick={() => handleDelete(c._id, 'cat')} className="w-3 h-3 text-slate-800 cursor-pointer" /></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>

                                    {/* Feature Section */}
                                    <div className="space-y-2 pb-4">
                                        <div className="flex justify-between items-center px-1">
                                            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-tighter">Create Feature</span>
                                            <button onClick={openNewFeat} className="bg-white border border-slate-400 p-0.5 px-2 hover:bg-slate-50">
                                                <Plus className="w-3 h-3 stroke-[3]" />
                                            </button>
                                        </div>
                                        <div className="border border-slate-200 rounded-sm">
                                            <table className="w-full text-[10px] text-left border-collapse">
                                                <thead className="bg-[#f8f9fa] border-b border-slate-200">
                                                    <tr>
                                                        <th className="px-2 py-2 font-bold whitespace-nowrap">Feature name</th>
                                                        <th className="px-2 py-2 font-bold">Inpute</th>
                                                        <th className="px-2 py-2 font-bold text-center">Order</th>
                                                        <th className="px-2 py-2 font-bold text-center">Status</th>
                                                        <th className="w-6 px-1 py-2 text-center"></th>
                                                        <th className="w-6 px-1 py-2 text-center"></th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {features.map(f => (
                                                        <tr key={f._id}>
                                                            <td className="px-2 py-1.5 font-bold text-slate-800">{f.name}</td>
                                                            <td className="px-2 py-1.5">{f.inputType}</td>
                                                            <td className="px-2 py-1.5 text-center">{f.order}</td>
                                                            <td className="px-2 py-1.5 text-center">
                                                                <CheckCircle2 className={cn("w-3 h-3 mx-auto", f.status ? "text-green-500" : "text-slate-300")} />
                                                            </td>
                                                            <td className="px-1 py-1.5"><Edit2 className="w-3 h-3 text-slate-800 cursor-pointer" /></td>
                                                            <td className="px-1 py-1.5"><Trash2 className="w-3 h-3 text-slate-800 cursor-pointer" /></td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Nested - Create Category Modal */}
                            <AnimatePresence>
                                {showCategoryModal && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                        className="absolute -bottom-[20px] left-0 w-full p-4 flex justify-center z-[110]"
                                    >
                                        <div className="bg-white border-[1.5px] border-slate-900 w-full max-w-[700px] shadow-2xl rounded-sm">
                                            <div className="flex justify-between items-center p-2 border-b border-slate-200 bg-slate-50">
                                                <div className="flex items-center gap-2 font-bold text-[11px] text-slate-800 uppercase">
                                                    <CircleDot className="w-4 h-4" /> {editingCatId ? 'Edit Catagorie' : 'Catagorie Name'}
                                                </div>
                                                <button onClick={() => setShowCategoryModal(false)} className="text-slate-400 p-1"><X className="w-4 h-4" /></button>
                                            </div>
                                            <form onSubmit={handleCatSubmit} className="p-4 grid grid-cols-2 gap-x-12 gap-y-3 text-[11px]">
                                                <div className="space-y-1">
                                                    <input type="text" placeholder="Catagorie Name" className="w-full border border-slate-300 px-2 py-1.5 outline-none font-medium bg-white"
                                                        value={catForm.name} onChange={e => setCatForm({ ...catForm, name: e.target.value })} required />
                                                </div>
                                                <div className="flex gap-2">
                                                    <label className="bg-white border border-slate-300 px-3 py-1 cursor-pointer hover:bg-slate-50 font-bold self-start">
                                                        Choose File
                                                        <input type="file" className="hidden" onChange={e => setCatForm({ ...catForm, icon: e.target.files?.[0] || null })} />
                                                    </label>
                                                    <span className="text-slate-400 self-center">{catForm.icon ? catForm.icon.name : 'No file chosen'}</span>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="border border-slate-200 px-2 py-1.5 bg-[#f4f4f4] text-slate-500">
                                                        {new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB')}
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4">
                                                    <span className="text-slate-900 font-bold lowercase">Status</span>
                                                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                                                        <input type="radio" checked={catForm.status} onChange={() => setCatForm({ ...catForm, status: true })} className="w-3 h-3 accent-blue-600" /> Yes
                                                    </label>
                                                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                                                        <input type="radio" checked={!catForm.status} onChange={() => setCatForm({ ...catForm, status: false })} className="w-3 h-3 accent-blue-600" /> No
                                                    </label>
                                                </div>
                                                <div className="space-y-1">
                                                    <input type="number" placeholder="Ordering" className="w-full border border-slate-300 px-2 py-1.5 outline-none font-medium bg-white text-slate-900"
                                                        value={catForm.order} onChange={e => setCatForm({ ...catForm, order: Number(e.target.value) })} />
                                                </div>
                                                <div className="flex gap-2 h-max self-end mt-1">
                                                    <button type="submit" className="bg-[#127ef3] text-white flex-1 py-1.5 font-bold rounded-sm border border-blue-800 shadow-inner px-12">
                                                        Save
                                                    </button>
                                                    <button type="button" onClick={() => setShowCategoryModal(false)} className="bg-white text-slate-600 px-8 py-1.5 font-bold rounded-sm border border-slate-300">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Nested - Create Feature Modal */}
                            <AnimatePresence>
                                {showFeatureModal && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }}
                                        className="absolute -bottom-[20px] left-0 w-full p-4 flex justify-center z-[110]"
                                    >
                                        <div className="bg-white border-[1.5px] border-slate-900 w-full max-w-[700px] shadow-2xl rounded-sm">
                                            <div className="flex justify-between items-center p-2 border-b border-slate-200 bg-slate-50">
                                                <div className="flex items-center gap-2 font-bold text-[11px] text-slate-800 uppercase">
                                                    <CircleDot className="w-4 h-4" /> New Feature
                                                </div>
                                                <button onClick={() => setShowFeatureModal(false)} className="text-slate-400 p-1"><X className="w-4 h-4" /></button>
                                            </div>
                                            <form onSubmit={handleFeatSubmit} className="p-4 grid grid-cols-2 gap-x-12 gap-y-3 text-[11px]">
                                                <div className="space-y-1">
                                                    <input type="text" placeholder="Feature Name" className="w-full border border-slate-300 px-2 py-1.5 outline-none font-medium"
                                                        value={featForm.name} onChange={e => setFeatForm({ ...featForm, name: e.target.value })} required />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="border border-slate-200 px-2 py-1.5 bg-[#f4f4f4] text-slate-500 text-center">
                                                        {new Date().toLocaleDateString('en-GB') + ' ' + new Date().toLocaleTimeString('en-GB')}
                                                    </div>
                                                </div>
                                                <div className="space-y-1">
                                                    <select className="w-full border border-slate-300 px-2 py-1.5 outline-none font-medium bg-white"
                                                        value={featForm.buttonType} onChange={e => setFeatForm({ ...featForm, buttonType: e.target.value })}>
                                                        <option>Button Type</option>
                                                        <option>Call, Message, Send CV</option>
                                                        <option>Apply Now</option>
                                                    </select>
                                                </div>
                                                <div className="space-y-1">
                                                    <input type="number" placeholder="Ordering" className="w-full border border-slate-300 px-2 py-1.5 outline-none font-medium"
                                                        value={featForm.order} onChange={e => setFeatForm({ ...featForm, order: Number(e.target.value) })} />
                                                </div>
                                                <div className="space-y-1">
                                                    <input type="text" placeholder="Box Fade Name" className="w-full border border-slate-300 px-2 py-1.5 outline-none font-medium"
                                                        value={featForm.boxFadeName} onChange={e => setFeatForm({ ...featForm, boxFadeName: e.target.value })} />
                                                </div>
                                                <div className="flex items-center gap-4 mt-1">
                                                    <span className="text-slate-900 font-bold lowercase">Status</span>
                                                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                                                        <input type="radio" checked={featForm.status} onChange={() => setFeatForm({ ...featForm, status: true })} className="w-3 h-3 accent-blue-600" /> Yes
                                                    </label>
                                                    <label className="flex items-center gap-1.5 cursor-pointer font-bold text-slate-800">
                                                        <input type="radio" checked={!featForm.status} onChange={() => setFeatForm({ ...featForm, status: false })} className="w-3 h-3 accent-blue-600" /> No
                                                    </label>
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex gap-1">
                                                        <input type="text" placeholder="Button Item Name" className="flex-1 border border-slate-300 px-2 py-1.5 outline-none font-medium"
                                                            value={featForm.buttonItemNames[0]} onChange={e => {
                                                                const newItems = [...featForm.buttonItemNames];
                                                                newItems[0] = e.target.value;
                                                                setFeatForm({ ...featForm, buttonItemNames: newItems });
                                                            }} />
                                                        <button type="button" className="p-1 px-2 border border-slate-900 bg-white hover:bg-slate-50"><Plus className="w-3 h-3 stroke-[3]" /></button>
                                                        <button type="button" className="p-1 px-2 border border-slate-900 bg-white hover:bg-slate-50"><Minus className="w-3 h-3 stroke-[3]" /></button>
                                                    </div>
                                                </div>
                                                <div className="flex gap-2 h-max self-end mt-1">
                                                    <button type="submit" className="bg-[#127ef3] text-white flex-1 py-1.5 font-bold rounded-sm border border-blue-800 shadow-inner px-12">
                                                        Save
                                                    </button>
                                                    <button type="button" onClick={() => setShowFeatureModal(false)} className="bg-white text-slate-600 px-8 py-1.5 font-bold rounded-sm border border-slate-300">
                                                        Cancel
                                                    </button>
                                                </div>
                                            </form>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: #f1f1f1;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 2px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #94a3b8;
                }
            `}</style>
        </div>
    );
}
