i-MAN WEBSITE V3 — CONNECTED TO SUPABASE

Supabase connection has been configured for the i-MAN activity/gallery system.

IMPORTANT
- The browser uses the Supabase Project URL + Publishable key only.
- Never add a service_role/secret key to this website.
- Admin access is controlled by Supabase Auth + RLS policies.
- Current admin email configured in the SQL policy: hafiz@iraudhah.com
- Storage bucket: activity-photos (Public read)
- Upload/delete is restricted to the configured admin through Storage policies.

UPLOAD TO GITHUB
1. Replace the website files in the existing iraudhah-iman GitHub Pages repository with ALL files in this package.
2. Keep CNAME containing: www.iraudhah.com
3. Do not rename the folders css, js, or images.
4. After GitHub Pages deploys, open:
   https://www.iraudhah.com/aktiviti.html
5. Open the hidden admin page directly:
   https://www.iraudhah.com/pengurusan.html
6. Login using the Supabase admin account.

ACTIVITY WORKFLOW
- Login at pengurusan.html.
- Enter program details.
- Select multiple old photos.
- Photos are compressed in the browser before upload.
- The program record is saved in Supabase Database.
- Photos are saved in Storage under events/<event-id>/.
- The public Aktiviti page automatically lists the new program.

SECURITY
- Do not share database passwords.
- Do not share service_role/secret keys.
- If you change the admin email later, update the is_admin() SQL function/policy logic.

GOOGLE VERIFICATION
Use real historical i-MAN activity photos, accurate dates/locations where known, and genuine program descriptions. Avoid inventing dates or events.
