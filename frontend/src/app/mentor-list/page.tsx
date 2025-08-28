'use client'
import React, { useState } from "react";
import { Search, MapPin, Users, BookOpen } from "lucide-react";
import Layout from "../../components/Layout";

const MentorsPage = () => {
    const [searchTerm, setSearchTerm] = useState("");

    // Sample mentor data
    const mentors = [
        {
            id: 1,
            name: "Nidhish Shettigar",
            location: "Pune",
            department: "Design and Development",
            expertise: ["Designing", "Mentorship"],
            tags: ["Python", "Flutter", "Flutter"],
        },
        {
            id: 2,
            name: "Sanidhya K Bhandary",
            location: "Bengaluru",
            department: "Testing",
            expertise: ["Debugging", "Mentorship"],
            tags: ["Python", "Selenium", "Senior Tester"],
        },
        {
            id: 3,
            name: "Krishna N Acharya",
            location: "Pune",
            department: "Design and Development",
            expertise: ["Designing", "Mentorship"],
            tags: ["Python", "Flutter", "Flutter"],
        },
        {
            id: 4,
            name: "Abhijna N",
            location: "Bengaluru",
            department: "Testing",
            expertise: ["Debugging", "Mentorship"],
            tags: ["Python", "Selenium", "Senior Tester"],
        },
        {
            id: 5,
            name: "Nidhish Shettigar",
            location: "Pune",
            department: "Design and Development",
            expertise: ["Designing", "Mentorship"],
            tags: ["Python", "Flutter", "React"],
        },
        {
            id: 6,
            name: "Sanidhya K Bhandary",
            location: "Bengaluru",
            department: "Testing",
            expertise: ["Debugging", "Mentorship"],
            tags: ["Python", "Selenium", "Senior Tester"],
        },
    ];

    const filteredMentors = mentors.filter(
        (mentor) =>
            mentor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mentor.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            mentor.expertise.some((skill) =>
                skill.toLowerCase().includes(searchTerm.toLowerCase())
            ) ||
            mentor.tags.some((tag) =>
                tag.toLowerCase().includes(searchTerm.toLowerCase())
            )
    );

    const getInitials = (name: string) => {
        return name
            .split(" ")
            .map((n) => n[0])
            .join("");
    };

    return (
        <Layout>
            <div className="min-h-screen bg-neutral-50">
                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Page Title and Search */}
                <div className="mb-8">
                    <h2 className="text-4xl font-bold text-gray-900 mb-6">Mentors</h2>

                    {/* Search Bar */}
                    <div className="relative max-w-md">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search Mentor"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            style={{ backgroundColor: "var(--color-neutral)" }}
                        />
                    </div>
                </div>

                {/* Mentors Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {filteredMentors.map((mentor) => (
                        <div
                            key={mentor.id}
                            className="rounded-2xl p-6 shadow-sm hover:shadow-md flex flex-col justify-between transition-all duration-200 border border-gray-200"
                            style={{ backgroundColor: "var(--color-neutral)" }}
                        >
                            <div className="flex items-start space-x-4">
                                {/* Avatar */}
                                <div
                                    className="w-16 h-16 rounded-full flex items-center justify-center text-tertiary text-lg font-semibold"
                                    style={{ backgroundColor: "var(--color-surface)" }}
                                >
                                    {getInitials(mentor.name)}
                                </div>

                                {/* Mentor Info */}
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                        {mentor.name}
                                    </h3>

                                    <div className="space-y-2 mb-4">
                                        <div className="flex items-center text-gray-600">
                                            <MapPin className="h-4 w-4 mr-2" />
                                            <span className="text-sm">
                                                Location: {mentor.location}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-gray-600">
                                            <Users className="h-4 w-4 mr-2" />
                                            <span className="text-sm">
                                                Department: {mentor.department}
                                            </span>
                                        </div>

                                        <div className="flex items-center text-gray-600">
                                            <BookOpen className="h-4 w-4 mr-2" />
                                            <span className="text-sm">
                                                Expertise: {mentor.expertise.join(", ")}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Tags */}
                                    <div className="flex flex-wrap gap-2">
                                        {mentor.tags.map((tag, index) => (
                                            <span
                                                key={index}
                                                className="px-3 py-1 text-xs font-medium text-neutral rounded-full"
                                                style={{ backgroundColor: "var(--color-primary)" }}
                                            >
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Connect Button */}
                            <div className="mt-6 pt-4 border-t border-gray-200 flex justify-center">
                                <button
                                    className="flex flex-row items-center justify-center py-2 px-4 rounded-lg text-neutral font-medium hover:opacity-90 transition-opacity duration-200"
                                    style={{ backgroundColor: "var(--color-primary)" }}
                                >
                                    Connect
                                </button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* No results message */}
                {filteredMentors.length === 0 && (
                    <div className="text-center py-12">
                        <div className="text-gray-500 text-lg">
                            No mentors found matching your search.
                        </div>
                        <button
                            onClick={() => setSearchTerm("")}
                            className="mt-4 px-4 py-2 text-sm font-medium rounded-lg hover:opacity-90 transition-opacity"
                            style={{
                                backgroundColor: "var(--color-primary)",
                                color: "var(--color-neutral)",
                            }}
                        >
                            Clear Search
                        </button>
                    </div>
                )}
            </div>
            </div>
        </Layout>
    );
};

export default MentorsPage;
