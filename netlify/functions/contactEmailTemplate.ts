import {
  SITE_NAME,
  SITE_TAGLINE,
  escapeHtml,
  formatMessageHtml,
  resolveSiteUrl,
  sectionHeading,
  formIntro,
  glassCard,
  chip,
  chipRow,
  formRowTwoCol,
  fieldBlock,
  messageArea,
  contactCardRow,
  buttonPrimary,
  emailFooter,
  wrapEmailDocument,
} from "./emailTheme";

export interface ContactEmailInput {
  name: string;
  email: string;
  subject: string;
  message: string;
  siteUrl?: string;
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
  const mailto = `mailto:${encodeURIComponent(input.email)}`;
  const nameHtml = escapeHtml(input.name);
  const emailHtml = `<a href="${mailto}" style="color:#00f5d4;text-decoration:none;font-weight:600;">${escapeHtml(input.email)}</a>`;

  const body = `
    ${sectionHeading("// 08. Contact", "New message", "A new submission from your portfolio contact form.")}
    ${formIntro("Send a message", `Incoming enquiry · ${SITE_TAGLINE}`)}
    ${chipRow([chip(input.subject, true)])}
    ${glassCard(`
      ${formRowTwoCol(
        fieldBlock("Name", nameHtml),
        fieldBlock("Email", emailHtml),
      )}
      ${messageArea("Message", formatMessageHtml(input.message))}
    `, "28px")}
    ${glassCard(`
      ${contactCardRow({ icon: "✉", title: "Reply to sender", subtitle: input.email, href: mailto })}
      ${contactCardRow({ icon: "◎", title: "Portfolio", subtitle: site.replace(/^https?:\/\//, ""), href: site })}
    `, "16px")}
    ${buttonPrimary(mailto, `Reply to ${input.name}`)}
    ${emailFooter([
      `Sent from the contact form on <a href="${site}" style="color:#00f5d4;text-decoration:none;font-weight:600;">${escapeHtml(SITE_NAME)}</a>`,
      `<a href="${site}" style="color:#9aa4b2;text-decoration:underline;">${escapeHtml(site)}</a>`,
    ])}
  `;

  return wrapEmailDocument({
    title: input.subject,
    preheader: `${input.name} wrote: ${input.subject}`,
    bodyHtml: body,
  });
}
