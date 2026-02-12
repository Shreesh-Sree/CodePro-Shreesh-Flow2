import { PrismaClient } from "@prisma/client";
import type { Blog, Tag, User, Vote } from "@prisma/client";

const prisma = new PrismaClient();

export interface BlogWithDetails {
    id: number;
    user_id: number;
    title: string;
    description: string | null;
    up_vote: number | null;
    down_vote: number | null;
    created_at: Date | null;
    is_deleted: boolean | null;
    user_name: string | null;
    user_email?: string | null;
    tags: { id: number; name: string | null }[];
}

export interface PaginatedResponse<T> {
    success: boolean;
    data: T[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

export class BlogService {
    /**
     * Get all blogs for admin with email search capability.
     * Includes functionality to view deleted blogs if needed, but defaults to active ones.
     */
    async getAdminBlogs(
        page: number = 1,
        limit: number = 10,
        search?: string,
        sort_by: "latest" | "oldest" | "most_upvoted" = "latest"
    ): Promise<PaginatedResponse<BlogWithDetails>> {
        const offset = (page - 1) * limit;

        // Build where clause
        let where: any = { is_deleted: false };

        if (search) {
            where = {
                ...where,
                OR: [
                    { title: { contains: search, mode: "insensitive" } },
                    { author: { email: { contains: search, mode: "insensitive" } } },
                    { author: { name: { contains: search, mode: "insensitive" } } },
                ],
            };
        }

        // Build order clause
        let orderBy: any = { created_at: "desc" };
        if (sort_by === "oldest") {
            orderBy = { created_at: "asc" };
        } else if (sort_by === "most_upvoted") {
            orderBy = { up_vote: "desc" };
        }


        // Get total count
        const total = await prisma.blog.count({ where });

        // Get blogs with user details including email
        const blogs = await prisma.blog.findMany({
            where,
            orderBy,
            skip: offset,
            take: limit,
            include: {
                author: { select: { name: true, email: true } },
                tags: { include: { tag: true } },
            },
        });

        // Map to admin response format
        const data: BlogWithDetails[] = blogs.map((blog) => ({
            id: blog.id,
            user_id: blog.user_id,
            title: blog.title,
            description: blog.description,
            up_vote: blog.up_vote,
            down_vote: blog.down_vote,
            created_at: blog.created_at,
            is_deleted: blog.is_deleted,
            user_name: blog.author.name,
            user_email: blog.author.email,
            tags: blog.tags.map((mapping) => ({
                id: mapping.tag.id,
                name: mapping.tag.name,
            })),
        }));

        return {
            success: true,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    /**
   * Get blog by ID with full details
   */
    async getBlogById(id: number): Promise<BlogWithDetails | null> {
        const blog = await prisma.blog.findUnique({
            where: { id },
            include: {
                author: { select: { name: true, email: true } },
                tags: { include: { tag: true } },
            },
        });

        if (!blog) {
            return null;
        }

        return {
            id: blog.id,
            user_id: blog.user_id,
            title: blog.title,
            description: blog.description,
            up_vote: blog.up_vote,
            down_vote: blog.down_vote,
            created_at: blog.created_at,
            is_deleted: blog.is_deleted,
            user_name: blog.author.name,
            user_email: blog.author.email,
            tags: blog.tags.map((mapping) => ({
                id: mapping.tag.id,
                name: mapping.tag.name,
            })),
        };
    }

    /**
     * Admin delete blog - can delete any blog regardless of ownership
     */
    async adminDeleteBlog(id: number): Promise<void> {
        const blog = await prisma.blog.findUnique({
            where: { id },
        });

        if (!blog) {
            throw new Error("Blog not found");
        }

        await prisma.blog.update({
            where: { id },
            data: {
                is_deleted: true,
            },
        });
    }
    /**
     * Create a new blog
     */
    async createBlog(
        userId: number,
        data: { title: string; description: string; tags: string[] }
    ): Promise<BlogWithDetails> {
        const { title, description, tags } = data;

        // Create or connect tags
        const tagConnects = await Promise.all(
            tags.map(async (tagName) => {
                const tag = await prisma.tag.upsert({
                    where: { name: tagName },
                    update: {},
                    create: { name: tagName },
                });
                return { tag_id: tag.id };
            })
        );

        const blog = await prisma.blog.create({
            data: {
                user_id: userId,
                title,
                description,
                tags: {
                    create: tagConnects,
                },
            },
            include: {
                author: { select: { name: true, email: true } },
                tags: { include: { tag: true } },
            },
        });

        return this.mapToBlogWithDetails(blog);
    }

    /**
     * Update an existing blog
     */
    async updateBlog(
        id: number,
        data: { title?: string; description?: string; tags?: string[] }
    ): Promise<BlogWithDetails> {
        const { title, description, tags } = data;

        const updateData: any = {};
        if (title !== undefined) updateData.title = title;
        if (description !== undefined) updateData.description = description;

        // Handle tags update if provided
        if (tags !== undefined) {
            // First, delete existing tag connections
            await prisma.blogTag.deleteMany({
                where: { blog_id: id },
            });

            // Create or connect new tags
            const tagConnects = await Promise.all(
                tags.map(async (tagName) => {
                    const tag = await prisma.tag.upsert({
                        where: { name: tagName },
                        update: {},
                        create: { name: tagName },
                    });
                    return { tag_id: tag.id };
                })
            );

            updateData.tags = {
                create: tagConnects,
            };
        }

        const blog = await prisma.blog.update({
            where: { id },
            data: updateData,
            include: {
                author: { select: { name: true, email: true } },
                tags: { include: { tag: true } },
            },
        });

        return this.mapToBlogWithDetails(blog);
    }

    private mapToBlogWithDetails(blog: any): BlogWithDetails {
        return {
            id: blog.id,
            user_id: blog.user_id,
            title: blog.title,
            description: blog.description,
            up_vote: blog.up_vote,
            down_vote: blog.down_vote,
            created_at: blog.created_at,
            is_deleted: blog.is_deleted,
            user_name: blog.author.name,
            user_email: blog.author.email,
            tags: blog.tags.map((mapping: any) => ({
                id: mapping.tag.id,
                name: mapping.tag.name,
            })),
        };
    }
}

export const blogService = new BlogService();
