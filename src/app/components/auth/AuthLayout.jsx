import AuthHero from "./AuthHero";

export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-7xl bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid lg:grid-cols-2 min-h-[750px]">
          <AuthHero />

          <div className="flex items-center justify-center p-6 md:p-10 xl:p-14">
            <div className="w-full max-w-lg">
              {children}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}