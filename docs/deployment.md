# Deployment

Step-by-step guide for deploying QuickSparks Hub to SharePoint Online and Microsoft Teams.

## Prerequisites

- SharePoint Admin access (for App Catalog and API permissions)
- Teams Admin access (for publishing the app)
- A Power Automate license (Per User or Per Flow) for whoever owns the data flow
- L&TDC's training tracker Excel file stored in a SharePoint document library

## 1. Store the Excel File

L&TDC's training tracker Excel file needs to be in a SharePoint document library. It can be any library on any site that employees have read access to.

1. Upload the Excel file to a SharePoint document library (e.g. `Shared Documents` on the L&TDC site)
2. Make sure the training records are inside an Excel **Table** (`Ctrl+T` in Excel) - the Power Automate Excel connector reads tables, not raw ranges

> [!TIP]
> See [data-format.md](data-format.md) for the expected Excel structure and a template file.

## 2. Build the Power Automate Flow

The web part does not read the Excel file directly. Instead, it calls a Power Automate flow that reads the Excel file and returns JSON. This keeps the Graph permission scope inside the flow's connection rather than granted to the whole SPFx solution.

1. Go to [make.powerautomate.com](https://make.powerautomate.com) -> **Create** -> **Instant cloud flow**
2. **Trigger:** *When an HTTP request is received* (the "PowerApps/Flow" HTTP trigger)
   - **Who Can Trigger The Flow:** set to **Any user in my tenant** (this enables AAD auth - required for SPFx tokens)
   - Request body schema: leave empty or `{ "type": "object" }`
3. **Action:** Excel Online (Business) -> *List rows present in a table*
   - **Location:** the SharePoint site holding the file
   - **Document Library:** e.g. `Shared Documents`
   - **File:** the training tracker `.xlsx`
   - **Table:** the named table inside the workbook
4. **Action:** *Response*
   - **Status Code:** `200`
   - **Headers:** `Content-Type: application/json`
   - **Body:**
     ```
     {
       "rows": @{outputs('List_rows_present_in_a_table')?['body/value']}
     }
     ```
   - **Response Body JSON Schema:** `{ "type": "object", "properties": { "rows": { "type": "array" } } }`
5. **Save** the flow
6. Open the trigger step and copy the **HTTP POST URL** - you'll paste it into the web part later
7. Click **Test -> Manually -> Run flow**. Open the run and confirm the Response body contains a `rows` array whose objects have keys matching the Excel column names (`CATEGORY OF TRAINING`, `BRONZE`, `SILVER`, `GOLD`, etc. - see [data-format.md](data-format.md))

## 3. Deploy the .sppkg

1. Download the latest `.sppkg` from [GitHub Releases](../../releases) (or build with `npm run package-solution -- --ship` and grab `sharepoint/solution/quicksparks-hub.sppkg`)
2. Go to the App Catalog (`/sites/appcatalog/_layouts/15/tenantAppCatalog.aspx`)
3. Upload the `.sppkg`
4. In the dialog:
   - Check **"Make this solution available to all sites in the organization"**
   - Click **Deploy**

## 4. Approve API Permission

Go to **SharePoint Admin Center - Advanced - API Access** (`/_admin/ServicePrincipal`).

Approve the pending request:

| Permission | Type | Purpose |
|-----------|------|---------|
| `Microsoft Flow Service` | Delegated (User) | Allow the web part to call the Power Automate flow as the signed-in user |

> [!CAUTION]
> The web part will show 401 errors until this permission is approved.

> [!NOTE]
> This is a delegated permission - the AAD token issued to the web part is bound to the signed-in employee, and the flow itself enforces "Any user in my tenant" trigger access. The flow's Excel connector uses the flow owner's credentials to read the file, so employees do not need direct SharePoint access to the training tracker.

## 5. Configure the Web Part

1. Add the **QuickSparks Hub** web part to a SharePoint page
2. Open the property pane (edit icon)
3. Set **"Use mock data"** to **Off**
4. Paste the **Flow trigger URL** copied in step 2.6
5. **Publish** the page

## 6. Publish to Microsoft Teams

**Option A:** In the App Catalog, select the app -> **Sync to Teams**

**Option B:**
1. Teams Admin Center -> **Manage apps**
2. Upload the Teams app package (included in the .sppkg)
3. Pin the app via Teams App Setup Policy for target users

## Troubleshooting

| Issue | Resolution |
|-------|-----------|
| Web part not in toolbox | Verify .sppkg is deployed tenant-wide; refresh the page |
| `401 Unauthorized` from flow | Approve `Microsoft Flow Service` permission in Admin Center (step 4); confirm the flow trigger is set to "Any user in my tenant" |
| `Flow URL not configured` error | Paste the HTTP POST URL into the property pane (step 5) |
| `Flow response missing "rows" array` | The flow's Response action body is wrong - it must return `{ "rows": <table values> }` (step 2.4) |
| No data showing, no errors | The flow ran but returned `rows: []` - usually the wrong table is selected in the Excel action, or the data isn't inside an Excel Table |
| Badges look wrong / missing | Excel column headers don't exactly match the keys in `src/webparts/quickSparksHub/config/flowConfig.ts` - case and spacing matter |
| Build fails locally | Run `nvm use` to ensure Node 18; delete `node_modules` and reinstall |
