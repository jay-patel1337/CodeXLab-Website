# CodeXLab Website: Hosting Costs

*Prices checked on 29 Sep 2026. Rates used: $1 = ₹96, plus about 3.5% bank fee when paying in dollars. Amounts include 18% GST where it applies and are rounded up.*

---

## The short answer

| | What | Cost |
|---|---|---|
| **Domain** | `codexlab.silveroakuni.ac.in`, a sub-domain SOU IT grants us | **₹0** |
| ⭐ **Hosting (recommended)** | **Vercel**, free plan | **₹0** |
| | **Total** | **₹0 per year** |

If the university prefers paid hosting on its own account, the best option is a **DigitalOcean server in Bangalore at ≈ ₹710 per month (≈ ₹8,500 per year)**. See section 2.

---

## 1. The domain: what SOU IT needs to do

We only need a **sub-domain** of the university's address, not a new domain.

- **One DNS record.** IT adds a single `CNAME` record for `codexlab`. The exact value is shown by the host once hosting is set up.
- **Easy to do.** SOU's DNS is managed on **Cloudflare**, so it is a 1-minute change. Set the record to **"DNS only"** (grey cloud), not proxied.
- **Nothing else changes.** It doesn't touch the main university website or email.
- **Checked on 29 Sep 2026:**
  - `codexlab.silveroakuni.ac.in` is unused.
  - SOU's settings allow free HTTPS certificates, so the site will be secure (🔒) at no cost.

**Ready-to-send request**

> **Subject:** Sub-domain request for CodeXLab coding club website
>
> Dear IT Team,
>
> CodeXLab, the coding club of Silver Oak University, has built its official website. We request the sub-domain **codexlab.silveroakuni.ac.in** for it.
>
> This needs one CNAME DNS record (set to "DNS only"), and we will share the exact value. It does not affect the main university website or email.
>
> If possible, we also request a club email ID (for example **codexlab@silveroakuni.ac.in**) to own the website accounts, so they stay with the club when students graduate.
>
> Faculty coordinator: ______
>
> Thank you,
> CodeXLab Core Team

---

## 2. Hosting options

The site is built with Next.js. It needs a host that can run a small server part, because the Join and Feedback forms pass through it securely. Plain file hosting (like basic cPanel) is not enough.

| Host | Per month | Per year | Why it's good | What to watch |
|---|---|---|---|---|
| ⭐ **Vercel (free)** | **₹0** | **₹0** | Made by the creators of Next.js, so the site runs as-is. Goes live automatically on every GitHub update. Free HTTPS. 100 GB of traffic a month. | The free plan is for **non-commercial** use. A non-profit club site with no ads or sales fits this. If a monthly limit is crossed, that feature pauses until the month resets. |
| **SOU's own server** | ₹0 | ₹0 | Fully official, on campus. | IT has to run it. The project already ships as a **Docker** package, so it is ready to hand over. |
| **DigitalOcean, Bangalore (1 GB)** | ≈ ₹710 | ≈ ₹8,500 | Server in India, full control, runs our Docker setup unchanged. | Someone must update and look after the server. Can be free for year 1 with GitHub Student Pack credit. |
| **Hostinger VPS (KVM 1)** | ≈ ₹710 → **₹1,180** | ≈ ₹8,500 → **₹14,000** | Billed in rupees with a GST invoice. | The price nearly **doubles at renewal**, and the intro price needs long prepayment. |
| **Vercel Pro** | ≈ ₹2,350 | ≈ ₹28,000 | Commercial terms and email support. | **Not needed** for a club site. |

**Free backups:** if Vercel ever stops fitting, **Netlify** or **Cloudflare Workers** also have free plans. Cloudflare needs some extra developer setup.

**Avoid:** Render's free plan. The site "sleeps" after 15 minutes, so the next visitor waits about 1 minute for it to load.

---

## 3. Hosting cost over 3 years

| Option | Year 1 | Year 2 | Year 3 | **3-year total** |
|---|---|---|---|---|
| ⭐ Vercel (free) | ₹0 | ₹0 | ₹0 | **₹0** |
| SOU's own server | ₹0 | ₹0 | ₹0 | **₹0** |
| DigitalOcean, Bangalore | ₹8,500 | ₹8,500 | ₹8,500 | **₹25,500** |
| Hostinger VPS | ₹8,500 | ₹14,000 | ₹14,000 | **₹36,500** |
| Vercel Pro | ₹28,000 | ₹28,000 | ₹28,000 | **₹84,000** |

**Already free, whatever we pick:**
- The Google Sheet stores sessions and form replies.
- Google Apps Script handles the forms.
- HTTPS / SSL is included.
- GitHub hosts the code.

---

## 4. Is the free plan enough?

Yes, by a wide margin. 100 GB a month is roughly **50,000 visits a month**, even at a generous 2 MB per visit. A college club site usually gets a few thousand. Session photos load from Google Drive, so they don't count toward our limit.

---

## 5. Who owns the accounts

Students graduate, so every account must belong to the **club**.

- Sign up for Vercel and the Google Sheet with the **club email**. Use the SOU one if IT grants it, otherwise a club Gmail.
- Add the **faculty coordinator** as the recovery contact, and turn on **2-step verification**.
- Pass the login to the next core team every year.

---

## 6. Going live (about 1 hour after IT approves)

1. **Sign in to Vercel** with the club's GitHub and import the `CodeXLab-Website` repository. Set the **root folder** to `frontend`.
2. **Add the 4 private settings** in Vercel → Settings → Environment Variables (the same ones as the local `.env.local`). Set `NEXT_PUBLIC_SITE_URL` to `https://codexlab.silveroakuni.ac.in`.
3. **In Vercel → Domains,** add `codexlab.silveroakuni.ac.in` and send the **CNAME value** it shows to SOU IT.
4. **After IT adds the record,** HTTPS turns on by itself (minutes to a few hours).
5. **Test.** Submit one Join form and one Feedback form and check that they appear in the Sheet.

After this, any change pushed to GitHub goes live by itself in about a minute.

---

## If SOU can't give the sub-domain

Buy **`codexlabsou.in`** instead (available on 29 Sep 2026). It costs **≈ ₹800 per year** at Porkbun, with the same price at renewal. Or buy from an Indian registrar for ≈ ₹700–1,000 per year with a GST invoice. Hosting stays exactly the same.

---

## Sources

- [Vercel Hobby plan: limits and non-commercial terms](https://vercel.com/docs/plans/hobby)
- [DigitalOcean Droplet pricing](https://www.digitalocean.com/pricing/droplets)
- [Hostinger VPS India pricing](https://ideepakrajput.in/blogs/hostinger-vps-hosting-review)
- [Netlify pricing](https://www.netlify.com/pricing/)
- [Cloudflare Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [Render free tier (sleep after 15 min)](https://render.com/articles/platforms-with-a-real-free-tier-for-developers-in-2026)
- [Porkbun domain prices](https://porkbun.com/products/domains)
- [USD → INR rate](https://tradingeconomics.com/india/currency)
