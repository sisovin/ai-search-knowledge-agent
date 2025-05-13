#!/usr/bin/env node
/**
 * Pre-Deployment Environment Variables Validation Script
 *
 * This script validates all required environment variables before deployment.
 * It checks for the presence and basic validity of:
 * - Supabase configuration
 * - NextAuth settings
 * - OAuth providers
 * - Redis configuration
 * - Exa API keys
 * - Other essential environment variables
 */

const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");
const chalk = require("chalk");

// Load environment variables from .env.local file
let envPath = path.join(process.cwd(), ".env.local");
if (!fs.existsSync(envPath)) {
  envPath = path.join(process.cwd(), ".env");
}

if (!fs.existsSync(envPath)) {
  console.error(chalk.red("❌ Error: No .env or .env.local file found!"));
  process.exit(1);
}

dotenv.config({ path: envPath });

// Define all required environment variables by category
const requiredEnvVars = {
  application: [
    {
      name: "NEXT_PUBLIC_APP_URL",
      validator: (value) => value.startsWith("http"),
    },
    {
      name: "NODE_ENV",
      validator: (value) =>
        ["development", "production", "test"].includes(value),
    },
  ],
  supabase: [
    {
      name: "NEXT_PUBLIC_SUPABASE_URL",
      validator: (value) =>
        value.includes("supabase.co") || value.startsWith("http"),
    },
    {
      name: "NEXT_PUBLIC_SUPABASE_ANON_KEY",
      validator: (value) => value.length > 8,
    },
    {
      name: "SUPABASE_SERVICE_ROLE_KEY",
      validator: (value) => value.length > 8,
    },
  ],
  exa: [{ name: "EXA_API_KEY", validator: (value) => value.length > 8 }],
  nextAuth: [
    { name: "NEXTAUTH_URL", validator: (value) => value.startsWith("http") },
    { name: "NEXTAUTH_SECRET", validator: (value) => value.length >= 16 },
  ],
  redis: [
    { name: "REDIS_URL", validator: (value) => value.startsWith("redis://") },
  ],
  oAuth: [
    {
      name: "GOOGLE_CLIENT_ID",
      validator: (value) => value.includes(".apps.googleusercontent.com"),
      required: false,
    },
    {
      name: "GOOGLE_CLIENT_SECRET",
      validator: (value) => value.length > 8,
      required: false,
    },
    {
      name: "GITHUB_CLIENT_ID",
      validator: (value) => value.length > 8,
      required: false,
    },
    {
      name: "GITHUB_CLIENT_SECRET",
      validator: (value) => value.length > 8,
      required: false,
    },
  ],
  rateLimiting: [
    {
      name: "RATE_LIMIT_REQUESTS",
      validator: (value) => !isNaN(parseInt(value)),
      required: false,
    },
    {
      name: "RATE_LIMIT_WINDOW_MS",
      validator: (value) => !isNaN(parseInt(value)),
      required: false,
    },
  ],
};

// Validate environment variables and collect results
const validationResults = {
  valid: [],
  invalid: [],
  missing: [],
  warnings: [],
};

// Check if either Google or GitHub OAuth is configured
function checkOAuthProviders() {
  const hasGoogle =
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET;
  const hasGithub =
    process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET;

  if (!hasGoogle && !hasGithub) {
    validationResults.warnings.push(
      "No OAuth providers (Google or GitHub) are fully configured. Users will only be able to use email/password login."
    );
  }
}

