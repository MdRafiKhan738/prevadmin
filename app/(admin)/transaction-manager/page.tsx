"use client";

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { Search, ChevronDown, ArrowLeft, Calendar, Trash2 } from 'lucide-react';
import { API_BASE_URL } from '@/utils/apiConfig';
import toast from 'react-hot-toast';
import Link from 'next/link';

export default function TransactionManagerPage() {
    // Manual Promotion State
    const [manualPromote, setManualPromote] = useState({
        productId: '',
        adType: 'Free',
        amount: '',
        runTill: '',
        sellerId: '',
        isVerifyBadge: 'No',
        level: ''
    });
    const [manualSaving, setManualSaving] = useState(false);

    // Premier Opportunity State for Labels
    const [premierSettings, setPremierSettings] = useState<any>({
        labels: []
    });

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const token = Cookies.get('adminToken');
            const premierRes = await axios.get(`${API_BASE_URL}/api/premier-opportunity`, {
                headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
            }).catch(() => null);

            if (premierRes && premierRes.data && premierRes.data.data) {
                const data = premierRes.data.data;
                setPremierSettings({
                    labels: data.labels && data.labels.length > 0 ? data.labels : [{ name: 'Discount', price: 500 }],
                });
            }
        } catch (err) {
            console.error("Fetch error:", err);
        }
    };

    const handleManualPromote = async () => {
        if (!manualPromote.productId && !manualPromote.sellerId) {
            return toast.error("Either Product ID or Seller ID is required");
        }
        setManualSaving(true);
        try {
            const token = Cookies.get('adminToken');
            await axios.post(`${API_BASE_URL}/api/admins/manual-promote`, manualPromote, {
                headers: { 'Authorization': `Bearer ${token}`, 'x-auth-token': token }
            });
            toast.success("Ad promoted successfully!");
            setManualPromote({ productId: '', adType: 'Free', amount: '', runTill: '', sellerId: '', isVerifyBadge: 'No', level: '' });
        } catch (err: any) {
            toast.error(err.response?.data?.message || "Failed to promote ad");
        } finally {
            setManualSaving(false);
        }
    };

    return (
        <div className="bg-[#f1f5f9] min-h-screen p-3 text-xs">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <Link href="/dashboard" className="text-rose-500 bg-white p-1 rounded-sm border border-slate-200 block">
                        <ArrowLeft className="w-3.5 h-3.5" strokeWidth={3} />
                    </Link>
                    <h1 className="text-sm font-bold text-blue-700 uppercase tracking-tight">Transaction Manager</h1>
                </div>
            </div>

            <div className="flex flex-col gap-6">
                {/* Manual Promotion Section */}
                <div className="bg-white/50 p-3 rounded-sm border border-slate-100 max-w-3xl">
                    <h2 className="text-xs font-bold text-black mb-2 flex items-center gap-1.5 uppercase">
                        Promote Manually
                    </h2>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                        <div className="space-y-2">
                            <div className="relative">
                                <input
                                    placeholder="Product ID"
                                    className="w-full border border-slate-300 px-2 h-8 outline-none text-xs placeholder:font-normal bg-white"
                                    value={manualPromote.productId}
                                    onChange={(e) => setManualPromote({ ...manualPromote, productId: e.target.value })}
                                />
                                <Search className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-emerald-600" />
                            </div>
                            <input
                                placeholder="Seller ID For Verify Badge"
                                className="w-full border border-slate-300 px-2 h-8 outline-none text-xs placeholder:font-normal bg-white"
                                value={manualPromote.sellerId}
                                onChange={(e) => setManualPromote({ ...manualPromote, sellerId: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="relative">
                                <select
                                    className="w-full border border-slate-300 px-2 h-8 outline-none text-xs bg-white text-slate-500 appearance-none"
                                    value={manualPromote.runTill}
                                    onChange={(e) => setManualPromote({ ...manualPromote, runTill: e.target.value })}
                                >
                                    <option value="" disabled>Promote till</option>
                                    <option value="7">7 Days</option>
                                    <option value="15">15 Days</option>
                                    <option value="30">30 Days</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black pointer-events-none" />
                            </div>
                            <div className="relative">
                                <select
                                    className="w-full border border-slate-300 px-2 h-8 outline-none text-xs bg-white text-slate-500 appearance-none"
                                    value={manualPromote.isVerifyBadge}
                                    onChange={(e) => setManualPromote({ ...manualPromote, isVerifyBadge: e.target.value })}
                                >
                                    <option value="" disabled>Verify Badge Yes/No</option>
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black pointer-events-none" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <input
                                placeholder="Amount"
                                className="w-full border border-slate-300 px-2 h-8 outline-none text-xs placeholder:font-normal bg-white"
                                value={manualPromote.amount}
                                onChange={(e) => setManualPromote({ ...manualPromote, amount: e.target.value })}
                            />
                            <div className="relative">
                                <select
                                    className="w-full border border-slate-300 px-2 h-8 outline-none text-xs bg-white text-slate-500 appearance-none"
                                    value={manualPromote.level}
                                    onChange={(e) => setManualPromote({ ...manualPromote, level: e.target.value })}
                                >
                                    <option value="" disabled>Select Level</option>
                                    {premierSettings.labels?.map((label: any) => (
                                        <option key={label.name} value={label.name}>{label.name}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-black pointer-events-none" />
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
                            onClick={() => setManualPromote({ productId: '', adType: 'Free', amount: '', runTill: '', sellerId: '', isVerifyBadge: 'No', level: '' })}
                            className="bg-white border border-slate-300 text-black px-5 py-1.5 rounded-[1px] font-bold text-xs shadow-sm hover:bg-slate-50 uppercase"
                        >
                            Cancel
                        </button>
                    </div>
                </div>

                {/* Transaction Report Section */}
                <div className="bg-white border border-slate-200 rounded-sm shadow-sm overflow-hidden flex flex-col">
                    <div className="p-3 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
                        <h2 className="text-xs font-bold text-black uppercase">Transaction Report</h2>
                    </div>

                    {/* Filters */}
                    <div className="p-3 flex items-center gap-2 flex-wrap border-b border-slate-100 bg-white">
                        <button className="p-1.5 border border-slate-300 rounded-sm bg-slate-100 hover:bg-slate-200">
                            <Trash2 className="w-3.5 h-3.5 text-black" />
                        </button>

                        <div className="flex items-center gap-2 border border-slate-200 rounded-sm bg-white px-2 h-9">
                            <span className="text-slate-500 shrink-0">From Date</span>
                            <input type="date" className="outline-none text-xs w-28 bg-transparent" />
                        </div>

                        <div className="flex items-center gap-2 border border-slate-200 rounded-sm bg-white px-2 h-9">
                            <span className="text-slate-500 shrink-0">To Date</span>
                            <input type="date" className="outline-none text-xs w-28 bg-transparent" />
                        </div>

                        <input placeholder="Txn ID..." className="h-9 border border-slate-300 px-3 outline-none text-xs w-32 bg-white" />
                        <input placeholder="Product ID" className="h-9 border border-slate-300 px-3 outline-none text-xs w-32 bg-white" />
                        <input placeholder="Seller Mobile" className="h-9 border border-slate-300 px-3 outline-none text-xs w-32 bg-white" />
                        <input placeholder="Seller ID" className="h-9 border border-slate-300 px-3 outline-none text-xs w-28 bg-white" />
                        <input placeholder="Item" className="h-9 border border-slate-300 px-3 outline-none text-xs w-28 bg-white" />
                        <input placeholder="Trx Mode" className="h-9 border border-slate-300 px-3 outline-none text-xs w-28 bg-white" />

                        <button className="bg-[#00a65a] text-white px-4 h-9 rounded-sm font-bold text-xs uppercase flex items-center gap-2 shadow-sm hover:bg-emerald-700 ml-auto">
                            <Search className="w-3.5 h-3.5" />
                            Search
                        </button>
                    </div>

                    {/* Table */}
                    <div className="overflow-x-auto">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="text-left bg-slate-50/50 border-b border-slate-100">
                                    <th className="p-2 w-10 text-center">
                                        <input type="checkbox" className="w-3 h-3" />
                                    </th>
                                    <th className="p-2 text-black border-r border-slate-100">Tnx ID</th>
                                    <th className="p-2 text-black border-r border-slate-100 text-center">Trx Mode</th>
                                    <th className="p-2 text-black border-r border-slate-100 text-center">Seller ID</th>
                                    <th className="p-2 text-black border-r border-slate-100 text-center">Product ID</th>
                                    <th className="p-2 text-black border-r border-slate-100 text-center">Mobile Number</th>
                                    <th className="p-2 text-black border-r border-slate-100 text-center">Amount</th>
                                    <th className="p-2 text-black border-r border-slate-100 text-center">Pay Type</th>
                                    <th className="p-2 text-black border-r border-slate-100">Payee Name</th>
                                    <th className="p-2 text-black border-r border-slate-100">Item</th>
                                    <th className="p-2 text-black border-r border-slate-100 whitespace-nowrap">Pay Time</th>
                                    <th className="p-2 text-black text-center whitespace-nowrap">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {[
                                    { tnx: '60178a10a661a147147', mode: 'Online', seller: '154855', prod: '----', mobile: '0175488544', amount: '1999', payType: 'DBBL', name: 'Sathi Akter', item: 'Verify Badge', time: '2021-02-01 10:56:48', status: 'VALID' },
                                    { tnx: '60178a0d71e33147147', mode: 'Admin', seller: '965885', prod: '85485555', mobile: '0158452877', amount: '1999', payType: 'Bkash', name: 'Sathi Akter', item: 'Highlight', time: '2021-02-01 10:56:45', status: 'VALID' },
                                    { tnx: '601762b300b89146337', mode: 'Online', seller: '965855', prod: '11254155', mobile: '01854887554', amount: '3050', payType: 'Visa', name: 'Imran Imran', item: 'View', time: '2021-02-01 08:08:51', status: 'VALID' },
                                    { tnx: '60171add9a179113585', mode: 'Online', seller: '8545888', prod: '10254778', mobile: '01996554887', amount: '1999', payType: 'Rocket', name: 'Shopan S.M. Sh', item: 'Urgent', time: '2021-02-01 03:02:21', status: 'VALID' },
                                ].map((row, i) => (
                                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                                        <td className="p-2 text-center">
                                            <input type="checkbox" className="w-3 h-3" />
                                        </td>
                                        <td className="p-2 font-mono text-[11px] text-slate-600 border-r border-slate-100">{row.tnx}</td>
                                        <td className="p-2 text-center text-slate-700 border-r border-slate-100">{row.mode}</td>
                                        <td className="p-2 text-center text-slate-700 border-r border-slate-100">{row.seller}</td>
                                        <td className="p-2 text-center text-slate-700 border-r border-slate-100">{row.prod}</td>
                                        <td className="p-2 text-center text-slate-700 border-r border-slate-100">{row.mobile}</td>
                                        <td className="p-2 text-center font-bold text-slate-800 border-r border-slate-100">Tk. {row.amount}</td>
                                        <td className="p-2 text-center text-slate-700 border-r border-slate-100">{row.payType}</td>
                                        <td className="p-2 text-blue-600 border-r border-slate-100">{row.name}</td>
                                        <td className="p-2 text-slate-700 border-r border-slate-100">{row.item}</td>
                                        <td className="p-2 text-[11px] text-slate-600 border-r border-slate-100 whitespace-nowrap">{row.time}</td>
                                        <td className="p-2 text-center">
                                            <span className="bg-emerald-600 text-white px-2 py-0.5 rounded-[1px] text-[10px] font-bold">VALID</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
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
