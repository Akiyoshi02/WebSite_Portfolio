export const COLORS = {
  bgPrimary: "#050810",
  bgSecondary: "#0d1117",
  bgElevated: "#111827",
  bgGlass: "#121a29",
  bgGlassSoft: "#0f1724",
  bgInput: "#101827",
  accent1: "#00f5d4",
  accent2: "#7b2fff",
  accent3: "#ff4ecd",
  success: "#20e080",
  warning: "#ffc857",
  textPrimary: "#e8eaf0",
  textSoft: "#c7ceda",
  textMuted: "#9aa4b2",
  textOnAccent: "#031111",
  border: "rgba(255, 255, 255, 0.08)",
  borderStrong: "rgba(255, 255, 255, 0.18)",
  glowCyan: "rgba(0, 245, 212, 0.16)",
  glowPurple: "rgba(123, 47, 255, 0.18)",
  glowPink: "rgba(255, 78, 205, 0.14)",
} as const;

export const SITE_NAME = process.env.SITE_NAME?.trim() || "Akiyoshi Yapa";
export const SITE_TAGLINE = process.env.SITE_TAGLINE?.trim() || "Software Engineer & Full-Stack Developer";
export const RESPONSE_TIME = "1-2 business days";

const FONT_LINK =
  "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700;9..40,800&family=JetBrains+Mono:wght@400;500;700&family=Syne:wght@700;800&display=swap";

const FONT_BODY = "'DM Sans', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const FONT_DISPLAY = "'Syne', 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";
const FONT_MONO = "'JetBrains Mono', Consolas, 'Courier New', monospace";

type HeroOptions = {
  kicker: string;
  title: string;
  subtitle: string;
  status?: string;
};

type FooterLink = {
  label: string;
  href: string;
};

export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeAttribute(value: string): string {
  return escapeHtml(value);
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
  return `${text.slice(0, max).trimEnd()}...`;
}

function gradientRule(height = 4): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td height="${height}" style="height:${height}px;font-size:0;line-height:0;background-color:${COLORS.accent1};background-image:linear-gradient(90deg, ${COLORS.accent1} 0%, ${COLORS.accent2} 52%, ${COLORS.accent3} 100%);">&nbsp;</td>
      </tr>
    </table>
  `;
}

function brandWordmark(): string {
  const [first, ...rest] = SITE_NAME.trim().split(/\s+/);
  const firstPart = first || SITE_NAME;
  const restPart = rest.join(" ");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td align="left" style="padding:0;">
          <p style="margin:0 0 8px;font-family:${FONT_MONO};font-size:13px;line-height:1.4;color:${COLORS.accent1};letter-spacing:0.02em;">
            &lt; ${escapeHtml(SITE_NAME)} /&gt;
          </p>
          <p style="margin:0;font-family:${FONT_DISPLAY};font-size:30px;font-weight:800;line-height:0.95;letter-spacing:-0.03em;">
            <span style="color:${COLORS.accent1};">${escapeHtml(firstPart)}</span>${restPart ? `<span style="color:${COLORS.textPrimary};"> </span><span style="color:${COLORS.accent2};">${escapeHtml(restPart)}</span>` : ""}
          </p>
        </td>
      </tr>
    </table>
  `;
}

