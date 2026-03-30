# Remove Google Sign-In — Design Spec

**Date:** 2026-03-30
**Status:** Approved

## Summary

Remove the Google OAuth sign-in option from the Login page. Email/password authentication remains unchanged.

## Changes

**File:** `src/pages/Login.tsx`

- Delete the `handleGoogle` async function (currently lines 49–55)
- Delete the "OR" divider `<div>` (currently lines 195–200)
- Delete the Google `<button>` and its inline SVG icon (currently lines 202–215)

## Out of Scope

- No changes to Supabase project config or OAuth provider settings
- No changes to any other file
