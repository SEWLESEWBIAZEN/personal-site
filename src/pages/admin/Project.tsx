import { useState, FormEvent } from 'react';
import { Plus, X } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import { addProject } from '@/lib/actions/projects';
import { Project } from '@/lib/interfaces';
import storage from '@/lib/utils/supabase';

const AddProjectForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    placeholder: [] as string[],
    tags: [] as string[],
    liveUrl: '',
    githubUrl: '',
    featured: false,
    tagInput: '',
  });

  const [files, setFiles] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleInputChange =
    (field: keyof typeof formData) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    if (e.target.files?.length) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleUpload = async () => {
    if (!files.length) {
      setUploadError('Please select at least one file');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const uploadedUrls = await Promise.all(
        files.map(async (file) => {
          const fileName = `${Date.now()}-${file.name}`;
          const { data, error } = await storage.supabase.storage
            .from('images')
            .upload(`placeholder/${fileName}`, file);

          if (error) throw error;

          const {
            data: { publicUrl },
          } = storage.supabase.storage.from('images').getPublicUrl(data.path);

          return publicUrl;
        })
      );

      setFormData((prev) => ({ ...prev, placeholder: uploadedUrls }));
      toast.success('Images uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload images');
    } finally {
      setIsUploading(false);
      setFiles([]);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const newProject: Project = {
        title: formData.title,
        description: formData.description,
        liveUrl: formData.liveUrl,
        githubUrl: formData.githubUrl,
        featured: formData.featured,
        tags: formData.tags,
        image: formData.placeholder,
      };

      const { error } = await addProject(newProject);
      if (error) throw error;

      toast.success('Project added successfully!');
      resetForm();
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Submission error:', error);
      toast.error('Error occurred while adding new project!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      placeholder: [],
      tags: [],
      liveUrl: '',
      githubUrl: '',
      featured: false,
      tagInput: '',
    });
    setFiles([]);
    setUploadError(null);
  };

  const handleTagKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData.tagInput.trim()) {
      e.preventDefault();

      const newTag = formData.tagInput.trim();
      if (!formData.tags.includes(newTag)) {
        setFormData((prev) => ({
          ...prev,
          tags: [...prev.tags, newTag],
          tagInput: '',
        }));
      }
    }
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <button
          className="flex items-center gap-2 px-4 py-2 mb-4 md:mb-0 rounded text-slate-400 hover:bg-slate-50 hover:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-800"
        >
          <Plus size={16} />
          <span className="text-sm font-medium">Add Project</span>
        </button>
      </DialogTrigger>

      <DialogContent className="h-full overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogTitle>Add New Project</DialogTitle>
          <DialogDescription>
            Fill in the details to showcase your project.
          </DialogDescription>

          {/* Title */}
          <div className="flex flex-col gap-2 my-6">
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter title..."
              value={formData.title}
              onChange={handleInputChange('title')}
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2 my-6">
            <Label htmlFor="description">Description*</Label>
            <Input
              id="description"
              type="text"
              placeholder="Enter description..."
              value={formData.description}
              onChange={handleInputChange('description')}
              required
            />
          </div>

          {/* GitHub URL */}
          <div className="flex flex-col gap-2 my-6">
            <Label htmlFor="githubUrl">GitHub URL</Label>
            <Input
              id="githubUrl"
              type="url"
              placeholder="Enter GitHub URL..."
              value={formData.githubUrl}
              onChange={handleInputChange('githubUrl')}
            />
          </div>

          {/* Live URL */}
          <div className="flex flex-col gap-2 my-6">
            <Label htmlFor="liveUrl">Live URL</Label>
            <Input
              id="liveUrl"
              type="url"
              placeholder="Enter live project URL..."
              value={formData.liveUrl}
              onChange={handleInputChange('liveUrl')}
            />
          </div>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 items-center my-6">
            {formData?.tags?.map((tag, index) => (
              <span
                key={index}
                className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="ml-1 text-xs hover:text-red-500"
                >
                  <X size={14} />
                </button>
              </span>
            ))}

            {formData?.tags?.length > 1 && (
              <button
                type="button"
                className="text-xs ms-4 px-2 py-1 rounded hover:bg-slate-50"
                onClick={() => setFormData((prev) => ({ ...prev, tags: [] }))}
              >
                Clear all
              </button>
            )}

            <Input
              type="text"
              value={formData.tagInput}
              placeholder="Add tags (press Enter)..."
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, tagInput: e.target.value }))
              }
              onKeyDown={handleTagKeyDown}
              className="flex-1 min-w-[200px]"
            />
          </div>

          {/* Image Upload */}
          <div className="flex flex-col gap-2 my-6">
            <Label>Placeholder image</Label>
            <Input
              type="file"
              accept="image/*"
              multiple
              className="cursor-pointer"
              onChange={handleFileChange}
              disabled={isUploading}
            />

            {files?.length > 0 && (
              <div className="w-full flex justify-between items-center">
                <span className="text-sm text-muted-foreground">
                  {files?.length} file(s) selected
                </span>
                <button
                  type="button"
                  className="px-3 py-2 rounded hover:bg-slate-50 text-xs font-semibold"
                  onClick={handleUpload}
                  disabled={isUploading}
                >
                  {isUploading ? 'Uploading...' : 'Upload'}
                </button>
              </div>
            )}

            {uploadError && (
              <p className="text-xs text-red-500">{uploadError}</p>
            )}

            {formData?.placeholder?.length > 0 && (
              <div className="text-green-600 text-xs">
                {formData?.placeholder?.length} image(s) uploaded
              </div>
            )}
          </div>

          {/* Featured Switch */}
          <div className="flex items-center gap-2 my-6">
            <Switch
              id="featured-switch"
              checked={formData.featured}
              onCheckedChange={(checked) =>
                setFormData((prev) => ({ ...prev, featured: checked }))
              }
            />
            <Label htmlFor="featured-switch">Featured Project</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center">
            <button
              type="button"
              className="font-semibold"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddProjectForm;
