// Master key management - stored locally and obfuscated
class MasterKeyManager {
  private static instance: MasterKeyManager;
  private masterKey: string;

  private constructor() {
    // Multiple layers of obfuscation for the master key
    const layers = [
      'TlRFeE9UZ3hNQT09', // Base64 of Base64 of '5419810'
      'NTQxOTgxMA==',      // Base64 of '5419810'
      '5419810'            // Plain text fallback
    ];
    
    try {
      // Decode the first layer
      const decoded1 = atob(layers[0]);
      // Decode the second layer
      const decoded2 = atob(decoded1);
      this.masterKey = decoded2;
    } catch {
      // Fallback to direct decoding
      try {
        this.masterKey = atob(layers[1]);
      } catch {
        this.masterKey = layers[2];
      }
    }
  }

  public static getInstance(): MasterKeyManager {
    if (!MasterKeyManager.instance) {
      MasterKeyManager.instance = new MasterKeyManager();
    }
    return MasterKeyManager.instance;
  }

  public validateToken(token: string): boolean {
    return token === this.masterKey;
  }

  public getMasterKey(): string {
    return this.masterKey;
  }

  // Additional security: clear key from memory after use
  public clearKey(): void {
    this.masterKey = '';
  }

  // Obfuscate the key in memory
  private obfuscateInMemory(): void {
    const original = this.masterKey;
    this.masterKey = btoa(original);
    
    // Restore after a short delay
    setTimeout(() => {
      this.masterKey = atob(this.masterKey);
    }, 100);
  }
}

export default MasterKeyManager;