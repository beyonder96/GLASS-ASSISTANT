/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./App.tsx",
        "./index.tsx",
        "./components/**/*.{js,ts,jsx,tsx}"
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', 'sans-serif'],
            },
            colors: {
                glass: {
                    border: 'rgba(255, 255, 255, 0.5)',
                    surface: 'rgba(255, 255, 255, 0.35)',
                    highlight: 'rgba(255, 255, 255, 0.6)',
                }
            },
            animation: {
                'gradient-x': 'gradient-x 15s ease infinite',
                'float': 'float 6s ease-in-out infinite',
                'blob': 'blob 7s infinite',
                'aura-waves': 'aura-waves 2.5s cubic-bezier(0.1, 0, 0.3, 1) infinite',
                'pulse-fast': 'pulse-fast 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                'shimmer': 'shimmer 2.5s infinite linear',
                'typing-dot': 'typing-dot 1.4s infinite ease-in-out',
                'message-pop': 'message-pop 0.5s cubic-bezier(0.2, 0.8, 0.2, 1.1) forwards',
                'morph': 'morph 8s ease-in-out infinite',
            },
            keyframes: {
                'gradient-x': {
                    '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
                    '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'blob': {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(10px, -20px) scale(1.1)' },
                    '66%': { transform: 'translate(-10px, 10px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                'aura-waves': {
                    '0%': { transform: 'scale(0.8)', opacity: '0.8' },
                    '100%': { transform: 'scale(2.5)', opacity: '0' },
                },
                'pulse-fast': {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.4' },
                },
                'shimmer': {
                    '0%': { transform: 'translateX(-100%)' },
                    '100%': { transform: 'translateX(100%)' },
                },
                'typing-dot': {
                    '0%, 80%, 100%': { opacity: '0', transform: 'scale(0.8)' },
                    '40%': { opacity: '1', transform: 'scale(1.2)' }
                },
                'message-pop': {
                    '0%': { opacity: '0', transform: 'translateY(20px) scale(0.9)', filter: 'blur(10px)' },
                    '100%': { opacity: '1', transform: 'translateY(0) scale(1)', filter: 'blur(0px)' }
                },
                'morph': {
                    '0%, 100%': { 'border-radius': '42% 58% 70% 30% / 45% 45% 55% 55%' },
                    '33%': { 'border-radius': '70% 30% 46% 54% / 30% 39% 61% 70%' },
                    '66%': { 'border-radius': '50% 50% 34% 66% / 56% 68% 32% 44%' },
                }
            }
        },
    },
    plugins: [],
}
