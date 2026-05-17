import { Link } from 'react-router-dom';

const QuickActions = () => {
    const actions = [
        { title: 'Add New Resident', desc: 'Register a new resident to the system', path: '/residents' },
        { title: 'Create Invoice', desc: 'Generate a new invoice for residents', path: '/invoices' },
        { title: 'New Maintenance Request', desc: 'Log a maintenance issue', path: '/repairs' },
        { title: 'Send Notification', desc: 'Broadcast to residents', path: '/notifications' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h2>
            <p className="text-sm text-slate-400 mb-6 -mt-3">Common tasks and shortcuts</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {actions.map((action, index) => (
                    <Link
                        key={index}
                        to={action.path}
                        className="p-4 rounded-xl border border-slate-100 hover:border-amber-400 hover:shadow-md transition-all group cursor-pointer block"
                    >
                        <h3 className="font-semibold text-slate-700 group-hover:text-amber-600">{action.title}</h3>
                        <p className="text-sm text-slate-500 mt-1">{action.desc}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default QuickActions;