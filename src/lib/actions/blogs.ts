
import { Blog, BlogProps } from "../interfaces";
import supabase from "../utils/supabase";


export const addBlog= async(blog:Blog)=>{
 
  try{
    const { data, error } = await supabase
      .from('blogs')
      .insert([
        {
          title: blog.title,
          excerpt: blog.excerpt,
          slug: blog.slug,
          readTime: blog.readTime,          
          tags: blog.tags
        }
      ])
      return {data,error};
  }
  catch(error){
    return{
      error:error,
      data:null
    }
  }

}

export const getAllBlogs = async () => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*'); 
    if (error) throw error;

    return {
      error: null,
      data: data
    };
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return {
      error: error.message,
      data: null
    };
  }
};


export const getBlogPost = async (slug: string): Promise<{
  error: string | null;
  data: BlogProps | null;
}> => {
  try {
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('slug', slug)  // Correct filter syntax
      .single();        // Get single record

    if (error) throw error;
    if (!data) throw new Error('Blog post not found');

    return {
      error: null,
      data: data
    };
  } catch (error) {
    console.error('Error fetching blog post:', error);
    return {
      error: error instanceof Error ? error.message : 'Unknown error',
      data: null
    };
  }
};