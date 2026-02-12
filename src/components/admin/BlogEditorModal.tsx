import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus } from "lucide-react";
import { ApiBlog, blogsApi } from "../../lib/api.ts";
import { toast } from "sonner"; // Assuming sonner is used for toasts

interface BlogEditorModalProps {
    blog?: ApiBlog | null; // If null, it's create mode
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void; // Trigger refresh on parent
}

const BlogEditorModal: React.FC<BlogEditorModalProps> = ({ blog, isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [tagInput, setTagInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (blog) {
                // Edit Mode
                setTitle(blog.title);
                setDescription(blog.description || "");
                setTags(blog.tags.map(t => t.name || "").filter(Boolean));
            } else {
                // Create Mode - Reset
                setTitle("");
                setDescription("");
                setTags([]);
            }
        }
    }, [isOpen, blog]);

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter" && tagInput.trim()) {
            e.preventDefault();
            if (!tags.includes(tagInput.trim())) {
                setTags([...tags, tagInput.trim()]);
            }
            setTagInput("");
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const handleSubmit = async () => {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }

        setLoading(true);
        try {
            if (blog) {
                // Update
                await blogsApi.update(blog.id, {
                    title,
                    description,
                    tags
                });
                toast.success("Blog updated successfully");
            } else {
                // Create
                await blogsApi.create({
                    title,
                    description,
                    tags
                });
                toast.success("Blog created successfully");
            }
            onSave();
            onClose();
        } catch (error: any) {
            toast.error(error.message || "Failed to save blog");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl bg-card border-border shadow-lg">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-foreground">
                        {blog ? "Edit Blog" : "Create New Blog"}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-5 py-2">
                    {/* Title */}
                    <div className="space-y-1.5">
                        <Label className="text-foreground">Title</Label>
                        <Input
                            placeholder="Enter blog title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="bg-background border-input focus-visible:ring-primary"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <Label className="text-foreground">Description</Label>
                        <Textarea
                            placeholder="Write your blog content here..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="min-h-[200px] bg-background border-input focus-visible:ring-primary resize-none"
                        />
                    </div>

                    {/* Tags */}
                    <div className="space-y-2">
                        <Label className="text-foreground">Tags</Label>
                        <div className="flex flex-wrap gap-2 mb-2">
                            {tags.map((tag) => (
                                <Badge key={tag} variant="secondary" className="px-2 py-1 gap-1">
                                    {tag}
                                    <X
                                        className="w-3 h-3 cursor-pointer hover:text-destructive"
                                        onClick={() => removeTag(tag)}
                                    />
                                </Badge>
                            ))}
                        </div>
                        <Input
                            placeholder="Type a tag and press Enter"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleAddTag}
                            className="bg-background border-input focus-visible:ring-primary"
                        />
                    </div>
                </div>

                <DialogFooter className="gap-2 sm:gap-0">
                    <Button variant="outline" onClick={onClose} disabled={loading} className="border-border text-foreground hover:bg-secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={loading} className="bg-primary text-primary-foreground hover:bg-primary/90">
                        {loading ? "Saving..." : (blog ? "Save Changes" : "Create Blog")}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BlogEditorModal;
