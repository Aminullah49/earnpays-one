import React from "react";

interface LogoProps {
  className?: string;
  iconSize?: number;
}

export const EarnPayLogo: React.FC<LogoProps> = ({ className = "", iconSize = 36 }) => {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      {/* Premium Gradient Logo Mark */}
      <div 
        className="relative flex items-center justify-center rounded-xl bg-slate-900 border border-slate-800 shadow-md overflow-hidden group"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-[80%] h-[80%] transition-transform duration-300 group-hover:scale-110"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Elegant Emerald & Mint Gradients */}
            <linearGradient id="epGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="lightningGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#34d399" />
              <stop offset="100%" stopColor="#059669" />
            </linearGradient>
            <linearGradient id="coinGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fbbf24" />
              <stop offset="100%" stopColor="#d97706" />
            </linearGradient>
            {/* Outer Ring Glow */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Abstract Grid Accent */}
          <circle cx="50" cy="50" r="42" stroke="rgba(16, 185, 129, 0.08)" strokeWidth="1.5" strokeDasharray="3 3" />
          
          {/* Main Stylized 'E' Interlocking Base */}
          <path
            d="M25 35C25 28.3726 30.3726 23 37 23H65C66.1046 23 67 23.8954 67 25V31C67 32.1046 66.1046 33 65 33H41C38.7909 33 37 34.7909 37 37V43H57C58.1046 43 59 43.8954 59 45V51C59 52.1046 58.1046 53 57 53H37V63C37 65.2091 38.7909 67 41 67H65C66.1046 67 67 67.8954 67 69V75C67 76.1046 66.1046 77 65 77H37C30.3726 77 25 71.6274 25 65V35Z"
            fill="url(#epGrad)"
          />

          {/* Dynamic Lightning Bolt/Profit Vector inside E */}
          <path
            d="M60 20L44 52H56L40 80L70 42H54L60 20Z"
            fill="url(#lightningGrad)"
            opacity="0.85"
            style={{ mixBlendMode: "screen" }}
          />

          {/* Mini Gold Coin Accent reflecting "Pay / Wealth" */}
          <circle
            cx="75"
            cy="50"
            r="10"
            fill="url(#coinGrad)"
            stroke="#111827"
            strokeWidth="2"
            filter="url(#glow)"
          />
          <path
            d="M75 45V55M72 47H78M72 53H78"
            stroke="#fff"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
        </svg>

        {/* Glow ring in hover state */}
        <div className="absolute inset-0 border border-emerald-500/0 rounded-xl group-hover:border-emerald-500/30 transition-colors duration-300 pointer-events-none" />
      </div>

      {/* Sleek Text Logotype */}
      <div className="flex flex-col">
        <span className="font-display font-black text-lg text-white tracking-tight leading-none flex items-center">
          Earn<span className="text-emerald-400">Pay</span>
          <span className="text-[8px] tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded-md font-mono font-black ml-1.5 align-middle uppercase">
            Global
          </span>
        </span>
        <span className="text-[7.5px] text-slate-500 font-mono font-medium tracking-widest uppercase mt-0.5">
          Secure Rewards Protocol
        </span>
      </div>
    </div>
  );
};
