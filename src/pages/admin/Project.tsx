import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { addProject } from '@/lib/actions/projects';
import { Project } from '@/lib/interfaces';
import supabase from '@/lib/utils/supabase';
import { Plus, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

const AddProjectForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        placeholder: [] as string[],
        tags: [] as string[],
        liveUrl: '',
        githubUrl: '',
        featuredValue: 0,
        inputValue: '',
    });
    const [files, setFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setUploadError(null);
        if (e.target.files?.length) {
            setFiles(Array.from(e.target.files));
        }
    };
    const handleUpload = async () => {
        if (files.length === 0) {
            setUploadError('Please select files');
            return;
        }
        setIsUploading(true);
        setUploadError(null);
        try {
            const uploadPromises = files.map(async (file) => {
                const fileName = `${Date.now()}-${file.name}`;
                const { data, error } = await supabase.storage
                    .from('images')
                    .upload(`placeholder/${fileName}`, file);
                if (error) throw error;
                const { data: { publicUrl } } = supabase.storage
                    .from('images')
                    .getPublicUrl(data.path);
                return publicUrl;
            });
            const uploadedUrls = await Promise.all(uploadPromises);
            // Store all URLs if needed
            setFormData(prev => ({ ...prev, placeholder: uploadedUrls }));
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
                featured: formData.featuredValue === 1,
                tags: formData.tags,
                image: formData.placeholder
            };
            const { data, error } = await addProject(newProject);
            if (error) throw error;
            toast.success("Project Added Successfully!");
            resetForm();
            setIsDialogOpen(false);
        } catch (error) {
            toast.error("Error occurred while adding new project!");
            console.error('Submission error:', error);
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
            featuredValue: 0,
            inputValue: '',
        });
        setFiles([]);
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && formData.inputValue.trim()) {
            e.preventDefault();
            if (!formData.tags.includes(formData.inputValue.trim())) {
                setFormData(prev => ({
                    ...prev,
                    tags: [...prev.tags, formData.inputValue.trim()],
                    inputValue: ""
                }));
            }
        }
    };
    const handleInputChange = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, [field]: e.target.value }));
    };
    return (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
                <button
                    className='flex flex-row px-4 py-2 rounded text-nowrap mb-4 md:mb-0 cursor-pointer items-center justify-end text-slate-400 hover:bg-slate-50 hover:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-800'
                >
                    <Plus />
                    <h2 className='text-[14px]'>Add Project</h2>
                </button>
            </DialogTrigger>
            <DialogContent className='h-full overflow-y-auto'>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Add New Project</DialogTitle>
                    <DialogDescription>New projects here and viewers can have a look at it.</DialogDescription>

                    <div className='flex flex-col justify-start gap-2 my-6'>
                        <Label>Title*</Label>
                        <Input
                            type='text'
                            placeholder='Enter title...'
                            value={formData.title}
                            onChange={handleInputChange('title')}
                            required
                        />
                    </div>
                    <div className='flex flex-col justify-start gap-2 my-6'>
                        <Label>Description*</Label>
                        <Input
                            type='text'
                            placeholder='Enter description...'
                            value={formData.description}
                            onChange={handleInputChange('description')}
                            required
                        />
                    </div>
                    <div className='flex flex-col justify-start gap-2 my-6'>
                        <Label>Github URL</Label>
                        <Input
                            type='url'
                            placeholder='Enter GitHub URL...'
                            value={formData.githubUrl}
                            onChange={handleInputChange('githubUrl')}
                        />
                    </div>
                    <div className='flex flex-col justify-start gap-2 my-6'>
                        <Label>Live URL</Label>
                        <Input
                            type='url'
                            placeholder='Enter live URL...'
                            value={formData.liveUrl}
                            onChange={handleInputChange('liveUrl')}
                        />
                    </div>
                    <div className="flex flex-wrap gap-2 items-center my-6">
                        {formData.tags.map((tag, index) => (
                            <span key={index} className="bg-gray-200 px-2 py-1 rounded-full text-sm flex items-center">
                                {tag}
                                <button
                                    type="button"
                                    onClick={() => setFormData(prev => ({
                                        ...prev,
                                        tags: prev.tags.filter((_, i) => i !== index)
                                    }))}
                                    className="ml-1 text-xs hover:text-red-500"
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                        {formData.tags.length > 1 && (
                            <button
                                type="button"
                                className='text-[12px] font-normal ms-4 px-2 py-1 rounded hover:bg-slate-50'
                                onClick={() => setFormData(prev => ({ ...prev, tags: [] }))}
                            >
                                Clear all
                            </button>
                        )}
                        <Input
                            type="text"
                            value={formData.inputValue}
                            placeholder="Add tags (press Enter)..."
                            onChange={(e) => setFormData(prev => ({ ...prev, inputValue: e.target.value }))}
                            onKeyDown={handleKeyDown}
                            className="flex-1 min-w-[200px]"
                        />
                    </div>
                    <div className='flex flex-col justify-start items-start gap-2 my-6'>
                        <Label>Placeholder image</Label>
                        <Input
                            type='file'
                            accept='image/*'
                            multiple
                            className='cursor-pointer'
                            onChange={handleFileChange}
                            disabled={isUploading}
                        />
                        {files.length > 0 && (
                            <div className='w-full flex justify-between items-center'>
                                <span className='text-sm text-muted-foreground'>
                                    {files.length} file(s) selected
                                </span>
                                <button
                                    type="button"
                                    className='px-3 py-2 rounded hover:bg-slate-50 text-[12px] font-semibold'
                                    onClick={handleUpload}
                                    disabled={isUploading}
                                >
                                    {isUploading ? 'Uploading...' : 'Upload'}
                                </button>
                            </div>
                        )}
                        {uploadError && (
                            <p className='text-xs text-red-500'>{uploadError}</p>
                        )}
                        {formData.placeholder && (
                            <div className='text-green-600 text-[12px]'>Image uploaded!</div>
                        )}
                    </div>
                    <div className='flex items-center gap-2 my-6'>
                        <Switch
                            id="featured-switch"
                            checked={formData.featuredValue === 1}
                            onCheckedChange={(checked) => setFormData(prev => ({
                                ...prev,
                                featuredValue: checked ? 1 : 0
                            }))}
                        />
                        <Label htmlFor="featured-switch">Featured Project</Label>
                    </div>
                    <div className='flex flex-row w-full items-center justify-between'>
                        <button
                            type="button"
                            className='font-semibold'
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancel
                        </button>
                        <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Project'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};
export default AddProjectForm;