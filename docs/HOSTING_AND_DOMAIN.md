# CodeXLab Website: Hosting & Domain Costs

*Prices checked on 29 Sep 2026. Rates used: $1 = ₹96, plus about 3.5% bank fee when paying in dollars. Amounts are rounded up.*

---

## The short answer

| | Option | Cost per year |
|---|---|---|
| ⭐ **Recommended** | Free hosting on **Vercel** + our own domain **`codexlabsou.in`** | **≈ ₹800** |
| 🆓 **Fully free** | Free hosting on **Vercel** + university sub-domain **`codexlab.silveroakuni.ac.in`** | **₹0** |

Both give a fast, secure (HTTPS) website that updates itself whenever the club pushes code to GitHub. The only real difference is the web address.

---

## 1. What the website needs

- **A place to run it (hosting).** The site is built with Next.js. It needs a small server part, because the Join and Feedback forms go through it safely. A plain "upload HTML files" host is not enough.
- **A web address (domain).** For example `codexlabsou.in`.
- **Everything else is already free:**
  - The Google Sheet stores sessions and form replies.
  - Google Apps Script handles the forms.
  - HTTPS / SSL comes free with any of the hosts below.
  - GitHub hosts the code.

---

## 2. Domain options

| Domain | Available? | 1st year | Every year after | Notes |
|---|---|---|---|---|
| `codexlab.silveroakuni.ac.in` | Needs SOU IT approval | **₹0** | **₹0** | Most official, since it sits under the university's own address. IT only has to add **one DNS record**. |
| ⭐ `codexlabsou.in` | ✅ Yes | ≈ ₹800 | ≈ ₹800 | Indian, short, and renewal price stays the same. |
| `codexlabsou.com` | ✅ Yes | ≈ ₹1,100 | ≈ ₹1,100 | Global and familiar. |
| `codexlabsou.dev` | ✅ Yes | ≈ ₹900 | ≈ ₹1,300 | Developer look. HTTPS-only by design. |
| `codexlab.club` | ✅ Yes | ≈ ₹400 | ≈ ₹1,600 | Cheap at first, but renewal is **4× higher**. |
| `codexlab.in` / `.com` / `.dev` / `.org` / `.tech` | ❌ Taken | – | – | Already owned by someone else. |

> Availability was checked on 29 Sep 2026. Any of these can be bought by someone else at any time.

**Where to buy**
- **Porkbun** (porkbun.com): the prices above. Renewal costs the same as the first year, and privacy is free. You pay by card in dollars.
- **An Indian registrar** such as GoDaddy India, BigRock or Hostinger: use one if the university needs a **GST invoice in rupees**. Expect about **₹700–1,000 per year including GST**. Always compare the **renewal** price, not the "₹99 first year" offers.

**Free student domains (GitHub Student Pack): not recommended for the club's main address**
- Free for 1 year only.
- Registered in **one student's personal name**. When that student graduates, the club can lose the address.
- `.tech` renews at about **₹5,100 per year**.

---

## 3. Hosting options

| Host | Cost per year | Why it's good | What to watch |
|---|---|---|---|
| ⭐ **Vercel (Hobby, free)** | **₹0** | Made by the creators of Next.js, so the site runs as-is. Updates automatically on every GitHub push. Free HTTPS. Covers 100 GB of traffic a month. | The free plan is for **non-commercial** use. A non-profit club site with no ads or sales fits this. If a monthly limit is ever crossed, that feature pauses until the month resets. |
| **Netlify (free)** | ₹0 | Very similar to Vercel. | The site **stops** if the monthly 300 credits run out. |
| **Cloudflare Workers (free)** | ₹0 | Huge free allowance (100,000 visits a day). No non-commercial rule. | Needs extra developer setup, and there is an app size limit (3 MB). |
| **SOU's own server** | ₹0 | Fully official, on campus. | IT has to run it for us. The project already ships as a **Docker** package, so it is ready to hand over. |
| **DigitalOcean, Bangalore (1 GB server)** | ≈ ₹8,500 *(1st year free with student credit)* | The server is in India, we have full control, and our Docker setup runs unchanged. | Someone must update and look after the server. |
| **Hostinger VPS (KVM 1)** | ≈ ₹8,500 intro → **≈ ₹14,000** on renewal | Billed in rupees with a GST invoice. | Price roughly doubles at renewal, and it needs long prepayment. |
| **Vercel Pro** | ≈ ₹28,000 | Commercial terms and email support. | **Not needed** for a club site. |

