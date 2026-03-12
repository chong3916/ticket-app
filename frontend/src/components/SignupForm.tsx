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
import React, { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext.tsx";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";

export function SignupForm({ ...props }: React.ComponentProps<typeof Card>) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const { login } = useAuth();

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

    const handleGoogleSuccess = useCallback(async (credentialResponse: any) => {
        try {
            const response = await fetch('/api/auth/google', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token: credentialResponse.credential }),
            });

            const data = await response.json();
            if (response.ok && data.token) {
                login(data.token, data.user);
                toast.success("Welcome!");
                navigate("/dashboard");
            } else {
                toast.error(data.error || "Google sign up failed");
            }
        } catch (err) {
            toast.error("Server connection failed");
        }
    }, [login, navigate]);

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
                                <GoogleLogin
                                    onSuccess={handleGoogleSuccess}
                                    onError={() => toast.error("Signup Failed")}
                                    text="signup_with"
                                />
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
