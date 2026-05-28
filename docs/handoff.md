# IT Handoff Guide

Everything needed to deploy QuickSparks Hub to production. Aimed at a SharePoint Administrator or Global Administrator running through this end-to-end in a single session.

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
                                              (runs as flow owner)
                                                    |
                                                    v
                                              QuickSparksTracker site
                                              (private, data team only)
```

The flow's Excel connection acts as a proxy. End users get permission to **call** the flow, not to read the file.

## Pre-handoff checklist

These are done before the meeting:

- [x] Private SharePoint site `QuickSparksTracker` exists and is restricted to the data team
- [x] Excel file uploaded to the site at `Documents/QuickSparks Tracker/QuickSparks Training Tracker (2).xlsx`
- [x] Excel data is inside a Table named `Training Records`
- [x] Power Automate flow exists with the HTTP trigger and Excel "List rows" action
- [x] Flow trigger URL captured

## Values needed for deployment

| Field | Value |
|---|---|
| SharePoint site | `https://republicconnect.sharepoint.com/sites/QuickSparksTracker` |
| Document library | `Documents` (a.k.a. `Shared Documents`) |
| Excel file path | `QuickSparks Tracker/QuickSparks Training Tracker (2).xlsx` |
| Excel table | `Training Records` |
| Sheet name | `Training Records` (headers on row 3) |
| API permission to approve | `Microsoft Flow Service`, scope `User` |
| `.sppkg` file | `sharepoint/solution/quicksparks-hub.sppkg` (build with `gulp bundle --ship && gulp package-solution --ship`) |

## Deployment steps

### 1. Confirm the flow's Excel connection owner

The flow's Excel Online (Business) connection must run under an account that has access to the `QuickSparksTracker` site.

- **Preferred:** a dedicated service account (e.g. `quicksparks-svc@rfhl.com`) added as a Member of `QuickSparksTracker`
- **Fallback:** a data team member's account

Sign in to `make.powerautomate.com` as the chosen account before editing the flow.

### 2. Configure the flow's Excel action

Open the flow in Power Automate and edit the **List rows present in a table** action:

| Field | Value |
|---|---|
| Location | `https://republicconnect.sharepoint.com/sites/QuickSparksTracker` |
| Document Library | `Documents` |
| File | `QuickSparks Tracker/QuickSparks Training Tracker (2).xlsx` |
| Table | `Training Records` |

Save the flow, then run **Test > Manually > Run flow**. Confirm the Response body contains a `rows` array with the expected columns (see [data-format.md](data-format.md) for the full column list).

### 3. Configure Run only users

On the flow's details page, click **Edit** next to **Run only users**.

1. Add the SharePoint group(s) or users allowed to trigger the flow (typically "Everyone except external users")
2. For the **Excel Online (Business)** connection, select **Use this connection (`<flow-owner-email>`)**. Do not pick "Provided by run-only user".
3. Save.

The "Use this connection" choice is what lets end users inherit the flow owner's Excel access. Without it, every user would need their own connection (and therefore direct file access), defeating the access model.

### 4. Upload the `.sppkg` to the App Catalog

1. Open the tenant App Catalog (typically `https://republicconnect.sharepoint.com/sites/appcatalog`)
2. Open **Apps for SharePoint**
3. Drag in `quicksparks-hub.sppkg`
4. In the trust dialog, check **Make this solution available to all sites in the organization**
5. Click **Deploy**

### 5. Sync to Microsoft Teams

In the App Catalog, find the QuickSparks Hub row, click the `...` menu, and select **Sync to Teams**. Wait for the confirmation toast. The app will appear in the tenant's Teams app catalog within a few minutes.

### 6. Approve the API permission

1. Open `https://republicconnect-admin.sharepoint.com`
2. Navigate to **Advanced > API access**
3. Under **Pending requests**, find `Microsoft Flow Service` (scope `User`)
4. Select it and click **Approve**

The web part returns 401 errors until this is approved.

### 7. Verify as the admin

1. Open Microsoft Teams
2. Click **Apps** in the left rail
3. Search for **QuickSparks Hub** and click **Add**
4. Open it. If the property pane is shown, paste the flow trigger URL and set **Use mock data** to **Off**.
5. Confirm data loads.

### 8. Verify as a non-admin

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
| Flow test fails on the Excel step | The flow's connection owner does not have access to `QuickSparksTracker`. Fix step 1. |
| `401 Unauthorized` from the web part | API permission not yet approved. Redo step 6. |
| App loads but shows no data | Flow returned `rows: []`. The wrong table is selected in step 2, or the Excel table is not named `Training Records`. |
| `Flow URL not configured` | Paste the trigger URL into the property pane (step 7). |
| App is not in the Teams app catalog | Sync to Teams was not done (step 5), or wait 5-10 minutes for propagation. |
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
