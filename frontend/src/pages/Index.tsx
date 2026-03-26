import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContractorCard } from "@/components/ContractorCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient } from "@/services/api";
import {
  ArrowRight, Shield, Star, Users, CheckCircle,
  HardHat, Zap, TrendingUp, Lock, MessageSquare, Award,
  Building2, ChevronRight, MapPin, Clock, Handshake,
} from "lucide-react";
import heroImage from "@/assets/661874.jpg";

interface ApiContractor {
  _id: string;
  company?: string;
  specialties?: string[];
  bio?: string;
  experience?: number;
  rating?: number;
  totalProjects?: number;
  isVerified?: boolean;
  userId?: {
    name?: string;
    location?: string;
  };
}

// â”€â”€ Data â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const STATS = [
  { value: "2,500+", label: "Verified Contractors" },
  { value: "15K+",   label: "Projects Completed"   },
  { value: "4.8",    label: "Avg. Star Rating"      },
  { value: "$50M+",  label: "Projects Managed"      },
];

const FEATURES = [
  { icon: Shield,       title: "Verified Professionals",  desc: "Every contractor is background-checked, licensed, and insured before joining the platform." },
  { icon: TrendingUp,   title: "Real-Time Tracking",       desc: "Monitor every milestone, document upload, and status change as it happens." },
  { icon: Lock,         title: "Secure Escrow Payments",   desc: "Funds are held safely and only released when you approve the completed work." },
  { icon: MessageSquare,title: "Direct Communication",     desc: "Chat directly with your contractor, share files, and resolve issues fast." },
  { icon: Award,        title: "Rating & Reviews",         desc: "Transparent, verified reviews help you choose the best contractor every time." },
  { icon: Zap,          title: "Fast Matching",            desc: "Get matched with qualified contractors in your area within minutes." },
];

const STEPS = [
  { icon: Users,        title: "Browse & Select", desc: "Explore verified contractors, compare ratings and portfolios, and find the perfect match for your project." },
  { icon: Building2,    title: "Post & Track",    desc: "Submit your project details, agree on milestones, and monitor every step in real-time." },
  { icon: CheckCircle,  title: "Approve & Pay",   desc: "Confirm the finished work, release payment from escrow, and leave a verified review." },
];

const TESTIMONIALS = [
  { name: "Sarah M.",  role: "Homeowner",           rating: 5, quote: "NEXA INFRA made my kitchen renovation stress-free. The contractor was professional and the tracking feature kept me updated daily." },
  { name: "James K.",  role: "Property Developer",  rating: 5, quote: "Managing multiple projects has never been easier. The escrow system gives me full confidence in every transaction." },
  { name: "Linda O.",  role: "Small Business Owner",rating: 5, quote: "Found an excellent contractor within a day. The reviews are genuine and the whole process is transparent." },
];

const ABOUT_PILLARS = [
  { icon: MapPin,    title: "Built for You",        desc: "Designed around the realities of the local construction market: local pricing, local professionals, and local trust." },
  { icon: Handshake, title: "Fair for Both Sides",    desc: "Homeowners get protection. Contractors get fair pay. Our platform is built to create lasting professional relationships." },
  { icon: Clock,     title: "Saving You Time",        desc: "From browsing to project completion, everything stays in one platform so you never chase emails or phone calls again." },
];

// â”€â”€ Scroll-reveal hook â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll<HTMLElement>(".scroll-reveal");
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement;
            const delay = el.dataset.delay ?? "0";
            setTimeout(() => el.classList.add("visible"), parseInt(delay));
            observer.unobserve(el);
          }
        });
      },
      { threshold: 0.12 }
    );
    els.forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);
}

