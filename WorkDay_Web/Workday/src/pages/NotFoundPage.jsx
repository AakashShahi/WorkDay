import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function NotFoundPage() {
    const navigate = useNavigate();

    return (
        <div
            className="relative h-screen w-full flex flex-col items-center justify-center text-white px-4"
            style={{
                backgroundImage: "linear-gradient(to bottom right, #2563EB, #1E40AF, #1e293b)",
                overflow: "hidden",
            }}
        >
            {/* Floating Stars */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:40px_40px] pointer-events-none z-0" />

            {/* Floating Robot Emoji */}
            <motion.div
                initial={{ y: 0 }}
                animate={{ y: [-10, 10, -10] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="text-8xl z-10 mb-4"
            >
                🤖
            </motion.div>

            {/* 404 Text */}
            <motion.h1
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="z-10 text-4xl sm:text-5xl font-extrabold text-center"
            >
                404 – You're Lost in Space!
            </motion.h1>

            {/* Message */}
            <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="z-10 text-lg mt-4 max-w-xl text-center text-blue-100"
            >
                Even NASA gave up trying to find this page. But this bot's having a cosmic chill!
            </motion.p>

            {/* Button */}
            <motion.button
                onClick={() => {
                    const userStr = localStorage.getItem("user");
                    if (userStr) {
                        try {
                            const user = JSON.parse(userStr);
                            if (user?.role === "admin") navigate("/admin/dashboard");
                            else if (user?.role === "worker") navigate("/worker/dashboard");
                            else if (user?.role === "customer") navigate("/"); // Customer dashboard is usually home or specific route
                            else navigate("/");
                        } catch (e) {
                            navigate("/");
                        }
                    } else {
                        navigate("/login");
                    }
                }}
                className="mt-8 px-8 py-3 bg-white text-blue-600 font-bold rounded-full shadow-xl hover:bg-blue-100 transition-all z-10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: "spring", stiffness: 300 }}
            >
                Go to Dashboard
            </motion.button>

            {/* Floating asteroids (humor effect) */}
            <motion.div
                className="absolute top-12 left-12 text-4xl z-0"
                animate={{ x: [0, 20, -20, 0], rotate: [0, 15, -15, 0] }}
                transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            >
                🪨
            </motion.div>
            <motion.div
                className="absolute bottom-20 right-16 text-5xl z-0"
                animate={{ y: [0, 15, -15, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
                🪐
            </motion.div>
        </div>
    );
}
