# Energy Changes Carbon Emissions Calculator

This is a standalone, mobile-friendly website for Energy Changes that helps business users estimate their carbon footprint, learn about carbon credits, build a sample offset portfolio, and request a consultation.

## How to run the website (no special software needed)
1. Download or clone this folder.
2. Open `index.html` in a web browser (Chrome, Edge, Safari, or Firefox).
3. The website will load and work right away.

If you prefer to run a local server (optional):
```bash
python3 -m http.server 8000
```
Then visit `http://localhost:8000` in your browser.

## Where to edit placeholder content
- **Contact details** (email/phone/address): edit the placeholders in `index.html`.
- **Branding text** (headline/tagline): edit `index.html`.
- **Project portfolio cards**: edit `data/projects.js`.
  - The file is written with clear labels so it’s easy to update names, prices, images, and impacts.

## Email setup (required for live form submissions)
The consultation form is ready for EmailJS, a service that can send emails without a custom server.

### Step-by-step setup
1. Create a free EmailJS account: https://www.emailjs.com/
2. Add an email service (EmailJS will guide you).
3. Create an email template. Include fields like name, email, company, and message.
4. In your EmailJS dashboard, copy:
   - **Service ID**
   - **Template ID**
   - **Public Key**

### Add EmailJS to the website
1. Open `index.html`.
2. Add this script **just before** the closing `</body>` tag:
   ```html
   <script src="https://cdn.jsdelivr.net/npm/@emailjs/browser@3/dist/email.min.js"></script>
   <script>
     window.EMAILJS_SERVICE_ID = "YOUR_SERVICE_ID";
     window.EMAILJS_TEMPLATE_ID = "YOUR_TEMPLATE_ID";
     window.EMAILJS_PUBLIC_KEY = "YOUR_PUBLIC_KEY";
   </script>
   ```
3. Replace the placeholder values with your real EmailJS IDs.

Once this is done, the form will send an email to your team with the user’s details and portfolio summary.

## Notes
- The calculations are simplified educational estimates and include a disclaimer on the results screen.
- Progress is saved in the browser session, so users can refresh without losing their place.
- The results page can be printed or saved as a PDF using the “Print / Save PDF” button.
