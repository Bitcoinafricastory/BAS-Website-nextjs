'use client';

import { Mail, MapPin, Send, AtSign, MessageCircle } from 'lucide-react';
import ContactForm from '@/components/ContactForm';
import NewsletterSignup from '@/components/NewsletterSignup';

const MINIMAL_ICON_SIZE = 18;

export default function ContactContent() {
  return (
    <div className="pt-16">
      <section id="hero" className="pt-16 pb-10 sm:pt-20 sm:pb-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <span className="font-bold text-[11px] tracking-[0.18em] uppercase text-yellow-500 mb-4 block">
            Get in touch
          </span>
          <h1 className="font-semibold text-white text-[34px] sm:text-[44px] md:text-[52px] leading-[1.05] tracking-tight mb-4 sm:mb-6">
            Let&rsquo;s <em className="italic text-yellow-500">connect.</em>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg leading-relaxed max-w-xl mx-auto">
            Have questions about Bitcoin? Want to collaborate? Or just want to say hello? We&rsquo;d love to
            hear from you.
          </p>
        </div>
      </section>

      <section className="py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
                Send Us a <span className="text-yellow-500">Message</span>
              </h2>
              <ContactForm />
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 sm:mb-6">
                Other Ways to <span className="text-yellow-500">Reach Us</span>
              </h2>

              <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                <div className="p-3 sm:p-4 md:p-6 bg-gray-900 border border-gray-800 hover:border-yellow-500 transition-colors duration-300">
                  <div className="flex items-start">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-yellow-500/10 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                      <Mail className="text-yellow-500" size={MINIMAL_ICON_SIZE} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold mb-1">Email</h3>
                      <a href="mailto:Bitcoinafricastory@proton.me" className="text-gray-400 hover:text-yellow-500 transition-colors duration-200 text-xs sm:text-sm">
                        Bitcoinafricastory@proton.me
                      </a>
                    </div>
                  </div>
                </div>

                <div className="p-3 sm:p-4 md:p-6 bg-gray-900 border border-gray-800 hover:border-yellow-500 transition-colors duration-300">
                  <div className="flex items-start">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 md:w-12 md:h-12 bg-yellow-500/10 flex items-center justify-center mr-3 sm:mr-4 flex-shrink-0">
                      <MapPin className="text-yellow-500" size={MINIMAL_ICON_SIZE} />
                    </div>
                    <div>
                      <h3 className="text-base sm:text-lg font-bold mb-1">Location</h3>
                      <p className="text-gray-400 text-xs sm:text-sm">
                        Operating across Africa<br />Based in Nigeria
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">Connect on Social Media</h3>
                <div className="space-y-3 sm:space-y-4">
                  <a href="https://x.com/story_bitcoin" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 sm:p-4 bg-gray-900 border border-gray-800 hover:border-yellow-500 hover:bg-gray-800 transition-all duration-300 group">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-500/10 flex items-center justify-center mr-3 sm:mr-4">
                      <AtSign className="text-yellow-500" size={MINIMAL_ICON_SIZE} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold group-hover:text-yellow-500 transition-colors duration-200">Twitter / X</div>
                      <div className="text-xs text-gray-400">Follow for daily Bitcoin insights</div>
                    </div>
                  </a>

                  <a href="https://t.me/+KirVlW8gMMtlNDI8" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 sm:p-4 bg-gray-900 border border-gray-800 hover:border-yellow-500 hover:bg-gray-800 transition-all duration-300 group">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-500/10 flex items-center justify-center mr-3 sm:mr-4">
                      <Send className="text-yellow-500" size={MINIMAL_ICON_SIZE} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold group-hover:text-yellow-500 transition-colors duration-200">Telegram</div>
                      <div className="text-xs text-gray-400">Join our community chat</div>
                    </div>
                  </a>

                  <a href="https://primal.net/p/nprofile1qqs0tmrphute79adfe4r3h8qdkdgqw3fz9244238x2ss53lmhft3jug4hhw4r" target="_blank" rel="noopener noreferrer" className="flex items-center p-3 sm:p-4 bg-gray-900 border border-gray-800 hover:border-yellow-500 hover:bg-gray-800 transition-all duration-300 group">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-yellow-500/10 flex items-center justify-center mr-3 sm:mr-4">
                      <MessageCircle className="text-yellow-500" size={MINIMAL_ICON_SIZE} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold group-hover:text-yellow-500 transition-colors duration-200">Nostr</div>
                      <div className="text-xs text-gray-400">Connect on the decentralized protocol</div>
                    </div>
                  </a>
                </div>
              </div>

              <div className="mt-6 sm:mt-8 p-3 sm:p-4 bg-yellow-500/10 border border-yellow-500/30">
                <p className="text-gray-300 text-xs">
                  <strong className="text-yellow-500">Response Time:</strong> We typically respond within 24-48
                  hours. For urgent matters, reach out on Twitter or Telegram for faster responses.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-20 px-4 bg-gradient-to-b from-gray-900/30 to-transparent">
        <div className="max-w-4xl mx-auto">
          <NewsletterSignup />
        </div>
      </section>
    </div>
  );
}
