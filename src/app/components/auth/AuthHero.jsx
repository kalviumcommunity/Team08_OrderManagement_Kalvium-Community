import Image from "next/image";

export default function AuthHero() {
  return (
    <div className="hidden lg:flex relative w-full h-full items-center justify-center overflow-hidden">

      {/* Background Image */}
      <Image
        src="/delivery.png"
        alt="Restaurant Background"
        fill
        className="object-cover absolute inset-0"
        priority
      />

      {/* Dark Overlay */}
      <div className="absolute inset-0 bg-black/50"></div>

      {/* Glass Card Content */}
      <div className="relative z-10 px-8 xl:px-12 text-white text-center">

        <h1 className="text-3xl xl:text-4xl font-bold">
          FoodOps Pro
        </h1>

        <p className="mt-4 text-gray-100 text-base xl:text-lg leading-7">
          Manage orders, inventory, staff, reports and analytics
          from one powerful dashboard.
        </p>

        <div className="mt-12">
          <h2 className="text-2xl xl:text-3xl font-semibold">
            Grow Your Restaurant Digitally
          </h2>

          <p className="mt-3 text-gray-200 leading-7">
            Register your restaurant and manage orders,
            inventory, staff, reports and customers from
            one unified platform.
          </p>
        </div>

      </div>

    </div>
  );
}