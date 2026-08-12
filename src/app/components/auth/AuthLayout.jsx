import AuthHero from "./AuthHero";

/**
 * AuthLayout Component
 * Two-column split shell layout used for authentication pages (Login and Signup).
 * Left column features the Hero banner; right column renders child form elements.
 */
export default function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-gray-100 flex items-center justify-center p-4 md:p-6">
      <div className="w-full max-w-7xl bg-white rounded-3xl overflow-hidden shadow-2xl">
        <div className="grid lg:grid-cols-2 min-h-[750px]">
          {/* Left Column: Branded Hero Banner */}
          <AuthHero />

          {/* Right Column: Dynamic Auth Form Container */}
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