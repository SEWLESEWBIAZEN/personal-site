
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  slug: string;
}

const BlogSection: React.FC = () => {
  const featuredPosts: BlogPost[] = [
    {
      id: 1,
      title: 'Building a Modern Portfolio with React and Tailwind',
      excerpt: 'Learn how to create a stunning portfolio website using React and Tailwind CSS.',
      date: 'Apr 12, 2023',
      readTime: '5 min read',
      slug: 'building-modern-portfolio'
    },
    {
      id: 2,
      title: 'The Power of TypeScript in Frontend Development',
      excerpt: 'Discover how TypeScript can improve your frontend development workflow.',
      date: 'Mar 24, 2023',
      readTime: '7 min read',
      slug: 'power-of-typescript'
    },
    {
      id: 3,
      title: 'Optimizing React Performance',
      excerpt: 'Tips and tricks to make your React applications faster and more efficient.',
      date: 'Feb 10, 2023',
      readTime: '6 min read',
      slug: 'optimizing-react-performance'
    }
  ];

  return (
    <section className="section" id="blog">
      <div className="container-content">
        <div className="flex justify-between items-center mb-8">
          <h2>Blog</h2>
          <Link to="/blog">
            <Button variant="ghost" className="group text-sm">
              View all posts
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredPosts.map((post) => (
            <Link to={`/blog/${post.slug}`} key={post.id}>
              <Card className="h-full hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                  <CardDescription className="flex items-center text-xs">
                    <Calendar size={14} className="mr-1" />
                    {post.date} · {post.readTime}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-sm line-clamp-3">
                    {post.excerpt}
                  </p>
                </CardContent>
                <CardFooter>
                  <Button variant="ghost" className="p-0 h-auto text-sm text-primary hover:bg-transparent hover:underline">
                    Read more
                  </Button>
                </CardFooter>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
