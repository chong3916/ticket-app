import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext.tsx";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useGoogleLogin } from "@react-oauth/google";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            if (response.ok && data.token) {
                login(data.token, data.user);
                toast.success("Welcome back!");
                navigate("/dashboard");
            } else {
                toast(data.error || 'Something went wrong');
            }
        } catch (err) {
            toast.error("Could not connect to the server.");
            console.error("Auth error:", err);
        }
    };

    const googleLoginTrigger = useGoogleLogin({
        flow: 'auth-code',
        onSuccess: async (codeResponse) => {
            try {
                const response = await fetch('/api/auth/google', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: codeResponse.code }),
                });

                const data = await response.json();
                if (response.ok && data.token) {
                    login(data.token, data.user);
                    toast.success("Welcome back!");
                    navigate("/dashboard");
                } else {
                    toast.error(data.error || "Google Login Failed");
                    setIsGoogleLoading(false);
                }
            } catch (err) {
                toast.error("Google sync failed");
                setIsGoogleLoading(false);
            }
        },
        onError: () => {
            toast.error("Google Login Failed");
            setIsGoogleLoading(false);
        },
        onNonOAuthError: () => setIsGoogleLoading(false),
    });

    return (
        <div className={ cn("flex flex-col gap-6", className) } { ...props }>
            <Card>
                <CardHeader>
                    <CardTitle>Login to your account</CardTitle>
                    <CardDescription>
                        Enter your email below to login to your account
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit}>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="email">Email</FieldLabel>
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="m@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />
                            </Field>
                            <Field>
                                <div className="flex items-center">
                                    <FieldLabel htmlFor="password">Password</FieldLabel>
                                    <a
                                        href="#"
                                        className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                                    >
                                        Forgot your password?
                                    </a>
                                </div>
                                <Input id="password" type="password" value={password}
                                       autoComplete="current-password"
                                       onChange={(e) => setPassword(e.target.value)} required/>
                            </Field>
                            <Field>
                                <Button type="submit">Login</Button>
                                <Button
                                    variant="outline"
                                    type="button"
                                    className="w-full gap-2"
                                    disabled={isGoogleLoading}
                                    onClick={(e) => {
                                        e.preventDefault();
                                        setIsGoogleLoading(true);
                                        googleLoginTrigger();
                                    }}
                                >
                                    {isGoogleLoading ? (
                                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                    ) : (
                                        <svg version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" xmlnsXlink="http://www.w3.org/1999/xlink" style={ { display: "block" } }>
                                            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                                            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                                            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                                            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                                            <path fill="none" d="M0 0h48v48H0z"></path>
                                        </svg>
                                    )}
                                    {isGoogleLoading ? "Connecting..." : "Login with Google"}
                                </Button>
                                <FieldDescription className="text-center">
                                    Don&apos;t have an account? <Link to="/signup" className="underline">Sign up</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </form>
                </CardContent>
            </Card>
        </div>
    )
}
