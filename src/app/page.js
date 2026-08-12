import AuthLayout from "@/app/components/auth/AuthLayout";
import LoginForm from "@/app/components/auth/LoginForm";

/**
 * Home / Login Page Component (Route: `/`)
 * Renders the authentication layout with the login form.
 */
export default function Home() {
  return (
    <AuthLayout>
      {/* Login form handles email/password credentials submission */}
      <LoginForm />
    </AuthLayout>
  );
}