**Avoid:** Render's free plan. The site goes to "sleep" after 15 minutes, so the next visitor waits about 1 minute for it to load.

**Is the free plan enough for us?** Yes, by a wide margin. 100 GB a month is roughly **50,000 visits a month**, even at a generous 2 MB per visit. A college club site usually gets a few thousand. Session photos load from Google Drive, so they don't count toward our limit.

---

## 4. Total cost over 3 years

| Plan | Year 1 | Year 2 | Year 3 | **3-year total** |
|---|---|---|---|---|
| ⭐ **A.** Vercel free + `codexlabsou.in` | ₹800 | ₹800 | ₹800 | **₹2,400** |
| 🆓 **B.** Vercel free + SOU sub-domain | ₹0 | ₹0 | ₹0 | **₹0** |
| **C.** DigitalOcean server + `codexlabsou.in` | ₹800 | ₹9,300 | ₹9,300 | **₹19,400** |
| **D.** Vercel Pro + `codexlabsou.in` | ₹28,800 | ₹28,800 | ₹28,800 | **₹86,400** |

*Plans C and D include 18% GST and the bank fee.*

---

## 5. Who should own the accounts (important)

Students graduate, so the accounts must belong to the **club**, not to one person.

1. Create **one club email** (for example a club Gmail). Use it for the domain, Vercel and the Google Sheet.
2. Add the **faculty coordinator** as the recovery contact, and turn on **2-step verification**.
3. Turn on **auto-renew** for the domain, or pay 2–3 years ahead. An expired domain can be bought by anyone.
4. Hand over the login to the next core team every year.

---

## 6. Going live with Plan A (about 1 hour)

1. **Buy** `codexlabsou.in`, from Porkbun or an Indian registrar if a GST bill is needed.
2. **Sign in to Vercel** with GitHub and import the `CodeXLab-Website` repository. Set the **root folder** to `frontend`.
3. **Add the 4 private settings** in Vercel → Settings → Environment Variables (the same ones as the local `.env.local`). Set `NEXT_PUBLIC_SITE_URL` to `https://codexlabsou.in`.
4. **Connect the domain.** In Vercel → Domains, add `codexlabsou.in`, then copy the DNS records it shows into the registrar.
5. **Test.** Once HTTPS turns on (minutes to a few hours), submit one Join form and one Feedback form and check that they appear in the Sheet.

After this, any change pushed to GitHub goes live by itself in about a minute.

**Optional, free:** a club email address such as `hello@codexlabsou.in` that forwards to the club Gmail, using Cloudflare Email Routing.

---

## Sources

- [Vercel Hobby plan: limits and non-commercial terms](https://vercel.com/docs/plans/hobby)
- [Porkbun domain prices](https://porkbun.com/products/domains)
- [DigitalOcean Droplet pricing](https://www.digitalocean.com/pricing/droplets)
- [Netlify pricing](https://www.netlify.com/pricing/)
- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Render free tier (sleep after 15 min)](https://render.com/articles/platforms-with-a-real-free-tier-for-developers-in-2026)
- [GitHub Student Pack domains (Namecheap .me)](https://nc.me/landing/github)
- [Hostinger VPS India pricing](https://ideepakrajput.in/blogs/hostinger-vps-hosting-review)
- [USD → INR rate](https://tradingeconomics.com/india/currency)
