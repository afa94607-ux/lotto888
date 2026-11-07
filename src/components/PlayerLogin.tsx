import React, { useState } from 'react';
import { Lock, User, Sparkles, AlertCircle, Eye, EyeOff, ShieldCheck, Play, ShieldAlert } from 'lucide-react';
import { AppUser } from '../types/lottery';
import { sound } from '../utils/audio';

interface PlayerLoginProps {
  users: AppUser[];
  onLogin: (user: AppUser) => void;
  onOpenAdminPortal?: () => void;
}

export const PlayerLogin: React.FC<PlayerLoginProps> = ({ users, onLogin, onOpenAdminPortal }) => {
  const [username, setUsername] = useState('AADPDPP001');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Filter available player accounts for demo helper chips
  const memberUsers = users.filter((u) => u.role === 'MEMBER' || u.role === 'AGENT');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    sound.playClick();

    setTimeout(() => {
      setIsLoading(false);
      const cleanUsername = username.trim().toUpperCase();
      const user = users.find(
        (u) => u.id.toUpperCase() === cleanUsername || (u.phone && u.phone.replace(/\s+/g, '') === cleanUsername.replace(/\s+/g, ''))
      );

      if (!user) {
        setError('រកមិនឃើញគណនីនេះទេ! សូមពិនិត្យឈ្មោះគណនី ឬទាក់ទង Admin ដើម្បីបង្កើតគណនី។');
        sound.playBeep();
        return;
      }

      // Check password
      const userPassword = user.password || '123456';
      if (password !== userPassword) {
        setError('ពាក្យសម្ងាត់មិនត្រឹមត្រូវទេ! ពាក្យសម្ងាត់ត្រូវបានកំណត់ដោយ Admin ប៉ុណ្ណោះ។');
        sound.playBeep();
        return;
      }

      // Check status
      if (user.status === 'SUSPENDED') {
        setError('គណនីនេះត្រូវបានផ្អាកជាបណ្តោះអាសន្ន (Suspended)! សូមទាក់ទង Admin/Master។');
        sound.playBeep();
        return;
      }

      // Login success
      sound.playWin();
      onLogin(user);
    }, 350);
  };

  const handleSelectDemoAccount = (demoUser: AppUser) => {
    sound.playSelect();
    setUsername(demoUser.id);
    setPassword(demoUser.password || '123456');
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e3c72] via-[#2a5298] to-[#0f2027] flex flex-col justify-center items-center p-4 selection:bg-amber-400 selection:text-slate-900">
      {/* Decorative Lottery Background Glow */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 -right-40 w-96 h-96 bg-amber-400/15 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {/* Brand Banner Card */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-400 via-yellow-300 to-amber-500 p-1 shadow-[0_10px_25px_rgba(245,158,11,0.4)] mb-3 transform hover:scale-105 transition-transform">
            <div className="w-full h-full bg-[#1e3c72] rounded-[14px] flex flex-col items-center justify-center text-amber-300">
              <span className="text-2xl font-black font-mono tracking-tighter">1/99</span>
              <span className="text-[9px] font-bold tracking-wider text-amber-200">SAMNANG</span>
            </div>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white tracking-wide drop-shadow-md">
            ឆ្នោតសំណាង 1/99
          </h1>
          <p className="text-sm font-semibold text-amber-300 mt-1">
            វេទិកាហ្គេមចាក់ឆ្នោតអនឡាញ (Lottery Gaming Platform)
          </p>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-200 text-xs mt-2 border border-white/10">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>ប្រព័ន្ធចាក់ឆ្នោត 5 ប៉ុស្តិ៍ (A, B, C, D, E) ផ្សាយផ្ទាល់</span>
          </div>
        </div>

        {/* Main Login Box */}
        <div className="bg-slate-900/90 backdrop-blur-xl border border-blue-400/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5">
          <div className="border-b border-slate-800 pb-3">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-400" />
              <span>ចូលលេងកម្សាន្ត (Player Login)</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              សូមបញ្ចូលឈ្មោះគណនី និងពាក្យសម្ងាត់ដែល Admin បានផ្ដល់ជូន
            </p>
          </div>

          {error && (
            <div className="bg-rose-500/15 border border-rose-500/40 rounded-xl p-3 flex items-start gap-2.5 text-rose-300 text-xs animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username / User ID */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                ឈ្មោះគណនី ឬ ID អ្នកលេង (User ID)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <User className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="ឧទាហរណ៍: AADPDPP001"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all uppercase"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                ពាក្យសម្ងាត់ (Password)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Lock className="h-4 w-4 text-slate-400" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="បញ្ចូលពាក្យសម្ងាត់"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-white font-mono text-sm placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Admin Policy Notice */}
            <div className="p-2.5 rounded-xl bg-blue-950/50 border border-blue-500/20 text-[11px] text-blue-200 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span>
                <strong>សេចក្តីជូនដំណឹង:</strong> ឈ្មោះគណនី និងពាក្យសម្ងាត់ត្រូវបានបង្កើត និងគ្រប់គ្រងដោយ Admin ប៉ុណ្ណោះ។
              </span>
            </div>

            {/* Login Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 rounded-xl font-black text-sm tracking-wide text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 hover:from-amber-300 hover:to-yellow-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>ចូលប្រព័ន្ធលេងឆ្នោត (LOGIN TO PLAY)</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Helper */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] font-bold text-slate-400 mb-2 flex items-center justify-between">
              <span>គណនីគំរូដែល Admin បានបង្កើត (Demo Accounts):</span>
              <span className="text-[10px] text-amber-400">ចុចដើម្បីបំពេញ</span>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {memberUsers.slice(0, 3).map((user) => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => handleSelectDemoAccount(user)}
                  className={`text-left p-2 rounded-xl border text-xs transition-all flex items-center justify-between ${
                    username === user.id
                      ? 'bg-amber-500/20 border-amber-400 text-amber-200'
                      : 'bg-slate-950/50 border-slate-800 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div>
                    <div className="font-mono font-bold text-amber-300">{user.id}</div>
                    <div className="text-[11px] text-slate-400">{user.name}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-emerald-400 font-bold">
                      {user.balance.toLocaleString()}៛
                    </div>
                    <div className="text-[10px] text-slate-500 font-mono">
                      Pass: {user.password || '123456'}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 text-xs text-blue-200/60">
          © 2026 ឆ្នោតសំណាង 1/99 Thai Samnang Platform. All Rights Reserved.
        </div>
      </div>
    </div>
  );
};
