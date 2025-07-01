export interface Project {
    id?: number;
    title: string;
    description: string;
    tags: string[];
    image: string[] | null;
    githubUrl: string | null;
    liveUrl: string | null;
    featured: boolean;
  }
export interface Blog {
    id?: number;
    title: string;
    excerpt: string;
    tags: string[];
    slug: string;
    readTime:number;
 
  }

  export interface BlogProps {
    id: number;
    title: string;
    excerpt: string;
    readTime:number;
    tags:string[];  
    slug: string;
    created_at: string;  
  }

  export interface NothingPageProps{
    content:string;
    clearFunc:()=>void;
  }

  export interface ExpandableCardProps{
    
  }