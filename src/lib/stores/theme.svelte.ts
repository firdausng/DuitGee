// Theme store using Svelte 5 runes
let isDark = $state(false);

// Check for saved theme preference or default to system preference
if (typeof window !== 'undefined') {
	const savedTheme = localStorage.getItem('theme');
	if (savedTheme) {
		isDark = savedTheme === 'dark';
	} else {
		// Check system preference
		isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
	}
}

export const theme = {
	get isDark() {
		return isDark;
	},

	toggle() {
		isDark = !isDark;
		this.apply();
		this.save();
	},

	setDark(dark: boolean) {
		isDark = dark;
		this.apply();
		this.save();
	},

	apply() {
		if (typeof document !== 'undefined') {
			if (isDark) {
				document.documentElement.classList.add('dark');
			} else {
				document.documentElement.classList.remove('dark');
			}
		}
	},

	save() {
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem('theme', isDark ? 'dark' : 'light');
		}
	},

	// Initialize theme on app start
	init() {
		this.apply();

		// Listen for system theme changes
		if (typeof window !== 'undefined') {
			const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
			mediaQuery.addEventListener('change', (e) => {
				// Only update if user hasn't set a preference
				const savedTheme = localStorage.getItem('theme');
				if (!savedTheme) {
					isDark = e.matches;
					this.apply();
				}
			});
		}
	}
};