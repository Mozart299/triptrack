'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle, CheckCircle2, Plane } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const router = useRouter();
  const redirectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (redirectTimer.current) clearTimeout(redirectTimer.current);
    };
  }, []);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    const supabase = createClient();

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setMessage('Account created! Check your email to confirm your account.');
      setLoading(false);
      redirectTimer.current = setTimeout(() => {
        router.push('/login');
      }, 3000);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="max-w-md w-full">
        <Card className="shadow-sm">
          <CardHeader className="justify-items-center text-center">
            <div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Plane className="size-5" />
            </div>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Start tracking your next trip</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignup} className="space-y-5">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="size-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {message && (
                <Alert className="border-emerald-200 bg-emerald-50 text-emerald-800">
                  <CheckCircle2 className="size-4" />
                  <AlertDescription className="text-emerald-800">
                    {message}
                  </AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <PasswordInput
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  minLength={6}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full"
                size="lg"
              >
                {loading ? 'Creating account...' : 'Create Account'}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="font-medium text-primary underline-offset-4 hover:underline"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-muted-foreground text-sm mt-6">
          Bring every trip plan into one shared workspace
        </p>
      </div>
    </div>
  );
}
