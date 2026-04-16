import Sidebar from "@/components/Sidebar";
import MapWrapper from "@/components/MapWrapper";

export default function Home() {
  return (
    <main className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-white">
      <Sidebar />
      <div className="flex-1 h-full z-0 relative">
        <MapWrapper />
      </div>
    </main>
  );
}
