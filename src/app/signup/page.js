import AuthLayout from "@/app/components/auth/AuthLayout";
import SignupForm from "@/app/components/auth/SignupForm";

/**
 * User Registration Page Component (Route: `/signup`)
 * Renders the authentication layout with the multi-field registration form.
 */
export default function SignupPage() {
  return (
    <AuthLayout>
      {/* Registration form collecting owner name, restaurant details, email, and password */}
      <SignupForm />
    </AuthLayout>
  );
}