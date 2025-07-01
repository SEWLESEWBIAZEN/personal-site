import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import AddBlogForm from './admin/Blog';
import { getAllBlogs } from '@/lib/actions/blogs';
import Loading from '@/components/Loading';
import Nothing from '@/components/Nothing';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  created_at: string;
  readTime: string;
  tags: string[];
  slug: string;
}


const Blogs: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [BLOG_POSTS, setBlogs] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchblogs = async () => {
      const fetchedBlogs = await getAllBlogs();
      setBlogs(fetchedBlogs.data)
      setIsLoading(false)

    }
    fetchblogs();

  }, [])
  // Get all unique tags sorted alphabetically
  const allTags = Array.from(
    new Set(BLOG_POSTS.flatMap(post => post.tags))
  ).sort((a, b) => a.localeCompare(b));

  // Filter posts by search term and tag
  const filteredPosts = BLOG_POSTS.filter(post => {
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch = searchTerm === '' ||
      post.title.toLowerCase().includes(searchLower) ||
      post.excerpt.toLowerCase().includes(searchLower);

    const matchesTag = selectedTag === null || post.tags.includes(selectedTag);

    return matchesSearch && matchesTag;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedTag(null);
  };

  return (
    <main className="container-content py-16">
      <header className="mb-8">
        <div className='w-full flex flex-row items-start flex-wrap md:flex-nowrap '>
          <div className='w-full flex-grow'>
            <h1 className="text-3xl font-bold mb-2">Blog</h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              I write about web development, design, and technology.
              Here you'll find tutorials, tips, and my thoughts on the latest trends.
            </p>

          </div>
    
        </div>

      </header>

      {/* Search and Filter Section */}
      <section aria-label="Blog post filters" className="mb-8">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-muted-foreground" />
            </div>
            <Input
              placeholder="Search articles..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              aria-label="Search blog posts"
            />
          </div>

          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by tags">
            <Button
              variant={selectedTag === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedTag(null)}
              aria-pressed={selectedTag === null}
            >
              All
            </Button>
            {allTags.map(tag => (
              <Button
                key={tag}
                variant={selectedTag === tag ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedTag(tag)}
                aria-pressed={selectedTag === tag}
              >
                {tag}
              </Button>
            ))}
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section aria-label="Blog posts">

        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <article key={post.id} className="h-full">
                <Link to={`/blog/${post.slug}`} className="block h-full">
                  <Card className="h-full hover:shadow-md transition-shadow duration-200">
                    <CardHeader>
                      <CardTitle className="line-clamp-2">{post.title}</CardTitle>
                      <CardDescription className="flex items-center text-xs">
                        <Calendar size={14} className="mr-1" aria-hidden="true" />
                        {new Date(post?.created_at).toDateString()} · {post.readTime}min
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground text-sm line-clamp-5">
                        {post.excerpt}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-4">
                        {post.tags.map((tag) => (
                          <Button
                            key={tag}
                            variant="ghost"
                            size="sm"
                            className="px-2 py-1 h-auto text-xs"
                            onClick={(e) => {
                              e.preventDefault();
                              setSelectedTag(tag);
                            }}
                          >
                            {tag}
                          </Button>
                        ))}
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="ghost"
                        className="p-0 h-auto text-sm text-primary hover:bg-transparent hover:underline"
                      >
                        Read article
                      </Button>
                    </CardFooter>
                  </Card>
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div>
            {isLoading ?
              <Loading content='blogs'/>:
              <Nothing content='articles' clearFunc={clearFilters}/>
            }
          </div>
        )}
      </section>
    </main>
  );
};

export default Blogs;