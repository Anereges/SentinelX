'use client';

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  compact: boolean;
  animations: boolean;
  emailAlerts: boolean;
  criticalAlerts: boolean;
  highAlerts: boolean;
  mediumAlerts: boolean;
  incidentUpdates: boolean;
  systemUpdates: boolean;
  dailyDigest: boolean;
  sessionTimeout: string;
  retentionPeriod: string;
}

const defaultSettings: AppSettings = {
  theme: 'dark',
  compact: false,
  animations: true,
  emailAlerts: true,
  criticalAlerts: true,
  highAlerts: true,
  mediumAlerts: false,
  incidentUpdates: true,
  systemUpdates: true,
  dailyDigest: false,
  sessionTimeout: '30',
  retentionPeriod: '90',
};

class SettingsStore {
  private settings: AppSettings;

  constructor() {
    this.settings = this.loadSettings();
  }

  private loadSettings(): AppSettings {
    if (typeof window === 'undefined') {
      return { ...defaultSettings };
    }

    try {
      const stored = localStorage.getItem('sentinelx_settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...defaultSettings, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
    return { ...defaultSettings };
  }

  private saveSettings() {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem('sentinelx_settings', JSON.stringify(this.settings));
    } catch (error) {
      console.error('Failed to save settings:', error);
    }
  }

  getSettings(): AppSettings {
    return { ...this.settings };
  }

  updateSettings(updates: Partial<AppSettings>) {
    this.settings = { ...this.settings, ...updates };
    this.saveSettings();
    return this.settings;
  }

  getTheme(): AppSettings['theme'] {
    return this.settings.theme;
  }

  setTheme(theme: AppSettings['theme']) {
    this.updateSettings({ theme });
    // Apply theme to document
    if (typeof document !== 'undefined') {
      if (theme === 'dark') {
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      } else if (theme === 'light') {
        document.documentElement.classList.add('light');
        document.documentElement.classList.remove('dark');
      } else {
        // System theme - detect from OS
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.toggle('dark', prefersDark);
        document.documentElement.classList.toggle('light', !prefersDark);
      }
    }
  }

  resetSettings() {
    this.settings = { ...defaultSettings };
    this.saveSettings();
    return this.settings;
  }
}

export const settingsStore = typeof window !== 'undefined' 
  ? new SettingsStore() 
  : new SettingsStore();