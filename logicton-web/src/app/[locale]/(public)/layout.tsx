import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { EditModeProvider } from "@/providers/EditModeProvider";
import { EditModeBar } from "@/components/EditModeBar";
import { EditModeToggle } from "@/components/EditModeToggle";

export default function PublicLayout(
    { children }: { children: React.ReactNode; }
) {
    return (
        <EditModeProvider>
            <Navbar />
            <main className="flex-grow pt-20">
                {children}
            </main>
            <Footer />
            <EditModeToggle />
            <EditModeBar />
        </EditModeProvider>
    );
}
