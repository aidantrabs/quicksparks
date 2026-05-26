# Security Model

Technical overview of how QuickSparks Hub is secured. For reporting vulnerabilities, see [SECURITY.md](../SECURITY.md).

## Architecture

QuickSparks Hub is a **read-only** web part. It calls a Power Automate flow that reads L&TDC's training tracker Excel file from a SharePoint document library and returns the rows as JSON. The web part never writes, modifies, or deletes any data, and never touches the Excel file directly.

```mermaid
flowchart LR
    subgraph Microsoft 365 Tenant
        XL[Excel File<br/>in SharePoint] -->|read-only| Flow[Power Automate Flow]
        Flow -->|JSON over HTTPS<br/>AAD-protected| WP[QuickSparks Hub]
        WP -->|renders| Browser
        LTDC[L&TDC] -->|maintains| XL
    end
```

> [!IMPORTANT]
> No data leaves the Microsoft 365 tenant. No external APIs are called.

## Authentication

| Aspect | Detail |
|--------|--------|
| Method | Azure AD SSO via SPFx context |
| Token management | Handled by SharePoint runtime |
| User identity | `this.context.pageContext.user` |
| Custom auth flows | None |
| Token storage | None  - no `localStorage`/`sessionStorage` for tokens |

No login screens, no custom OAuth, no token refresh logic.

## API Permissions

Minimum necessary permissions:

| Permission | Type | Purpose |
|-----------|------|---------|
| `Microsoft Flow Service` | Delegated (User) | Call the Power Automate flow that returns training data |

This is a delegated permission - the AAD token issued to the web part is bound to the signed-in employee, and the flow trigger is restricted to "Any user in my tenant" so anonymous callers (even with the URL) are rejected by AAD. The flow's Excel connector runs under the flow owner's credentials, so the SPFx solution never holds Graph or Files permissions directly. Approved by a SharePoint Admin at `/_admin/ServicePrincipal`.

## Content Security Policy

SPFx enforces a strict CSP managed by SharePoint Online:

- No `eval()` or `new Function()`
- No external CDN dependencies  - everything bundled in `.sppkg`
- No external font loading (Segoe UI available on all bank machines)
- No `dangerouslySetInnerHTML` in React components
- No inline script execution

## Code Security

| Control | Implementation |
|---------|---------------|
| Type safety | Strict TypeScript (`noImplicitAny`, `strictNullChecks`, `strictFunctionTypes`) |
| Linting | Biome with security rules enabled |
| XSS prevention | React's built-in escaping for all rendered strings |
| Data validation | Excel column headers validated on parse; all data type-checked before rendering |
| Secrets | No API keys, secrets, or tenant IDs in source code |

## Dependency Security

| Control | Implementation |
|---------|---------------|
| Runtime deps | Minimal - production path uses built-in SPFx `AadHttpClient` (zero additional runtime deps) |
| Version pinning | Exact versions (no `^` or `~`) |
| Audit | `npm audit` runs in CI on every PR |
| CI supply chain | GitHub Actions pinned to commit SHAs |

## Deployment Security

| Control | Implementation |
|---------|---------------|
| Package scope | Tenant-scoped `.sppkg` (deployed once, available across sites) |
| Branch protection | Required for merges to `main` |
| Code review | CODEOWNERS required for approval |
| Artifact provenance | Release builds run in CI, not locally |
