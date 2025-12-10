# Drizzle ORM Documentation

Complete guide to using Drizzle ORM in the TropiGo project.

## Quick Start

```bash
# Start database
docker compose up -d

# Create tables
bun run db:push

# Add sample data
bun run db:seed

# View data in GUI
bun run db:studio
```

## Documentation

1. **[Setup](./01-setup.md)** - Installation, configuration, and available scripts
2. **[Schema and Types](./02-schema-and-types.md)** - How we define tables and generate types
3. **[Common Operations](./03-common-operations.md)** - CRUD operations and query examples

## What We Built

### Database Structure
- **PostgreSQL 18** running in Docker Compose
- **2 tables:** `users` and `experiences`
- **Type inference** from schema (no manual type definitions)
- **Sample data** via seed script

### Key Files
- `apps/api/src/db/index.ts` - Database connection
- `apps/api/src/db/schema.ts` - Table definitions + inferred types
- `apps/api/src/db/seed.ts` - Sample data script
- `apps/api/drizzle.config.ts` - Drizzle Kit configuration

### Available Commands
- `bun run db:push` - Create/update tables (use this for hackathon!)
- `bun run db:seed` - Add sample data
- `bun run db:studio` - Open GUI at localhost:4983
- `bun run db:generate` - Generate migrations (for production)
- `bun run db:migrate` - Run migrations (for production)

## Why Drizzle?

We chose Drizzle for this hackathon because:
- **Fast** - Lightweight and works great with Bun
- **Type-safe** - Auto-inferred TypeScript types
- **Simple** - SQL-like syntax, easy to learn
- **GUI included** - Drizzle Studio for viewing/editing data
- **No duplication** - Single source of truth for schema

## Need Help?

- [Official Drizzle Docs](https://orm.drizzle.team/docs/overview)
- [Drizzle Discord](https://discord.gg/drizzle)
- Check the example files in `apps/api/src/`

## Team Tips

1. **Always run `db:push` after changing schema**
2. **Use type inference** - import types from `./db/schema`
3. **Test in Drizzle Studio** before writing code
4. **Use the seed script** to reset data during development
5. **Check `03-common-operations.md`** for query examples
