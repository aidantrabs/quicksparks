# Security Policy

## Reporting a Vulnerability

If you discover a security vulnerability in this project, please report it responsibly. **Do not open a public issue.**

### How to Report

1. Email the repository maintainers directly (see [CODEOWNERS](.github/CODEOWNERS))
2. Or use GitHub's [private vulnerability reporting](https://docs.github.com/en/code-security/security-advisories/guidance-on-reporting-and-writing-information-about-vulnerabilities/privately-reporting-a-security-vulnerability) feature on this repository

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### Response Timeline

| Stage | Target |
|-------|--------|
| Acknowledgement | 48 hours |
| Initial assessment | 5 business days |
| Resolution or mitigation | 30 days |

We will keep you informed of progress and credit you in the fix (unless you prefer otherwise).

## Scope

This policy covers the QuickSparks Hub web part source code and its build/deployment pipeline.

Out of scope:
- SharePoint Online platform vulnerabilities (report to [Microsoft MSRC](https://msrc.microsoft.com))
- Azure AD / Entra ID issues (report to Microsoft)
- Third-party dependencies (report to the upstream maintainer)

## Security Model

For details on how QuickSparks Hub is secured  - authentication, permissions, CSP, and dependency management  - see [docs/security-model.md](docs/security-model.md).
