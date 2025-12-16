import { motion } from "framer-motion";
import { PawPrint, Heart, Mail, Twitter, Instagram, Github } from "lucide-react";
import { Link } from "react-router-dom";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-card border-t border-border/50 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-primary/10">
                <PawPrint className="h-6 w-6 text-primary" />
              </div>
              <span className="font-heading text-xl font-bold">
                Paw<span className="text-primary">Sense</span>
              </span>
            </Link>
            <p className="text-muted-foreground font-body text-sm max-w-md mb-4">
              Empowering pet owners with AI-driven insights to understand and care for their furry companions better than ever before.
            </p>
            <div className="flex items-center gap-4">
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="p-2 rounded-lg bg-secondary hover:bg-primary/10 transition-colors"
              >
                <Twitter className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="p-2 rounded-lg bg-secondary hover:bg-primary/10 transition-colors"
              >
                <Instagram className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.1 }}
                href="#"
                className="p-2 rounded-lg bg-secondary hover:bg-primary/10 transition-colors"
              >
                <Github className="h-4 w-4 text-muted-foreground hover:text-primary" />
              </motion.a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading font-bold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              {["Dashboard", "Vet Finder"].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary transition-colors font-body text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-heading font-bold text-foreground mb-4">Support</h4>
            <ul className="space-y-2">
              {["Help Center", "Contact Us", "Privacy Policy", "Terms of Service", "FAQ"].map((item) => (
                <li key={item}>
                  <Link
                    to="#"
                    className="text-muted-foreground hover:text-primary transition-colors font-body text-sm"
                  >
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm font-body flex items-center gap-1">
            © {currentYear} PawSense. Made with <Heart className="h-3 w-3 text-destructive fill-destructive" /> for pets everywhere.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Mail className="h-4 w-4" />
            <a href="mailto:hello@pawsense.app" className="hover:text-primary transition-colors">
              hello@pawsense.app
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
