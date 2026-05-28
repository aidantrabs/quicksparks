# IT Handoff Guide

Everything the SharePoint Administrator needs to push QuickSparks Hub live. The data team and the flow are already configured; this guide covers the admin-only steps that finish the deployment.

## What QuickSparks Hub is

A read-only Teams app (and SharePoint web part) that shows employees their training badges, upcoming sessions, attendance streak, and a division leaderboard. Data lives in an Excel file the L&TDC team maintains; the app reads it through a Power Automate flow so end users never need direct access to the file.

## Architecture summary

```
Employee (Teams)
   |
   v
QuickSparks Hub web part  ---(AAD token)--->  Power Automate flow
                                                    |
                                                    v
                                              Excel Online connector
                                                    |
                                                    v
                                              QuickSparksTracker site
                                              (private, data team only)
```

The flow's Excel connection acts as a proxy. End users get permission to **call** the flow, not to read the file.

## Already done

- [x] Private SharePoint site `QuickSparksTracker` exists, restricted to the data team
- [x] Excel file at `Documents/QuickSparks Tracker/QuickSparks Training Tracker (2).xlsx`
- [x] Excel table named `Training Records`
- [x] Power Automate flow exists and is wired to the Excel table
- [x] Flow trigger URL captured
- [x] Run only users configured on the flow so end users inherit the flow owner's Excel access

## Values needed for deployment

| Field | Value |
|---|---|
| API permission to approve | `Microsoft Flow Service`, scope `User` |
| `.sppkg` file | `sharepoint/solution/quicksparks-hub.sppkg` (build with `gulp bundle --ship && gulp package-solution --ship`) |
| Flow trigger URL | provided separately |

## Deployment steps

### 1. Upload the `.sppkg` to the App Catalog

1. Open the tenant App Catalog (typically `https://republicconnect.sharepoint.com/sites/appcatalog`)
2. Open **Apps for SharePoint**
3. Drag in `quicksparks-hub.sppkg`
4. In the trust dialog, check **Make this solution available to all sites in the organization**
5. Click **Deploy**

### 2. Sync to Microsoft Teams

In the App Catalog, find the QuickSparks Hub row, click the `...` menu, and select **Sync to Teams**. Wait for the confirmation toast. The app will appear in the tenant's Teams app catalog within a few minutes.

### 3. Approve the API permission

1. Open `https://republicconnect-admin.sharepoint.com`
2. Navigate to **Advanced > API access**
3. Under **Pending requests**, find `Microsoft Flow Service` (scope `User`)
4. Select it and click **Approve**

The web part returns 401 errors until this is approved.

### 4. Verify as the admin

1. Open Microsoft Teams
2. Click **Apps** in the left rail
3. Search for **QuickSparks Hub** and click **Add**
4. Open it. If the property pane is shown, paste the flow trigger URL and set **Use mock data** to **Off**.
5. Confirm data loads.

### 5. Verify as a non-admin

1. Have a regular employee (or a test account not in the data team) open Teams > Apps > QuickSparks Hub > Add
2. Confirm data loads for them as well
3. Open the Excel file URL directly in their browser. They should see **Access denied** - confirming the access model is intact.

## Optional: pin the app for everyone

To pin QuickSparks Hub in every employee's Teams sidebar:

1. **Teams Admin Center > Teams apps > Setup policies > Global (Org-wide default)**
2. Add **QuickSparks Hub** to the **Pinned apps** list
3. Save. Propagation takes a few hours.

## Troubleshooting

| Symptom | Resolution |
|---|---|
| `401 Unauthorized` from the web part | API permission not yet approved. Redo step 3. |
| App loads but shows no data | Flow returned `rows: []`. The Excel connection on the flow side has lost authorisation, or the table contents changed. |
| `Flow URL not configured` | Paste the trigger URL into the property pane (step 4). |
| App is not in the Teams app catalog | Sync to Teams was not done (step 2), or wait 5-10 minutes for propagation. |
| Build fails locally | Run `nvm use` to switch to Node 18, then `npm install`. |

## After deployment

- Send an announcement to the org (Teams channel post or email) directing employees to the Teams app catalog.
- The data team continues to update the Excel file directly. Changes propagate to the app within 5 minutes (the data cache TTL).
- If anything breaks, check the flow's run history in Power Automate first - the most common failure mode is the flow's Excel connection losing authorisation.

## Reference

- [Deployment](deployment.md) - full deployment reference including the original flow build steps
- [Security Model](security-model.md) - authentication, permissions, data flow
- [Data Format](data-format.md) - Excel column rules and template
- [Architecture](architecture.md) - codebase architecture for future maintainers