export function heroBlock(options: HeroOptions): string {
  const status = options.status ? availabilityPill(options.status) : "";

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:22px;">
      <tr>
        <td style="padding:0;border-radius:24px;background:${COLORS.bgGlass};border:1px solid ${COLORS.borderStrong};overflow:hidden;">
          ${gradientRule(4)}
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td style="padding:30px 28px 28px;background-color:${COLORS.bgGlass};background-image:radial-gradient(circle at 14% 0%, ${COLORS.glowCyan}, transparent 260px), radial-gradient(circle at 92% 18%, ${COLORS.glowPurple}, transparent 280px), linear-gradient(135deg, rgba(0, 245, 212, 0.08), rgba(123, 47, 255, 0.08), rgba(255, 78, 205, 0.08));">
                ${brandWordmark()}
                <div style="height:24px;line-height:24px;">&nbsp;</div>
                ${monoKicker(options.kicker)}
                <h1 style="margin:14px 0 0;font-family:${FONT_BODY};font-size:34px;font-weight:800;line-height:1.04;letter-spacing:-0.03em;color:${COLORS.textPrimary};">
                  ${escapeHtml(options.title)}
                </h1>
                <p style="margin:14px 0 0;max-width:520px;font-family:${FONT_BODY};font-size:16px;line-height:1.75;color:${COLORS.textSoft};">
                  ${escapeHtml(options.subtitle)}
                </p>
                ${status}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function sectionHeading(kicker: string, title: string, description?: string): string {
  const desc = description
    ? `<p style="margin:10px 0 0;font-family:${FONT_BODY};font-size:15px;line-height:1.7;color:${COLORS.textSoft};">${escapeHtml(description)}</p>`
    : "";

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 20px;">
      <tr>
        <td>
          <p style="margin:0;font-family:${FONT_MONO};font-size:13px;line-height:1.45;color:${COLORS.accent1};">${escapeHtml(kicker)}</p>
          <h2 style="margin:8px 0 0;font-family:${FONT_BODY};font-size:25px;font-weight:800;line-height:1.12;letter-spacing:-0.02em;color:${COLORS.textPrimary};">${escapeHtml(title)}</h2>
          ${desc}
        </td>
      </tr>
    </table>
  `;
}

export function glassCard(innerHtml: string, padding = "24px", marginBottom = "18px"): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:${marginBottom};">
      <tr>
        <td style="padding:${padding};border-radius:18px;background:${COLORS.bgGlass};border:1px solid ${COLORS.border};box-shadow:0 24px 70px rgba(0,0,0,0.30);">
          ${innerHtml}
        </td>
      </tr>
    </table>
  `;
}

export function contactRow(options: {
  icon: string;
  title: string;
  value: string;
  href?: string;
}): string {
  const value = options.href
    ? `<a href="${escapeAttribute(options.href)}" style="color:${COLORS.textMuted};text-decoration:none;font-weight:700;">${escapeHtml(options.value)}</a>`
    : `<span style="color:${COLORS.textMuted};">${escapeHtml(options.value)}</span>`;

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:12px;">
      <tr>
        <td width="46" valign="top" style="width:46px;padding-right:14px;">
          <div style="width:44px;height:44px;border-radius:999px;background:rgba(255,255,255,0.045);border:1px solid ${COLORS.border};font-family:${FONT_BODY};font-size:16px;font-weight:800;line-height:44px;text-align:center;color:${COLORS.accent1};">
            ${escapeHtml(options.icon)}
          </div>
        </td>
        <td valign="middle" style="padding:2px 0 0;">
          <p style="margin:0;font-family:${FONT_BODY};font-size:15px;font-weight:800;line-height:1.25;color:${COLORS.textPrimary};">${escapeHtml(options.title)}</p>
          <p style="margin:3px 0 0;font-family:${FONT_BODY};font-size:14px;line-height:1.45;word-break:break-word;">${value}</p>
        </td>
      </tr>
    </table>
  `;
}

export function fieldBlock(label: string, valueHtml: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
      <tr>
        <td style="padding:14px 14px 13px;border-radius:14px;background:${COLORS.bgInput};border:1px solid ${COLORS.border};">
          <p style="margin:0 0 7px;font-family:${FONT_BODY};font-size:12px;font-weight:800;line-height:1.3;letter-spacing:0.04em;text-transform:uppercase;color:${COLORS.textMuted};">${escapeHtml(label)}</p>
          <div style="font-family:${FONT_BODY};font-size:15px;font-weight:700;line-height:1.5;color:${COLORS.textPrimary};word-break:break-word;">
            ${valueHtml}
          </div>
        </td>
      </tr>
    </table>
  `;
}

export function formRowTwoCol(left: string, right: string): string {
  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:14px;">
      <tr>
        <td class="stack" width="50%" valign="top" style="padding-right:7px;">${left}</td>
        <td class="stack stack-gap" width="50%" valign="top" style="padding-left:7px;">${right}</td>
      </tr>
    </table>
  `;
}

export function messageArea(label: string, contentHtml: string): string {
  return glassCard(
    `
      <p style="margin:0 0 10px;font-family:${FONT_BODY};font-size:12px;font-weight:800;line-height:1.3;letter-spacing:0.04em;text-transform:uppercase;color:${COLORS.textMuted};">${escapeHtml(label)}</p>
      <div style="padding:16px;border-radius:14px;background:${COLORS.bgInput};border:1px solid ${COLORS.borderStrong};font-family:${FONT_BODY};font-size:15px;line-height:1.78;color:${COLORS.textSoft};word-break:break-word;">
        ${contentHtml}
      </div>
    `,
    "18px",
  );
}

export function monoKicker(text: string): string {
  return `
    <span style="display:inline-block;min-height:32px;padding:0 13px;border-radius:999px;border:1px solid rgba(0, 245, 212, 0.24);background:rgba(0, 245, 212, 0.06);font-family:${FONT_MONO};font-size:13px;font-weight:500;line-height:32px;color:${COLORS.accent1};">
      ${escapeHtml(text)}
    </span>
  `;
}

export function bodyCopy(html: string): string {
  return `
    <p style="margin:0 0 18px;font-family:${FONT_BODY};font-size:16px;line-height:1.75;color:${COLORS.textSoft};">
      ${html}
    </p>
  `;
}

export function chip(text: string, accent = false): string {
  const bg = accent ? "rgba(0,245,212,0.08)" : "rgba(255,255,255,0.045)";
  const border = accent ? "rgba(0,245,212,0.24)" : COLORS.border;
  const color = accent ? COLORS.accent1 : COLORS.textPrimary;

  return `
    <span style="display:inline-block;min-height:30px;padding:5px 11px;border-radius:999px;font-family:${FONT_BODY};font-size:13px;font-weight:800;line-height:20px;color:${color};background:${bg};border:1px solid ${border};">
      ${escapeHtml(text)}
    </span>
  `;
}

export function chipRow(chips: string[]): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:18px;">
      <tr>
        <td>${chips.join("&nbsp;&nbsp;")}</td>
      </tr>
    </table>
  `;
}

export function availabilityPill(label: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin-top:18px;">
      <tr>
        <td>
          <span style="display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(32,224,128,0.08);border:1px solid rgba(32,224,128,0.22);font-family:${FONT_BODY};font-size:14px;font-weight:800;line-height:1.3;color:${COLORS.textPrimary};">
            <span style="display:inline-block;width:10px;height:10px;margin-right:9px;border-radius:50%;background:${COLORS.success};vertical-align:-1px;box-shadow:0 0 14px rgba(32,224,128,0.5);"></span>${escapeHtml(label)}
          </span>
        </td>
      </tr>
    </table>
  `;
}

export function statGrid(items: Array<{ value: string; label: string }>): string {
  const cells = items
    .map(
      (item) => `
        <td class="stack" width="${Math.floor(100 / items.length)}%" valign="top" style="padding:0 5px 10px;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
            <tr>
              <td align="center" style="padding:15px 10px;border-radius:14px;background:rgba(255,255,255,0.035);border:1px solid ${COLORS.border};">
                <p style="margin:0;font-family:${FONT_DISPLAY};font-size:24px;font-weight:800;line-height:1;color:${COLORS.accent1};">${escapeHtml(item.value)}</p>
                <p style="margin:7px 0 0;font-family:${FONT_BODY};font-size:12px;font-weight:700;line-height:1.35;color:${COLORS.textMuted};">${escapeHtml(item.label)}</p>
              </td>
            </tr>
          </table>
        </td>
      `,
    )
    .join("");

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin:0 -5px 18px;">
      <tr>${cells}</tr>
    </table>
  `;
}

export function buttonPrimary(href: string, label: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:24px auto 8px;">
      <tr>
        <td align="center" style="border-radius:999px;background-color:${COLORS.accent1};background-image:linear-gradient(135deg, ${COLORS.accent1} 0%, ${COLORS.accent2} 55%, ${COLORS.accent3} 100%);box-shadow:0 18px 45px rgba(0,245,212,0.22);">
          <a href="${escapeAttribute(href)}" style="display:inline-block;min-height:46px;padding:0 24px;border-radius:999px;font-family:${FONT_BODY};font-size:15px;font-weight:800;line-height:46px;color:${COLORS.textOnAccent};text-decoration:none;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function buttonOutline(href: string, label: string): string {
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin:12px auto 8px;">
      <tr>
        <td align="center" style="border-radius:999px;background:rgba(255,255,255,0.03);border:1px solid ${COLORS.borderStrong};">
          <a href="${escapeAttribute(href)}" style="display:inline-block;min-height:44px;padding:0 22px;border-radius:999px;font-family:${FONT_BODY};font-size:14px;font-weight:800;line-height:44px;color:${COLORS.textPrimary};text-decoration:none;">
            ${escapeHtml(label)}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function emailFooter(lines: string[], links: FooterLink[] = []): string {
  const rows = lines
    .map(
      (line) => `
        <p style="margin:0 0 8px;font-family:${FONT_BODY};font-size:13px;line-height:1.6;color:${COLORS.textMuted};">${line}</p>
      `,
    )
    .join("");
  const linkRow = links.length
    ? `
      <p style="margin:12px 0 0;font-family:${FONT_BODY};font-size:13px;line-height:1.6;">
        ${links
          .map(
            (link) =>
              `<a href="${escapeAttribute(link.href)}" style="color:${COLORS.accent1};text-decoration:none;font-weight:800;">${escapeHtml(link.label)}</a>`,
          )
          .join('<span style="color:#4b5563;"> &nbsp;/&nbsp; </span>')}
      </p>
    `
    : "";

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-top:26px;">
      <tr>
        <td style="padding-top:20px;border-top:1px solid ${COLORS.border};">
          ${rows}
          ${linkRow}
          <p style="margin:16px 0 0;font-family:${FONT_MONO};font-size:12px;line-height:1.5;color:${COLORS.textMuted};">
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
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="color-scheme" content="dark" />
  <meta name="supported-color-schemes" content="dark" />
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="${FONT_LINK}" />
  <style type="text/css">
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; border-collapse: collapse; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    body { margin: 0 !important; padding: 0 !important; width: 100% !important; background-color: ${COLORS.bgPrimary}; }
    a { text-decoration: none; }
    @media only screen and (max-width: 640px) {
      .shell { width: 100% !important; max-width: 100% !important; }
      .pad { padding-left: 18px !important; padding-right: 18px !important; }
      .stack { display: block !important; width: 100% !important; padding-left: 0 !important; padding-right: 0 !important; }
      .stack-gap { padding-top: 12px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${COLORS.bgPrimary};background-image:radial-gradient(circle at 50% -10%, ${COLORS.glowCyan}, transparent 520px), linear-gradient(180deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 55%, ${COLORS.bgPrimary} 100%);">
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;">${escapeHtml(preheader)}</div>
  ${gradientRule(3)}
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:${COLORS.bgPrimary};background-image:linear-gradient(180deg, ${COLORS.bgPrimary} 0%, ${COLORS.bgSecondary} 55%, ${COLORS.bgPrimary} 100%);">
    <tr>
      <td align="center" class="pad" style="padding:34px 20px 44px;">
        <table role="presentation" class="shell" width="640" cellspacing="0" cellpadding="0" border="0" style="width:640px;max-width:640px;">
          <tr>
            <td style="padding:0;">
              ${bodyHtml}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
