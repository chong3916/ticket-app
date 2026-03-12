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
import React, { useCallback, useState } from "react";
import { useAuth } from "@/context/AuthContext.tsx";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { GoogleLogin } from "@react-oauth/google";

export function LoginForm({ className, ...props }: React.ComponentProps<"div">) {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();

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
                toast.success("Welcome back!");
                navigate("/dashboard");
            } else {
                toast.error(data.error || "Google login failed");
            }
        } catch (err) {
            toast.error("Server connection failed");
        }
    }, [login, navigate]);

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
                                <GoogleLogin theme="outline"
                                             onSuccess={handleGoogleSuccess}
                                             onError={() => toast.error("Google Login Failed")}
                                />
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
