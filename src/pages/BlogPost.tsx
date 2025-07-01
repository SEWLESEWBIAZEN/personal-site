import { getBlogPost } from '@/lib/actions/blogs';
import { BlogProps } from '@/lib/interfaces';
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom';


const BlogPost = () => {
  const { slug } = useParams<{ slug: any }>();
  const [blog, setBlog] = useState<BlogProps>(null)


  useEffect(() => {
    const fetchBlog = async () => {
      const fetchedBlog = await getBlogPost(decodeURIComponent(slug))
      setBlog(fetchedBlog?.data)

    }
    fetchBlog();
  }, [])
  return (
    <main className="container-content py-16">
      {blog === null && (
        <div
          role="status"
          aria-live="polite"
          className="flex w-full h-full justify-center items-center"
        >
          <div className="text-center space-y-2">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]">
              <span className="sr-only">Loading...</span>
            </div>
            <p className="text-gray-600">Loading content...</p>
          </div>
        </div>
      )}
      <h2 className='flex flex-start'>{blog?.title}</h2>
      <div>
        <p className='my-6'>{blog?.excerpt}</p>
      </div>
      <div className=' flex flex-row flex-wrap gap-2 '>
        {blog?.tags?.map((tag: string) => {
          return (<p className='px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded-xl'>{tag}</p>)
        })}
      </div>
    </main>
  )
}
export default BlogPost;