import AuthLayout from "@/app/components/auth/AuthLayout";
import SignupForm from "@/app/components/auth/SignupForm";

export default function SignupPage() {
    return (
        <AuthLayout>
            <SignupForm />
        </AuthLayout>
    );
}