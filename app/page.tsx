import Sidebar from "@/components/Sidebar";
import dynamic from "next/dynamic";
import UrlSync from "@/components/UrlSync";

const Map = dynamic(() => import("@/components/Map"), { 
  ssr: false,
  loading: () => <div className="h-full w-full bg-gray-100 animate-pulse" />
});

export default function Home() {
  return (
    <main className="h-screen w-full flex flex-col md:flex-row overflow-hidden bg-white">
      <UrlSync />
      <Sidebar />
      <div className="flex-1 h-full z-0 relative">
        <Map />
      </div>
    </main>
  );
}
