# Silverback Insurance — Construction Insurance Proposal Form

**Pre-renewal HTML form for builders, hosted on GitHub Pages and linked from Pipedrive emails.**

C.A.R No: 1283436 · Authorised Representative of Australian Broker Network

---

## Architecture Summary

```
Builder receives email (Pipedrive)
  → Clicks "Complete Proposal" button
  → Opens form on GitHub Pages (static HTML)
  → Fills out form, signs digitally, submits
  → Formspree receives submission (serverless)
  → Formspree emails copy to info@silverbackinsurance.com.au
  → Builder sees success confirmation
```

**Why this approach:**

| Concern | Solution |
|---|---|
| Hosting | GitHub Pages — free, reliable, HTTPS built-in |
| Form submission | Formspree — serverless, no backend to maintain |
| Email delivery | Formspree sends to info@silverbackinsurance.com.au |
| Security | No secrets in client code; Formspree handles spam filtering |
| Email embedding | Not recommended — HTML forms don't work inside email clients. We use a linked form (CTA button) instead |

---

## File Structure

```
silverback-contract-works-insurance-proposal/
├── index.html                  ← The full 14-section proposal form
├── styles.css                  ← Professional branded styling
├── script.js                   ← Validation, conditional logic, signature pads, submission
├── Silverback_Logo_FullStack.jpg  ← Logo file
└── README.md                   ← This file (setup & deployment guide)
```

---

## Setup & Deployment (Step by Step)

### Step 1: Create a Formspree Account

