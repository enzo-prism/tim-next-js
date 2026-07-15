"use client";

import { motion } from "framer-motion";
import { MinimalGlyph } from "@/components/ui/minimal-glyph";
import { trackSocialClick } from "@/lib/analytics";

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const socialHighlights = [
  {
    title: "Smile Tips for Parents",
    description: "Quick at-home habits to keep little smiles healthy between visits.",
    href: "https://www.instagram.com/p/DSvVBG3EnVf/",
    chip: "Parent tips",
  },
  {
    title: "Behind the Scenes",
    description: "A peek at our warm office experience and team-first care approach.",
    href: "https://www.instagram.com/reel/DSL1E46D9yM/",
    chip: "Office life",
  },
  {
    title: "Preventive Care Advice",
    description: "Practical reminders for brushing, flossing, and routine checkups.",
    href: "https://www.instagram.com/reel/DRVD-p7kt-4/",
    chip: "Prevention",
  },
  {
    title: "Community Updates",
    description: "Recent moments from families in Los Gatos who visit our office.",
    href: "https://www.instagram.com/p/DNOvY7ny3ey/",
    chip: "Community",
  },
];

export default function SocialMediaSection() {
  return (
    <motion.section
      className="bg-background py-16 sm:py-20"
      initial={false}
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div className="mb-10 text-center sm:mb-12" variants={fadeInUp}>
          <div className="mb-3 inline-flex items-center rounded-lg border border-primary/20 bg-primary/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
            Live Updates
          </div>
          <h2 className="text-3xl font-bold text-gray-800 lg:text-4xl">Follow Us on Social Media</h2>
          <p className="mx-auto mt-3 max-w-3xl text-base text-gray-600 sm:text-lg">
            Keep up with office updates, dental education, and family-friendly smile care tips.
          </p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
          initial={false}
          whileInView="visible"
          viewport={{ once: true, margin: "-50px" }}
          variants={staggerContainer}
        >
          {socialHighlights.map((post) => (
            <motion.a
              key={post.href}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeInUp}
              className="group block h-full rounded-xl border border-border bg-card p-5 transition-colors duration-200 hover:border-primary/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => trackSocialClick("instagram", "social_highlight")}
            >
              <div className="-mx-5 -mt-5 mb-5 border-b border-border bg-muted/40 px-5 py-4">
                <span className="rounded-lg border border-border bg-background px-2.5 py-1 text-xs font-medium text-muted-foreground">
                  {post.chip}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{post.description}</p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors group-hover:text-primary">
                View on Instagram
                <MinimalGlyph name="arrow-up-right" className="h-4 w-4" />
              </span>
            </motion.a>
          ))}
        </motion.div>

        <motion.div
          className="mt-10 rounded-xl border border-border bg-card p-6 text-center sm:mt-12 sm:p-8"
          variants={fadeInUp}
        >
          <p className="mx-auto mb-5 max-w-2xl text-base text-gray-700">
            Want daily dental tips and real clinic moments? Follow both channels to stay connected with our team.
          </p>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="https://www.instagram.com/famfirstsmile/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-lg bg-primary px-6 py-3 font-semibold text-primary-foreground transition-colors duration-200 hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
              data-testid="button-follow-instagram"
              onClick={() => trackSocialClick("instagram", "social_follow_cta")}
            >
              Follow @famfirstsmile
            </a>
            <a
              href="https://www.xiaohongshu.com/user/profile/6787d0fa000000000801e7e7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center rounded-lg border border-primary px-6 py-3 font-semibold text-primary transition-colors duration-200 hover:bg-primary hover:text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
              data-testid="button-follow-xiaohongshu"
              onClick={() => trackSocialClick("xiaohongshu", "social_follow_cta")}
            >
              Dr. Chuang on Xiaohongshu
            </a>
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Follow Dr. Chuang on Xiaohongshu (小红书) for dental tips and updates in Chinese.
          </p>
        </motion.div>
      </div>
    </motion.section>
  );
}
