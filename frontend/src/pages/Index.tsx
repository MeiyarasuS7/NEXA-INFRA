import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContractorCard } from "@/components/ContractorCard";
import { Button } from "@/components/ui/button";
import { MOCK_CONTRACTORS } from "@/data/mock";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Shield, Clock, Star, Users, CheckCircle, HardHat, TrendingUp, Award, Zap } from "lucide-react";
import heroImage from "@/assets/hero-construction.jpg";

const Index = () => {
  const { loginAs } = useAuth();
  const navigate = useNavigate();
  const hasScrolled = useRef(false);

  const topContractors = MOCK_CONTRACTORS.filter(c => c.status === 'ACTIVE').slice(0, 3);

  useEffect(() => {
    const revealOnScroll = () => {
      hasScrolled.current = true;
      const els = document.querySelectorAll<HTMLElement>('.sr:not(.sr-done)');
      els.forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight - 60) {
          el.classList.add('sr-done');
        }
      });
    };
    window.addEventListener('scroll', revealOnScroll, { passive: true });
    return () => window.removeEventListener('scroll', revealOnScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar forcePublic={true} />

      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="h-full w-full object-cover scale-105" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/97 via-primary/85 to-primary/30" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/60 via-transparent to-transparent" />
        </div>
        <div className="container relative z-10 py-32">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-secondary/30 bg-secondary/10 backdrop-blur-sm px-4 py-1.5 text-sm font-medium text-secondary hero-animate">
              <HardHat className="h-4 w-4" />
              Trusted by 10,000+ homeowners across India
            </div>
            <h1 className="mt-6 font-heading text-5xl font-extrabold leading-[1.1] text-white lg:text-7xl hero-animate" style={{ animationDelay: '0.25s' }}>
              Build with<br />
              <span className="text-secondary">confidence.</span>
            </h1>
            <p className="mt-6 max-w-xl text-xl text-white/75 leading-relaxed hero-animate" style={{ animationDelay: '0.45s' }}>
              Connect with verified construction professionals. Get transparent pricing, real-time project tracking, and guaranteed quality.
            </p>
            <div className="mt-10 flex flex-wrap gap-4 hero-animate" style={{ animationDelay: '0.65s' }}>
              <Button size="lg" className="h-13 px-8 text-base font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-lg shadow-secondary/30 rounded-xl" onClick={() => navigate('/browse-contractors')}>
                Find a Contractor <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="h-13 px-8 text-base font-semibold border-white/30 text-white hover:bg-white/10 rounded-xl backdrop-blur-sm" onClick={() => navigate('/register')}>
                Join as Contractor
              </Button>
            </div>
          </div>
        </div>
        {/* Decorative bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* ── Stats ── */}
      <section className="py-16 bg-background">
        <div className="container">
          <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
            {[
              { value: "2,500+", label: "Verified Contractors", icon: Users },
              { value: "15K+",   label: "Projects Completed",  icon: CheckCircle },
              { value: "4.8★",   label: "Average Rating",      icon: Star },
              { value: "$50M+",  label: "Projects Managed",    icon: TrendingUp },
            ].map((stat, i) => (
              <div key={stat.label} className="sr sr-up group relative overflow-hidden rounded-2xl border border-border bg-card p-6 text-center shadow-sm hover:shadow-md transition-shadow" style={{ transitionDelay: `${i * 0.1}s` }}>
                <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-secondary/10 group-hover:bg-secondary/20 transition-colors">
                  <stat.icon className="h-5 w-5 text-secondary" />
                </div>
                <p className="font-heading text-3xl font-extrabold text-foreground">{stat.value}</p>
                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it Works ── */}
      <section className="py-20 lg:py-28 bg-muted/40">
        <div className="container">
          <div className="text-center mb-16">
            <span className="inline-block rounded-full bg-secondary/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-secondary sr sr-up">Simple Process</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground lg:text-4xl sr sr-up" style={{ transitionDelay: '0.1s' }}>Three steps to your dream project</h2>
          </div>
          <div className="relative grid gap-8 md:grid-cols-3">
            {/* Connector line */}
            <div className="absolute top-10 left-1/4 right-1/4 h-0.5 bg-secondary/20 hidden md:block" />
            {[
              { icon: Users,       title: "Browse & Select",    desc: "Explore verified contractors, compare ratings, and find the perfect match for your project.", color: "bg-blue-50 text-blue-600" },
              { icon: Shield,      title: "Secure & Manage",    desc: "Submit your project details, agree on terms, and track every milestone in real-time.",        color: "bg-amber-50 text-amber-600" },
              { icon: CheckCircle, title: "Complete & Review",  desc: "Approve the finished work, release payment, and share your experience with the community.",    color: "bg-green-50 text-green-600" },
            ].map((step, i) => (
              <div key={step.title} className="sr sr-right relative flex flex-col items-center text-center p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-lg transition-all hover:-translate-y-1" style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${step.color} mb-4`}>
                  <step.icon className="h-8 w-8" />
                </div>
                <div className="text-xs font-bold tracking-widest text-secondary mb-2">STEP {i + 1}</div>
                <h3 className="font-heading text-xl font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Top Contractors ── */}
      <section className="py-20 lg:py-28 bg-background">
        <div className="container">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-12">
            <div className="sr sr-up">
              <span className="inline-block rounded-full bg-secondary/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-secondary">Top Rated</span>
              <h2 className="mt-3 font-heading text-3xl font-bold text-foreground lg:text-4xl">Top Contractors</h2>
              <p className="mt-2 text-muted-foreground">Highly-rated professionals ready for your project</p>
            </div>
            <Link to="/browse-contractors" className="sr sr-up inline-flex items-center gap-2 rounded-xl border border-secondary/40 bg-secondary/5 px-5 py-2.5 text-sm font-semibold text-secondary hover:bg-secondary/10 transition-colors self-start sm:self-auto" style={{ transitionDelay: '0.15s' }}>
              View all contractors <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {topContractors.map((c, i) => (
              <div key={c.id} className="sr sr-right" style={{ transitionDelay: `${i * 0.15}s` }}>
                <ContractorCard contractor={c} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission / About ── */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container">
          <div className="text-center mb-16">
            <span className="inline-block rounded-full bg-secondary/10 px-4 py-1 text-xs font-bold uppercase tracking-widest text-secondary sr sr-up">Who We Are</span>
            <h2 className="mt-3 font-heading text-3xl font-bold text-foreground lg:text-4xl sr sr-up" style={{ transitionDelay: '0.1s' }}>Built for the future of construction</h2>
            <p className="mt-3 max-w-2xl mx-auto text-muted-foreground sr sr-up" style={{ transitionDelay: '0.2s' }}>
              At NEXA INFRA, we bridge the gap between homeowners and skilled construction professionals through technology, trust, and transparency.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
            {/* Mission list */}
            <div className="space-y-4 sr sr-right">
              {[
                { icon: Award,       title: "Verified Professionals",    desc: "Every contractor is thoroughly vetted, background-checked, and skill-verified before joining our platform." },
                { icon: Shield,      title: "Protected Payments",        desc: "Funds are held securely in escrow and released only when you approve the completed milestone." },
                { icon: Zap,         title: "Real-Time Tracking",        desc: "Monitor every project update, message your contractor, and track milestones from your dashboard." },
                { icon: Star,        title: "Quality Assurance",         desc: "Our review system and quality checks ensure every project meets the highest standards." },
              ].map((item, i) => (
                <div key={item.title} className="sr sr-right flex gap-4 rounded-2xl border border-border bg-card p-5 hover:shadow-md transition-all hover:-translate-y-0.5" style={{ transitionDelay: `${i * 0.1}s` }}>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10">
                    <item.icon className="h-5 w-5 text-secondary" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-foreground">{item.title}</h4>
                    <p className="mt-1 text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTA card */}
            <div className="sr sr-right lg:sticky lg:top-24" style={{ transitionDelay: '0.3s' }}>
              <div className="rounded-3xl overflow-hidden border border-border shadow-xl">
                <div className="bg-primary p-8 text-center">
                  <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary/20">
                    <HardHat className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-primary-foreground">Ready to build?</h3>
                  <p className="mt-2 text-primary-foreground/70 text-sm">Join thousands of homeowners who trust NEXA INFRA for their construction projects.</p>
                </div>
                <div className="bg-card p-6 space-y-3">
                  <Button className="w-full bg-secondary text-secondary-foreground hover:bg-secondary/90 rounded-xl h-12 font-semibold" onClick={() => navigate('/register')}>
                    Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="w-full rounded-xl h-12" onClick={() => navigate('/browse-contractors')}>
                    Browse Contractors
                  </Button>
                  <p className="text-center text-xs text-muted-foreground pt-2">
                    Already have an account? <Link to="/login" className="text-secondary font-medium hover:underline">Sign in</Link>
                  </p>
                </div>
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

