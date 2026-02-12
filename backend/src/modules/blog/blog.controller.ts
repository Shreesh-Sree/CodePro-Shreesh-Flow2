
import type { Request, Response } from "express";
import { blogService } from "./blog.service.ts";
import type { AuthRequest } from "../../middlewares/auth.middleware.ts";

export const getAdminBlogs = async (req: Request, res: Response): Promise<void> => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const search = (req.query.search as string) || undefined;
        const sort_by = (req.query.sort_by as "latest" | "oldest" | "most_upvoted") || "latest";

        const result = await blogService.getAdminBlogs(page, limit, search, sort_by);
        res.json(result);
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "Failed to fetch blogs";
        res.status(500).json({ error: errorMessage });
    }
};

export const getBlogById = async (req: Request, res: Response): Promise<void> => {
    try {
        const blogId = Number(req.params.id);

        if (!blogId || isNaN(blogId)) {
            res.status(400).json({ error: "Valid blog ID is required" });
            return;
        }

        const blog = await blogService.getBlogById(blogId);

        if (!blog) {
            res.status(404).json({ error: "Blog not found" });
            return;
        }

        res.json(blog);
    } catch (error: any) {
        const errorMessage =
            error instanceof Error ? error.message : "Failed to fetch blog";
        res.status(500).json({ error: errorMessage });
    }
};

export const deleteAdminBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const blogId = Number(req.params.id);
        if (!blogId || isNaN(blogId)) {
            res.status(400).json({ error: "Valid blog ID is required" });
            return;
        }

        await blogService.adminDeleteBlog(blogId);
        res.json({ success: true, message: "Blog deleted successfully" });
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "Failed to delete blog";

        if (errorMessage === "Blog not found") {
            res.status(404).json({ error: errorMessage });
            return;
        }

        res.status(500).json({ error: errorMessage });
    }
};

export const createBlog = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            res.status(401).json({ error: "Unauthorized" });
            return;
        }

        const { title, description, tags } = req.body;

        if (!title) {
            res.status(400).json({ error: "Title is required" });
            return;
        }

        const blog = await blogService.createBlog(userId, {
            title,
            description: description || "",
            tags: tags || [],
        });

        res.status(201).json(blog);
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "Failed to create blog";
        res.status(500).json({ error: errorMessage });
    }
};

export const updateBlog = async (req: Request, res: Response): Promise<void> => {
    try {
        const blogId = Number(req.params.id);
        if (!blogId || isNaN(blogId)) {
            res.status(400).json({ error: "Valid blog ID is required" });
            return;
        }

        const { title, description, tags } = req.body;

        const blog = await blogService.updateBlog(blogId, {
            title,
            description,
            tags,
        });

        res.json(blog);
    } catch (error: any) {
        const errorMessage = error instanceof Error ? error.message : "Failed to update blog";
        res.status(500).json({ error: errorMessage });
    }
};

