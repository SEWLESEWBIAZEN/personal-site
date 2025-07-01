import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github } from 'lucide-react';
import { getAllProjects } from '@/lib/actions/projects';
import Loading from '@/components/Loading';
import Nothing from '@/components/Nothing';
import ImageStackWithPreview from '@/components/ImagePreviewWithStack';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Project {
  id: number;
  title: string;
  description: string;
  tags: string[];
  image: string[];
  githubUrl: string | null;
  liveUrl: string | null;
  featured: boolean;
}

const Projects: React.FC = () => {

  const [filter, setFilter] = useState<string | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchProjects = async () => {
      const fetchedProjects = await getAllProjects();
      setProjects(fetchedProjects.data)
      
      setIsLoading(false)
    }
    fetchProjects();

  }, [])

  // Get all unique tags
  const allTags = Array.from(
    new Set(projects.flatMap(project => project.tags))
  ).sort();

  // Filter projects by tag
  const filteredProjects = filter
    ? projects.filter(project => project.tags.includes(filter))
    : projects;

  return (
    <div className="container-content py-16">
      <div className='w-full flex flex-row items-start flex-wrap md:flex-nowrap '>
        <div className='w-full flex-grow'>
          <h1 className="mb-6">Projects</h1>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
            A collection of my work including web applications, design projects, and experiments.
            Each project represents a unique challenge and solution.
          </p>
        </div>
        
      </div>
      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2 mb-8">
        <Button
          variant={filter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter(null)}
        >
          All
        </Button>
        {allTags.map(tag => (
          <Button
            key={tag}
            variant={filter === tag ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(tag)}
          >
            {tag}
          </Button>
        ))}
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects?.map((project) => (
          <Card key={project.id} className="overflow-hidden hover:shadow-md transition-shadow">
            <div className="h-48 bg-secondary flex items-center justify-center">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div>
                      <ImageStackWithPreview
                        cardsData={project?.image?.map((img:string,index:number)=>({id:index+1,img:img,alt:"placeholder image"}))}
                        cardDimensions={{ width: 350, height: 180 }}
                        previewWidth={800}
                        previewHeight={600}
                        // Optional additional props:
                        randomRotation={true}
                        sensitivity={180}
                        sendToBackOnClick={false}
                      />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className='dark:bg-slate-100 dark:text-slate-800  text-slate-50 bg-slate-800'>
                    <p>Drag to left to see all screenshoot of the project out of the stack.</p>
                    <p>Click on the image to enlarge/preview.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <CardHeader>
              <CardTitle>{project.title}</CardTitle>
              <CardDescription>{project.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-secondary text-secondary-foreground rounded-md text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              {project.githubUrl !== null &&
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-primary transition-colors"
                >
                  <Github size={16} className="mr-1" />
                  Code
                </a>}
              {project.liveUrl !== null &&
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center hover:text-primary transition-colors"
                >
                  <ExternalLink size={16} className="mr-1" />
                  Live Demo
                </a>}
            </CardFooter>
          </Card>
        ))}
      </div>
      {filteredProjects.length === 0 && !isLoading && (
        <Nothing content='projects' clearFunc={() => setFilter(null)} />
      )}
      {isLoading && (
        <Loading content="projects" />
      )}
    </div>
  );
};

export default Projects;
