'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

const departments = [
    'Engineering',
    'Science',
    'Business',
    'Arts',
    'Medicine',
    'Law',
    'Education',
    'Other',
];

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        email: '',
        name: '',
        password: '',
        confirmPassword: '',
        department: '',
        role: 'STAFF',
        agreeToTerms: false,
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');

    const getPasswordStrength = (password: string) => {
        if (password.length === 0) return { strength: 0, label: '', color: '' };
        if (password.length < 6) return { strength: 1, label: 'Weak', color: 'bg-red-500' };
        if (password.length < 10) return { strength: 2, label: 'Fair', color: 'bg-yellow-500' };
        if (password.length < 12 || !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
            return { strength: 3, label: 'Good', color: 'bg-blue-500' };
        }
        return { strength: 4, label: 'Strong', color: 'bg-green-500' };
    };

    const passwordStrength = getPasswordStrength(formData.password);

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        }

        if (!formData.email) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Invalid email format';
        }

        if (!formData.password) {
            newErrors.password = 'Password is required';
        } else if (formData.password.length < 8) {
            newErrors.password = 'Password must be at least 8 characters';
        }

        if (formData.password !== formData.confirmPassword) {
            newErrors.confirmPassword = 'Passwords do not match';
        }

        if (!formData.department) {
            newErrors.department = 'Please select a department';
        }

        if (!formData.agreeToTerms) {
            newErrors.agreeToTerms = 'You must agree to the terms and conditions';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSuccessMessage('');

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email: formData.email,
                    name: formData.name,
                    password: formData.password,
                    department: formData.department,
                    role: formData.role,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrors({ general: data.error || 'Signup failed' });
            } else {
                setSuccessMessage('Account created successfully! Redirecting to login...');
                setTimeout(() => {
                    router.push('/login');
                }, 2000);
            }
        } catch (error) {
            setErrors({ general: 'An error occurred. Please try again.' });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4 py-12">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2">Create Account</h1>
                    <p className="text-slate-600">Join ChAI Academy today</p>
                </div>

                {/* Signup Form */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-100">
                    {successMessage && (
                        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                            <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-green-800">{successMessage}</p>
                        </div>
                    )}

                    {errors.general && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            <p className="text-sm text-red-800">{errors.general}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <Input
                            label="Full Name"
                            type="text"
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            error={errors.name}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            }
                        />

                        <Input
                            label="Email Address"
                            type="email"
                            placeholder="your.email@university.edu"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            error={errors.email}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                                </svg>
                            }
                        />

                        <div>
                            <Input
                                label="Password"
                                type="password"
                                placeholder="Create a strong password"
                                value={formData.password}
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                error={errors.password}
                                icon={
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                }
                            />
                            {formData.password && (
                                <div className="mt-2">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-xs text-slate-600">Password strength:</span>
                                        <span className={`text-xs font-medium ${passwordStrength.strength === 1 ? 'text-red-600' :
                                                passwordStrength.strength === 2 ? 'text-yellow-600' :
                                                    passwordStrength.strength === 3 ? 'text-blue-600' :
                                                        'text-green-600'
                                            }`}>
                                            {passwordStrength.label}
                                        </span>
                                    </div>
                                    <div className="flex gap-1">
                                        {[1, 2, 3, 4].map((level) => (
                                            <div
                                                key={level}
                                                className={`h-1 flex-1 rounded-full transition-colors ${level <= passwordStrength.strength
                                                        ? passwordStrength.color
                                                        : 'bg-slate-200'
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        <Input
                            label="Confirm Password"
                            type="password"
                            placeholder="Re-enter your password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            error={errors.confirmPassword}
                            icon={
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            }
                        />

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                Department
                            </label>
                            <select
                                value={formData.department}
                                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                className={`
                  w-full px-4 py-2.5 rounded-lg border
                  ${errors.department
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
                                        : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500'
                                    }
                  focus:outline-none focus:ring-2 focus:ring-opacity-50
                  transition-colors duration-200
                `}
                            >
                                <option value="">Select your department</option>
                                {departments.map((dept) => (
                                    <option key={dept} value={dept}>
                                        {dept}
                                    </option>
                                ))}
                            </select>
                            {errors.department && (
                                <p className="mt-1.5 text-sm text-red-600">{errors.department}</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                I am a:
                            </label>
                            <div className="flex gap-4">
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="STAFF"
                                        checked={formData.role === 'STAFF'}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900">Learner</span>
                                </label>
                                <label className="flex items-center gap-2 cursor-pointer group">
                                    <input
                                        type="radio"
                                        name="role"
                                        value="INSTRUCTOR"
                                        checked={formData.role === 'INSTRUCTOR'}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="w-4 h-4 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                    />
                                    <span className="text-sm text-slate-700 group-hover:text-slate-900">Instructor</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="flex items-start gap-2 cursor-pointer group">
                                <input
                                    type="checkbox"
                                    checked={formData.agreeToTerms}
                                    onChange={(e) => setFormData({ ...formData, agreeToTerms: e.target.checked })}
                                    className="w-4 h-4 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500 focus:ring-2 cursor-pointer"
                                />
                                <span className="text-sm text-slate-600 group-hover:text-slate-900 transition-colors">
                                    I agree to the{' '}
                                    <Link href="/terms" className="text-blue-600 hover:text-blue-700 font-medium">
                                        Terms of Service
                                    </Link>{' '}
                                    and{' '}
                                    <Link href="/privacy" className="text-blue-600 hover:text-blue-700 font-medium">
                                        Privacy Policy
                                    </Link>
                                </span>
                            </label>
                            {errors.agreeToTerms && (
                                <p className="mt-1.5 text-sm text-red-600">{errors.agreeToTerms}</p>
                            )}
                        </div>

                        <Button type="submit" isLoading={isLoading}>
                            Create Account
                        </Button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-slate-500">Already have an account?</span>
                        </div>
                    </div>

                    {/* Sign In Link */}
                    <Link href="/login">
                        <Button variant="outline" type="button">
                            Sign In
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}
