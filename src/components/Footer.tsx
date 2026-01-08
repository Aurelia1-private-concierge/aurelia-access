import { Instagram, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-background border-t border-border/30 py-12 text-center md:text-left">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">
        <div className="mb-6 md:mb-0">
          <a href="#" className="font-serif text-lg tracking-widest text-foreground">
            AURELIA
          </a>
          <p className="text-xs text-muted-foreground/60 mt-2">
            © 2024 Aurelia Holdings Ltd. All rights reserved.
          </p>
        </div>

        <div className="flex items-center space-x-6">
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            <Instagram className="w-[18px] h-[18px]" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            <Twitter className="w-[18px] h-[18px]" />
          </a>
          <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
            <Linkedin className="w-[18px] h-[18px]" />
          </a>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 mt-8 flex flex-col md:flex-row justify-between items-center text-xs text-muted-foreground/50 font-light">
        <div className="space-x-4">
          <a href="#" className="hover:text-muted-foreground">Privacy Policy</a>
          <a href="#" className="hover:text-muted-foreground">Terms of Service</a>
          <a href="#" className="hover:text-muted-foreground">Sovereign Data Agreement</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
