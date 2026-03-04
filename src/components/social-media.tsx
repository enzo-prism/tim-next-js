import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Instagram, BookOpen } from 'lucide-react';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.1
    }
  }
};

// Instagram post URLs extracted from embed codes
const instagramPosts = [
  "https://www.instagram.com/p/DSvVBG3EnVf/",
  "https://www.instagram.com/reel/DSL1E46D9yM/",
  "https://www.instagram.com/reel/DRVD-p7kt-4/",
  "https://www.instagram.com/reel/DPC4XC5AYjR/",
  "https://www.instagram.com/p/DOrx8tmjwO4/",
  "https://www.instagram.com/reel/DNrGJb4ZMXi/",
  "https://www.instagram.com/reel/DNYUG_KBaKM/",
  "https://www.instagram.com/p/DNOvY7ny3ey/"
];

const INSTAGRAM_SCRIPT_ID = "instagram-embed-script";

const waitForInstagramGlobal = (timeoutMs = 15000) =>
  new Promise<void>((resolve, reject) => {
    const start = Date.now();
    const tick = () => {
      if ((window as any).instgrm?.Embeds?.process) {
        resolve();
        return;
      }

      if (Date.now() - start > timeoutMs) {
        reject(new Error("Instagram embed script did not initialize in time"));
        return;
      }

      window.setTimeout(tick, 50);
    };

    tick();
  });

const ensureInstagramScriptLoaded = () => {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).instgrm?.Embeds?.process) return Promise.resolve();

  const existing = document.getElementById(INSTAGRAM_SCRIPT_ID);
  if (!existing) {
    const script = document.createElement("script");
    script.id = INSTAGRAM_SCRIPT_ID;
    script.src = "https://www.instagram.com/embed.js";
    script.async = true;
    document.body.appendChild(script);
  }

  return waitForInstagramGlobal();
};

export default function SocialMediaSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const [shouldLoadEmbeds, setShouldLoadEmbeds] = useState(false);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof window === "undefined") return;

    // Lazy-load the Instagram embed script only when this section is near the viewport.
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setShouldLoadEmbeds(true);
          observer.disconnect();
        }
      },
      { rootMargin: "250px" }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!shouldLoadEmbeds) return;

    let cancelled = false;
    ensureInstagramScriptLoaded()
      .then(() => {
        if (cancelled) return;
        (window as any).instgrm?.Embeds?.process?.();
      })
      .catch((error) => {
        // If the script fails to load, we still show the plain links as a fallback.
        console.warn("Failed to load Instagram embeds:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [shouldLoadEmbeds]);

  return (
    <motion.section 
      ref={sectionRef}
      className="py-16 lg:py-20 bg-gradient-to-br from-gray-50 via-white to-gray-50"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <motion.div 
          className="text-center mb-12"
          variants={fadeInUp}
        >
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-800 mb-4">
            Follow Us on Social Media
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Stay updated with the latest from our practice, dental tips, and behind-the-scenes moments
          </p>
        </motion.div>

        {/* Instagram Posts Grid */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10 justify-items-center"
          variants={staggerContainer}
        >
          {instagramPosts.map((postUrl) => (
            <motion.div
              key={postUrl}
              variants={fadeInUp}
              className="instagram-embed-container flex justify-center"
            >
              <blockquote 
                className="instagram-media" 
                data-instgrm-captioned 
                data-instgrm-permalink={`${postUrl}?utm_source=ig_embed&utm_campaign=loading`}
                data-instgrm-version="14"
                style={{
                  background: "#FFF",
                  border: 0,
                  borderRadius: "3px",
                  boxShadow: "0 0 1px 0 rgba(0,0,0,0.5),0 1px 10px 0 rgba(0,0,0,0.15)",
                  margin: "1px",
                  maxWidth: "540px",
                  minWidth: "326px",
                  padding: 0,
                  width: "99.375%"
                }}
              >
                <div style={{ padding: "16px" }}>
                  <a 
                    href={postUrl}
                    style={{
                      background: "#FFFFFF",
                      lineHeight: 0,
                      padding: 0,
                      textAlign: "center",
                      textDecoration: "none",
                      width: "100%"
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View this post on Instagram
                  </a>
                </div>
              </blockquote>
            </motion.div>
          ))}
        </motion.div>

        {/* Call to Action */}
        <motion.div 
          className="text-center mt-12 space-y-4"
          variants={fadeInUp}
        >
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <a 
              href="https://www.instagram.com/famfirstsmilecare/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-700 text-white font-medium rounded-full hover:from-pink-700 hover:to-purple-800 transition duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:hover:scale-100 motion-reduce:transition-none"
              data-testid="button-follow-instagram"
            >
              <Instagram className="w-5 h-5" />
              Follow @famfirstsmilecare
            </a>
            <a 
              href="https://www.xiaohongshu.com/user/profile/6787d0fa000000000801e7e7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-medium rounded-full hover:from-red-700 hover:to-red-800 transition duration-200 hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:hover:scale-100 motion-reduce:transition-none"
              data-testid="button-follow-xiaohongshu"
            >
              <BookOpen className="w-5 h-5" />
              Dr. Chuang on Xiaohongshu
            </a>
          </div>
          <p className="text-sm text-gray-600 mt-2">
            Follow Dr. Chuang on Xiaohongshu (小红书) for dental tips and updates in Chinese
          </p>
        </motion.div>
      </div>

    </motion.section>
  );
}
