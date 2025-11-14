'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '../components/AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardLayout from '../components/DashboardLayout';
import styles from './notifications.module.css';

export default function NotificationsPage() {
  const { user, token } = useAuth();
  const [settings, setSettings] = useState({
    owner_type: 'user',
    owner_id: null,
    channels: {
      email: true,
      sms: true,
      push: true,
      calendar: true,
    },
    email_config: {
      provider: 'smtp',
      smtp_host: '',
      smtp_port: 587,
      username: '',
      password: '',
      from_name: '',
      from_email: '',
    },
    sms_config: {
      twilio_sid: '',
      twilio_token: '',
      phone_number: process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || '',
    },
    push_config: {
      firebase_service_account_json: '',
    },
    calendar_config: {
      google_client_id: '',
      google_client_secret: '',
      refresh_token: '',
      redirect_uri: 'http://localhost:3000/oauth2callback',
    },
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testResults, setTestResults] = useState({});
  const [showPassword, setShowPassword] = useState({
    email: false,
    sms: false,
    push: false,
    calendar: false,
  });

  useEffect(() => {
    if (user) {
      setSettings(prev => ({
        ...prev,
        owner_id: user.id,
      }));
      fetchNotificationSettings();
    }
  }, [user]);

  const fetchNotificationSettings = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/settings/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const savedSettings = await response.json();
        if (savedSettings) {
          // Merge saved settings with default settings
          setSettings(prev => ({
            ...prev,
            ...savedSettings,
            channels: {
              ...prev.channels,
              ...savedSettings.channels,
            },
            email_config: {
              ...prev.email_config,
              ...savedSettings.email_config,
            },
            sms_config: {
              ...prev.sms_config,
              ...savedSettings.sms_config,
              phone_number: savedSettings.sms_config?.phone_number || process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || '',
            },
            push_config: {
              ...prev.push_config,
              ...savedSettings.push_config,
            },
            calendar_config: {
              ...prev.calendar_config,
              ...savedSettings.calendar_config,
            },
          }));
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChannelChange = (channel) => {
    setSettings({
      ...settings,
      channels: {
        ...settings.channels,
        [channel]: !settings.channels[channel],
      },
    });
  };

  const handleInputChange = (section, field, value) => {
    setSettings({
      ...settings,
      [section]: {
        ...settings[section],
        [field]: value,
      },
    });
  };

  const handleProviderChange = (provider, value) => {
    setSettings({
      ...settings,
      email_config: {
        ...settings.email_config,
        provider: value,
      },
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/settings/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(settings),
      });
      
      if (response.ok) {
        alert('Settings saved successfully!');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Error saving settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async (provider) => {
    try {
      const testPayload = {
        provider: provider,
      };

      // Add test-specific fields based on provider
      if (provider === 'sms') {
        testPayload.test_to = prompt('Enter phone number to send test SMS to:');
        if (!testPayload.test_to) return;
      } else if (provider === 'email') {
        testPayload.test_email = prompt('Enter email address to send test email to:');
        if (!testPayload.test_email) return;
      }

      setTestResults(prev => ({
        ...prev,
        [provider]: { loading: true },
      }));

      const response = await fetch('http://localhost:3001/api/settings/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(testPayload),
      });

      const result = await response.json();
      
      setTestResults(prev => ({
        ...prev,
        [provider]: { 
          loading: false, 
          success: result.success, 
          message: result.message 
        },
      }));
    } catch (err) {
      console.error('Error testing notification:', err);
      setTestResults(prev => ({
        ...prev,
        [provider]: { 
          loading: false, 
          success: false, 
          message: 'Error testing notification' 
        },
      }));
    }
  };

  const togglePasswordVisibility = (section) => {
    setShowPassword(prev => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (loading) {
    return <div>Loading settings...</div>;
  }

  return (
    <ProtectedRoute allowedRoles={['super_admin', 'lecturer', 'student']}>
      <DashboardLayout role={user.role}>
        <div className={styles.notifications}>
          <div className={styles.header}>
            <h1>Notification Preferences</h1>
          </div>
          
          <div className={styles.settingsContainer}>
            <form onSubmit={handleSubmit} className={styles.settingsForm}>
              <h2>Notification Channels</h2>
              
              <div className={styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.channels.email}
                    onChange={() => handleChannelChange('email')}
                  />
                  Enable Email Notifications
                </label>
              </div>
              
              <div className={styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.channels.sms}
                    onChange={() => handleChannelChange('sms')}
                  />
                  Enable SMS Notifications
                </label>
              </div>
              
              <div className={styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.channels.push}
                    onChange={() => handleChannelChange('push')}
                  />
                  Enable Push Notifications
                </label>
              </div>
              
              <div className={styles.checkboxGroup}>
                <label>
                  <input
                    type="checkbox"
                    checked={settings.channels.calendar}
                    onChange={() => handleChannelChange('calendar')}
                  />
                  Enable Calendar Integration
                </label>
              </div>

              {/* Email Configuration */}
              {settings.channels.email && (
                <div className={styles.providerSection}>
                  <h3>Email Configuration</h3>
                  
                  <div className={styles.formGroup}>
                    <label>Email Provider</label>
                    <select
                      value={settings.email_config.provider}
                      onChange={(e) => handleProviderChange('email', e.target.value)}
                    >
                      <option value="smtp">SMTP</option>
                      <option value="gmail">Gmail</option>
                      <option value="sendgrid">SendGrid</option>
                      <option value="custom">Custom</option>
                    </select>
                  </div>
                  
                  {settings.email_config.provider === 'smtp' && (
                    <>
                      <div className={styles.formGroup}>
                        <label>SMTP Host</label>
                        <input
                          type="text"
                          value={settings.email_config.smtp_host || ''}
                          onChange={(e) => handleInputChange('email_config', 'smtp_host', e.target.value)}
                          placeholder="smtp.example.com"
                        />
                      </div>
                      
                      <div className={styles.formGroup}>
                        <label>SMTP Port</label>
                        <input
                          type="number"
                          value={settings.email_config.smtp_port || 587}
                          onChange={(e) => handleInputChange('email_config', 'smtp_port', parseInt(e.target.value))}
                          placeholder="587"
                        />
                      </div>
                    </>
                  )}
                  
                  <div className={styles.formGroup}>
                    <label>Username</label>
                    <input
                      type="text"
                      value={settings.email_config.username || ''}
                      onChange={(e) => handleInputChange('email_config', 'username', e.target.value)}
                      placeholder="your@email.com"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Password</label>
                    <div className={styles.passwordField}>
                      <input
                        type={showPassword.email ? "text" : "password"}
                        value={settings.email_config.password || ''}
                        onChange={(e) => handleInputChange('email_config', 'password', e.target.value)}
                        placeholder="Your email password"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('email')}
                        className={styles.togglePassword}
                      >
                        {showPassword.email ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Sender Name</label>
                    <input
                      type="text"
                      value={settings.email_config.from_name || ''}
                      onChange={(e) => handleInputChange('email_config', 'from_name', e.target.value)}
                      placeholder="Lecture Reminder System"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>From Email</label>
                    <input
                      type="email"
                      value={settings.email_config.from_email || ''}
                      onChange={(e) => handleInputChange('email_config', 'from_email', e.target.value)}
                      placeholder="noreply@university.edu"
                    />
                  </div>
                  
                  <div className={styles.testButtonContainer}>
                    <button
                      type="button"
                      onClick={() => handleTest('email')}
                      className={styles.testButton}
                      disabled={testResults.email?.loading}
                    >
                      {testResults.email?.loading ? 'Sending...' : 'Send Test Email'}
                    </button>
                    {testResults.email && (
                      <div className={`${styles.testResult} ${testResults.email.success ? styles.success : styles.error}`}>
                        {testResults.email.message}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SMS Configuration */}
              {settings.channels.sms && (
                <div className={styles.providerSection}>
                  <h3>SMS Configuration (Twilio)</h3>
                  
                  <div className={styles.formGroup}>
                    <label>Account SID</label>
                    <input
                      type="text"
                      value={settings.sms_config.twilio_sid || ''}
                      onChange={(e) => handleInputChange('sms_config', 'twilio_sid', e.target.value)}
                      placeholder="ACXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Auth Token</label>
                    <div className={styles.passwordField}>
                      <input
                        type={showPassword.sms ? "text" : "password"}
                        value={settings.sms_config.twilio_token || ''}
                        onChange={(e) => handleInputChange('sms_config', 'twilio_token', e.target.value)}
                        placeholder="Your Twilio Auth Token"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('sms')}
                        className={styles.togglePassword}
                      >
                        {showPassword.sms ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Phone Number (Sender)</label>
                    <input
                      type="text"
                      value={settings.sms_config.phone_number || process.env.NEXT_PUBLIC_TWILIO_PHONE_NUMBER || ''}
                      onChange={(e) => handleInputChange('sms_config', 'phone_number', e.target.value)}
                      placeholder="+1234567890"
                    />
                  </div>
                  
                  <div className={styles.testButtonContainer}>
                    <button
                      type="button"
                      onClick={() => handleTest('sms')}
                      className={styles.testButton}
                      disabled={testResults.sms?.loading}
                    >
                      {testResults.sms?.loading ? 'Sending...' : 'Send Test SMS'}
                    </button>
                    {testResults.sms && (
                      <div className={`${styles.testResult} ${testResults.sms.success ? styles.success : styles.error}`}>
                        {testResults.sms.message}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Push Notification Configuration */}
              {settings.channels.push && (
                <div className={styles.providerSection}>
                  <h3>Push Notification Configuration (Firebase)</h3>
                  
                  <div className={styles.formGroup}>
                    <label>Service Account JSON</label>
                    <textarea
                      value={settings.push_config.firebase_service_account_json || ''}
                      onChange={(e) => handleInputChange('push_config', 'firebase_service_account_json', e.target.value)}
                      placeholder="Paste your Firebase service account JSON here"
                      rows="6"
                    />
                  </div>
                  
                  <div className={styles.testButtonContainer}>
                    <button
                      type="button"
                      onClick={() => handleTest('push')}
                      className={styles.testButton}
                      disabled={testResults.push?.loading}
                    >
                      {testResults.push?.loading ? 'Sending...' : 'Send Test Push'}
                    </button>
                    {testResults.push && (
                      <div className={`${styles.testResult} ${testResults.push.success ? styles.success : styles.error}`}>
                        {testResults.push.message}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Google Calendar Configuration */}
              {settings.channels.calendar && (
                <div className={styles.providerSection}>
                  <h3>Google Calendar Configuration</h3>
                  
                  <div className={styles.formGroup}>
                    <label>Client ID</label>
                    <input
                      type="text"
                      value={settings.calendar_config.google_client_id || ''}
                      onChange={(e) => handleInputChange('calendar_config', 'google_client_id', e.target.value)}
                      placeholder="Your Google Client ID"
                    />
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Client Secret</label>
                    <div className={styles.passwordField}>
                      <input
                        type={showPassword.calendar ? "text" : "password"}
                        value={settings.calendar_config.google_client_secret || ''}
                        onChange={(e) => handleInputChange('calendar_config', 'google_client_secret', e.target.value)}
                        placeholder="Your Google Client Secret"
                      />
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility('calendar')}
                        className={styles.togglePassword}
                      >
                        {showPassword.calendar ? 'Hide' : 'Show'}
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles.formGroup}>
                    <label>Redirect URI</label>
                    <input
                      type="text"
                      value={settings.calendar_config.redirect_uri || ''}
                      onChange={(e) => handleInputChange('calendar_config', 'redirect_uri', e.target.value)}
                      placeholder="http://localhost:3000/oauth2callback"
                      readOnly
                    />
                  </div>
                  
                  <div className={styles.oauthButtonContainer}>
                    <button type="button" className={styles.oauthButton}>
                      Connect Google Account
                    </button>
                  </div>
                  
                  <div className={styles.testButtonContainer}>
                    <button
                      type="button"
                      onClick={() => handleTest('calendar')}
                      className={styles.testButton}
                      disabled={testResults.calendar?.loading}
                    >
                      {testResults.calendar?.loading ? 'Creating...' : 'Add Test Event to Calendar'}
                    </button>
                    {testResults.calendar && (
                      <div className={`${styles.testResult} ${testResults.calendar.success ? styles.success : styles.error}`}>
                        {testResults.calendar.message}
                      </div>
                    )}
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                className={styles.submitButton}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </form>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}