import {
  RESPONSE_TIME,
  SITE_NAME,
  SITE_TAGLINE,
  buttonOutline,
  buttonPrimary,
  chip,
  chipRow,
  contactRow,
  emailFooter,
  escapeHtml,
  fieldBlock,
  formRowTwoCol,
  formatMessageHtml,
  glassCard,
  heroBlock,
  messageArea,
  resolveSiteUrl,
  sectionHeading,
  statGrid,
  truncateText,
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
  const replyHref = `mailto:${encodeURIComponent(input.email)}?subject=${encodeURIComponent(
    `Re: ${input.subject}`,
  )}`;
  const emailLink = `<a href="${replyHref}" style="color:#00f5d4;text-decoration:none;font-weight:800;">${escapeHtml(input.email)}</a>`;

  const body = `
    ${heroBlock({
      kicker: "// Contact transmission",
      title: "New portfolio message",
      subtitle: `${input.name} reached out through the contact form. The message is ready to review and reply to.`,
      status: "Reply path active",
    })}

    ${statGrid([
      { value: "01", label: "New message" },
      { value: "SMTP", label: "Delivered by" },
      { value: "1-2d", label: "Reply target" },
    ])}

    ${glassCard(`
      ${sectionHeading(
        "// Sender snapshot",
        "Contact details",
        `Incoming enquiry from ${SITE_TAGLINE}.`,
      )}
      ${chipRow([chip(input.subject, true), chip("Portfolio contact"), chip(RESPONSE_TIME)])}
      ${formRowTwoCol(
        fieldBlock("Name", escapeHtml(input.name)),
        fieldBlock("Email", emailLink),
      )}
      ${fieldBlock("Message preview", escapeHtml(truncateText(input.message, 120)))}
    `)}

    ${messageArea("Full message", formatMessageHtml(input.message))}

    ${glassCard(`
      ${sectionHeading(
        "// Next action",
        "Reply without hunting for context",
        "The reply-to header is also set to the sender, so replying from your inbox will target the right address.",
      )}
      ${contactRow({ icon: "@", title: "Reply to sender", value: input.email, href: replyHref })}
      ${contactRow({ icon: "#", title: "Original subject", value: input.subject })}
      ${contactRow({ icon: "/", title: "Portfolio source", value: site.replace(/^https?:\/\//, ""), href: site })}
      ${buttonPrimary(replyHref, `Reply to ${input.name}`)}
      ${buttonOutline(site, "Open portfolio")}
    `, "24px", "0")}

    ${emailFooter(
      [
        `Sent from the contact form on <span style="color:#c7ceda;font-weight:700;">${escapeHtml(SITE_NAME)}</span>.`,
        "SMTP delivery succeeded for the owner notification before this email was marked as sent.",
      ],
      [{ label: "Portfolio", href: site }],
    )}
  `;

  return wrapEmailDocument({
    title: input.subject,
    preheader: `${input.name} wrote: ${truncateText(input.message, 90)}`,
    bodyHtml: body,
  });
}
