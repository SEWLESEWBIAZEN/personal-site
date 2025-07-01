
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

const AboutSection: React.FC = () => {
  const skills = [
    'JavaScript', 'TypeScript', 'React', 'Next.js', 
    'Node.js', 'Tailwind CSS', 'UI/UX Design'
  ];

  return (
    <section className="section" id="about">
      <div className="container-content">
        <h2 className="mb-8">About Me</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div className="col-span-2">
            <p className="text-lg mb-4">
              Hello there! I'm a passionate developer focused on creating beautiful, 
              functional, and user-centered digital experiences. With a background in 
              both design and development, I bring a unique perspective to every project.
            </p>
            <p className="mb-6">
              When I'm not coding, you can find me exploring new technologies, contributing 
              to open source projects, or enjoying the outdoors. I believe in continuous 
              learning and pushing the boundaries of what's possible on the web.
            </p>
            
            <Link to="/about">
              <Button className="group">
                Learn more about me
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </div>
          
          <div>
            <h3 className="text-xl font-medium mb-4">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
