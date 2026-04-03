/**
 * VaultService.js
 * Handles Biometric (WebAuthn) and PIN logic for local-only vault protection.
 */

class VaultService {
  constructor() {
    this.PIN_STORAGE_KEY = 'omni_vault_pin';
    this.WEBAUTHN_ID_KEY = 'omni_vault_webauthn_id';
    this.AUTO_LOCK_TIMEOUT = 5 * 60 * 1000; // 5 minutes
    this.lastActivity = Date.now();
  }

  // ── PIN Management ──

  async setPIN(pin) {
    const hash = await this.hashPIN(pin);
    localStorage.setItem(this.PIN_STORAGE_KEY, hash);
  }

  async verifyPIN(pin) {
    const storedHash = localStorage.getItem(this.PIN_STORAGE_KEY);
    if (!storedHash) return false;
    const currentHash = await this.hashPIN(pin);
    return storedHash === currentHash;
  }

  async hashPIN(pin) {
    const msgUint8 = new TextEncoder().encode(pin + 'omni-salt-2026'); // basic salt
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // ── Biometric (WebAuthn) Management ──

  isBiometricSupported() {
    return window.PublicKeyCredential && 
           window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable &&
           window.isSecureContext;
  }

  async registerBiometrics() {
    if (!this.isBiometricSupported()) throw new Error('Biometrics not supported on this device/browser.');

    const challenge = crypto.getRandomValues(new Uint8Array(32));
    const userId = crypto.getRandomValues(new Uint8Array(16));

    const options = {
      publicKey: {
        challenge,
        rp: { name: 'OmniBudget', id: window.location.hostname },
        user: { 
          id: userId, 
          name: 'user@omnibudget.app', 
          displayName: 'OmniBudget User' 
        },
        pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
        authenticatorSelection: { 
          authenticatorAttachment: 'platform', 
          userVerification: 'required' 
        },
        timeout: 60000,
      }
    };

    const credential = await navigator.credentials.create(options);
    localStorage.setItem(this.WEBAUTHN_ID_KEY, btoa(String.fromCharCode(...new Uint8Array(credential.rawId))));
    return true;
  }

  async verifyBiometrics() {
    const credentialId = localStorage.getItem(this.WEBAUTHN_ID_KEY);
    if (!credentialId) throw new Error('Biometrics not registered.');

    const rawId = Uint8Array.from(atob(credentialId), c => c.charCodeAt(0));
    const challenge = crypto.getRandomValues(new Uint8Array(32));

    const options = {
      publicKey: {
        challenge,
        allowCredentials: [{
          id: rawId,
          type: 'public-key',
          transports: ['internal']
        }],
        userVerification: 'required',
        timeout: 60000,
      }
    };

    await navigator.credentials.get(options);
    return true;
  }

  // ── Session Management ──

  resetInactivityTimer() {
    this.lastActivity = Date.now();
  }

  shouldLock() {
    const elapsed = Date.now() - this.lastActivity;
    return elapsed > this.AUTO_LOCK_TIMEOUT;
  }

  isConfigured() {
    return !!localStorage.getItem(this.PIN_STORAGE_KEY);
  }
}

export const vaultService = new VaultService();
