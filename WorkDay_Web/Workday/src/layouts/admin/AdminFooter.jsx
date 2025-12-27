export default function AdminFooter() {
    return (
        <footer className="w-full bg-white border-t border-gray-200 px-6 py-4 mt-auto font-Inter">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-gray-500 text-sm">
                <div>
                    &copy; 2025 KaamMaa. All rights reserved.
                </div>
                <div className="flex gap-6">
                    <a href="#" className="hover:text-primary">
                        Help Center
                    </a>
                    <a href="#" className="hover:text-primary">
                        Support
                    </a>
                    <a href="#" className="hover:text-primary">
                        Privacy Policy
                    </a>
                    <a href="#" className="hover:text-primary">
                        Terms of Service
                    </a>
                </div>
            </div>
        </footer>
    );
}
