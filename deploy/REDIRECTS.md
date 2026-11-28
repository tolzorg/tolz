# Duplicate calculator URL redirects (Render)

Hosting: DNS at Hostinger → `www.tolz.org` CNAME → `tolz-client.onrender.com`.
There's no Cloudflare account. The `Server: cloudflare` header comes from Render's own edge.

## What's in render.yaml

`tolz-client.routes` holds 145 explicit `type: redirect` rules (Render sends a 301),
one for each duplicate `/calculators/<category>/<tool>` URL whose canonical is its `/tools/` twin.
After them comes the SPA rewrite `/*` → `/index.html`. Render applies the first matching rule
from the top, so the redirects must stay above the rewrite. There are no wildcards. The
20 self-canonical construction pages (baluster, rebar, decking, …) are not listed.

## One-time: let render.yaml manage tolz-client (Blueprint)

`render.yaml` only takes effect for services managed by a Blueprint, and `tolz-client`
is currently configured in the dashboard. Render adopts an existing service when the
Blueprint uses the same `name`.

1. Push the commit that contains this render.yaml.
2. Render dashboard → **New → Blueprint** → choose this repo (branch `main`).
3. On the review screen, check the planned changes before you click Deploy:
   - `tolz-client`: only the new routes should show. The headers already match the live site.
   - `tolz-api`: there should be **no** changes. If anything is listed, stop and compare
     it with the dashboard settings first.
   - No **new** services (names with a suffix). If Render shows any, cancel, because
     it isn't adopting the existing services.
4. Deploy Blueprint. Then open tolz-client → Redirects/Rewrites and confirm the order:
   the 145 redirects first, and `/*` → `/index.html` **last**. Render keeps dashboard
   rules that aren't in the file, so an old dashboard copy of the `/*` rewrite sitting
   above the redirects would stop them from working.

## Then

- `bash deploy/verify-redirects.sh`
- **Trailing slash:** section 2 shows whether `/calculators/.../x/` redirects. If those
  URLs FAIL (they still return 200), Render treats `/a` and `/a/` as different paths.
  The slash variants and the `/tools/*/` → `/tools/*` strip rule are added only then,
  in a second deploy tested on one URL first, so it can't loop.
- **http:// and tolz.org variants** take 2–3 hops. Render itself does http→https and
  tolz.org→www before any rule runs, and that can't be changed on Render.
- **Don't** block the old URLs in robots.txt. Google must crawl them to see the 301s.
