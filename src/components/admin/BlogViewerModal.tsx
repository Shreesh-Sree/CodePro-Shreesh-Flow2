import React, { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ThumbsUp, ThumbsDown, MessageCircle, Send, X, Calendar, User } from "lucide-react";
import { ApiBlog } from "../../lib/api.ts";

interface BlogViewerModalProps {
    blog: ApiBlog | null;
    isOpen: boolean;
    onClose: () => void;
}

// Dummy Comments
const DUMMY_COMMENTS = [
    {
        id: 1,
        user_name: "Alice Cooper",
        comment: "Great insights! This really helped me prepare.",
        created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: 2,
        user_name: "Bob Martin",
        comment: "Could you elaborate more on the system design round?",
        created_at: new Date(Date.now() - 7200000).toISOString()
    }
];

const BlogViewerModal: React.FC<BlogViewerModalProps> = ({ blog, isOpen, onClose }) => {
    const [newComment, setNewComment] = useState("");

    if (!blog) return null;

    const timeAgo = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        if (diffMins < 1) return "just now";
        if (diffMins < 60) return `${diffMins}m ago`;
        const diffHrs = Math.floor(diffMins / 60);
        if (diffHrs < 24) return `${diffHrs}h ago`;
        return format(date, "MMM d, yyyy");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0 bg-card border-border shadow-2xl rounded-xl overflow-hidden">
                {/* Header */}
                <div className="flex items-start justify-between px-6 py-5 border-b border-border bg-muted/20">
                    <div className="flex-1 pr-8">
                        <div className="flex items-center gap-2 mb-3">
                            {blog.tags?.map((tag) => (
                                <Badge key={tag.id} variant="secondary" className="px-2 py-0.5 text-xs font-medium bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                                    {tag.name}
                                </Badge>
                            ))}
                        </div>
                        <DialogTitle className="text-2xl font-bold text-foreground leading-tight tracking-tight">
                            {blog.title}
                        </DialogTitle>
                        <div className="flex items-center gap-4 mt-3 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <Avatar className="h-6 w-6 border border-border">
                                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${blog.user_name}`} />
                                    <AvatarFallback>{blog.user_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                </Avatar>
                                <span className="font-medium text-foreground">
                                    {blog.user_name}
                                </span>
                            </div>
                            <Separator orientation="vertical" className="h-4" />
                            <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>{blog.created_at ? format(new Date(blog.created_at), "MMM d, yyyy") : "Unknown Date"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Body */}
                <ScrollArea className="flex-1">
                    <div className="px-8 py-6 space-y-8">
                        {/* Description */}
                        <div className="prose prose-sm md:prose-base max-w-none text-foreground leading-relaxed whitespace-pre-wrap dark:prose-invert">
                            {blog.description}
                        </div>

                        {/* Interaction Bar */}
                        <div className="flex items-center justify-between pt-6 border-t border-border">
                            <div className="flex items-center gap-4">
                                <Button variant="outline" size="sm" className="gap-2 rounded-full h-9">
                                    <ThumbsUp className="w-4 h-4" />
                                    <span>{blog.up_vote || 0}</span>
                                </Button>
                                <Button variant="outline" size="sm" className="gap-2 rounded-full h-9">
                                    <ThumbsDown className="w-4 h-4" />
                                    <span>{blog.down_vote || 0}</span>
                                </Button>
                            </div>
                            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                                <MessageCircle className="w-4 h-4" />
                                {DUMMY_COMMENTS.length} Comments
                            </Button>
                        </div>

                        {/* Comments Section */}
                        <div className="space-y-6 pt-2">
                            <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                                Discussion
                            </h3>

                            {/* Add Comment */}
                            <div className="flex gap-4">
                                <Avatar className="h-9 w-9 border border-border">
                                    <AvatarFallback>ME</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-3">
                                    <Textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Add to the discussion..."
                                        rows={3}
                                        className="min-h-[80px] bg-background resize-none focus-visible:ring-primary"
                                    />
                                    <div className="flex justify-end">
                                        <Button size="sm" disabled={!newComment.trim()} className="gap-2">
                                            <Send className="w-3.5 h-3.5" /> Post Comment
                                        </Button>
                                    </div>
                                </div>
                            </div>

                            {/* Comment List */}
                            <div className="space-y-6">
                                {DUMMY_COMMENTS.map((c) => (
                                    <div key={c.id} className="flex gap-4 group">
                                        <Avatar className="h-9 w-9 border border-border">
                                            <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${c.user_name}`} />
                                            <AvatarFallback>{c.user_name?.substring(0, 2).toUpperCase()}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-sm font-medium text-foreground">{c.user_name}</span>
                                                <span className="text-xs text-muted-foreground">• {timeAgo(c.created_at)}</span>
                                            </div>
                                            <p className="text-sm text-muted-foreground leading-relaxed">{c.comment}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </ScrollArea>

                <DialogFooter className="px-6 py-4 border-t border-border bg-muted/20">
                    <Button variant="outline" onClick={onClose}>Close</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default BlogViewerModal;
