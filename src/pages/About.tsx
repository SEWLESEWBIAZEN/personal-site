
import React from 'react';
import { Briefcase, GraduationCap } from 'lucide-react';
import { Button } from '@/components/ui/button';

const About: React.FC = () => {
  const experiences = [
    {
      role: 'Software(Fullstack) Developer',
      company: 'Ethiopian Airlines',
      period: 'April 2024 - Present',
      description: 'Collaborate with the senior development teams of the company\'s main product, improving performance by 40%. Collaborated with designers and work in both frontend and backend to implement new features.'
    },
    {
      role: 'Junior Software(Fullstack) Developer',
      company: 'ADIB',
      period: 'December 2003 - April 2024',
      description: 'Built responsive web applications for various clients. Worked with React, Vue.js, and modern CSS frameworks to deliver high-quality user interfaces.'
    },
    {
      role: 'Web Developer Intern',
      company: 'ABA.',
      period: 'January 2023 - March 2023',
      description: 'Assisted in building and maintaining company websites. Learned modern web development practices and collaborated in an agile team environment.'
    },
    {
      role: "Full - Stack Developer(Personal Projects)",
      company: "Self - Initiated",
      period: "January 2021 – July 2023",
      description: 'Designed, developed, and deployed multiple full-stack web applications using modern frameworks (React, Node.js, etc.). Implemented responsive UI/UX principles, RESTful APIs, and database architectures (SQL/NoSQL). Adopted Agile methodologies (sprints, version control via Git) in solo and collaborative project settings. Continuously improved skills through iterative development, user feedback, and staying updated with industry trends.'
    }
  ];

  const education = [

    {
      degree: 'Bachelor of Science in Computer Science',
      institution: 'Addis Ababa University',
      period: '2019 - 2023',
      description: 'Studied programming, data structures, algorithms, and software development methodologies.'
    }
  ];

  return (
    <div className="container-content py-16">
      <h1 className="mb-6">About Me</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-16">
        <div className="col-span-2">
          <p className="text-lg mb-4">
            Hello! I'm <span className="font-semibold"> Sewlesew</span>, a passionate and creative developer with 4+ years of experience in building web applications.
            I enjoy solving complex problems and turning ideas into reality through elegant and efficient code.
          </p>
          <p className="mb-4">
            My journey in technology began during college when I discovered my passion for creating web experiences.
            Since then, I've worked with various technologies and frameworks, always staying up-to-date with the latest industry trends.
          </p>
          <p className="mb-6">
            When I'm not coding, I enjoy hiking, reading science fiction, and contributing to open source projects.
            I believe in continuous learning and sharing knowledge with the developer community.
          </p>

          <a href="/resumes/Sewlesew_Biazen_Resume_Updated_2025.PDF" download className="inline-block">
            <Button>Download Resume</Button>
          </a>
        </div>

        <div className="space-y-6">
          <div className="bg-secondary/30 p-6 rounded-lg">
            <h3 className="font-medium mb-4">Technical Skills</h3>
            <ul className="space-y-2 text-sm">
              <li>JavaScript / TypeScript</li>
              <li>React / Next.js</li>
              <li>HTML5 / CSS3 / Tailwind</li>
              <li>Node.js / Express</li>
              <li>.Net Core / C#</li>                            
              <li>Git / GitHub</li>
              <li>Azure Devops</li>
              <li>UI/UX Design principles</li>
            </ul>
          </div>

          <div className="bg-secondary/30 p-6 rounded-lg">
            <h3 className="font-medium mb-4">Soft Skills</h3>
            <ul className="space-y-2 text-sm">
              <li>Problem Solving</li>
              <li>Team Collaboration</li>
              <li>Project Management</li>
              <li>Effective Communication</li>
              <li>Time Management</li>
              <li>Adaptability</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <section className="mb-16">
        <div className="flex items-center mb-6">
          <Briefcase className="mr-2" />
          <h2>Experience</h2>
        </div>

        <div className="space-y-8">
          {experiences.map((exp, index) => (
            <div key={index} className="relative pl-8 border-l border-border">
              <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary"></div>
              <h3 className="text-xl font-medium">{exp.role}</h3>
              <p className="text-primary mb-1">{exp.company}</p>
              <p className="text-sm text-muted-foreground mb-2">{exp.period}</p>
              <p>{exp.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Education Section */}
      <section>
        <div className="flex items-center mb-6">
          <GraduationCap className="mr-2" />
          <h2>Education</h2>
        </div>

        <div className="space-y-8">
          {education.map((edu, index) => (
            <div key={index} className="relative pl-8 border-l border-border">
              <div className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary"></div>
              <h3 className="text-xl font-medium">{edu.degree}</h3>
              <p className="text-primary mb-1">{edu.institution}</p>
              <p className="text-sm text-muted-foreground mb-2">{edu.period}</p>
              <p>{edu.description}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default About;
