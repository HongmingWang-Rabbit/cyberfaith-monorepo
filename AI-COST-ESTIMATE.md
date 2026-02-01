# CyberFaith AI Cost Estimates

> Model: gpt-4o-mini | Pricing: $0.15/1M input, $0.60/1M output
> Updated: 2026-02-01

## Per-Feature Cost Estimate

Each reading sends a prompt (~300-500 tokens) and gets a structured JSON response (~400-800 tokens).

| Feature | Est. Input Tokens | Est. Output Tokens | Cost/Request |
|---------|------------------:|-------------------:|-------------:|
| MBTI Analysis | ~400 | ~600 | ~$0.0004 |
| Tarot Reading | ~500 | ~800 | ~$0.0006 |
| I Ching Analysis | ~450 | ~700 | ~$0.0005 |
| Four Pillars | ~500 | ~700 | ~$0.0005 |
| Zodiac Reading | ~350 | ~500 | ~$0.0004 |
| Zodiac Compatibility | ~400 | ~600 | ~$0.0004 |

**Average cost per reading: ~$0.0005 ($0.50 per 1,000 readings)**

## Projected Monthly Costs

| Users/Day | Readings/User/Day | Monthly Readings | Monthly AI Cost |
|----------:|------------------:|-----------------:|----------------:|
| 10 | 3 | 900 | $0.45 |
| 100 | 3 | 9,000 | $4.50 |
| 1,000 | 3 | 90,000 | $45.00 |
| 10,000 | 3 | 900,000 | $450.00 |

## Cost Optimization Strategies (implement as needed)
1. **Response caching** — Cache zodiac daily readings (same for all users per sign/day) → saves ~30% of calls
2. **Per-user rate limit** — Cap free users at 10 readings/day
3. **Shorter prompts** — Trim system prompts, reduce output token limits
4. **Model downgrade** — gpt-4o-mini is already the cheapest; could use gpt-3.5-turbo for zodiac (~40% cheaper)
5. **Batch zodiac** — Pre-generate all 12 daily zodiac readings once/day via cron (~$0.006/day)

## Infrastructure Costs (estimated)
- Railway (API + Postgres): ~$5-20/mo (Hobby plan)
- Vercel (2 frontends): Free tier likely sufficient
- Domain: ~$12/yr
- **Total infra: ~$10-25/mo before AI costs**
