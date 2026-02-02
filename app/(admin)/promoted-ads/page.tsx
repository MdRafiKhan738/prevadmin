"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import {
    Search, Plus, X, Edit2, Check, ArrowLeft, Calendar,
    MoreHorizontal, LayoutGrid, ChevronDown, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { API_BASE_URL } from '@/utils/apiConfig';
import toast from 'react-hot-toast';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface PromotionPlan {
    _id?: string;
    subCategories: string[];
    amount: string;
    reach: string;
    traffic: string;
    minReach: string;
    minTraffic: string;
    gapAmount: string;
    isEditing?: boolean;
}

export default function PromotedAdsPage() {
    const [plans, setPlans] = useState<PromotionPlan[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Manual Promotion State
    const [manualPromote, setManualPromote] = useState({
        productId: '',
        adType: 'Free',
        amount: '',
        runTill: ''
    });
    const [savingId, setSavingId] = useState<string | number | null>(null);
    const [manualSaving, setManualSaving] = useState(false);

    // Premier Opportunity State
    const [premierSettings, setPremierSettings] = useState({
        verifyBadgePrice: 0,
        highlightPostPrice: 0,
        addLabelPrice: 0,
        freeAdCredit: 0
    });
    const [premierSaving, setPremierSaving] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const token = Cookies.get('adminToken');
            const [plansRes, subCatRes, premierRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/admins/promotion-plans`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
                }).catch(() => ({ data: [] })),
                axios.get(`${API_BASE_URL}/api/categories/sub`),
                axios.get(`${API_BASE_URL}/api/premier-opportunity`, {
                    headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
                }).catch(() => ({ data: { data: {} } }))
            ]);

            setPlans(plansRes.data.length > 0 ? plansRes.data : [{
                subCategories: [],
                amount: '',
                reach: '',
                traffic: '',
                minReach: '',
                minTraffic: '',
                gapAmount: ''
            }]);

            const allSubs = subCatRes.data.data?.map((sc: any) => sc.name) || [];
            setCategories(allSubs);

            if (premierRes && premierRes.data && premierRes.data.data) {
                const settings = premierRes.data.data;
                setPremierSettings({
                    verifyBadgePrice: settings.verifyBadgePrice || 0,
                    highlightPostPrice: settings.highlightPostPrice || 0,
                    addLabelPrice: settings.addLabelPrice || 0,
                    freeAdCredit: settings.freeAdCredit || 0
                });
            }

        } catch (err) {
            console.error("Fetch error:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPlan = () => {
        setPlans([...plans, {
            subCategories: [],
            amount: '',
            reach: '',
            traffic: '',
            minReach: '',
            minTraffic: '',
            gapAmount: '',
            isEditing: true
        }]);
    };

    const handleRemovePlan = (index: number) => {
        if (plans.length === 1) return;
        const newPlans = [...plans];
        newPlans.splice(index, 1);
        setPlans(newPlans);
    };

    const updatePlan = (index: number, field: keyof PromotionPlan, value: any) => {
        const newPlans = [...plans];
        (newPlans[index] as any)[field] = value;
        setPlans(newPlans);
    };

    const handleSavePlan = async (index: number) => {
        const plan = plans[index];
        setSavingId(index);
        try {
            const token = Cookies.get('adminToken');
            if (plan._id) {
                await axios.put(`${API_BASE_URL}/api/admins/promotion-plans/${plan._id}`, plan, {
                    headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
                });
            } else {
                const res = await axios.post(`${API_BASE_URL}/api/admins/promotion-plans`, plan, {
                    headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
                });
                const newPlans = [...plans];
                newPlans[index]._id = res.data._id;
                setPlans(newPlans);
            }
            updatePlan(index, 'isEditing', false);
            toast.success("Package saved successfully!");
            fetchData();
        } catch (err) {
            toast.error("Failed to save Package");
        } finally {
            setSavingId(null);
        }
    };

    const handleManualPromote = async () => {
        if (!manualPromote.productId) return toast.error("Product ID is required");
        setManualSaving(true);
        try {
            const token = Cookies.get('adminToken');
            await axios.post(`${API_BASE_URL}/api/admins/manual-promote`, manualPromote, {
                headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
            });
            toast.success("Ad promoted successfully!");
            setManualPromote({ productId: '', adType: 'Free', amount: '', runTill: '' });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to promote ad");
        } finally {
            setManualSaving(false);
        }
    };

    const handleSavePremier = async () => {
        setPremierSaving(true);
        try {
            const token = Cookies.get('adminToken');
            await axios.put(`${API_BASE_URL}/api/premier-opportunity`, premierSettings, {
                headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
            });
            toast.success("Premier settings updated!");
        } catch (err: any) {
            toast.error("Failed to update settings");
        } finally {
            setPremierSaving(false);
        }
    };

    return (
        <div className="bg-[#f1f5f9] min-h-screen p-3 font-['Tahoma','Verdana',sans-serif] text-xs">
            {/* Header */}
            <div className="flex items-center gap-3 mb-4">
                <button className="text-rose-500 bg-white p-1 rounded-sm border border-slate-200">
                    <ArrowLeft className="w-3.5 h-3.5" strokeWidth={3} />
                </button>
                <h1 className="text-sm font-bold text-blue-700">Promote Plan</h1>
            </div>

            {/* Promote Plan Section */}
            <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden mb-6 max-w-6xl">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-left border-b border-slate-200 bg-white">
                                <th className="px-2 py-2 font-bold text-slate-800 text-xs w-[22%]">Sub Categorie</th>
                                <th className="px-2 py-2 font-bold text-slate-800 text-xs text-center border-l border-slate-100 uppercase">Amount</th>
                                <th className="px-2 py-2 font-bold text-slate-800 text-xs text-center border-l border-slate-100" colSpan={2}>
                                    <div className="text-xs uppercase">View</div>
                                    <div className="flex justify-around text-xs font-normal text-slate-400 mt-0.5">
                                        <span className="w-1/2">Reach</span>
                                        <span className="w-1/2">Trafic</span>
                                    </div>
                                </th>
                                <th className="px-2 py-2 font-bold text-slate-800 text-xs text-center border-l border-slate-100" colSpan={2}>
                                    <div className="text-xs uppercase">Min Amount</div>
                                    <div className="flex justify-around text-xs font-normal text-slate-400 mt-0.5">
                                        <span className="w-1/2">Reach</span>
                                        <span className="w-1/2">Trafic</span>
                                    </div>
                                </th>
                                <th className="px-2 py-2 font-bold text-slate-800 text-xs text-center border-l border-slate-100 whitespace-nowrap uppercase">Gap 'to Amount'</th>
                                <th className="px-2 py-2 font-bold text-slate-800 text-xs text-center border-l border-slate-100 uppercase">Edit/Save</th>
                                <th className="px-2 py-2 font-bold text-slate-800 text-xs text-center border-l border-slate-100 uppercase">Dl, +</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {plans.map((plan, idx) => (
                                <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                                    {/* Sub Categorie Selection */}
                                    <td className="p-1.5">
                                        <div className="flex flex-wrap gap-1 p-1 min-h-7 border border-slate-200 rounded-sm bg-white relative group">
                                            {plan.subCategories.length > 0 ? plan.subCategories.map(sub => (
                                                <span key={sub} className="bg-[#10b981] text-white px-1.5 py-0.5 rounded-sm flex items-center gap-1 text-xs font-bold relative z-20">
                                                    {sub}
                                                    <X
                                                        className="w-2.5 h-2.5 cursor-pointer hover:text-rose-200"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            const newSubs = plan.subCategories.filter(s => s !== sub);
                                                            updatePlan(idx, 'subCategories', newSubs);
                                                        }}
                                                    />
                                                </span>
                                            )) : <span className="text-slate-300 text-xs py-0.5 px-1 uppercase">Sub Catag..</span>}
                                            <select
                                                className="opacity-0 absolute inset-0 w-full h-full cursor-pointer z-10"
                                                onChange={(e) => {
                                                    if (e.target.value && !plan.subCategories.includes(e.target.value)) {
                                                        updatePlan(idx, 'subCategories', [...plan.subCategories, e.target.value]);
                                                    }
                                                }}
                                                value=""
                                            >
                                                <option value="" disabled></option>
                                                {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                            </select>
                                            <div className="flex-1 flex items-center justify-end px-1 pointer-events-none">
                                                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                            </div>
                                        </div>
                                    </td>

                                    {/* Amount */}
                                    <td className="p-1.5 border-l border-slate-100 text-center">
                                        <input
                                            type="text"
                                            className="w-16 h-8 border border-slate-200 rounded-sm text-center outline-none bg-[#f8fafc] focus:bg-white focus:border-blue-400 font-bold text-xs shadow-inner"
                                            value={plan.amount}
                                            onChange={(e) => updatePlan(idx, 'amount', e.target.value)}
                                        />
                                    </td>

                                    {/* View Reach/Traffic */}
                                    <td className="p-1.5 border-l border-slate-100" colSpan={2}>
                                        <div className="flex gap-1.5 justify-center">
                                            <input
                                                type="text"
                                                className="w-14 h-8 border border-slate-200 rounded-sm text-center outline-none bg-[#f8fafc] focus:bg-white focus:border-blue-400 font-bold text-xs shadow-inner"
                                                value={plan.reach}
                                                onChange={(e) => updatePlan(idx, 'reach', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className="w-14 h-8 border border-slate-200 rounded-sm text-center outline-none bg-[#f8fafc] focus:bg-white focus:border-blue-400 font-bold text-xs shadow-inner"
                                                value={plan.traffic}
                                                onChange={(e) => updatePlan(idx, 'traffic', e.target.value)}
                                            />
                                        </div>
                                    </td>

                                    {/* Min Amount Reach/Traffic */}
                                    <td className="p-1.5 border-l border-slate-100" colSpan={2}>
                                        <div className="flex gap-1.5 justify-center">
                                            <input
                                                type="text"
                                                className="w-14 h-8 border border-slate-200 rounded-sm text-center outline-none bg-[#f8fafc] focus:bg-white focus:border-blue-400 font-bold text-xs shadow-inner"
                                                value={plan.minReach}
                                                onChange={(e) => updatePlan(idx, 'minReach', e.target.value)}
                                            />
                                            <input
                                                type="text"
                                                className="w-14 h-8 border border-slate-200 rounded-sm text-center outline-none bg-[#f8fafc] focus:bg-white focus:border-blue-400 font-bold text-xs shadow-inner"
                                                value={plan.minTraffic}
                                                onChange={(e) => updatePlan(idx, 'minTraffic', e.target.value)}
                                            />
                                        </div>
                                    </td>

                                    {/* Gap Amount */}
                                    <td className="p-1.5 border-l border-slate-100 text-center">
                                        <input
                                            type="text"
                                            className="w-16 h-8 border border-slate-200 rounded-sm text-center outline-none bg-[#f8fafc] focus:bg-white focus:border-blue-400 font-bold text-xs shadow-inner"
                                            value={plan.gapAmount}
                                            onChange={(e) => updatePlan(idx, 'gapAmount', e.target.value)}
                                        />
                                    </td>

                                    {/* Edit/Save Buttons */}
                                    <td className="p-1.5 border-l border-slate-100 text-center">
                                        <div className="flex items-center justify-center gap-1">
                                            <button
                                                onClick={() => updatePlan(idx, 'isEditing', true)}
                                                className="bg-[#1e40af] text-white w-9 h-6 rounded-sm font-bold text-xs uppercase shadow-sm hover:bg-blue-800 transition-colors"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => handleSavePlan(idx)}
                                                disabled={savingId === idx}
                                                className="bg-[#1e40af] text-white w-9 h-6 rounded-sm font-bold text-xs uppercase shadow-sm hover:bg-blue-800 transition-colors disabled:bg-slate-300"
                                            >
                                                {savingId === idx ? "..." : "Save"}
                                            </button>
                                        </div>
                                    </td>

                                    {/* DL, + Buttons */}
                                    <td className="p-1.5 border-l border-slate-100 text-center">
                                        <div className="flex items-center justify-center gap-1.5">
                                            <button
                                                onClick={async () => {
                                                    if (plan._id) {
                                                        const token = Cookies.get('adminToken');
                                                        await axios.delete(`${API_BASE_URL}/api/admins/promotion-plans/${plan._id}`, {
                                                            headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
                                                        });
                                                        toast.success("Plan deleted");
                                                    }
                                                    handleRemovePlan(idx);
                                                }}
                                                className="w-5 h-5 bg-[#0f172a] text-white rounded-sm flex items-center justify-center hover:bg-rose-600 transition-colors"
                                            >
                                                <X className="w-3.5 h-3.5" />
                                            </button>
                                            {idx === plans.length - 1 && (
                                                <button
                                                    onClick={handleAddPlan}
                                                    className="w-5 h-5 border border-slate-200 text-slate-300 rounded-full flex items-center justify-center hover:bg-slate-50 hover:text-slate-500 transition-all font-bold"
                                                >
                                                    <Plus className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex gap-4 items-start">
                {/* Manual Promotion Section */}
                <div className="bg-white/50 p-3 rounded-sm border border-slate-100 max-w-3xl flex-1">
                    <h2 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5 uppercase">
                        Product a Product Manually
                    </h2>

                    <div className="grid grid-cols-[1fr_0.8fr] gap-3 mb-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <div className="relative">
                                    <input
                                        placeholder="Product ID"
                                        className="w-full border border-slate-300 px-2 h-8 outline-none text-xs font-bold placeholder:font-normal bg-white"
                                        value={manualPromote.productId}
                                        onChange={(e) => setManualPromote({ ...manualPromote, productId: e.target.value })}
                                    />
                                    <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-600" />
                                </div>
                                <input
                                    placeholder="Amount"
                                    className="w-full border border-slate-300 px-2 h-8 outline-none text-xs font-bold placeholder:font-normal bg-white"
                                    value={manualPromote.amount}
                                    onChange={(e) => setManualPromote({ ...manualPromote, amount: e.target.value })}
                                />
                            </div>

                            <div className="space-y-1">
                                <select
                                    className="w-full border border-slate-300 px-2 h-8 outline-none text-xs font-bold bg-white"
                                    value={manualPromote.adType}
                                    onChange={(e) => setManualPromote({ ...manualPromote, adType: e.target.value })}
                                >
                                    <option value="" disabled>AD Type</option>
                                    <option value="Free">Free</option>
                                    <option value="Promoted">Promoted</option>
                                </select>
                                <div className="relative">
                                    <input
                                        placeholder="Today to Run till"
                                        className="w-full border border-slate-300 px-2 h-8 outline-none text-xs font-bold placeholder:font-normal bg-white"
                                        value={manualPromote.runTill}
                                        onChange={(e) => setManualPromote({ ...manualPromote, runTill: e.target.value })}
                                        onFocus={(e) => e.target.type = 'date'}
                                        onBlur={(e) => e.target.type = 'text'}
                                    />
                                    <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2">
                        <button
                            onClick={handleManualPromote}
                            disabled={manualSaving}
                            className="bg-[#00a65a] text-white px-5 py-1.5 rounded-[1px] font-bold text-xs shadow-sm hover:bg-[#008d4c] uppercase flex items-center gap-2 disabled:bg-slate-300"
                        >
                            {manualSaving ? "Saving..." : "Save"}
                        </button>
                        <button
                            className="bg-white border border-slate-300 text-slate-600 px-5 py-1.5 rounded-[1px] font-bold text-xs shadow-sm hover:bg-slate-50 uppercase"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Premier Opportunity Section */}
                <div className="bg-white/50 p-3 rounded-sm border border-slate-100 flex-1">
                    <h2 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-1.5 uppercase">
                        Premier Opportunity
                    </h2>
                    <div className="space-y-2">
                        <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-1">
                            <label className="text-xs font-bold text-slate-600">Profile Verify Badge Price (year)</label>
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-slate-400">$</span>
                                <input
                                    type="number"
                                    className="w-16 h-6 border border-slate-300 px-1 text-center font-bold text-xs outline-none bg-white focus:border-blue-500"
                                    value={premierSettings.verifyBadgePrice}
                                    onChange={e => setPremierSettings({ ...premierSettings, verifyBadgePrice: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-1">
                            <label className="text-xs font-bold text-slate-600">Highlight Post Price</label>
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-slate-400">$</span>
                                <input
                                    type="number"
                                    className="w-16 h-6 border border-slate-300 px-1 text-center font-bold text-xs outline-none bg-white focus:border-blue-500"
                                    value={premierSettings.highlightPostPrice}
                                    onChange={e => setPremierSettings({ ...premierSettings, highlightPostPrice: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between border-b border-dashed border-slate-200 pb-1">
                            <label className="text-xs font-bold text-slate-600">Add Label Price</label>
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-slate-400">$</span>
                                <input
                                    type="number"
                                    className="w-16 h-6 border border-slate-300 px-1 text-center font-bold text-xs outline-none bg-white focus:border-blue-500"
                                    value={premierSettings.addLabelPrice}
                                    onChange={e => setPremierSettings({ ...premierSettings, addLabelPrice: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-between pb-1">
                            <label className="text-xs font-bold text-emerald-600">Free Ad Credit Amount</label>
                            <div className="flex items-center gap-1">
                                <span className="text-xs font-bold text-slate-400">$</span>
                                <input
                                    type="number"
                                    className="w-16 h-6 border border-slate-300 px-1 text-center font-bold text-xs outline-none bg-white focus:border-blue-500 text-emerald-600"
                                    value={premierSettings.freeAdCredit}
                                    onChange={e => setPremierSettings({ ...premierSettings, freeAdCredit: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                        <button
                            onClick={handleSavePremier}
                            disabled={premierSaving}
                            className="bg-[#1e40af] text-white px-5 py-1.5 rounded-[1px] font-bold text-xs shadow-sm hover:bg-blue-800 uppercase flex items-center gap-2 disabled:bg-slate-300"
                        >
                            {premierSaving ? "Saving..." : "Update Premier Info"}
                        </button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                input::-webkit-outer-spin-button,
                input::-webkit-inner-spin-button {
                    -webkit-appearance: none;
                    margin: 0;
                }
            `}</style>
        </div>
    );
}
