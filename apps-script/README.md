# Google Sheet setup (sessions + forms)

It takes about 10 minutes and uses one Google Sheet for everything.

## 1. Create the Sheet
Create a Google Sheet named, for example, **CodeXLab Website**, and add a tab named **Sessions** with this header row:

```
id | date | title | speaker | tags | summary | attendees | cover_image_url | photos | resources_url | status
```

- `date` uses the `YYYY-MM-DD` format. Set the column to **Format → Number → Plain text** before typing, or Sheets turns it into a local date (19/09/2026) and sorting breaks.
- `tags` are comma-separated, e.g. `Web, AI / ML`.
- `status`: set it to `draft` or `hidden` to keep a row off the site.
- `id` is optional; if it's empty, the site builds one from the date and title.
- `cover_image_url` + `photos`: image links shown in the session's detail view (cover first).
  - Put several links in `photos`, one per line or separated with `|`.
  - Google Drive links work as-is (`drive.google.com/file/d/…/view`). The file must be shared as **Anyone with the link**.
  - With no photos, the detail view shows reserved photo frames.

## 2. Publish the Sessions tab (for the website to read)
1. Go to **File → Share → Publish to web**.
2. Pick the **Sessions** tab and the **Comma-separated values (.csv)** format, then click **Publish**. Never pick **Entire document**: the Join and Feedback tabs hold students' emails and enrollment numbers.
3. Copy the URL into `frontend/.env.local` as `SESSIONS_CSV_URL=...`.

The site re-reads it at most once an hour.

## 3. Deploy the form receiver
1. In the Sheet, open **Extensions → Apps Script** and paste in the contents of `Code.gs`.
2. Under **Project Settings → Script properties**, add `SECRET` with any long random string.
3. Click **Deploy → New deployment → Web app**. Set **Execute as: Me** and **Who has access: Anyone**.
4. Copy the Web app URL into `frontend/.env.local`:
   ```
   APPS_SCRIPT_URL=https://script.google.com/macros/s/.../exec
   APPS_SCRIPT_SECRET=<same string as step 2>
   ```

The `Join` and `Feedback` tabs are created automatically on the first submission.

> If you change `Code.gs`, deploy again with **Manage deployments → Edit → New version**. The URL stays the same.
