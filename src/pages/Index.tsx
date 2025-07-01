import React from 'react';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import AboutSection from '@/components/AboutSection';
import ProjectsSection from '@/components/ProjectsSection';
import BlogSection from '@/components/BlogSection';
import ContactSection from '@/components/ContactSection';
import RotatingText from '@/components/RotatingText';
import CountUp from '@/components/CounterUp';
import LetterGlitch from '@/components/LetterGlitch';


const Index: React.FC = () => {
  const scrollToAbout = () => {
    const aboutSection = document.getElementById('about');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Hero Section */}

      <section className="flex items-center justify-center min-h-screen bg-secondary/20 relative overflow-hidden">
        <div className="absolute inset-0 w-full h-full -z-10 backdrop-blur-sm">
          <div className="absolute inset-0 backdrop-blur-[100px]">
            <LetterGlitch
              glitchColors={['#64748b', '#cffafe', '#a8a29e']}
              glitchSpeed={50}
              centerVignette={true}
              outerVignette={false}
              smooth={true}             
            />
          </div>
        </div>
        <div className="container-content text-center md:text-left relative z-10">
          <div className="max-w-3xl mx-auto md:mx-0">
            <h1 className="mb-4 animate-slide-in">
              <div className='flex flex-row gap-2 items-center  text-[40px] text-nowrap flex-wrap'>
                Hi, I'm <span className="text-primary">Sewlesew</span>.
                <RotatingText
                  texts={['FULLSTACK', 'REACT', 'NEXT.JS', 'MERN', '.NET']}
                  mainClassName="px-2 sm:px-2 md:px-3 dark:text-slate-300 text-slate-600 overflow-hidden py-0.5 sm:py-1 md:py-2 justify-center rounded-lg border"
                  staggerFrom={"last"}
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  exit={{ y: "-120%" }}
                  staggerDuration={0.025}
                  splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                  transition={{ type: "spring", damping: 30, stiffness: 400 }}
                  rotationInterval={3000}
                />
                <div>Developer with</div>
                <div className='dark:text-slate-300 text-slate-600 rounded-lg uppercase text-[26px] sm:text-[30px] md:text-[40px]'>
                  <CountUp
                    from={0}
                    to={3}
                    separator=","
                    direction="up"
                    duration={1}
                    className="count-up-text"
                  />+ years of experience</div>
              </div>
              <br />
              I build things for the web.
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-xl animate-slide-in" style={{ animationDelay: "100ms" }}>
              I'm a developer specializing in building exceptional digital experiences.
              Currently, I'm focused on creating accessible, human-centered products.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start animate-slide-in" style={{ animationDelay: "200ms" }}>
              <Link to="/projects">
                <Button size="lg">
                  View my work
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" onClick={scrollToAbout}>
                Learn more
                <ArrowDown className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Other Sections */}
      <AboutSection />
      <ProjectsSection />
      <BlogSection />
      <ContactSection />
    </>
  );
};

export default Index;
