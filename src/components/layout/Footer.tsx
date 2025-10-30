import { Link } from "react-router-dom";
import { BookOpen, Mail, MapPin, Phone, FileText, Globe } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-banner text-banner-foreground mt-auto border-t border-banner-foreground/10">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand & Mission */}
          <div className="lg:col-span-2">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-12 h-12 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
                <BookOpen className="w-7 h-7 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-banner-foreground font-serif text-xl font-bold">AJVS</span>
                <span className="text-banner-foreground/60 text-xs">Est. 2024</span>
              </div>
            </div>
            <p className="text-banner-foreground/80 text-sm leading-relaxed mb-4">
              The African Journal of Veterinary Sciences is a premier international, peer-reviewed, open-access publication dedicated to advancing veterinary medicine, animal health, and related disciplines across Africa and the global scientific community.
            </p>
            <div className="flex flex-col gap-2 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                <span className="text-banner-foreground/70">ISSN: 2958-4027 (Online)</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-primary" />
                <span className="text-banner-foreground/70">Open Access • Peer-Reviewed</span>
              </div>
            </div>
          </div>

          {/* Browse */}
          <div>
            <h3 className="font-semibold mb-5 text-banner-foreground">Browse</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/current-issue" className="text-banner-foreground/70 hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  Current Issue
                </Link>
              </li>
              <li>
                <Link to="/archives" className="text-banner-foreground/70 hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  Archives
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-banner-foreground/70 hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  About the Journal
                </Link>
              </li>
              <li>
                <Link to="/editorial-board" className="text-banner-foreground/70 hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  Editorial Board
                </Link>
              </li>
              <li>
                <Link to="/news" className="text-banner-foreground/70 hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  News & Updates
                </Link>
              </li>
            </ul>
          </div>

          {/* For Authors */}
          <div>
            <h3 className="font-semibold mb-5 text-banner-foreground">For Authors</h3>
            <ul className="space-y-3 text-sm">
              <li>
                <Link to="/submit" className="text-banner-foreground/70 hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  Submit Manuscript
                </Link>
              </li>
              <li>
                <Link to="/for-authors" className="text-banner-foreground/70 hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  Author Guidelines
                </Link>
              </li>
              <li>
                <Link to="/policies" className="text-banner-foreground/70 hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  Policies & Ethics
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-banner-foreground/70 hover:text-primary transition-smooth hover:translate-x-1 inline-block">
                  Contact Editorial Office
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="font-semibold mb-5 text-banner-foreground">Contact</h3>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="text-banner-foreground/90 font-medium">Editorial</span>
                  <a href="mailto:editor@ajvs.org" className="text-banner-foreground/70 hover:text-primary transition-smooth">
                    editor@ajvs.org
                  </a>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <div className="flex flex-col gap-1">
                  <span className="text-banner-foreground/90 font-medium">Support</span>
                  <span className="text-banner-foreground/70">+254 (0) 712 345 678</span>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-0.5 text-primary flex-shrink-0" />
                <div className="flex flex-col">
                  <span className="text-banner-foreground/90 font-medium mb-1">Location</span>
                  <span className="text-banner-foreground/70 leading-relaxed">
                    African Journal of Veterinary Sciences<br />
                    Editorial Office<br />
                    Nairobi, Kenya
                  </span>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-banner-foreground/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-banner-foreground/60">
              &copy; {new Date().getFullYear()} African Journal of Veterinary Sciences. All rights reserved.
            </p>
            <div className="flex gap-6 text-sm">
              <Link to="/policies" className="text-banner-foreground/60 hover:text-primary transition-smooth">
                Privacy Policy
              </Link>
              <Link to="/policies" className="text-banner-foreground/60 hover:text-primary transition-smooth">
                Terms of Use
              </Link>
              <Link to="/contact" className="text-banner-foreground/60 hover:text-primary transition-smooth">
                Accessibility
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
