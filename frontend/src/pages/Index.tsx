import { Link, useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ContractorCard } from "@/components/ContractorCard";
import { Button } from "@/components/ui/button";
import { MOCK_CONTRACTORS } from "@/data/mock";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowRight, Shield, Clock, Star, Users, CheckCircle, HardHat } from "lucide-react";
import heroImage from "@/assets/hero-construction.jpg";

const Index = () => {
  const { loginAs } = useAuth();
  const navigate = useNavigate();

  const topContractors = MOCK_CONTRACTORS.filter(c => c.status === 'APPROVED').slice(0, 3);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/95 via-primary/80 to-primary/40" />
        </div>
        <div className="container relative py-24 lg:py-36">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 rounded-full bg-secondary/20 px-3 py-1 w-fit text-sm font-medium text-secondary">
              <HardHat className="h-4 w-4" />
              Trusted by 10,000+ homeowners
            </div>
            <h1 className="mt-5 font-heading text-4xl font-extrabold leading-tight text-primary-foreground lg:text-6xl">
              Build with<br />
              <span className="text-secondary">confidence.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-primary-foreground/80">
              Connect with verified construction professionals. Get transparent pricing, real-time project tracking, and guaranteed quality.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" className="bg-secondary text-secondary-foreground hover:bg-secondary/90 h-12 px-6 text-base" onClick={() => navigate('/browse-contractors')}>
                Find a Contractor <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="h-12 px-6 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10" onClick={() => navigate('/register')}>
                Join as Contractor
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-border bg-card py-10">
        <div className="container grid grid-cols-2 gap-8 md:grid-cols-4">
          {[
            { value: "2,500+", label: "Verified Contractors" },
            { value: "15K+", label: "Projects Completed" },
            { value: "4.8★", label: "Average Rating" },
            { value: "$50M+", label: "Projects Managed" },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className="font-heading text-2xl font-bold text-foreground lg:text-3xl">{stat.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 lg:py-24">
        <div className="container">
          <div className="text-center">
            <h2 className="font-heading text-3xl font-bold text-foreground">How BuildPro Works</h2>
            <p className="mt-2 text-muted-foreground">Three simple steps to your dream project</p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {[
              { icon: Users, title: "Browse & Select", desc: "Explore verified contractors, compare ratings, and find the perfect match for your project." },
              { icon: Shield, title: "Secure & Manage", desc: "Submit your project details, agree on terms, and track every milestone in real-time." },
              { icon: CheckCircle, title: "Complete & Review", desc: "Approve the finished work, release payment, and share your experience." },
            ].map((step, i) => (
              <div key={step.title} className="text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary/10">
                  <step.icon className="h-7 w-7 text-secondary" />
                </div>
                <div className="mt-1 text-xs font-bold text-secondary">STEP {i + 1}</div>
                <h3 className="mt-2 font-heading text-lg font-semibold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Top Contractors */}
      <section className="border-t border-border bg-muted/50 py-16 lg:py-24">
        <div className="container">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-heading text-3xl font-bold text-foreground">Top Contractors</h2>
              <p className="mt-2 text-muted-foreground">Highly-rated professionals ready for your project</p>
            </div>
            <Link to="/browse-contractors" className="hidden items-center gap-1 text-sm font-medium text-secondary hover:underline md:flex">
              View all <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {topContractors.map(c => <ContractorCard key={c.id} contractor={c} />)}
          </div>
        </div>
      </section>

      {/* Quick Demo Login */}
      <section className="py-16">
        <div className="container">
          <div className="rounded-2xl border border-border bg-card p-8 text-center shadow-card">
            <h2 className="font-heading text-2xl font-bold text-foreground">Explore the Platform</h2>
            <p className="mt-2 text-muted-foreground">Try any role to see the full dashboard experience</p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              {([
                { role: 'SUPER_ADMIN' as const, label: 'Admin Dashboard', path: '/admin/dashboard' },
                { role: 'CONTRACTOR' as const, label: 'Contractor Dashboard', path: '/contractor/dashboard' },
                { role: 'USER' as const, label: 'User Dashboard', path: '/user/dashboard' },
              ]).map(item => (
                <Button key={item.role} variant="outline" onClick={() => { loginAs(item.role); navigate(item.path); }}>
                  {item.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Index;
