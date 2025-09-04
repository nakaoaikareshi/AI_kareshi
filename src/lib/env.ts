/**
 * Environment variable validation and type-safe access
 */

// Define required environment variables
const requiredEnvVars = [
  'OPENAI_API_KEY',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'DATABASE_URL',
] as const;

// Define optional environment variables with defaults
const optionalEnvVars = {
  NODE_ENV: 'development',
  LOG_LEVEL: 'INFO',
  RATE_LIMIT_ENABLED: 'true',
} as const;

type RequiredEnvVars = typeof requiredEnvVars[number];
type OptionalEnvVars = keyof typeof optionalEnvVars;

// Validated environment object
interface ValidatedEnv {
  // Required
  OPENAI_API_KEY: string;
  NEXTAUTH_SECRET: string;
  NEXTAUTH_URL: string;
  DATABASE_URL: string;
  // Optional with defaults
  NODE_ENV: 'development' | 'production' | 'test';
  LOG_LEVEL: string;
  RATE_LIMIT_ENABLED: boolean;
  // Computed
  IS_PRODUCTION: boolean;
  IS_DEVELOPMENT: boolean;
}

class EnvironmentValidator {
  private env: ValidatedEnv | null = null;
  
  /**
   * Validates all required environment variables on startup
   */
  private validate(): ValidatedEnv {
    const missingVars: string[] = [];
    
    // Check required variables
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }
    
    // Fail fast if required variables are missing
    if (missingVars.length > 0) {
      const errorMessage = `Missing required environment variables: ${missingVars.join(', ')}\n` +
        'Please check your .env file and ensure all required variables are set.';
      
      if (process.env.NODE_ENV === 'production') {
        // In production, throw error immediately
        throw new Error(errorMessage);
      } else {
        // In development, log warning but continue
        console.warn(`⚠️ ${errorMessage}`);
      }
    }
    
    return {
      // Required (with fallbacks for development)
      OPENAI_API_KEY: process.env.OPENAI_API_KEY || '',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
      DATABASE_URL: process.env.DATABASE_URL || '',
      
      // Optional with defaults
      NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
      LOG_LEVEL: process.env.LOG_LEVEL || optionalEnvVars.LOG_LEVEL,
      RATE_LIMIT_ENABLED: process.env.RATE_LIMIT_ENABLED !== 'false',
      
      // Computed values
      IS_PRODUCTION: process.env.NODE_ENV === 'production',
      IS_DEVELOPMENT: process.env.NODE_ENV === 'development',
    };
  }
  
  /**
   * Gets the validated environment object
   */
  public get(): ValidatedEnv {
    if (!this.env) {
      this.env = this.validate();
    }
    return this.env;
  }
  
  /**
   * Type-safe access to a specific environment variable
   */
  public getValue<K extends keyof ValidatedEnv>(key: K): ValidatedEnv[K] {
    return this.get()[key];
  }
  
  /**
   * Checks if all required environment variables are properly set
   */
  public isValid(): boolean {
    try {
      const env = this.get();
      return requiredEnvVars.every(varName => env[varName as RequiredEnvVars]);
    } catch {
      return false;
    }
  }
  
  /**
   * Gets a summary of the environment configuration
   */
  public getSummary(): Record<string, string | boolean> {
    const env = this.get();
    return {
      environment: env.NODE_ENV,
      apiKeyConfigured: !!env.OPENAI_API_KEY,
      authConfigured: !!env.NEXTAUTH_SECRET,
      databaseConfigured: !!env.DATABASE_URL,
      rateLimitEnabled: env.RATE_LIMIT_ENABLED,
      logLevel: env.LOG_LEVEL,
    };
  }
}

// Create singleton instance
const envValidator = new EnvironmentValidator();

// Export validated environment
export const env = envValidator.get();

// Export validator for testing
export const validateEnv = () => envValidator.isValid();

// Export summary for debugging
export const getEnvSummary = () => envValidator.getSummary();

// Initialize on module load
if (typeof window === 'undefined') {
  // Server-side only validation
  const isValid = validateEnv();
  
  if (!isValid && process.env.NODE_ENV === 'production') {
    console.error('❌ Environment validation failed in production');
    process.exit(1);
  } else if (!isValid) {
    console.warn('⚠️ Environment validation failed in development mode');
  } else {
    console.log('✅ Environment variables validated successfully');
  }
}