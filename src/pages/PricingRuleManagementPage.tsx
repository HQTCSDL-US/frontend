import React, { useEffect, useState } from "react";
import api from "../services/api";
import type { PricingRuleDto } from "../types/unrepeatable";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import {
    DollarSign,
    Edit,
    Trash2,
    Plus,
    Loader2,
    CheckCircle2,
    AlertCircle,
} from "lucide-react";

const PricingRuleManagementPage: React.FC = () => {
    const [rules, setRules] = useState<PricingRuleDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingRule, setEditingRule] = useState<PricingRuleDto | null>(null);
    const [isCreating, setIsCreating] = useState(false);
    const [status, setStatus] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const [formData, setFormData] = useState({
        pricePerKilometer: 1000,
        luxuryTrainSurcharge: 1.2,
        firstFloorBedSurcharge: 5000,
        secondFloorBedSurcharge: 9000,
        effectiveDate: new Date().toISOString().split("T")[0],
    });

    const fetchRules = async () => {
        setLoading(true);
        try {
            const res = await api.get<PricingRuleDto[]>(`/admin/pricing-rules`);
            setRules(res.data);
        } catch (error) {
            console.error("Error fetching pricing rules:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRules();
    }, []);

    const handleCreate = async () => {
        try {
            await api.post(`/admin/pricing-rules`, formData);
            setStatus({ type: "success", message: "✅ Pricing rule created successfully!" });
            setIsCreating(false);
            fetchRules();
            resetForm();
        } catch (error: any) {
            setStatus({ type: "error", message: error.response?.data?.message || "Error creating rule" });
        }
    };

    const handleUpdate = async () => {
        if (!editingRule) return;
        try {
            await api.put(`/admin/pricing-rules/${editingRule.id}`, formData);
            setStatus({ type: "success", message: "✅ Pricing rule updated successfully!" });
            setEditingRule(null);
            fetchRules();
            resetForm();
        } catch (error: any) {
            setStatus({ type: "error", message: error.response?.data?.message || "Error updating rule" });
        }
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this pricing rule?")) return;
        try {
            await api.delete(`/admin/pricing-rules/${id}`);
            setStatus({ type: "success", message: "✅ Pricing rule deleted" });
            fetchRules();
        } catch (error: any) {
            setStatus({ type: "error", message: error.response?.data?.message || "Error deleting rule" });
        }
    };

    const startEdit = (rule: PricingRuleDto) => {
        setEditingRule(rule);
        setIsCreating(false);
        setFormData({
            pricePerKilometer: rule.pricePerKilometer,
            luxuryTrainSurcharge: rule.luxuryTrainSurcharge,
            firstFloorBedSurcharge: rule.firstFloorBedSurcharge,
            secondFloorBedSurcharge: rule.secondFloorBedSurcharge,
            effectiveDate: rule.effectiveDate,
        });
    };

    const resetForm = () => {
        setFormData({
            pricePerKilometer: 1000,
            luxuryTrainSurcharge: 1.2,
            firstFloorBedSurcharge: 5000,
            secondFloorBedSurcharge: 9000,
            effectiveDate: new Date().toISOString().split("T")[0],
        });
    };

    return (
        <div className="container mx-auto py-8 px-4 max-w-7xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-100 mb-2">Pricing Rule Management</h1>
                <p className="text-slate-400">Manage train ticket pricing rules (Admin Only)</p>
            </div>

            {status && (
                <div
                    className={`mb-6 p-4 rounded-lg border flex items-center gap-3 ${status.type === "success"
                        ? "bg-green-500/10 border-green-500 text-green-400"
                        : "bg-red-500/10 border-red-500 text-red-400"
                        }`}
                >
                    {status.type === "success" ? (
                        <CheckCircle2 className="h-5 w-5" />
                    ) : (
                        <AlertCircle className="h-5 w-5" />
                    )}
                    <span>{status.message}</span>
                    <button onClick={() => setStatus(null)} className="ml-auto">
                        <Trash2 className="h-4 w-4" />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left: Rules List */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-slate-100">All Pricing Rules</h2>
                        <Button
                            onClick={() => {
                                setIsCreating(true);
                                setEditingRule(null);
                                resetForm();
                            }}
                            className="bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            Add New Rule
                        </Button>
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="h-10 w-10 animate-spin text-slate-700" />
                        </div>
                    ) : (
                        <div className="relative overflow-x-auto shadow-md sm:rounded-lg border border-slate-800">
                            <table className="w-full text-sm text-left text-slate-300">
                                <thead className="text-xs uppercase bg-slate-800 text-slate-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Effective Date</th>
                                        <th scope="col" className="px-6 py-3">Price/Km</th>
                                        <th scope="col" className="px-6 py-3">Luxury Surcharge</th>
                                        <th scope="col" className="px-6 py-3">1st Floor Bed</th>
                                        <th scope="col" className="px-6 py-3">2nd Floor Bed</th>
                                        <th scope="col" className="px-6 py-3">ID</th>
                                        <th scope="col" className="px-6 py-3 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {rules.map((rule) => (
                                        <tr
                                            key={rule.id}
                                            className={`bg-slate-900 border-b border-slate-800 hover:bg-slate-800/50 ${rule.isActive ? "bg-green-900/10 border-l-4 border-l-green-500" : ""
                                                }`}
                                        >
                                            <td className="px-6 py-4 font-medium text-slate-100 whitespace-nowrap">
                                                {rule.effectiveDate}
                                                {rule.isActive && (
                                                    <span className="ml-2 text-[10px] bg-green-500/20 text-green-400 px-1.5 py-0.5 rounded uppercase font-bold">
                                                        Active
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4">{rule.pricePerKilometer.toLocaleString()}</td>
                                            <td className="px-6 py-4">{rule.luxuryTrainSurcharge}x</td>
                                            <td className="px-6 py-4">{rule.firstFloorBedSurcharge.toLocaleString()}</td>
                                            <td className="px-6 py-4">{rule.secondFloorBedSurcharge.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-slate-500">#{rule.id}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10"
                                                        onClick={() => startEdit(rule)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                        onClick={() => rule.id && handleDelete(rule.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Right: Create/Edit Form */}
                {(isCreating || editingRule) && (
                    <div className="lg:col-span-1">
                        <Card className="bg-slate-900 border-slate-800 sticky top-8">
                            <CardHeader>
                                <CardTitle className="text-slate-100">
                                    {isCreating ? "Create New Rule" : "Edit Rule"}
                                </CardTitle>
                                <CardDescription>
                                    {isCreating ? "Add a new pricing rule" : `Editing Rule #${editingRule?.id}`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Effective Date *</label>
                                    <input
                                        type="date"
                                        value={formData.effectiveDate}
                                        onChange={(e) => setFormData({ ...formData, effectiveDate: e.target.value })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Price per Kilometer (VNĐ) *</label>
                                    <input
                                        type="number"
                                        value={formData.pricePerKilometer}
                                        onChange={(e) => setFormData({ ...formData, pricePerKilometer: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Luxury Train Surcharge (Multiplier) *</label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        value={formData.luxuryTrainSurcharge}
                                        onChange={(e) => setFormData({ ...formData, luxuryTrainSurcharge: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">1st Floor Bed Surcharge (VNĐ) *</label>
                                    <input
                                        type="number"
                                        value={formData.firstFloorBedSurcharge}
                                        onChange={(e) => setFormData({ ...formData, firstFloorBedSurcharge: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200 text-sm"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">2nd Floor Bed Surcharge (VNĐ) *</label>
                                    <input
                                        type="number"
                                        value={formData.secondFloorBedSurcharge}
                                        onChange={(e) => setFormData({ ...formData, secondFloorBedSurcharge: parseFloat(e.target.value) })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-slate-200 text-sm"
                                    />
                                </div>

                                <div className="flex gap-2 pt-4">
                                    <Button
                                        onClick={isCreating ? handleCreate : handleUpdate}
                                        className="flex-1 bg-green-600 hover:bg-green-700"
                                    >
                                        <DollarSign className="mr-2 h-4 w-4" />
                                        {isCreating ? "Create" : "Update"}
                                    </Button>
                                    <Button
                                        onClick={() => {
                                            setIsCreating(false);
                                            setEditingRule(null);
                                            resetForm();
                                        }}
                                        variant="outline"
                                        className="border-slate-700 text-slate-400"
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PricingRuleManagementPage;
