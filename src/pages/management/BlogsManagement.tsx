import React, { useState, useEffect, useCallback } from "react";
import { format } from "date-fns";
import { Search, ThumbsUp, ThumbsDown, MessageCircle, MoreVertical, Eye, Trash2, ArrowRight, Plus, Edit } from "lucide-react";
import BlogViewerModal from "../../components/admin/BlogViewerModal.tsx";
import BlogEditorModal from "../../components/admin/BlogEditorModal.tsx";
import { ApiBlog, blogsApi } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";

// Dummy Data for fallback
const DUMMY_BLOGS: ApiBlog[] = [
    {
        id: 1,
        user_id: 101,
        title: "My Interview Experience at Google",
        description: "I recently interviewed for the L4 position at Google. The process consisted of 4 rounds focusing on DSA, System Design, and Behavioral questions. In the first round...",
        up_vote: 120,
        down_vote: 5,
        created_at: new Date().toISOString(),
        is_deleted: false,
        user_name: "John Doe",
        user_email: "john@example.com",
        tags: [{ id: 1, name: "Interview" }, { id: 2, name: "Google" }]
    },
    {
        id: 2,
        user_id: 102,
        title: "System Design: Scaling a Notification Service",
        description: "In this blog, I discuss how to scale a notification service to handle millions of users. We'll cover message queues, worker pools, and database choices...",
        up_vote: 85,
        down_vote: 2,
        created_at: new Date(Date.now() - 86400000).toISOString(),
        is_deleted: false,
        user_name: "Jane Smith",
        user_email: "jane@example.com",
        tags: [{ id: 3, name: "System Design" }, { id: 4, name: "Backend" }]
    },
    {
        id: 3,
        user_id: 103,
        title: "React Hooks Deep Dive",
        description: "Understanding useEffect, useMemo, and useCallback constraints and best practices. Common pitfalls and how to avoid infinite render loops...",
        up_vote: 200,
        down_vote: 10,
        created_at: new Date(Date.now() - 172800000).toISOString(),
        is_deleted: false,
        user_name: "React Fan",
        user_email: "fan@react.dev",
        tags: [{ id: 5, name: "React" }, { id: 6, name: "Frontend" }]
    }
];

