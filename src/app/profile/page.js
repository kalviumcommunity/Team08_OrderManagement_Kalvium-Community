import Sidebar from "@/app/components/Sidebar";
import Navbar from "@/app/components/Navbar";
import ProfileCard from "@/app/components/profile/ProfileCard";

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-gray-100 flex">

      <Sidebar />

      <div className="flex-1 flex flex-col">

        <Navbar />

        <main className="p-4 sm:p-6 lg:p-8">

          <ProfileCard />

        </main>

      </div>

    </div>
  );
}
