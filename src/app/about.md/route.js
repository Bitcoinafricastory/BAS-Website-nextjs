import { machineHeaders, SITE_URL, SITE_NAME } from '@/lib/machine-content';

export const revalidate = 3600;

// Mirrors the facts on /about. Kept as prose here (rather than parsed from the
// page) because the About page is presentational JSX, not CMS content — but the
// claims must stay in sync with what the page actually says.
const ABOUT_MARKDOWN = `---
title: "About ${SITE_NAME}"
canonical: "${SITE_URL}/about"
---

# About ${SITE_NAME}

${SITE_NAME} is an independent media and education platform documenting Bitcoin
adoption, innovation, and impact across the African continent.

We are not an exchange, and we do not sell tokens. We tell Africa's Bitcoin story
through journalism, podcasts, education, and community reporting.

## Mission

To accelerate Bitcoin adoption in Africa through education, community empowerment,
grassroots initiatives, and storytelling — all aimed at making Bitcoin practical
for everyday Africans.

## Vision

To build a financially empowered Africa where individuals, families, and communities
understand Bitcoin, use Bitcoin, and benefit from its freedom, transparency, and
opportunity.

## What we do

- **Education** — Practical Bitcoin training for schools, youth, merchants, and
  communities, helping people understand and use Bitcoin confidently.
- **Storytelling** — Real stories of Bitcoin adoption across Africa, highlighting
  the people, challenges, and progress in each community.
- **Community Development** — Supporting communities in building sustainable Bitcoin
  circular economies through merchant onboarding, local spending, and hands-on guidance.
- **Research and Insights** — Studying Bitcoin usage, community needs, and adoption
  patterns to guide our programs and share insights with the ecosystem.

## Independence

${SITE_NAME} is independent and volunteer-led. Funding comes from community
donations, documented publicly at ${SITE_URL}/donate.

---

Source: [${SITE_NAME}](${SITE_URL}/about)
`;

export async function GET() {
  return new Response(ABOUT_MARKDOWN, {
    headers: machineHeaders('text/markdown; charset=utf-8'),
  });
}
