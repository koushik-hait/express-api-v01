import { eq, and } from "drizzle-orm";
import db from "../db/index.js";
import { settings } from "../db/schema/index.js";
import { asyncHandler, NotFoundError, ConflictError } from "../utils/errors.js";
import { sendSuccess, sendCreated, sendNoContent } from "../utils/response.js";

/**
 * @desc    Get all settings
 * @route   GET /api/v1/settings
 * @access  Private/Admin
 */
export const getSettings = asyncHandler(async (req, res) => {
  const { group } = req.query;

  const whereClause = group ? eq(settings.group, group) : undefined;

  const settingsList = await db.select().from(settings).where(whereClause);

  // Group settings by group
  const grouped = settingsList.reduce((acc, setting) => {
    if (!acc[setting.group]) {
      acc[setting.group] = {};
    }
    acc[setting.group][setting.key] = {
      value: setting.value,
      type: setting.type,
      description: setting.description,
    };
    return acc;
  }, {});

  sendSuccess(res, grouped, "Settings fetched successfully");
});

/**
 * @desc    Get single setting
 * @route   GET /api/v1/settings/:group/:key
 * @access  Private/Admin
 */
export const getSetting = asyncHandler(async (req, res) => {
  const { group, key } = req.params;

  const [setting] = await db
    .select()
    .from(settings)
    .where(and(eq(settings.group, group), eq(settings.key, key)))
    .limit(1);

  if (!setting) {
    throw new NotFoundError("Setting");
  }

  sendSuccess(res, setting, "Setting fetched successfully");
});

/**
 * @desc    Create or update setting
 * @route   POST /api/v1/settings
 * @access  Private/Admin
 */
export const upsertSetting = asyncHandler(async (req, res) => {
  const { group, key, value, type, description } = req.body;

  const [existing] = await db
    .select()
    .from(settings)
    .where(and(eq(settings.group, group), eq(settings.key, key)))
    .limit(1);

  let setting;
  if (existing) {
    [setting] = await db
      .update(settings)
      .set({
        value,
        type: type || existing.type,
        description:
          description !== undefined ? description : existing.description,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(settings.id, existing.id))
      .returning();

    sendSuccess(res, setting, "Setting updated successfully");
  } else {
    [setting] = await db
      .insert(settings)
      .values({
        group,
        key,
        value,
        type: type || "string",
        description,
      })
      .returning();

    sendCreated(res, setting, "Setting created successfully");
  }
});

/**
 * @desc    Delete setting
 * @route   DELETE /api/v1/settings/:group/:key
 * @access  Private/Admin
 */
export const deleteSetting = asyncHandler(async (req, res) => {
  const { group, key } = req.params;

  const [existing] = await db
    .select()
    .from(settings)
    .where(and(eq(settings.group, group), eq(settings.key, key)))
    .limit(1);

  if (!existing) {
    throw new NotFoundError("Setting");
  }

  await db.delete(settings).where(eq(settings.id, existing.id));

  sendNoContent(res);
});

/**
 * @desc    Get public settings
 * @route   GET /api/v1/settings/public
 * @access  Public
 */
export const getPublicSettings = asyncHandler(async (req, res) => {
  const publicSettings = await db
    .select()
    .from(settings)
    .where(eq(settings.group, "public"));

  const settingsObj = publicSettings.reduce((acc, s) => {
    acc[s.key] = s.value;
    return acc;
  }, {});

  sendSuccess(res, settingsObj, "Public settings fetched");
});
