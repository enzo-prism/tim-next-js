import { motion } from "framer-motion";
import { ArrowUpRight, BookOpen, Instagram, Sparkles } from "lucide-react";

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
  },
  {
    title: "Behind the Scenes",
    description: "A peek at our warm office experience and team-first care approach.",
    href: "https://www.instagram.com/reel/DSL1E46D9yM/",
  },
  {
    title: "Preventive Care Advice",
    description: "Practical reminders for brushing, flossing, and routine checkups.",
    href: "https://www.instagram.com/reel/DRVD-p7kt-4/",
  },
  {
    title: "Community Updates",
    description: "Recent moments from families in Los Gatos who visit our office.",
    href: "https://www.instagram.com/p/DNOvY7ny3ey/",
  },
];

export default function SocialMediaSection() {
  return (
    <motion.section
      className="bg-gradient-to-br from-gray-50 via-white to-gray-50 py-14 sm:py-16 lg:py-20"
      initial={false}
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div className="mb-10 text-center sm:mb-12" variants={fadeInUp}>
          <h2 className="text-3xl font-bold text-gray-800 lg:text-4xl">Follow Us on Social Media</h2>
          <p className="mx-auto mt-3 max-w-2xl text-base text-gray-600 sm:text-lg">
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
          {socialHighlights.map((post, index) => (
            <motion.a
              key={post.href}
              href={post.href}
              target="_blank"
              rel="noopener noreferrer"
              variants={fadeInUp}
              className="group block rounded-2xl border border-gray-200 bg-white p-5 shadow-sm transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <div
                className={`mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl text-white shadow-sm ${
                  index % 2 === 0 ? "bg-primary" : "bg-secondary"
                }`}
              >
                <Sparkles className="h-5 w-5" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800">{post.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-600">{post.description}</p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-primary transition-colors group-hover:text-primary/80">
                View on Instagram
                <ArrowUpRight className="h-4 w-4" />
              </span>
            </motion.a>
          ))}
        </motion.div>

        <motion.div className="mt-10 text-center sm:mt-12" variants={fadeInUp}>
          <div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
            <a
              href="https://www.instagram.com/famfirstsmilecare/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-primary to-secondary px-6 py-3 font-semibold text-white transition duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
              data-testid="button-follow-instagram"
            >
              <Instagram className="h-5 w-5" />
              Follow @famfirstsmilecare
            </a>
            <a
              href="https://www.xiaohongshu.com/user/profile/6787d0fa000000000801e7e7"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-red-600 to-red-700 px-6 py-3 font-semibold text-white transition duration-200 hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 sm:w-auto"
              data-testid="button-follow-xiaohongshu"
            >
              <BookOpen className="h-5 w-5" />
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
