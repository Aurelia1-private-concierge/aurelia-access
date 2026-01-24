import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
  	container: {
  		center: true,
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		fontFamily: {
  			sans: [
  				'Open Sans',
  				'ui-sans-serif',
  				'system-ui',
  				'sans-serif',
  				'Apple Color Emoji',
  				'Segoe UI Emoji',
  				'Segoe UI Symbol',
  				'Noto Color Emoji'
  			],
  			serif: [
  				'Playfair Display',
  				'ui-serif',
  				'Georgia',
  				'Cambria',
  				'Times New Roman',
  				'Times',
  				'serif'
  			],
  			display: [
  				'Cormorant Garamond',
  				'serif'
  			],
  			mono: [
  				'Roboto Mono',
  				'ui-monospace',
  				'SFMono-Regular',
  				'Menlo',
  				'Monaco',
  				'Consolas',
  				'Liberation Mono',
  				'Courier New',
  				'monospace'
  			]
  		},
  		colors: {
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			platinum: {
  				DEFAULT: 'hsl(var(--platinum))',
  				light: 'hsl(var(--platinum-light))',
  				muted: 'hsl(var(--platinum-muted))'
  			},
  			silver: {
  				DEFAULT: 'hsl(var(--silver))',
  				light: 'hsl(var(--silver-light))'
  			},
  			obsidian: {
  				DEFAULT: 'hsl(var(--obsidian))',
  				light: 'hsl(var(--obsidian-light))'
  			},
  			gold: {
  				DEFAULT: 'hsl(var(--gold))',
  				light: 'hsl(var(--gold-light))',
  				muted: 'hsl(var(--gold-muted))'
  			},
  			champagne: {
  				DEFAULT: 'hsl(var(--champagne))',
  				light: 'hsl(var(--champagne-light, 43 40% 88%))'
  			},
  			bronze: {
  				DEFAULT: 'hsl(var(--bronze))'
  			},
  			navy: {
  				deep: 'hsl(var(--navy-deep))',
  				light: 'hsl(var(--navy-light))'
  			},
  			marble: {
  				light: 'hsl(var(--marble-light, 45 30% 96%))',
  				dark: 'hsl(var(--marble-dark, 45 20% 92%))'
  			},
  			ivory: 'hsl(var(--ivory))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		spacing: {
  			'18': '4.5rem',
  			'22': '5.5rem',
  			'30': '7.5rem'
  		},
  		letterSpacing: {
  			'ultra-wide': '0.3em',
  			premium: '0.2em'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			},
  			'fade-in': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(10px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'fade-in-up': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			'fade-in-scale': {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.98)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			},
  			'slide-in-right': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'slide-in-left': {
  				'0%': {
  					opacity: '0',
  					transform: 'translateX(-20px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateX(0)'
  				}
  			},
  			'subtle-pulse': {
  				'0%, 100%': {
  					opacity: '0.5'
  				},
  				'50%': {
  					opacity: '0.8'
  				}
  			},
  			'glow-pulse': {
  				'0%, 100%': {
  					boxShadow: '0 0 20px hsl(43 65% 55% / 0.1)'
  				},
  				'50%': {
  					boxShadow: '0 0 40px hsl(43 65% 55% / 0.2)'
  				}
  			},
  			'gold-shimmer': {
  				'0%': {
  					backgroundPosition: '-200% center'
  				},
  				'100%': {
  					backgroundPosition: '200% center'
  				}
  			},
  			'border-glow': {
  				'0%, 100%': {
  					borderColor: 'hsl(43 65% 55% / 0.2)'
  				},
  				'50%': {
  					borderColor: 'hsl(43 65% 55% / 0.4)'
  				}
  			},
  			shimmer: {
  				'0%': {
  					transform: 'translateX(-100%)'
  				},
  				'100%': {
  					transform: 'translateX(100%)'
  				}
  			},
  			'line-grow': {
  				'0%': {
  					transform: 'scaleX(0)'
  				},
  				'100%': {
  					transform: 'scaleX(1)'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'fade-in': 'fade-in 0.5s ease-out forwards',
  			'fade-in-up': 'fade-in-up 0.6s ease-out forwards',
  			'fade-in-scale': 'fade-in-scale 0.4s ease-out forwards',
  			'slide-in-right': 'slide-in-right 0.4s ease-out forwards',
  			'slide-in-left': 'slide-in-left 0.4s ease-out forwards',
  			'subtle-pulse': 'subtle-pulse 3s ease-in-out infinite',
  			'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
  			'border-glow': 'border-glow 2s ease-in-out infinite',
  			'line-grow': 'line-grow 1s ease-out forwards'
  		},
  		boxShadow: {
  			'2xs': 'var(--shadow-2xs)',
  			xs: 'var(--shadow-xs)',
  			sm: 'var(--shadow-sm)',
  			md: 'var(--shadow-md)',
  			lg: 'var(--shadow-lg)',
  			xl: 'var(--shadow-xl)',
  			'2xl': 'var(--shadow-2xl)',
  			platinum: '0 0 60px hsl(var(--platinum) / 0.15)',
  			'platinum-lg': '0 20px 60px -15px hsl(30 8% 0% / 0.5), 0 0 30px hsl(var(--platinum) / 0.1)',
  			gold: '0 0 60px hsl(43 65% 55% / 0.15)',
  			'gold-lg': '0 20px 60px -15px hsl(30 8% 0% / 0.6), 0 0 30px hsl(43 65% 55% / 0.12)',
  			luxury: '0 25px 50px -12px hsl(30 8% 0% / 0.5), 0 0 40px hsl(43 65% 55% / 0.08)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;
