'use client';

import { useUser } from "@/components/UserContext";
import BottomNav from "@/components/layout/BottomNav";
import MaintenanceStub from "@/components/MaintenanceStub";

export default function AppContent({ children }: { children: React.ReactNode }) {
    const { isAdmin, user, isLoading } = useUser();

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)]">
                <div className="text-[var(--accent)] animate-pulse font-black uppercase tracking-widest text-xs">
                    Initialising...
                </div>
            </div>
        );
    }

    const isAllowed = isAdmin || (user as any)?.isWhitelisted;

    if (!isAllowed) {
        return <MaintenanceStub />;
    }

    return (
        <div className="pb-28">
            {children}
            <BottomNav />
        </div>
    );
}
