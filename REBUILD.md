# Rebuild Documentation

This document outlines the changes made during the rebuild of PassCheck Matrix, ensuring 100% functionality parity with the original application.

## Summary of Changes

The primary change was refactoring the single, large `src/routes/index.tsx` file into smaller, more maintainable components and modules, while keeping all original business logic, API integrations, and functionality completely intact.

## New Files Added

### Types

- `src/types/passcheck.ts`: Defines shared types (VaultEntry) and constants (VAULT_KEY, BREACH_PREF_KEY)

### Utilities

- `src/lib/passcheck-utils.ts`: Contains scoreToToken utility function

### Hooks

- `src/hooks/use-passcheck.ts`: Contains useDebounced and useBreachCheck hooks

### Components (src/components/passcheck/)

- `BackgroundGrid.tsx`: Background grid component
- `Header.tsx`: Application header with HIBP toggle
- `Metric.tsx`: Reusable metric display component
- `ClassPill.tsx`: Reusable pill for character class indicators
- `BreachPill.tsx`: Reusable pill for breach status
- `PoolToggle.tsx`: Toggle for password character pools
- `CipherInput.tsx`: Password input with analysis display
- `TelemetryModule.tsx`: Telemetry/analysis tab
- `GeneratorModule.tsx`: Password/passphrase generator tab
- `BreachModule.tsx`: HIBP breach check tab
- `VaultModule.tsx`: Local vault management tab
- `AuditModule.tsx`: Policy compliance audit tab

## Modified Files

- `src/routes/index.tsx`: Rewritten to import and compose all new components

## Verification

All functionality has been preserved, and the application:

- Runs correctly in dev mode (npm run dev)
- Builds successfully for production (npm run build)
- Maintains all original UI/UX
- Preserves all business logic in src/lib/password.ts
- Maintains all HIBP API integrations
- Keeps LocalStorage functionality unchanged

## No Changes To

- `src/lib/password.ts` (all core password logic untouched)
- All other original files (server.ts, start.ts, config files, etc.)
