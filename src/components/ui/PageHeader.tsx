'use client';

export default function PageHeader({ title }: { title: string }) {
    return (
        <div className="flex items-center gap-4 py-4 px-6 border-b border-white/5 sticky top-0 bg-[#0b0e11]/80 backdrop-blur-md z-50 pt-[calc(6rem+env(safe-area-inset-top))]">
            <h1 className="text-xl font-bold">{title}</h1>
        </div>
    );
}
