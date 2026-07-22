import AuthLayout from "@/app/components/auth/AuthLayout";
import LoginForm from "@/app/components/auth/LoginForm";

export default function Home() {
    return (
        <AuthLayout>
            <LoginForm />
        </AuthLayout>
    );
}