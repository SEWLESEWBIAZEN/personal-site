
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Mail, MessageSquare, Send } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const ContactSection: React.FC = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      setFormData({ name: '', email: '', message: '' });
      toast({
        title: "Message sent",
        description: "Thanks for reaching out! I'll get back to you soon.",
      });
    }, 1000);
  };

  return (
    <section className="section bg-secondary/30" id="contact">
      <div className="container-content">
        <div className="max-w-2xl mx-auto">
          <h2 className="mb-2">Get in Touch</h2>
          <p className="text-muted-foreground mb-8">
            Have a question or want to work together? Drop me a message.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            <div>
              <div className="flex items-center mb-4">
                <div className="mr-4 p-3 rounded-full bg-primary text-primary-foreground">
                  <Mail size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Email</h3>
                  <a href="mailto:hello@example.com" className="text-muted-foreground hover:text-primary">
                    sewlesewbiazen65@gmail.com
                  </a>
                </div>
              </div>
              
              <div className="flex items-center">
                <div className="mr-4 p-3 rounded-full bg-primary text-primary-foreground">
                  <MessageSquare size={18} />
                </div>
                <div>
                  <h3 className="text-lg font-medium">Social</h3>
                  <p className="text-muted-foreground">
                    Find me on 
                    {/* <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Twitter</a> */}
                     or <a href="https://linkedin.com/in/sewlesew-biazen-sfd" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">LinkedIn</a>
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input 
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleChange}
                  required
                />
              </div>
              <Button 
                type="submit" 
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : (
                  <>
                    Send Message
                    <Send className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