const BlogsManagement = () => {
    const [blogs, setBlogs] = useState<ApiBlog[]>([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState("");
    const [selectedBlog, setSelectedBlog] = useState<ApiBlog | null>(null);
    const [isViewerOpen, setIsViewerOpen] = useState(false);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editorBlog, setEditorBlog] = useState<ApiBlog | null>(null); // Blog to edit, null for create

    const fetchBlogs = useCallback(async () => {
        setLoading(true);
        try {
            const response = await blogsApi.getAdminBlogs(1, 50, search); // Fetch up to 50 for now
            if (response.data && response.data.length > 0) {
                setBlogs(response.data);
            } else {
                // Fallback to dummy data if API returns empty (for testing/demo)
                const filtered = DUMMY_BLOGS.filter(b =>
                    b.title.toLowerCase().includes(search.toLowerCase()) ||
                    (b.user_name && b.user_name.toLowerCase().includes(search.toLowerCase()))
                );
                setBlogs(filtered);
            }
        } catch (error) {
            console.error("Failed to fetch blogs", error);
            toast.error("Failed to fetch blogs, loading demo data");
            // Fallback to dummy data on error
            const filtered = DUMMY_BLOGS.filter(b =>
                b.title.toLowerCase().includes(search.toLowerCase()) ||
                (b.user_name && b.user_name.toLowerCase().includes(search.toLowerCase()))
            );
            setBlogs(filtered);
        } finally {
            setLoading(false);
        }
    }, [search]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchBlogs();
        }, 500);
        return () => clearTimeout(timer);
    }, [fetchBlogs]);

    const handleView = (blog: ApiBlog) => {
        setSelectedBlog(blog);
        setIsViewerOpen(true);
    };

    const handleCreate = () => {
        setEditorBlog(null);
        setIsEditorOpen(true);
    };

    const handleEdit = (blog: ApiBlog) => {
        setEditorBlog(blog);
        setIsEditorOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this blog?")) return;
        try {
            await blogsApi.deleteAdminBlog(id);
            toast.success("Blog deleted successfully");
            fetchBlogs();
        } catch (error) {
            toast.error("Failed to delete blog");
        }
    };

    return (
        <div className="container mx-auto py-8 space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Blogs Management</h1>
                    <p className="text-muted-foreground mt-2">Manage, review, and moderate user blogs.</p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search blogs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 bg-card"
                        />
                    </div>
                    <Button onClick={handleCreate} className="gap-2">
                        <Plus className="w-4 h-4" /> Create Blog
                    </Button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
                </div>
            ) : blogs.length === 0 ? (
                <div className="text-center py-20 rounded-lg border bg-card/50 border-dashed">
                    <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                        <MessageCircle className="w-8 h-8 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium text-foreground mb-1">No blogs found</h3>
                    <p className="text-sm text-muted-foreground">Try adjusting your filters or create a new blog.</p>
                    <Button variant="link" onClick={handleCreate} className="mt-2 text-primary">
                        Create your first blog
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {blogs.map((blog) => (
                        <Card key={blog.id} className="group hover:shadow-md transition-all duration-300 border-border/60 hover:border-primary/50 cursor-pointer overflow-hidden" onClick={() => handleView(blog)}>
                            <CardHeader className="p-5 pb-3 space-y-3">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-2.5">
                                        <Avatar className="h-9 w-9 border border-border">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${blog.user_name}`} />
                                            <AvatarFallback>{blog.user_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-0.5">
                                            <p className="text-sm font-medium leading-none text-foreground">{blog.user_name}</p>
                                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                                {blog.created_at ? format(new Date(blog.created_at), "MMM d, yyyy") : "-"}
                                            </p>
                                        </div>
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-muted-foreground hover:text-foreground">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleView(blog); }}>
                                                <Eye className="mr-2 h-4 w-4" /> View
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleEdit(blog); }}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); handleDelete(blog.id); }} className="text-destructive focus:text-destructive">
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>

                                <CardTitle className="text-lg leading-tight group-hover:text-primary transition-colors line-clamp-2">
                                    {blog.title}
                                </CardTitle>
                            </CardHeader>

                            <CardContent className="p-5 pt-0 pb-4">
                                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-4">
                                    {blog.description}
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {blog.tags?.slice(0, 3).map(tag => (
                                        <Badge key={tag.id} variant="secondary" className="text-[10px] font-normal px-2 bg-secondary/50 hover:bg-secondary">
                                            {tag.name || ''}
                                        </Badge>
                                    ))}
                                    {(blog.tags?.length || 0) > 3 && (
                                        <Badge variant="outline" className="text-[10px] font-normal px-2">+{blog.tags!.length - 3}</Badge>
                                    )}
                                </div>
                            </CardContent>

                            <Separator className="bg-border/50" />

                            <CardFooter className="p-3 px-5 bg-muted/20 flex items-center justify-between text-muted-foreground">
                                <div className="flex items-center gap-4 text-xs font-medium">
                                    <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                        <ThumbsUp className="w-3.5 h-3.5" />
                                        {blog.up_vote || 0}
                                    </div>
                                    <div className="flex items-center gap-1.5 hover:text-foreground transition-colors">
                                        <ThumbsDown className="w-3.5 h-3.5" />
                                        {blog.down_vote || 0}
                                    </div>
                                </div>
                                <div className="flex items-center gap-1 text-xs text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                                    Read More <ArrowRight className="w-3 h-3" />
                                </div>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            {/* Viewer Modal */}
            <BlogViewerModal
                blog={selectedBlog}
                isOpen={isViewerOpen}
                onClose={() => setIsViewerOpen(false)}
            />

            {/* Editor Modal */}
            <BlogEditorModal
                blog={editorBlog}
                isOpen={isEditorOpen}
                onClose={() => setIsEditorOpen(false)}
                onSave={fetchBlogs}
            />
        </div>
    );
};

export default BlogsManagement;
