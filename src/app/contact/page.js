import ContactContent from './ContactContent';

export const metadata = {
  title: 'Contact Us',
  description:
    "Have questions about Bitcoin or want to collaborate? Reach out to the Bitcoin Africa Story team. We'd love to hear from you.",
  alternates: { canonical: 'https://bitcoinafricastory.com/contact' },
};

export default function ContactPage() {
  return <ContactContent />;
}
