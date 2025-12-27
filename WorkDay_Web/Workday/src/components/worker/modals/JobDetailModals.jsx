import React, { useState, useRef, useEffect, useCallback, useContext } from "react"; // ADD useContext here
import {
    FaTimes, FaMapMarkerAlt, FaPhone, FaUserTie,
    FaClock, FaBriefcase, FaPaperPlane
} from "react-icons/fa";
import { useGetChatHistory, useSendMessage } from "../../../hooks/chat/useChat";
import socket from "../../../utils/socket";
import { AuthContext } from "../../../auth/AuthProvider";

export default function JobDetailModal({ job, onClose }) { // Remove userId: propUserId here, as we'll get it from context
    const [newMessage, setNewMessage] = useState("");
    const chatEndRef = useRef(null);
    const { messages, refetch } = useGetChatHistory(job._id);
    const { mutate: sendMessage } = useSendMessage();

    // Consume AuthContext to get the logged-in user
    const { user } = useContext(AuthContext); // Get the user object from AuthContext

    // Get the logged-in worker's userId from the AuthContext user object
    const loggedInWorkerId = user?._id; // Use the _id from the user object


    // Get the customer's ID from the job object for alignment
    const customerId = job?.postedBy?._id; // This is the customer's ID

    // Debugging: Log the worker's ID that you are using for comparison
    useEffect(() => {
        console.log("Worker's loggedInWorkerId (from AuthContext):", loggedInWorkerId);
        if (!loggedInWorkerId) {
            console.warn("WARNING: loggedInWorkerId is null or undefined. Chat alignment will not work correctly. Ensure user is logged in and context is providing _id.");
        }
        console.log("Customer ID (job.postedBy._id):", customerId);
    }, [loggedInWorkerId, customerId]);


    const handleReceiveMessage = useCallback((msg) => {
        console.log("Socket received message (raw):", msg);
        if (msg.jobId === job._id) {
            console.log("Message for current job. Refetching chat history.");
            refetch();
        }
    }, [job._id, refetch]);

    useEffect(() => {
        if (!job?._id) {
            console.log("No job ID, skipping socket room join.");
            return;
        }

        console.log(`Attempting to join socket room: ${job._id}`);
        socket.emit("joinRoom", { jobId: job._id });

        socket.on("receiveMessage", handleReceiveMessage);

        return () => {
            console.log(`Leaving socket room: ${job._id}`);
            socket.emit("leaveRoom", { jobId: job._id }); // Optional: Emit leaveRoom event if your backend supports it
            socket.off("receiveMessage", handleReceiveMessage);
        };
    }, [job?._id, handleReceiveMessage]);

    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [messages]);

    const handleSend = () => {
        const trimmed = newMessage.trim();
        if (!trimmed) return;

        const payload = {
            jobId: job._id,
            content: trimmed,
        };

        console.log("Sending message payload (REST API):", payload);

        sendMessage(payload, {
            onSuccess: (data) => {
                console.log("Message sent successfully via API, input cleared.");
                setNewMessage("");
            },
            onError: (error) => {
                console.error("Failed to send message via API:", error);
            }
        });
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleSend();
        }
    };

    if (!job) return null;

    const customer = job?.postedBy || {};

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl p-6 relative max-h-[90vh] overflow-y-auto">
                <button
                    className="absolute top-4 right-4 text-gray-500 hover:text-red-600"
                    onClick={onClose}
                >
                    <FaTimes size={20} />
                </button>

                <h2 className="text-2xl font-semibold text-[#FA5804] mb-4">Job Details</h2>

                <div className="space-y-3 text-gray-800 text-sm">
                    <div className="flex items-center gap-2">
                        <FaBriefcase className="text-[#FA5804]" />
                        <span><strong>Category:</strong> {job.category?.name || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaClock className="text-[#FA5804]" />
                        <span><strong>Date:</strong> {job.date} {job.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaMapMarkerAlt className="text-[#FA5804]" />
                        <span><strong>Location:</strong> {job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaUserTie className="text-[#FA5804]" />
                        <span><strong>Customer:</strong> {customer.username}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <FaPhone className="text-[#FA5804]" />
                        <span><strong>Phone:</strong> {customer.phone}</span>
                    </div>
                    <div className="mt-1 text-gray-700"><strong>Description:</strong> {job.description}</div>
                </div>

                {/* Chat Section */}
                <div className="mt-6 border-t pt-5">
                    <h3 className="text-xl font-semibold text-gray-800 mb-3">💬 Chat with Customer</h3>

                    {/* Messages */}
                    <div className="bg-gray-100 rounded-lg h-64 overflow-y-auto p-3 space-y-3">
                        {messages.length === 0 ? (
                            <p className="text-center text-gray-400 italic">
                                No messages yet. Start the conversation!
                            </p>
                        ) : (
                            messages.map((msg, idx) => {
                                // Extract the sender's actual _id from the populated object
                                const messageSenderId = msg.senderId && typeof msg.senderId === 'object'
                                    ? msg.senderId._id
                                    : msg.senderId; // Fallback for non-object senderId (e.g., if backend didn't populate for some reason, or optimistic)

                                // Debugging: Log senderId from message and worker's ID
                                console.log(`Message ${idx} - senderId:`, messageSenderId, " | loggedInWorkerId:", loggedInWorkerId);
                                console.log(`Comparison result (messageSenderId === loggedInWorkerId):`, messageSenderId === loggedInWorkerId);

                                // Determine if the message is from the logged-in worker (LEFT side)
                                const isWorkerMessage = messageSenderId === loggedInWorkerId;

                                return (
                                    <div
                                        key={idx}
                                        className={`flex ${isWorkerMessage ? "justify-start" : "justify-end"}`}
                                    >
                                        <div
                                            className={`max-w-xs px-4 py-2 rounded-lg text-sm shadow
                                                ${isWorkerMessage
                                                    ? "bg-white text-gray-800 border border-gray-300" // Worker's bubble (left)
                                                    : "bg-[#FA5804] text-white" // Customer's bubble (right)
                                                }`}
                                        >
                                            {msg.content}
                                        </div>
                                    </div>
                                );
                            })
                        )}
                        <div ref={chatEndRef} />
                    </div>

                    {/* Input */}
                    <div className="mt-3 flex items-center gap-2">
                        <input
                            type="text"
                            className="flex-1 border rounded-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#FA5804]"
                            placeholder="Type your message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                        <button
                            onClick={handleSend}
                            className="bg-[#FA5804] hover:bg-orange-600 text-white p-2 rounded-full transition"
                            aria-label="Send message"
                        >
                            <FaPaperPlane />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}