// â”€â”€ Page â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const Index = () => {
  const navigate = useNavigate();
  const [featuredContractors, setFeaturedContractors] = useState<ApiContractor[]>([]);
  useScrollReveal();

  useEffect(() => {
    const loadFeaturedContractors = async () => {
      try {
        const data = await apiClient.get<{ contractors: ApiContractor[] }>("/contractors");
        setFeaturedContractors((data.contractors || []).slice(0, 3));
      } catch {
        setFeaturedContractors([]);
      }
    };

    void loadFeaturedContractors();
  }, []);

  const topContractors = featuredContractors.map((contractor) => ({
    id: contractor._id,
    businessName: contractor.company || contractor.userId?.name || "Unnamed contractor",
    location: contractor.userId?.location || "Location unavailable",
    yearsExperience: contractor.experience || 0,
    bio: contractor.bio || "No company bio available yet.",
    specialties: contractor.specialties || [],
    rating: contractor.rating || 0,
    reviewCount: contractor.totalProjects || 0,
    completedProjects: contractor.totalProjects || 0,
    verified: contractor.isVerified,
  }));

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />

      {/* â”€â”€ Hero â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="Construction site" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/97 via-primary/85 to-primary/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/80 via-transparent to-transparent" />
        </div>

        <div className="container relative py-28 lg:py-44">
          <div className="max-w-2xl space-y-6">
            <div className="hero-animate" style={{ animationDelay: "0.1s" }}>
              <div className="flex items-center gap-2 w-fit rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-sm font-medium text-primary-foreground/90 backdrop-blur-sm">
                <HardHat className="h-4 w-4 text-secondary" />
                Trusted by 10,000+ homeowners worldwide
              </div>
            </div>

            <div className="hero-animate" style={{ animationDelay: "0.25s" }}>
              <h1 className="font-heading text-5xl font-extrabold leading-tight text-primary-foreground lg:text-[4.25rem]">
                Build your vision<br />
                <span className="text-secondary">with confidence.</span>
              </h1>
            </div>

            <div className="hero-animate" style={{ animationDelay: "0.4s" }}>
              <p className="max-w-lg text-lg leading-relaxed text-primary-foreground/75">
                Connect with trusted construction professionals. Get clear pricing,
                live project tracking, and secure payments in one platform.
              </p>
            </div>

            <div className="hero-animate flex flex-wrap gap-3 pt-2" style={{ animationDelay: "0.55s" }}>
              <Button size="lg" className="h-12 px-8 text-base bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg" onClick={() => navigate("/browse-contractors")}>
                Find a Contractor <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/30 text-primary-foreground bg-white/10 hover:bg-white/20 backdrop-blur-sm" onClick={() => navigate("/register")}>
                Join as Contractor
              </Button>
            </div>

            <div className="hero-animate flex items-center gap-4 pt-2 text-sm text-primary-foreground/70" style={{ animationDelay: "0.7s" }}>
              <div className="flex -space-x-2">
                {(["#c4a265","#b8905a","#a67c4d","#946e42"] as const).map((bg, i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-primary/50 flex items-center justify-center text-xs font-bold text-white" style={{ backgroundColor: bg }}>
                    {["S","J","A","M"][i]}
                  </div>
                ))}
              </div>
              <span><strong className="text-primary-foreground">4.8/5</strong> rated by 3,200+ verified homeowners</span>
            </div>
          </div>
        </div>
      </section>

      {/* â”€â”€ Stats Bar â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="border-b border-border bg-card shadow-sm">
        <div className="container py-10">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {STATS.map((stat, i) => (
              <div key={stat.label} className="text-center scroll-reveal fade-up" data-delay={`${i * 100}`}>
                <p className="font-heading text-3xl font-extrabold text-primary lg:text-4xl">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ About â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 lg:py-32 overflow-hidden">
        <div className="container">
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto mb-16 scroll-reveal fade-up">
            <Badge variant="outline" className="mb-3 border-secondary/40 text-secondary font-semibold">About NEXA INFRA</Badge>
            <h2 className="font-heading text-3xl font-bold text-foreground lg:text-5xl leading-tight">
              The most trusted<br />construction platform
            </h2>
            <p className="mt-4 text-muted-foreground text-base leading-relaxed max-w-2xl mx-auto">
              NEXA INFRA was founded with one mission: make construction projects simple, transparent, and safe for everyone.
              We connect homeowners and property developers with skilled, verified contractors backed by smart technology
              and real accountability.
            </p>
          </div>

          {/* Two-column story */}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center mb-20">
            <div className="scroll-reveal slide-right">
              <div className="relative rounded-3xl overflow-hidden shadow-xl aspect-[4/3]">
                <img src={heroImage} alt="Construction professionals" className="h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/70 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-primary-foreground font-heading text-xl font-bold">Over 15,000 successful projects</p>
                  <p className="text-primary-foreground/80 text-sm mt-1">and counting, nationwide</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 scroll-reveal fade-up" data-delay="150">
              <h3 className="font-heading text-2xl font-bold text-foreground lg:text-3xl">
                We believe great construction starts with great trust.
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                Too many homeowners have been let down by contractors who disappear mid-project, quote one price and charge another,
                or deliver shoddy work with no recourse. NEXA INFRA changes that.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Every contractor on our platform is verified, rated, and held accountable. Every payment is protected by escrow.
                Every milestone is tracked in real time, so you're always in control.
              </p>
              <div className="flex flex-wrap gap-3 pt-2">
                <Button onClick={() => navigate("/register")} className="gap-2">
                  Get Started <ArrowRight className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={() => navigate("/browse-contractors")} className="gap-2">
                  Browse Contractors
                </Button>
              </div>
            </div>
          </div>

          {/* Pillars */}
          <div className="grid gap-6 md:grid-cols-3">
            {ABOUT_PILLARS.map((p, i) => (
              <div key={p.title} className="rounded-2xl bg-primary p-8 text-primary-foreground scroll-reveal fade-up" data-delay={`${i * 120}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 mb-5">
                  <p.icon className="h-6 w-6 text-secondary" />
                </div>
                <h4 className="font-heading text-lg font-semibold mb-2">{p.title}</h4>
                <p className="text-primary-foreground/75 text-sm leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ Why NEXA INFRA â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-muted/40 border-y border-border py-20 lg:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14 scroll-reveal fade-up">
            <Badge variant="outline" className="mb-3 border-secondary/40 text-secondary font-semibold">Why NEXA INFRA</Badge>
            <h2 className="font-heading text-3xl font-bold text-foreground lg:text-4xl">Everything you need to build smarter</h2>
            <p className="mt-3 text-muted-foreground text-base">
              Every feature is built around making construction projects more transparent, secure, and successful.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f, i) => (
              <div key={f.title} className="group rounded-2xl border border-border bg-card p-6 shadow-sm hover:border-secondary/40 hover:shadow-md hover:-translate-y-1 transition-all duration-300 scroll-reveal fade-up" data-delay={`${i * 80}`}>
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="mt-4 font-heading text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ How It Works â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14 scroll-reveal fade-up">
            <Badge variant="outline" className="mb-3 border-secondary/40 text-secondary font-semibold">How It Works</Badge>
            <h2 className="font-heading text-3xl font-bold text-foreground lg:text-4xl">Three steps to your ideal project</h2>
            <p className="mt-3 text-muted-foreground text-base">
              From finding the right contractor to approving the finished work, everything stays simple and straightforward.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 relative">
            <div className="hidden md:block absolute top-10 left-[33%] right-[33%] h-0.5 bg-border z-0" />
            {STEPS.map((step, i) => (
              <div key={step.title} className="relative z-10 flex flex-col items-center text-center scroll-reveal fade-up" data-delay={`${i * 150}`}>
                <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-primary shadow-md">
                  <step.icon className="h-9 w-9 text-primary-foreground" />
                  <span className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-secondary-foreground shadow">
                    {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 font-heading text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground max-w-xs">{step.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center scroll-reveal fade-up" data-delay="200">
            <Button size="lg" onClick={() => navigate("/register")} className="h-12 px-8 text-base">
              Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* â”€â”€ Top Contractors â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-muted/40 border-y border-border py-20 lg:py-28">
        <div className="container">
          <div className="flex items-end justify-between mb-10 scroll-reveal fade-up">
            <div>
              <Badge variant="outline" className="mb-3 border-secondary/40 text-secondary font-semibold">Featured Professionals</Badge>
              <h2 className="font-heading text-3xl font-bold text-foreground lg:text-4xl">Top-rated contractors</h2>
              <p className="mt-2 text-muted-foreground">Highly-rated professionals ready for your next project.</p>
            </div>
            <Link to="/browse-contractors" className="hidden items-center gap-1 text-sm font-semibold text-secondary hover:underline md:flex shrink-0 ml-4">
              View all <ChevronRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {topContractors.map((c, i) => (
              <div key={c.id} className="scroll-reveal fade-up" data-delay={`${i * 120}`}>
                <ContractorCard contractor={c} />
              </div>
            ))}
          </div>

          <div className="mt-8 text-center md:hidden scroll-reveal fade-up">
            <Link to="/browse-contractors" className="inline-flex items-center gap-1 text-sm font-semibold text-secondary hover:underline">
              View all contractors <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* â”€â”€ Testimonials â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="py-20 lg:py-28">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14 scroll-reveal fade-up">
            <Badge variant="outline" className="mb-3 border-secondary/40 text-secondary font-semibold">Testimonials</Badge>
            <h2 className="font-heading text-3xl font-bold text-foreground lg:text-4xl">What our clients say</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col gap-4 hover:shadow-md hover:-translate-y-1 transition-all duration-300 scroll-reveal fade-up" data-delay={`${i * 130}`}>
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-secondary text-secondary" />
                  ))}
                </div>
                <p className="text-sm leading-relaxed text-foreground/80 flex-1">"{t.quote}"</p>
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary/20 font-bold text-secondary text-sm">{t.name[0]}</div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* â”€â”€ CTA Banner â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <section className="bg-muted/40 border-t border-border py-20 lg:py-28">
        <div className="container">
          <div className="rounded-3xl bg-primary px-8 py-16 text-center shadow-xl lg:px-16 scroll-reveal fade-up relative overflow-hidden">
            {/* Decorative circles */}
            <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-white/5" />
            <div className="pointer-events-none absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-white/5" />

            <div className="relative">
              <Badge className="mb-4 bg-secondary/20 text-secondary border-secondary/30 font-semibold">Start Today</Badge>
              <h2 className="font-heading text-3xl font-extrabold text-primary-foreground lg:text-4xl">
                Ready to start your project?
              </h2>
              <p className="mt-3 text-primary-foreground/75 text-base max-w-xl mx-auto">
                Join thousands of homeowners and contractors already building smarter on NEXA INFRA.
              </p>
              <div className="mt-8 flex flex-wrap justify-center gap-3">
                <Button size="lg" className="h-12 px-8 text-base bg-secondary text-secondary-foreground hover:bg-secondary/90" onClick={() => navigate("/browse-contractors")}>
                  Find a Contractor <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 px-8 text-base border-white/30 text-primary-foreground bg-white/10 hover:bg-white/20" onClick={() => navigate("/register")}>
                  List Your Services
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
