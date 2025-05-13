# Supabase Edge Functions

This directory contains Supabase Edge Functions for the AI Search Knowledge Agent application.

## Functions

### 1. exa-search
Provides search functionality using the Exa API with:
- Rate limiting
- Response caching
- Search history tracking
- Error handling

### 2. exa-scrape
Provides content scraping functionality using the Exa API with:
- HTML sanitization
- Rate limiting
- Content metadata extraction
- Document storage

## Development

### Local Development

1. Install the Supabase CLI:
```bash
npm install -g supabase
```

2. Start local development:
```bash
supabase start
```

3. Deploy functions to your local instance:
```bash
supabase functions deploy exa-search
supabase functions deploy exa-scrape
```

4. Test with your local instance:
```bash
supabase functions serve
```

### Environment Variables

Create a `.env` file in this directory based on `.env.example` with your actual values.

### Deployment

Deploy to your Supabase project:

```bash
supabase link --project-ref <your-project-id>
supabase secrets set --env-file .env
supabase functions deploy --no-verify-jwt
```

## Configuration

Function configurations are stored in `supabase.json`. Modify as needed for memory allocation, 
authentication requirements, and other settings.
