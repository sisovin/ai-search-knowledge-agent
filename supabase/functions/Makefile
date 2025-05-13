# Makefile for Supabase Edge Functions

.PHONY: start deploy serve link secrets

# Local development
start:
	supabase start

# Serve functions locally
serve:
	supabase functions serve

# Deploy a specific function
deploy-search:
	supabase functions deploy exa-search --no-verify-jwt

deploy-scrape:
	supabase functions deploy exa-scrape --no-verify-jwt

# Deploy all functions
deploy-all:
	supabase functions deploy exa-search --no-verify-jwt
	supabase functions deploy exa-scrape --no-verify-jwt

# Link to your Supabase project
# Usage: make link PROJECT_ID=your-project-id
link:
	supabase link --project-ref $(PROJECT_ID)

# Set secrets from .env file
secrets:
	supabase secrets set --env-file .env

# Reset all
reset:
	supabase db reset
