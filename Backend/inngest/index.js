import { Inngest } from "inngest";
import prisma from "../configs/prisma.js";

// Create a client to send and receive events
export const inngest = new Inngest({ id: "project-management" });

/* ---------------------- USER EVENTS ---------------------- */

// Inngest function to save user data to the database
const syncUserCreation = inngest.createFunction(
  { id: "sync-user-from-clerk" },
  { event: "clerk/user.created" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.create({
      data: {
        id: data.id,
        email: data?.email_addresses?.[0]?.email_address || null,
        name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
        image: data?.image_url || null,
      },
    });

    return { message: "User created successfully", userId: data.id };
  }
);

// Inngest function to delete user from the database
const syncUserDeletion = inngest.createFunction(
  { id: "delete-user-with-clerk" },
  { event: "clerk/user.deleted" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.delete({
      where: { id: data.id },
    });

    return { message: "User deleted successfully", userId: data.id };
  }
);

// Inngest function to update user data in the database
const syncUserUpdation = inngest.createFunction(
  { id: "update-user-from-clerk" },
  { event: "clerk/user.updated" },
  async ({ event }) => {
    const { data } = event;

    await prisma.user.update({
      where: { id: data.id },
      data: {
        email: data?.email_addresses?.[0]?.email_address || null,
        name: `${data?.first_name || ""} ${data?.last_name || ""}`.trim(),
        image: data?.image_url || null,
      },
    });

    return { message: "User updated successfully", userId: data.id };
  }
);

/* ---------------------- WORKSPACE EVENTS ---------------------- */

// Inngest function to save workspace data to the database
const syncWorkspaceCreation = inngest.createFunction(
  { id: "sync-workspace-from-clerk" },
  { event: "clerk/organization.created" },
  async ({ event }) => {
    const { data } = event;

    await prisma.workspace.create({
      data: {
        id: data.id,
        name: data.name,
        slug: data.slug,
        ownerId: data.created_by,
        image_url: data.image_url,
      },
    });

    // Add creator as ADMIN member
    await prisma.workspaceMember.create({
      data: {
        userId: data.created_by, // ✅ corrected field name
        workspaceId: data.id,
        role: "ADMIN",
      },
    });

    return { message: "Workspace created successfully", workspaceId: data.id };
  }
);

// Inngest function to update workspace data in the database
const syncWorkspaceUpdation = inngest.createFunction(
  { id: "update-workspace-from-clerk" }, // ✅ corrected typo in id
  { event: "clerk/organization.updated" },
  async ({ event }) => {
    const { data } = event;

    await prisma.workspace.update({
      where: { id: data.id },
      data: {
        name: data.name,
        slug: data.slug,
        image_url: data.image_url,
      },
    });

    return { message: "Workspace updated successfully", workspaceId: data.id };
  }
);

// Inngest function to delete workspace from the database
const syncWorkspaceDeletion = inngest.createFunction(
  { id: "delete-workspace-with-clerk" },
  { event: "clerk/organization.deleted" },
  async ({ event }) => {
    const { data } = event;

    await prisma.workspace.delete({
      where: { id: data.id },
    });

    return { message: "Workspace deleted successfully", workspaceId: data.id };
  }
);

// Inngest function to save workspace member data to the database
const syncWorkspaceMemberCreation = inngest.createFunction(
  { id: "sync-workspace-member-from-clerk" },
  { event: "clerk/organizationInvitation.accepted" },
  async ({ event }) => {
    const { data } = event;

    await prisma.workspaceMember.create({
      data: {
        userId: data.user_id,
        workspaceId: data.organization_id,
        role: String(data.role_name || "MEMBER").toUpperCase(),
      },
    });

    return { message: "Workspace member added successfully", userId: data.user_id };
  }
);

/* ---------------------- EXPORT ALL FUNCTIONS ---------------------- */

export const functions = [
  syncUserCreation,
  syncUserDeletion,
  syncUserUpdation,
  syncWorkspaceCreation,
  syncWorkspaceUpdation,
  syncWorkspaceDeletion,
  syncWorkspaceMemberCreation,
];
