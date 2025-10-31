"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { toast } from "sonner";
import api from "@/api/axios";
import { apiConfig } from "@/config/api";
import { PublicRoute } from "@/components/auth/public-route";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [contactPersonName, setContactPersonName] = useState("");
  const [contactPersonEmail, setContactPersonEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(apiConfig.endpoints.authCompanyRegister, {
        name,
        email,
        password,
        address,
        phone,
        website,
        contactPersonName,
        contactPersonEmail,
      });
      toast.success("Account created. Please sign in.");
      router.replace("/login");
    } catch (err: unknown) {
      const anyErr = err as { response?: { data?: { detail?: string } } };
      const msg = anyErr?.response?.data?.detail || "Signup failed";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PublicRoute redirectIfAuthenticated={true}>
      <div className="min-h-screen flex items-center justify-center  p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Create an account</CardTitle>
            <CardDescription>Sign up to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" value={address} onChange={(e) => setAddress(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input id="website" value={website} onChange={(e) => setWebsite(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPersonName">Contact Person Name</Label>
                <Input id="contactPersonName" value={contactPersonName} onChange={(e) => setContactPersonName(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="contactPersonEmail">Contact Person Email</Label>
                <Input id="contactPersonEmail" type="email" value={contactPersonEmail} onChange={(e) => setContactPersonEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Creating..." : "Create account"}
              </Button>
            </form>
            <p className="text-sm text-muted-foreground mt-4">
              Already have an account? <Link href="/login" className="underline">Sign in</Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </PublicRoute>
  );
}
