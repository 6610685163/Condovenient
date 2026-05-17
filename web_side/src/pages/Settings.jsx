import { useState } from 'react';
import { Home } from 'lucide-react';

const Settings = () => {
    // States จำลองสำหรับเก็บข้อมูลในแต่ละส่วน
    const [profile, setProfile] = useState({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@condovenient.com',
        phone: '+1 (555) 000-0000'
    });

    const [property, setProperty] = useState({
        name: 'Condovenient Tower',
        totalUnits: '188',
        currency: 'USD ($)'
    });

    const [notifications, setNotifications] = useState({
        email: true,
        maintenance: true,
        payment: true,
        weekly: false
    });

    // Component เล็กๆ สำหรับทำปุ่มสวิตช์ (Toggle)
    const ToggleSwitch = ({ enabled, onChange }) => (
        <div
            onClick={onChange}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors duration-300 ease-in-out ${enabled ? 'bg-[#FBBF24]' : 'bg-slate-200'}`}
        >
            <div
                className={`bg-white w-4 h-4 rounded-full shadow-sm transform transition-transform duration-300 ease-in-out ${enabled ? 'translate-x-5' : 'translate-x-0'}`}
            ></div>
        </div>
    );

    return (
        <div className="space-y-6 pb-8 font-sans">

            {/* ── 1. Header ── */}
            <div className="mb-6">
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-2">
                    <Home size={14} /> <span>/</span> <span>Settings</span>
                </div>
                <h1 className="text-4xl font-serif font-bold text-slate-800">Settings</h1>
                <p className="text-sm text-slate-500 mt-2">Manage your account and system preferences</p>
            </div>

            <div className="space-y-6 max-w-4xl">

                {/* ── 2. Profile Settings ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-1">Profile Settings</h2>
                    <p className="text-sm text-slate-500 mb-6">Update your personal information and preferences</p>

                    <div className="space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm font-semibold text-slate-800 block mb-2">First Name</label>
                                <input
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none transition-all text-slate-700"
                                    value={profile.firstName} onChange={e => setProfile({ ...profile, firstName: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-800 block mb-2">Last Name</label>
                                <input
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none transition-all text-slate-700"
                                    value={profile.lastName} onChange={e => setProfile({ ...profile, lastName: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-800 block mb-2">Email Address</label>
                            <input
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none transition-all text-slate-700"
                                value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className="text-sm font-semibold text-slate-800 block mb-2">Phone Number</label>
                            <input
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none transition-all text-slate-700"
                                value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })}
                            />
                        </div>

                        <div className="pt-2">
                            <button className="bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 px-6 py-2.5 rounded-xl font-semibold transition-colors active:scale-95 shadow-sm text-sm">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── 3. Property Settings ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-1">Property Settings</h2>
                    <p className="text-sm text-slate-500 mb-6">Configure your property details and preferences</p>

                    <div className="space-y-5">
                        <div>
                            <label className="text-sm font-semibold text-slate-800 block mb-2">Property Name</label>
                            <input
                                className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none transition-all text-slate-700"
                                value={property.name} onChange={e => setProperty({ ...property, name: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div>
                                <label className="text-sm font-semibold text-slate-800 block mb-2">Total Units</label>
                                <input
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none transition-all text-slate-700"
                                    type="number" value={property.totalUnits} onChange={e => setProperty({ ...property, totalUnits: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-semibold text-slate-800 block mb-2">Currency</label>
                                <select
                                    className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-amber-400 outline-none transition-all text-slate-700 bg-white"
                                    value={property.currency} onChange={e => setProperty({ ...property, currency: e.target.value })}
                                >
                                    <option value="USD ($)">USD ($)</option>
                                    <option value="THB (฿)">THB (฿)</option>
                                    <option value="EUR (€)">EUR (€)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button className="bg-[#FBBF24] hover:bg-[#F59E0B] text-slate-900 px-6 py-2.5 rounded-xl font-semibold transition-colors active:scale-95 shadow-sm text-sm">
                                Save Changes
                            </button>
                        </div>
                    </div>
                </div>

                {/* ── 4. Notification Preferences ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 md:p-8">
                    <h2 className="text-lg font-bold text-slate-800 mb-1">Notification Preferences</h2>
                    <p className="text-sm text-slate-500 mb-6">Manage how you receive notifications</p>

                    <div className="space-y-0 divide-y divide-slate-100">
                        {/* Toggle 1 */}
                        <div className="flex items-center justify-between py-4 first:pt-0">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Email Notifications</p>
                                <p className="text-xs text-slate-500 mt-0.5">Receive notifications via email</p>
                            </div>
                            <ToggleSwitch enabled={notifications.email} onChange={() => setNotifications({ ...notifications, email: !notifications.email })} />
                        </div>

                        {/* Toggle 2 */}
                        <div className="flex items-center justify-between py-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Maintenance Alerts</p>
                                <p className="text-xs text-slate-500 mt-0.5">Get notified about new maintenance requests</p>
                            </div>
                            <ToggleSwitch enabled={notifications.maintenance} onChange={() => setNotifications({ ...notifications, maintenance: !notifications.maintenance })} />
                        </div>

                        {/* Toggle 3 */}
                        <div className="flex items-center justify-between py-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Payment Reminders</p>
                                <p className="text-xs text-slate-500 mt-0.5">Receive reminders about overdue payments</p>
                            </div>
                            <ToggleSwitch enabled={notifications.payment} onChange={() => setNotifications({ ...notifications, payment: !notifications.payment })} />
                        </div>

                        {/* Toggle 4 */}
                        <div className="flex items-center justify-between py-4 pb-0">
                            <div>
                                <p className="text-sm font-semibold text-slate-800">Weekly Reports</p>
                                <p className="text-xs text-slate-500 mt-0.5">Receive weekly summary reports</p>
                            </div>
                            <ToggleSwitch enabled={notifications.weekly} onChange={() => setNotifications({ ...notifications, weekly: !notifications.weekly })} />
                        </div>
                    </div>
                </div>

                {/* ── 5. Danger Zone ── */}
                <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6 md:p-8">
                    <h2 className="text-lg font-bold text-red-600 mb-1">Danger Zone</h2>
                    <p className="text-sm text-slate-500 mb-6">Irreversible and destructive actions</p>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-slate-800">Delete Account</p>
                            <p className="text-xs text-slate-500 mt-0.5">Permanently delete your account and all data</p>
                        </div>
                        <button
                            onClick={() => confirm('Are you sure you want to delete your account? This action cannot be undone.')}
                            className="bg-[#E11D48] hover:bg-red-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-colors active:scale-95 shadow-sm text-sm whitespace-nowrap"
                        >
                            Delete Account
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Settings;