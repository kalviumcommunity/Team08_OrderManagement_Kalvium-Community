"use client";

export default function ProfileCard({ profile, loading = false }) {
  if (loading || !profile) {
    return (
      <div className="bg-white rounded-xl p-10 text-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">

      {/* Header */}
      <div className="mb-10">

        <h2 className="text-2xl font-bold text-gray-800">
          Restaurant Profile
        </h2>

        <p className="text-gray-500 mt-2">
          View your registered restaurant information.
        </p>

      </div>

      {/* Form */}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Restaurant Name */}

        <div>

          <div className="bg-slate-50 border border-gray-200 rounded-xl p-4">

            <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
              
              Restaurant Name
            </p>

            <p className="font-semibold text-gray-800">
              {profile.restaurantName}
            </p>

          </div>

        </div>

        {/* Owner */}

        <div>

          <div className="bg-slate-50 border border-gray-200 rounded-xl p-4">

            <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
             
              Owner Name
            </p>

            <p className="font-semibold text-gray-800">
              {profile.name}
            </p>

          </div>

        </div>

        {/* Email */}

        <div>

          <div className="bg-slate-50 border border-gray-200 rounded-xl p-4">

            <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
              
              Email
            </p>

            <p className="font-semibold text-gray-800 break-all">
              {profile.email}
            </p>

          </div>

        </div>

        {/* Phone */}

        <div>

          <div className="bg-slate-50 border border-gray-200 rounded-xl p-4">

            <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
             
              Phone Number
            </p>

            <p className="font-semibold text-gray-800">
              {profile.phone}
            </p>

          </div>

        </div>

        {/* Business Type */}

        <div className="md:col-span-2 bg-slate-50 border border-gray-200 rounded-xl p-4">

          <p className="text-sm text-gray-500 mb-1 flex items-center gap-2">
          
            Business Type
          </p>

          <span className="inline-block bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-sm font-medium mt-1">
            {profile.businessType}
          </span>

        </div>

      </div>

    </div>
  );
}
