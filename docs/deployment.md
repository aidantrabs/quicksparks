# Deployment

Step-by-step guide for deploying QuickSparks Hub to SharePoint Online and Microsoft Teams.

## Prerequisites

- SharePoint Admin access (for App Catalog and API permissions)
- Teams Admin access (for publishing the app)
- L&TDC's training tracker Excel file stored in a SharePoint document library

## 1. Store the Excel File

L&TDC's training tracker Excel file needs to be in a SharePoint document library. It can be any library on any site that employees have read access to.

1. Upload the Excel file to a SharePoint document library (e.g. `Shared Documents` on the L&TDC site)
2. Note the **site URL**, **library name**, and **file name** - you'll need these when configuring the web part

> [!TIP]
> See [data-format.md](data-format.md) for the expected Excel structure and a template file.

## 2. Deploy the .sppkg

1. Download the latest `.sppkg` from [GitHub Releases](../../releases)
2. Go to the App Catalog (`/sites/appcatalog/_layouts/15/tenantAppCatalog.aspx`)
3. Upload the `.sppkg`
4. In the dialog:
   - Check **"Make this solution available to all sites in the organization"**
   - Click **Deploy**

## 3. Approve API Permission

Go to **SharePoint Admin Center - Advanced - API Access** (`/_admin/ServicePrincipal`).

Approve the pending request:

| Permission | Type | Purpose |
|-----------|------|---------|
| `Files.Read.All` | Delegated | Read the training tracker Excel file via Graph API |

> [!CAUTION]
> The web part will show errors until this permission is approved.

> [!NOTE]
> This is a delegated permission - it runs as the logged-in employee and can only access files they already have SharePoint access to. No service accounts or app registrations are needed.

## 4. Configure the Web Part

1. Add the **QuickSparks Hub** web part to a SharePoint page
2. Open the property pane (edit icon)
3. Set **"Use mock data"** to **Off**
4. Fill in the **Excel File Location** fields:
   - **SharePoint site URL** - e.g. `https://tenant.sharepoint.com/sites/LTDC`
   - **Document library name** - e.g. `Shared Documents`
   - **Excel file name** - e.g. `QuickSparks Training Tracker GTSD.xlsx`
5. **Publish** the page

## 5. Publish to Microsoft Teams

**Option A:** In the App Catalog, select the app - **Sync to Teams**

**Option B:**
1. Teams Admin Center - **Manage apps**
2. Upload the Teams app package (included in the .sppkg)
3. Pin the app via Teams App Setup Policy for target users

## Troubleshooting

| Issue | Resolution |
|-------|-----------|
| Web part not in toolbox | Verify .sppkg is deployed tenant-wide; refresh the page |
| "Access Denied" errors | Approve `Files.Read.All` permission in Admin Center (step 3) |
| No data showing | Verify the Excel file location in the property pane; ensure "Use mock data" is off |
| "Could not find header row" error | The Excel file format doesn't match expectations. See [data-format.md](data-format.md) |
| "Document library not found" error | The library name in the property pane doesn't match. The error message lists available libraries. |
| "File not found" error | Check the exact file name (including extension) in the property pane |
| Build fails locally | Run `nvm use` to ensure Node 18; delete `node_modules` and reinstall |
