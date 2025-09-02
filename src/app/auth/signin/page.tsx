'use client';

import React, { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    nickname: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (isSignUp) {
        // Validation for signup
        if (formData.password !== formData.confirmPassword) {
          alert('パスワードが一致しません');
          setIsLoading(false);
          return;
        }

        if (formData.password.length < 6) {
          alert('パスワードは6文字以上で入力してください');
          setIsLoading(false);
          return;
        }

        // Create new user
        const signupResponse = await fetch('/api/auth/signup', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            name: formData.name,
            nickname: formData.nickname,
          }),
        });

        const signupData = await signupResponse.json();

        if (!signupData.success) {
          alert(signupData.error || 'サインアップに失敗しました');
          setIsLoading(false);
          return;
        }

        // Auto sign in after successful signup
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.ok) {
          router.push('/');
        } else {
          alert('サインインに失敗しました');
        }
      } else {
        // Sign in existing user
        const result = await signIn('credentials', {
          email: formData.email,
          password: formData.password,
          redirect: false,
        });

        if (result?.ok) {
          router.push('/');
        } else {
          alert('メールアドレスまたはパスワードが間違っています');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('エラーが発生しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            AI恋人アプリ
          </h1>
          <p className="text-gray-600">
            {isSignUp ? 'アカウントを作成してください' : 'ログインしてください'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              メールアドレス
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              パスワード
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="6文字以上"
            />
          </div>

          {isSignUp && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  パスワード確認
                </label>
                <input
                  type="password"
                  required
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="パスワードを再入力"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  お名前
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="山田太郎"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  呼び名（相手に呼んでもらいたい名前）
                </label>
                <input
                  type="text"
                  required
                  value={formData.nickname}
                  onChange={(e) => setFormData({ ...formData, nickname: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="太郎くん、真実ちゃん など"
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:opacity-50"
          >
            {isLoading ? '処理中...' : (isSignUp ? 'アカウント作成' : 'ログイン')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-blue-500 hover:text-blue-600"
          >
            {isSignUp ? 'すでにアカウントをお持ちですか？ログイン' : 'アカウントをお持ちでないですか？新規登録'}
          </button>
        </div>
      </div>
    </div>
  );
}