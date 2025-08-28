// pages/requests.tsx or app/requests/page.tsx (depending on your Next.js version)
"use client";
import React, { useState, useMemo } from 'react';
import { Search, Home, MessageSquare, Tag, Users, Bookmark, Info, Phone, HelpCircle, Bell, User, Menu } from 'lucide-react';

interface RequestCard {
    id: string;
    name: string;
    status: 'Pending' | 'New' | 'Accepted';
    message: string;
    fullMessage: string;
    avatar?: string;
}

const RequestsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'All' | 'New' | 'Accepted'>('All');
    const [searchText, setSearchText] = useState('');
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [activeSidebarItem, setActiveSidebarItem] = useState('Questions');

    // Mock data with different statuses for filtering
    const allRequests: RequestCard[] = [
        {
            id: '1',
            name: 'John Doe',
            status: 'Pending',
            message: 'Looking for guidance in React development',
            fullMessage: 'Hi, I am a junior developer looking for guidance in React development. I have been working with React for 6 months but need help with advanced patterns and state management.'
        },
        {
            id: '2',
            name: 'Jane Smith',
            status: 'New',
            message: 'Need help with career transition',
            fullMessage: 'I am transitioning from marketing to software development and would love guidance on making this career change successfully.'
        },
        {
            id: '3',
            name: 'Mike Johnson',
            status: 'Accepted',
            message: 'Seeking mentorship in data science',
            fullMessage: 'Looking for a mentor in data science to help me navigate machine learning projects and career advancement in the field.'
        },
        {
            id: '4',
            name: 'Sarah Wilson',
            status: 'Pending',
            message: 'Want to learn about entrepreneurship',
            fullMessage: 'I have a business idea and need mentorship on how to validate it, find funding, and build a successful startup.'
        },
        {
            id: '5',
            name: 'Alex Chen',
            status: 'New',
            message: 'Looking for UX design guidance',
            fullMessage: 'New to UX design and seeking guidance on portfolio development, design thinking processes, and career growth in UX.'
        },
        {
            id: '6',
            name: 'Emily Brown',
            status: 'Accepted',
            message: 'Need support in project management',
            fullMessage: 'Looking to improve my project management skills and learn best practices for leading cross-functional teams.'
        },
    ];

    // Filter requests based on active tab and search text
    const filteredRequests = useMemo(() => {
        let filtered = allRequests;

        // Filter by tab
        if (activeTab !== 'All') {
            filtered = filtered.filter(request => request.status === activeTab);
        }

        // Filter by search text
        if (searchText.trim()) {
            const searchLower = searchText.toLowerCase();
            filtered = filtered.filter(request =>
                request.name.toLowerCase().includes(searchLower) ||
                request.message.toLowerCase().includes(searchLower) ||
                request.fullMessage.toLowerCase().includes(searchLower)
            );
        }

        return filtered;
    }, [activeTab, searchText, allRequests]);

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'New':
                return 'bg-blue-100 text-blue-700';
            case 'Accepted':
                return 'bg-green-100 text-green-700';
            case 'Pending':
            default:
                return 'bg-orange-100 text-orange-700';
        }
    };

    return (
        <div className="min-h-screen bg-neutral-dark flex" style={{
            '--color-primary': '#06a395',
            '--color-primary-light': '#33b9ab',
            '--color-primary-dark': '#04786d',
            '--color-secondary': '#065f46',
            '--color-secondary-light': '#2d7a64',
            '--color-secondary-dark': '#044634',
            '--color-tertiary': '#172A3A',
            '--color-tertiary-light': '#3d4e5c',
            '--color-tertiary-dark': '#0e1921',
            '--color-neutral': '#FFFFFF',
            '--color-neutral-light': '#FFFFFF',
            '--color-neutral-dark': '#f4f4f4',
            '--color-surface': '#d1fae5',
            '--color-surface-light': '#e6fcf1',
            '--color-surface-dark': '#a8e4c9'
        } as React.CSSProperties}>

            {/* Sidebar Overlay for Mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed lg:relative h-full z-30 transition-all duration-300 ${sidebarOpen ? 'w-64' : 'w-0 lg:w-64'
                } overflow-hidden`}>
                <div className="w-64 h-full shadow-lg" style={{ backgroundColor: 'var(--color-tertiary)' }}>
                    <div className="p-6">
                        <div className="flex items-center justify-between">
                            <h1 className="text-xl font-bold" style={{ color: 'var(--color-neutral)' }}>
                                Mentor Stack
                            </h1>
                            <button
                                onClick={() => setSidebarOpen(false)}
                                className="lg:hidden p-1 rounded-md hover:bg-opacity-10 hover:bg-white"
                                style={{ color: 'var(--color-neutral)' }}
                            >
                                ✕
                            </button>
                        </div>
                    </div>

                    <nav className="px-4 space-y-1">
                        {sidebarItems.map((item, index) => (
                            <button
                                key={index}
                                onClick={() => setActiveSidebarItem(item.label)}
                                className={`w-full flex items-center px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeSidebarItem === item.label
                                        ? 'shadow-md'
                                        : 'hover:bg-opacity-10 hover:bg-white'
                                    }`}
                                style={{
                                    backgroundColor: activeSidebarItem === item.label ? 'var(--color-primary)' : 'transparent',
                                    color: activeSidebarItem === item.label ? 'var(--color-neutral)' : 'var(--color-tertiary-light)'
                                }}
                            >
                                <item.icon size={18} className="mr-3" />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
                {/* Header */}
                <header className="shadow-sm border-b" style={{
                    backgroundColor: 'var(--color-neutral)',
                    borderColor: 'var(--color-surface-dark)'
                }}>
                    <div className="px-6 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="lg:hidden p-2 rounded-md transition-colors"
                                    style={{
                                        color: 'var(--color-tertiary)',
                                        ':hover': { backgroundColor: 'var(--color-surface)' }
                                    }}
                                >
                                    <Menu size={20} />
                                </button>
                                <div className="relative flex-1 max-w-md">
                                    <Search
                                        className="absolute left-3 top-1/2 transform -translate-y-1/2"
                                        size={18}
                                        style={{ color: 'var(--color-tertiary-light)' }}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Hinted search text"
                                        value={searchText}
                                        onChange={(e) => setSearchText(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-all"
                                        style={{
                                            backgroundColor: 'var(--color-surface)',
                                            borderColor: 'var(--color-surface-dark)',
                                            '--tw-ring-color': 'var(--color-primary)'
                                        }}
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-4">
                                <button
                                    className="p-2 rounded-md transition-colors hover:bg-opacity-10"
                                    style={{ color: 'var(--color-tertiary-light)' }}
                                >
                                    <Home size={20} />
                                </button>
                                <button
                                    className="p-2 rounded-md transition-colors hover:bg-opacity-10 relative"
                                    style={{ color: 'var(--color-tertiary-light)' }}
                                >
                                    <Bell size={20} />
                                    <span
                                        className="absolute -top-1 -right-1 w-3 h-3 rounded-full text-xs"
                                        style={{ backgroundColor: 'var(--color-primary)' }}
                                    />
                                </button>
                                <button
                                    className="p-2 rounded-md transition-colors hover:bg-opacity-10"
                                    style={{ color: 'var(--color-tertiary-light)' }}
                                >
                                    <User size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <main className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h1 className="text-3xl font-bold" style={{ color: 'var(--color-tertiary)' }}>
                            Requests
                        </h1>
                        <div className="text-sm" style={{ color: 'var(--color-tertiary-light)' }}>
                            {filteredRequests.length} of {allRequests.length} requests
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex space-x-1 mb-8">
                        {(['All', 'New', 'Accepted'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === tab ? 'shadow-md' : 'hover:bg-opacity-10'
                                    }`}
                                style={{
                                    backgroundColor: activeTab === tab ? 'var(--color-primary)' : 'var(--color-surface)',
                                    color: activeTab === tab ? 'var(--color-neutral)' : 'var(--color-secondary)',
                                }}
                            >
                                {tab} ({tab === 'All' ? allRequests.length : allRequests.filter(r => r.status === tab).length})
                            </button>
                        ))}
                    </div>

                    {/* Search Results Info */}
                    {searchText && (
                        <div className="mb-6 p-4 rounded-lg" style={{ backgroundColor: 'var(--color-surface)' }}>
                            <p style={{ color: 'var(--color-secondary)' }}>
                                {filteredRequests.length} results found for "{searchText}"
                                {filteredRequests.length === 0 && (
                                    <span className="block mt-1 text-sm">Try adjusting your search terms or filters.</span>
                                )}
                            </p>
                        </div>
                    )}

                    {/* Request Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredRequests.map((request) => (
                            <div
                                key={request.id}
                                className="rounded-xl shadow-sm border transition-all duration-200 hover:shadow-lg hover:scale-105 p-6"
                                style={{
                                    backgroundColor: 'var(--color-neutral)',
                                    borderColor: 'var(--color-surface-dark)'
                                }}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div
                                            className="w-12 h-12 rounded-full flex items-center justify-center"
                                            style={{ backgroundColor: 'var(--color-surface)' }}
                                        >
                                            <User size={20} style={{ color: 'var(--color-primary)' }} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold" style={{ color: 'var(--color-tertiary)' }}>
                                                {request.name}
                                            </h3>
                                        </div>
                                    </div>
                                    <span
                                        className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}
                                    >
                                        {request.status}
                                    </span>
                                </div>

                                <div className="mb-4">
                                    <div
                                        className="rounded-lg p-3 mb-3"
                                        style={{ backgroundColor: 'var(--color-surface-light)' }}
                                    >
                                        <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-secondary)' }}>
                                            Message
                                        </p>
                                        <p className="text-sm" style={{ color: 'var(--color-tertiary-light)' }}>
                                            {request.message}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    className="text-sm font-medium hover:underline transition-colors"
                                    style={{ color: 'var(--color-primary)' }}
                                >
                                    Full Info
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Empty State */}
                    {filteredRequests.length === 0 && !searchText && (
                        <div className="text-center py-12">
                            <div
                                className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center"
                                style={{ backgroundColor: 'var(--color-surface)' }}
                            >
                                <MessageSquare size={24} style={{ color: 'var(--color-primary)' }} />
                            </div>
                            <h3 className="text-lg font-medium mb-2" style={{ color: 'var(--color-tertiary)' }}>
                                No {activeTab.toLowerCase()} requests
                            </h3>
                            <p style={{ color: 'var(--color-tertiary-light)' }}>
                                There are currently no {activeTab.toLowerCase()} requests to display.
                            </p>
                        </div>
                    )}

                    {/* Empty state for bottom row placeholder cards */}
                    {filteredRequests.length > 0 && filteredRequests.length % 3 !== 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                            {Array.from({ length: 3 - (filteredRequests.length % 3) }).map((_, index) => (
                                <div
                                    key={`empty-${index}`}
                                    className="rounded-xl h-48 border-2 border-dashed opacity-50"
                                    style={{ borderColor: 'var(--color-surface-dark)' }}
                                />
                            ))}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default RequestsPage;