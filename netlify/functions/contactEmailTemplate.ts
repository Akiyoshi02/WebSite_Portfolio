export interface ContactEmailInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  siteUrl?: string;
}

const COLORS = {
  bgPrimary: "#050810",
  bgSecondary: "#0d1117",
  bgElevated: "#111827",
  bgGlass: "#141c2b",
  accent1: "#00f5d4",
  accent2: "#7b2fff",
  accent3: "#ff4ecd",
  textPrimary: "#e8eaf0",
  textSoft: "#c7ceda",
  textMuted: "#9aa4b2",
  border: "rgba(255, 255, 255, 0.1)",
  borderStrong: "rgba(255, 255, 255, 0.18)",
} as const;

const SITE_NAME = "Akiyoshi Yapa";
const SITE_TAGLINE = "Software Engineer · Full-Stack Developer";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatMessageHtml(message: string): string {
  return escapeHtml(message).replace(/\r\n|\r|\n/g, "<br />");
}

function resolveSiteUrl(siteUrl?: string): string {
  const raw = siteUrl?.trim() || process.env.SITE_URL?.trim() || "https://akiyoshiyapa.netlify.app";
  return raw.replace(/\/$/, "");
}

export function buildContactEmailText(input: ContactEmailInput): string {
  const site = resolveSiteUrl(input.siteUrl);
  return [
    `New message from ${SITE_NAME}`,
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Subject: ${input.subject}`,
    "",
    "Message:",
    input.message,
    "",
    `Reply to: ${input.email}`,
    `Sent via ${site}`,
  ].join("\n");
}

export function buildContactEmailHtml(input: ContactEmailInput): string {
  const site = resolveSiteUrl(input.siteUrl);
  const name = escapeHtml(input.name);
  const email = escapeHtml(input.email);
  const subject = escapeHtml(input.subject);
  const messageHtml = formatMessageHtml(input.message);
  const mailto = `mailto:${encodeURIComponent(input.email)}`;

  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${subject}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    @media only screen and (max-width: 620px) {
      .shell { width: 100% !important; }
      .pad { padding-left: 20px !important; padding-right: 20px !important; }
      .hero-title { font-size: 26px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.bgPrimary};background-image:linear-gradient(180deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 55%, ${COLORS.bgPrimary} 100%);">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">
    ${name} wrote: ${subject}
  </div>

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${COLORS.bgPrimary};">
    <tr>
      <td align="center" style="padding:32px 16px 40px;">

        <!-- Gradient accent bar -->
        <table role="presentation" class="shell" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td height="4" style="font-size:0;line-height:0;">
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td width="33%" height="4" style="background-color:${COLORS.accent1};font-size:0;line-height:0;">&nbsp;</td>
                  <td width="34%" height="4" style="background-color:${COLORS.accent2};font-size:0;line-height:0;">&nbsp;</td>
                  <td width="33%" height="4" style="background-color:${COLORS.accent3};font-size:0;line-height:0;">&nbsp;</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        <!-- Main card -->
        <table role="presentation" class="shell" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;border-collapse:separate;">
          <tr>
            <td
              class="pad"
              style="background-color:${COLORS.bgElevated};border:1px solid ${COLORS.border};border-top:none;border-radius:0 0 16px 16px;padding:36px 40px 32px;box-shadow:0 24px 64px rgba(0,0,0,0.45);"
            >

              <!-- Kicker -->
              <p style="margin:0 0 10px;font-family:'Consolas','Courier New',monospace;font-size:13px;line-height:1.4;color:${COLORS.accent1};letter-spacing:0.02em;">
                // Contact · Portfolio
              </p>

              <!-- Title -->
              <h1 class="hero-title" style="margin:0 0 8px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:32px;font-weight:700;line-height:1.15;color:${COLORS.textPrimary};">
                New message
              </h1>
              <p style="margin:0 0 28px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:${COLORS.textMuted};">
                ${SITE_TAGLINE}
              </p>

              <!-- Subject chip -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td style="background-color:rgba(0,245,212,0.12);border:1px solid rgba(0,245,212,0.35);border-radius:999px;padding:8px 16px;">
                    <span style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:14px;font-weight:600;color:${COLORS.accent1};">
                      ${subject}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Fields -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td style="padding:0 0 16px;border-bottom:1px solid ${COLORS.border};">
                    <p style="margin:0 0 4px;font-family:'Consolas','Courier New',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${COLORS.textMuted};">Name</p>
                    <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;font-weight:600;color:${COLORS.textPrimary};">${name}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 0;border-bottom:1px solid ${COLORS.border};">
                    <p style="margin:0 0 4px;font-family:'Consolas','Courier New',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${COLORS.textMuted};">Email</p>
                    <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:16px;">
                      <a href="${mailto}" style="color:${COLORS.accent1};text-decoration:none;font-weight:600;">${email}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Message block -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td style="background-color:${COLORS.bgGlass};border:1px solid ${COLORS.borderStrong};border-radius:12px;padding:20px 22px;">
                    <p style="margin:0 0 10px;font-family:'Consolas','Courier New',monospace;font-size:11px;text-transform:uppercase;letter-spacing:0.08em;color:${COLORS.accent1};">
                      // Message
                    </p>
                    <p style="margin:0;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.75;color:${COLORS.textSoft};">
                      ${messageHtml}
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Reply CTA -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:28px;">
                <tr>
                  <td align="center">
                    <!--[if mso]>
                    <v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${mailto}" style="height:46px;v-text-anchor:middle;width:220px;" arcsize="50%" strokecolor="${COLORS.accent1}" fillcolor="${COLORS.accent1}">
                      <w:anchorlock/>
                      <center style="color:#050810;font-family:Segoe UI,sans-serif;font-size:15px;font-weight:bold;">Reply to ${name}</center>
                    </v:roundrect>
                    <![endif]-->
                    <!--[if !mso]><!-->
                    <a
                      href="${mailto}"
                      style="display:inline-block;padding:14px 32px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;color:#050810;text-decoration:none;border-radius:999px;background-color:${COLORS.accent1};border:1px solid rgba(0,245,212,0.6);box-shadow:0 8px 24px rgba(0,245,212,0.25);"
                    >
                      Reply to ${name}
                    </a>
                    <!--<![endif]-->
                  </td>
                </tr>
              </table>

              <!-- Footer -->
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td style="padding-top:20px;border-top:1px solid ${COLORS.border};">
                    <p style="margin:0 0 6px;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;font-size:13px;color:${COLORS.textMuted};">
                      Sent from the contact form on
                      <a href="${site}" style="color:${COLORS.accent1};text-decoration:none;font-weight:600;">${SITE_NAME}</a>
                    </p>
                    <p style="margin:0;font-family:'Consolas','Courier New',monospace;font-size:12px;color:${COLORS.textMuted};">
                      <a href="${site}" style="color:${COLORS.textMuted};text-decoration:underline;">${escapeHtml(site)}</a>
                    </p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>
        </table>

        <!-- Bottom mark -->
        <table role="presentation" class="shell" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
          <tr>
            <td align="center" style="padding:20px 16px 0;">
              <p style="margin:0;font-family:'Consolas','Courier New',monospace;font-size:12px;color:${COLORS.textMuted};">
                &lt; ${escapeHtml(SITE_NAME)} /&gt;
              </p>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>
</body>
</html>`;
}