// Perform the validation
function validateEnvironmentVariables() {
  Object.entries(requiredEnvVars).forEach(([category, variables]) => {
    console.log(chalk.cyan(`\n🔍 Checking ${category} variables...`));

    variables.forEach((variable) => {
      const { name, validator, required = true } = variable;
      const value = process.env[name];

      if (!value) {
        if (required) {
          console.log(chalk.red(`❌ Missing: ${name}`));
          validationResults.missing.push(name);
        } else {
          console.log(chalk.yellow(`⚠️ Optional but missing: ${name}`));
          validationResults.warnings.push(
            `Optional variable ${name} is missing.`
          );
        }
        return;
      }

      // Mask sensitive values
      const displayValue =
        name.includes("KEY") ||
        name.includes("SECRET") ||
        name.includes("PASSWORD") ||
        name.includes("TOKEN")
          ? "********"
          : value;

      try {
        if (validator(value)) {
          console.log(chalk.green(`✅ Valid: ${name}=${displayValue}`));
          validationResults.valid.push(name);
        } else {
          console.log(chalk.red(`❌ Invalid format: ${name}=${displayValue}`));
          validationResults.invalid.push(name);
        }
      } catch (error) {
        console.log(chalk.red(`❌ Error validating ${name}: ${error.message}`));
        validationResults.invalid.push(name);
      }
    });
  });

  // Special checks
  checkOAuthProviders();

  // Check for conflicting or deprecated variables
  const deprecatedVars = [];
  Object.keys(process.env).forEach((key) => {
    if (key.startsWith("REACT_APP_")) {
      deprecatedVars.push(key);
    }
  });

  if (deprecatedVars.length > 0) {
    console.log(chalk.yellow("\n⚠️ Deprecated environment variables found:"));
    deprecatedVars.forEach((key) =>
      console.log(
        chalk.yellow(
          `   ${key} - Next.js uses NEXT_PUBLIC_ prefix instead of REACT_APP_`
        )
      )
    );
    validationResults.warnings.push(
      "Deprecated REACT_APP_ variables found. Use NEXT_PUBLIC_ prefix for Next.js."
    );
  }
}

// Run validation and display summary
validateEnvironmentVariables();

// Display summary
console.log(chalk.cyan("\n📊 Validation Summary:"));
console.log(
  chalk.green(`✅ Valid variables: ${validationResults.valid.length}`)
);

if (validationResults.missing.length > 0) {
  console.log(
    chalk.red(`❌ Missing variables: ${validationResults.missing.length}`)
  );
  console.log(chalk.red("   " + validationResults.missing.join(", ")));
}

if (validationResults.invalid.length > 0) {
  console.log(
    chalk.red(`❌ Invalid variables: ${validationResults.invalid.length}`)
  );
  console.log(chalk.red("   " + validationResults.invalid.join(", ")));
}

if (validationResults.warnings.length > 0) {
  console.log(
    chalk.yellow(`⚠️ Warnings: ${validationResults.warnings.length}`)
  );
  validationResults.warnings.forEach((warning) => {
    console.log(chalk.yellow(`   - ${warning}`));
  });
}

// Environment-specific checks
if (process.env.NODE_ENV === "production") {
  console.log(chalk.cyan("\n🚀 Production-specific checks:"));

  // Check for development-only URLs
  if (
    process.env.NEXTAUTH_URL?.includes("localhost") ||
    process.env.NEXT_PUBLIC_APP_URL?.includes("localhost")
  ) {
    console.log(chalk.red("❌ Production deployment contains localhost URLs!"));
    validationResults.invalid.push("Production URLs using localhost");
  }

  // Check for secure URLs
  if (
    process.env.NEXTAUTH_URL?.startsWith("http:") ||
    process.env.NEXT_PUBLIC_APP_URL?.startsWith("http:")
  ) {
    console.log(chalk.red("❌ Production deployment should use HTTPS!"));
    validationResults.warnings.push("Production URLs not using HTTPS");
  }

  // Check if using default/non-production Redis
  if (process.env.REDIS_URL?.includes("localhost")) {
    console.log(chalk.yellow("⚠️ Using localhost Redis in production!"));
    validationResults.warnings.push("Using localhost Redis in production");
  }
}

// Exit with appropriate code
if (
  validationResults.missing.length > 0 ||
  validationResults.invalid.length > 0
) {
  console.log(
    chalk.red("\n❌ Validation failed! Please fix the issues before deploying.")
  );
  process.exit(1);
} else if (validationResults.warnings.length > 0) {
  console.log(
    chalk.yellow(
      "\n⚠️ Validation passed with warnings. Review warnings before deploying."
    )
  );
  process.exit(0);
} else {
  console.log(
    chalk.green(
      "\n✅ All environment variables validated successfully. Ready to deploy!"
    )
  );
  process.exit(0);
}
