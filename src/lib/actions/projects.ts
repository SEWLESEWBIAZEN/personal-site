

import { Project } from "../interfaces";
import  supabase  from '../utils/supabase'


export const addProject= async(project:Project)=>{
  
  try{
    const { data, error } = await supabase
      .from('projects')
      .insert([
        {
          title: project.title,
          description: project.description,
          image: project.image,
          githubUrl: project.githubUrl,
          liveUrl: project.liveUrl,
          featured: project.featured,
          tags: project.tags
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
export const getAllProjects = async () => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*');  // Use .select() instead of .collect()
    return {
      error: null,
      data: data
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return {
      error: error.message,
      data: null
    };
  }
};

