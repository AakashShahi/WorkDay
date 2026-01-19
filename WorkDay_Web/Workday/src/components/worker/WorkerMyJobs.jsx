import React, { useState } from "react";
import classNames from "classnames";
import WorkerRequestedJobs from "./worker_job/WorkerRequestedJobs";
import WorkerAssignedJobs from "./worker_job/WorkerAssignedJobs";
import WorkerInProgressJob from "./worker_job/WorkerInProgressJob";
import WorkerCompletedJobs from "./worker_job/WorkerCompletedJobs";
import WorkerFailedJobs from "./worker_job/WorkerFailedJobs";

const tabs = [
    "Requested Jobs",
    "Assigned Jobs",
    "In Progress Jobs",
    "Completed Jobs",
    "Failed Jobs",
];

export default function WorkerMyJobs() {
    const [activeTab, setActiveTab] = useState("In Progress Jobs");

    const renderTabContent = () => {
        switch (activeTab) {
            case "Requested Jobs":
                return <WorkerRequestedJobs />;
            case "Assigned Jobs":
                return <WorkerAssignedJobs />;
            case "In Progress Jobs":
                return <WorkerInProgressJob />;
            case "Completed Jobs":
                return <WorkerCompletedJobs />;
            case "Failed Jobs":
                return <WorkerFailedJobs />;
            default:
                return null;
        }
    };

    return (
        <div className="max-w-6xl mx-auto px-6 py-12">
            {/* Tabs container */}
            <nav
                className="border-b border-gray-300"
                role="tablist"
                aria-label="Worker job status tabs"
            >
                <ul className="flex">
                    {tabs.map((tab) => {
                        const isActive = activeTab === tab;

                        return (
                            <li key={tab} role="presentation" className="flex-1">
                                <button
                                    role="tab"
                                    aria-selected={isActive}
                                    aria-controls={`panel-${tab.replace(/\s+/g, "-").toLowerCase()}`}
                                    id={`tab-${tab.replace(/\s+/g, "-").toLowerCase()}`}
                                    tabIndex={isActive ? 0 : -1}
                                    onClick={() => setActiveTab(tab)}
                                    className={classNames(
                                        "relative w-full py-4 px-3 text-center whitespace-nowrap font-semibold text-gray-600 transition-transform duration-300 ease-in-out focus:outline-none",
                                        isActive
                                            ? "text-blue-600 scale-110"
                                            : "hover:text-blue-600 focus-visible:text-blue-600 scale-100"
                                    )}
                                    style={{
                                        // Smooth scaling animation handled by transition-transform
                                        transformOrigin: "center bottom",
                                    }}
                                >
                                    {tab}
                                    {/* Animated underline */}
                                    <span
                                        aria-hidden="true"
                                        className={classNames(
                                            "absolute bottom-0 left-1/2 transform -translate-x-1/2 h-1 w-14 rounded-t-full transition-all duration-300",
                                            isActive ? "bg-blue-600" : "bg-transparent"
                                        )}
                                    />
                                </button>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* Content panel */}
            <section
                id={`panel-${activeTab.replace(/\s+/g, "-").toLowerCase()}`}
                role="tabpanel"
                aria-labelledby={`tab-${activeTab.replace(/\s+/g, "-").toLowerCase()}`}
                className="mt-10 min-h-[250px] p-6 bg-white rounded-lg shadow-md"
            >
                {renderTabContent()}
            </section>
        </div>
    );
}

// Component for displaying worker's jobs
