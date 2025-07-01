import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { addBlog } from '@/lib/actions/blogs';
import { Blog } from '@/lib/interfaces';
import { Plus, X } from 'lucide-react';
import { FormEvent, useState } from 'react';
import { toast } from 'sonner';

const AddBlogForm = () => {
    const [formData, setFormData] = useState({
        title: '',
        excerpt: '',
        readTime: 0.00,
        tags: [] as string[],
        slug: '',
        inputValue: ''
    });   
   
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

       const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            const newBlog: Blog = {
                title: formData.title,
                excerpt: formData.excerpt,
                tags: formData.tags,
                slug: formData.slug,
                readTime: formData.readTime
            };

            const { data, error } = await addBlog(newBlog);

            if (error) throw error;

            toast.success("Blog Added Successfully!");
            resetForm();
            setIsDialogOpen(false);
            return {
                error: error?.message,
                data: data
            }
        } catch (error) {
            toast.error("Error occurred while adding new blog!");
            console.error('Submission error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setFormData({
            title: '',
            excerpt: '',
            tags: [],
            slug: '',
            readTime: 0.00,
            inputValue: ''
        });        
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
                    className='flex flex-row px-4 py-2 rounded text-nowrap mb-4 md:mb-0 
                    cursor-pointer items-center justify-end text-slate-400 hover:bg-slate-50 hover:text-slate-300 dark:hover:bg-slate-900 dark:hover:text-slate-800'
                >
                    <Plus />
                    <h2 className='text-[14px]'>Add Blog</h2>
                </button>
            </DialogTrigger>
            <DialogContent className='h-full overflow-y-auto'>
                <form onSubmit={handleSubmit}>
                    <DialogTitle>Add New Blog</DialogTitle>
                    <DialogDescription>New blogs here and viewers can have a look at it.</DialogDescription>

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

                    <div className="space-y-2 my-6">
                        <Label htmlFor="details-textarea">Details*</Label>
                        <Textarea
                            id="details-textarea"
                            name="excerpt"
                            placeholder="Enter details..."
                            value={formData.excerpt}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                excerpt: e.target.value
                            }))}
                            required
                            aria-required="true"
                            className="min-h-[100px]"
                        />
                    </div>
                    <div className='flex flex-col justify-start gap-2 my-6'>
                        <Label>Read Time</Label>
                        <Input
                            type='number'
                            placeholder='Enter length of read time...'
                            value={formData.readTime}
                            onChange={handleInputChange('readTime')}

                        />
                    </div>

                    <div className='flex flex-col justify-start gap-2 my-6'>
                        <Label>Blog Slug*</Label>
                        <Input
                            type='text'
                            placeholder='Enter slug...'
                            value={formData.slug}
                            onChange={handleInputChange('slug')}
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

                    <div className='flex flex-row w-full items-center justify-between'>
                        <button
                            type="button"
                            className='font-semibold'
                            onClick={() => setIsDialogOpen(false)}
                        >
                            Cancel
                        </button>
                        <Button type='submit' disabled={isSubmitting}>
                            {isSubmitting ? 'Adding...' : 'Add Blog'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default AddBlogForm;