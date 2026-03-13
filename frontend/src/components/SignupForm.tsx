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

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const { login } = useAuth();

    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const response = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    email: formData.email,
                    password: formData.password
                }),
            });

            const data = await response.json();
            if (response.ok && data.token) {
                login(data.token, data.user);
                toast.success("Welcome!");
                navigate("/dashboard");
            } else {
                toast.error(data.error || 'Registration failed');
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
                    toast.success("Welcome!");
                    navigate("/dashboard");
                } else {
                    toast.error(data.error || "Google Sign Up Failed");
                    setIsGoogleLoading(false);
                }
            } catch (err) {
                toast.error("Google sync failed");
                setIsGoogleLoading(false);
            }
        },
        onError: () => {
            toast.error("Google Sign Up Failed");
            setIsGoogleLoading(false);
        },
        onNonOAuthError: () => setIsGoogleLoading(false),
    });

    return (
        <Card {...props}>
            <CardHeader>
                <CardTitle>Create an account</CardTitle>
                <CardDescription>
                    Enter your information below to create your account
                </CardDescription>
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit}>
                    <FieldGroup>
                        <Field>
                            <FieldLabel htmlFor="username">Username</FieldLabel>
                            <Input id="username" type="text" placeholder="John Doe" value={formData.username}
                                   autoComplete="username"
                                   onChange={handleChange} required />
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="email">Email</FieldLabel>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={formData.email}
                                autoComplete="email"
                                onChange={handleChange}
                                required
                            />
                            <FieldDescription>
                                We&apos;ll use this to contact you. We will not share your email
                                with anyone else.
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="password">Password</FieldLabel>
                            <Input id="password" type="password" value={formData.password}
                                   autoComplete="new-password"
                                   onChange={handleChange} required />
                            <FieldDescription>
                                Must be at least 8 characters long.
                            </FieldDescription>
                        </Field>
                        <Field>
                            <FieldLabel htmlFor="confirmPassword">
                                Confirm Password
                            </FieldLabel>
                            <Input id="confirmPassword" type="password" value={formData.confirmPassword}
                                   autoComplete="new-password"
                                   onChange={handleChange} required />
                            <FieldDescription>Please confirm your password.</FieldDescription>
                        </Field>
                        <FieldGroup>
                            <Field>
                                <Button type="submit">Create Account</Button>
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
                                    {isGoogleLoading ? "Connecting..." : "Sign up with Google"}
                                </Button>
                                <FieldDescription className="px-6 text-center">
                                    Already have an account? <Link to="/login" className="underline">Sign in</Link>
                                </FieldDescription>
                            </Field>
                        </FieldGroup>
                    </FieldGroup>
                </form>
            </CardContent>
        </Card>
    )
}
