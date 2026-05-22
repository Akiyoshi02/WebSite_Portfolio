export const COLORS = {
  bgPrimary: "#050810",
  bgSecondary: "#0d1117",
  bgElevated: "#111827",
  bgGlass: "#141c2b",
  accent1: "#00f5d4",
  accent2: "#7b2fff",
  accent3: "#ff4ecd",
  success: "#20e080",
  textPrimary: "#e8eaf0",
  textSoft: "#c7ceda",
  textMuted: "#9aa4b2",
  border: "rgba(255, 255, 255, 0.1)",
  borderStrong: "rgba(255, 255, 255, 0.18)",
} as const;

export const SITE_NAME = "Akiyoshi Yapa";
export const SITE_TAGLINE = "Software Engineer · Full-Stack Developer";
export const RESPONSE_TIME = "1–2 business days";

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function formatMessageHtml(message: string): string {
  return escapeHtml(message).replace(/\r\n|\r|\n/g, "<br />");
}

export function resolveSiteUrl(siteUrl?: string): string {
  const raw = siteUrl?.trim() || process.env.SITE_URL?.trim() || "https://akiyoshiyapa.netlify.app";
  return raw.replace(/\/$/, "");
}

export function firstName(fullName: string): string {
  const part = fullName.trim().split(/\s+/)[0];
  return part || fullName;
}

export function truncateText(text: string, max = 280): string {
  if (text.length <= max) return text;
  return `${text.slice(0, max).trimEnd()}…`;
}

export function emailDocumentStyles(): string {
  return `
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; }
    @media only screen and (max-width: 620px) {
      .shell { width: 100% !important; }
      .pad { padding-left: 20px !important; padding-right: 20px !important; }
      .hero-title { font-size: 26px !important; }
    }
  `;
}

export function gradientAccentBar(): string {
  return `
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
  `;
}

export function bottomMark(): string {
  return `
    <table role="presentation" class="shell" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;">
      <tr>
        <td align="center" style="padding:20px 16px 0;">
          <p style="margin:0;font-family:'Consolas','Courier New',monospace;font-size:12px;color:${COLORS.textMuted};">
            &lt; ${escapeHtml(SITE_NAME)} /&gt;
          </p>
        </td>
      </tr>
    </table>
  `;
}

export function wrapEmailDocument(options: {
  title: string;
  preheader: string;
  bodyHtml: string;
}): string {
  const { title, preheader, bodyHtml } = options;
  return `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(title)}</title>
  <style type="text/css">${emailDocumentStyles()}</style>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.bgPrimary};background-image:linear-gradient(180deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 55%, ${COLORS.bgPrimary} 100%);">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${COLORS.bgPrimary};">
    <tr>
      <td align="center" style="padding:32px 16px 40px;">
        ${gradientAccentBar()}
        <table role="presentation" class="shell" width="600" cellspacing="0" cellpadding="0" border="0" style="max-width:600px;width:100%;border-collapse:separate;">
          <tr>
            <td class="pad" style="background-color:${COLORS.bgElevated};border:1px solid ${COLORS.border};border-top:none;border-radius:0 0 16px 16px;padding:36px 40px 32px;box-shadow:0 24px 64px rgba(0,0,0,0.45);">
              ${bodyHtml}
            </td>
          </tr>
        </table>
        ${bottomMark()}
      </td>
    </tr>
  </table>
</body>
</html>`;
}
