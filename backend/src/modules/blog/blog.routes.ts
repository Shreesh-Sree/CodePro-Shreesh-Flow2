import express from "express";
import * as blogController from "./blog.controller.ts";
import { authenticate, authorize } from "../../middlewares/auth.middleware.ts";

const router = express.Router();

// Admin routes - protect with authorize
router.get("/admin/list", authenticate, authorize(['ADMIN', 'SUPERADMIN']), blogController.getAdminBlogs);
router.post("/", authenticate, authorize(['ADMIN', 'SUPERADMIN']), blogController.createBlog);
router.put("/:id", authenticate, authorize(['ADMIN', 'SUPERADMIN']), blogController.updateBlog);
router.get("/:id", authenticate, blogController.getBlogById); // Public/Student accessible view
router.delete("/admin/:id", authenticate, authorize(['ADMIN', 'SUPERADMIN']), blogController.deleteAdminBlog);

export default router;