1. Go to [https://formspree.io](https://formspree.io) and sign up (free tier: 50 submissions/month)
2. Click **"New Form"**
3. Set the email to: `info@silverbackinsurance.com.au`
4. Copy the **Form ID** — it looks like `xpznqkdl`
5. Open `script.js` and replace `YOUR_FORMSPREE_ID` with your actual form ID:
   ```js
   const FORMSPREE_ID = 'xpznqkdl';  // ← your real ID here
   ```

### Step 2: Create a GitHub Repository

1. Go to [https://github.com](https://github.com) and sign in (or create an account)
2. Click the **"+"** button → **"New repository"**
3. Name it: `silverback-contract-works-insurance-proposal`
4. Set it to **Public** (required for free GitHub Pages)
5. Click **"Create repository"**

### Step 3: Upload the Files

1. On the new repo page, click **"uploading an existing file"**
2. Drag and drop ALL files:
   - `index.html`
   - `styles.css`
   - `script.js`
   - `Silverback_Logo_FullStack.jpg`
3. Click **"Commit changes"**

### Step 4: Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages** (in the left sidebar)
2. Under "Source", select **"Deploy from a branch"**
3. Select **"main"** branch and **"/ (root)"** folder
4. Click **Save**
5. Wait 1–2 minutes. Your form will be live at:
   ```
   https://YOUR-USERNAME.github.io/silverback-contract-works-insurance-proposal/
   ```

### Step 5: Test the Form

1. Open the live URL in a browser
2. Fill in a test submission
3. Check that the email arrives at info@silverbackinsurance.com.au
4. Verify the success message displays

---

## Formspree Configuration Tips

After creating your form on Formspree, configure these settings in the Formspree dashboard:

- **Email subject line**: Already set in the code as "New Construction Insurance Proposal — [Business Name]"
- **Reply-to**: Automatically set to the proposer's email
- **reCAPTCHA**: Enable in Formspree dashboard (Settings → Spam Protection) for bot protection
- **Allowed domains**: Restrict to your GitHub Pages URL for extra security
- **Email notifications**: Confirm info@silverbackinsurance.com.au is verified in Formspree

---

## Pipedrive Pre-Renewal Email Template

Use this HTML snippet as a CTA button in your Pipedrive email template. Replace `YOUR-URL` with your actual GitHub Pages URL.

### Simple Button (works in all email clients):

```html
<table cellpadding="0" cellspacing="0" border="0" style="margin:24px auto;">
  <tr>
    <td align="center" bgcolor="#1a3f6f" style="border-radius:8px;">
      <a href="https://YOUR-USERNAME.github.io/silverback-contract-works-insurance-proposal/"
         target="_blank"
         style="display:inline-block;padding:14px 40px;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;background-color:#1a3f6f;">
        Complete Your Insurance Proposal
      </a>
    </td>
  </tr>
</table>
```

### Full Email Template Example:

```html
Hi {first_name},

Your construction insurance policy is due for renewal on {renewal_date}.

To ensure we can provide you with the best possible quote, please take a few minutes to complete our online proposal form with your current business details.

<table cellpadding="0" cellspacing="0" border="0" style="margin:24px auto;">
  <tr>
    <td align="center" bgcolor="#1a3f6f" style="border-radius:8px;">
      <a href="https://YOUR-USERNAME.github.io/silverback-contract-works-insurance-proposal/"
         target="_blank"
         style="display:inline-block;padding:14px 40px;font-family:Arial,sans-serif;font-size:16px;font-weight:bold;color:#ffffff;text-decoration:none;border-radius:8px;background-color:#1a3f6f;">
        Complete Your Insurance Proposal
      </a>
    </td>
  </tr>
</table>

If you have any questions, don't hesitate to give me a call.

Kind regards,
Petara Tanuvasa
Silverback Insurance
C.A.R No: 1283436 | AR of Australian Broker Network
P: 0410 152 835
E: info@silverbackinsurance.com.au
```

**Why a link instead of an embedded form?**
HTML forms cannot be embedded directly in emails — email clients (Gmail, Outlook, etc.) strip out `<form>` tags, JavaScript, and interactive elements for security. The industry-standard approach is a CTA button linking to the hosted form.

---

## Spam Protection & Security

| Measure | Status |
|---|---|
| HTTPS | Automatic via GitHub Pages |
| Formspree spam filter | Built-in (Akismet-powered) |
| reCAPTCHA | Enable in Formspree dashboard |
| Domain restriction | Set allowed domains in Formspree settings |
| Honeypot field | Formspree adds automatically |
| No secrets in code | Formspree ID is not a secret — submissions are filtered server-side |
| Input validation | Client-side validation + Formspree server-side validation |

**Recommendations:**
1. Enable reCAPTCHA in Formspree (free, adds invisible challenge)
2. Set domain restriction to your GitHub Pages URL only
3. Monitor submissions in the Formspree dashboard for spam patterns

---

## Testing Checklist

- [ ] Form loads correctly on desktop (Chrome, Firefox, Safari, Edge)
- [ ] Form loads correctly on mobile (iOS Safari, Android Chrome)
- [ ] Logo displays correctly in header
- [ ] All 14 sections visible and styled correctly
- [ ] Required field validation works (try submitting empty form)
- [ ] Email validation rejects invalid addresses
- [ ] Conditional fields appear/disappear:
  - [ ] Disclosure details (when any disclosure = Yes)
  - [ ] Risk details (when any risk question = Yes)
  - [ ] Liability details (when any liability question = Yes)
  - [ ] Hired equipment details (when hired equipment = Yes)
  - [ ] Pollution details (when pollution required = Yes)
  - [ ] Office details (when builders office = Yes)
  - [ ] Liability limit other (when limit = Other)
- [ ] Percentage totals calculate correctly (Contract Types, Project Breakdown, Geographic)
- [ ] Plant & Equipment total calculates correctly
- [ ] Signature pad works (mouse and touch)
- [ ] Clear signature button works
- [ ] Progress bar updates as sections are filled
- [ ] Consent checkbox is required for submission
- [ ] Form submits successfully to Formspree
- [ ] Email received at info@silverbackinsurance.com.au
- [ ] Email contains all form data in readable format
- [ ] Success overlay displays after submission
- [ ] Form scrolls smoothly to first error on failed validation
- [ ] Pipedrive email button links to correct URL
- [ ] Print styles work (Ctrl+P)

---

## Limitations & Future Enhancements

### Current Limitations

- **Formspree free tier**: 50 submissions/month. Upgrade to $10/month for 1,000 submissions if needed.
- **Signature images**: Signature data is captured but sent as text "[Signature captured digitally]" to Formspree to avoid email size limits. For full signature capture, consider upgrading to Formspree Gold (file uploads) or integrating with a document signing service.
- **No auto-save**: Form data is not saved if the browser is closed mid-completion. Consider adding localStorage auto-save in a future version.
- **No PDF generation**: The form submits data via email, not as a formatted PDF. A future enhancement could generate a PDF copy.

### Recommended Future Enhancements

1. **Auto-save with localStorage** — Save form progress so builders can return later
2. **PDF generation** — Generate a branded PDF copy of the submission using jsPDF
3. **File uploads** — Allow builders to attach claims schedules, plant schedules, etc. (requires Formspree paid plan or alternative like Cloudinary)
4. **Pipedrive integration** — Use Formspree's webhook feature to create/update Pipedrive deals automatically
5. **Custom domain** — Point a subdomain like `forms.silverbackinsurance.com.au` to GitHub Pages
6. **Multi-language support** — If servicing non-English-speaking clients
7. **Google Analytics** — Track form completion rates and drop-off points

---

## Support

For technical issues with the form, contact the developer.
For insurance enquiries: **info@silverbackinsurance.com.au** | **0410 152 835**

---

*Silverback Insurance · C.A.R No: 1283436 · Authorised Representative of Australian Broker Network*
