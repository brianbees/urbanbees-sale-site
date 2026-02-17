#!/usr/bin/env node
/**
 * Configuration Checker for Urban Bees Admin Panel
 * Run: node check-config.mjs
 * 
 * This script verifies that Supabase environment variables are properly configured.
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load .env.local file
const envPath = join(__dirname, '.env.local');
let envContent;
try {
  envContent = readFileSync(envPath, 'utf8');
} catch (error) {
  console.log('\n❌ .env.local file not found at:', envPath);
  console.log('\nPlease create admin/.env.local with your Supabase keys.\n');
  process.exit(1);
}

// Parse environment variables
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([A-Z_]+)="?([^"]+)"?$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

console.log('\n🔍 Checking Supabase Configuration...\n');

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

let hasErrors = false;

// Check Supabase URL
if (!supabaseUrl) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_URL is not set');
  hasErrors = true;
} else if (!supabaseUrl.includes('supabase.co')) {
  console.log('⚠️  NEXT_PUBLIC_SUPABASE_URL might be incorrect:', supabaseUrl);
  console.log('   Expected format: https://[project-ref].supabase.co');
  hasErrors = true;
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_URL is configured');
  console.log('   Value:', supabaseUrl);
}

// Check Anon Key
if (!supabaseAnonKey) {
  console.log('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY is not set');
  hasErrors = true;
} else if (!supabaseAnonKey.startsWith('eyJ') && !supabaseAnonKey.startsWith('sb_publishable_')) {
  console.log('⚠️  NEXT_PUBLIC_SUPABASE_ANON_KEY might be incorrect');
  console.log('   Supabase keys should start with "eyJ" (JWT format) or "sb_publishable_" (new format)');
  console.log('   Current value starts with:', supabaseAnonKey.substring(0, 20) + '...');
  hasErrors = true;
} else {
  console.log('✅ NEXT_PUBLIC_SUPABASE_ANON_KEY is configured');
  console.log('   Value:', supabaseAnonKey.substring(0, 50) + '...');
}

// Check Service Role Key
if (!supabaseServiceKey) {
  console.log('❌ SUPABASE_SERVICE_ROLE_KEY is not set');
  console.log('   ⚠️  This must NOT have NEXT_PUBLIC_ prefix (server-side only)');
  hasErrors = true;
} else if (!supabaseServiceKey.startsWith('eyJ') && !supabaseServiceKey.startsWith('sb_secret_')) {
  console.log('⚠️  SUPABASE_SERVICE_ROLE_KEY might be incorrect');
  console.log('   Supabase keys should start with "eyJ" (JWT format) or "sb_secret_" (new format)');
  console.log('   Current value starts with:', supabaseServiceKey.substring(0, 20) + '...');
  hasErrors = true;
} else {
  console.log('✅ SUPABASE_SERVICE_ROLE_KEY is configured');
  console.log('   Value:', supabaseServiceKey.substring(0, 50) + '...');
}

console.log('\n' + '─'.repeat(60) + '\n');

if (hasErrors) {
  console.log('❌ Configuration has issues. Please fix the errors above.\n');
  console.log('📝 How to fix:');
  console.log('   1. Go to https://supabase.com/dashboard');
  console.log('   2. Select your project → Settings → API');
  console.log('   3. Copy the correct keys to your .env.local file:\n');
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://[your-project].supabase.co');
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ... (anon/public key)');
  console.log('   SUPABASE_SERVICE_ROLE_KEY=eyJ... (service_role key)\n');
  console.log('   4. Restart your dev server: npm run dev\n');
  process.exit(1);
} else {
  console.log('✅ All configuration looks good!\n');
  console.log('📋 Next steps:');
  console.log('   • Make sure these same values are in Vercel (for production)');
  console.log('   • Test the admin panel: npm run dev');
  console.log('   • Test creating/editing products\n');
  process.exit(0);
}
