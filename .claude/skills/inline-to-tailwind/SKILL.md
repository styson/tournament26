---
name: inline-to-tailwind
description: Refactor all inline style attributes in a file into Tailwind CSS utility classes
---

Refactor all inline `style` attributes in the current file (or `$ARGUMENTS` if a path is provided) into Tailwind CSS utility classes.

## Inline style conversion

- Map every CSS property to its closest Tailwind equivalent (e.g., `style={{ padding: '20px' }}` → `p-5`).
- If a style uses a custom value not in the default Tailwind theme, use arbitrary value syntax (e.g., `top-[13px]`).
- If the project's Tailwind config registers theme tokens (CSS variables mapped to utility names), prefer the canonical short form over arbitrary `var()` syntax (e.g., `text-accent` over `text-[var(--color-accent)]`).
- Remove the `style` attribute entirely once the conversion is complete.
- Ensure responsive modifiers (`sm:`, `md:`, `lg:`) are applied if the existing styles were conditional on breakpoints.
- Replace JS `onMouseEnter`/`onMouseLeave` handlers that only toggle color/opacity with equivalent Tailwind `hover:` classes.
- Maintain the exact visual layout and design — do not change spacing, sizing, colors, or structure beyond what is required to move styles into class names.
- After writing the file, review any linter diagnostics and apply canonical class suggestions before finishing.

## Repeated styled elements → small functional components

After converting inline styles, look for plain HTML elements (`<span>`, `<td>`, `<div>`, `<button>`, etc.) whose Tailwind className strings are repeated — verbatim or with only one or two properties varying across usages.

**When to extract:**
- The same element + className appears 3 or more times in the file, OR
- A pattern of the same element appears with one prop varying (e.g., a colored label where only `text-*` differs).

**How to extract:**
- Define a small typed functional component at the bottom of the file (or co-located with other helpers), named after the element's semantic role (e.g., `StatusBadge`, `RoleTag`, `SectionValue`, `MetaCell`).
- Accept only the props that actually vary across usages — keep the signature minimal.
- Place the shared Tailwind classes on the element inside the component; pass variant-driving values as props (e.g., a `color` string, a boolean `active`, a `variant` union).
- Replace every call-site with the new component.
- Do **not** extract if the element is only used once, or if the "shared" classes are trivially short (under ~3 utilities) — the abstraction cost outweighs the benefit.
- Do **not** create wrapper components for layout/structural divs whose className is incidentally similar — only extract elements whose repetition reflects a shared **semantic role**.
