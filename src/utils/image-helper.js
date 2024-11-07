import ExifParser from "exif-parser";
import fs from "fs";
import sharp from "sharp";

/**
 * Gets image metadata from the given file path
 * @param {string} imagePath - file path of the image
 * @return {object} - an object containing the image metadata
 * @property {string} format - image format
 * @property {number} width - image width
 * @property {number} height - image height
 * @property {number} space - image color space
 * @property {number} channels - number of color channels
 * @property {number} depth - image depth
 * @property {number} density - image resolution
 * @property {boolean} hasAlpha - whether the image has an alpha channel
 * @property {boolean} hasProfile - whether the image has an embedded color profile
 */
export async function getImageMetadata(imagePath) {
  try {
    const metadata = await sharp(imagePath).metadata();
    return {
      format: metadata.format,
      width: metadata.width,
      height: metadata.height,
      space: metadata.space,
      channels: metadata.channels,
      depth: metadata.depth,
      density: metadata.density,
      hasAlpha: metadata.hasAlpha,
      hasProfile: metadata.hasProfile,
    };
  } catch (error) {
    console.error("Error getting metadata:", error);
    return null;
  }
}

/**
 * Extracts EXIF data from a given image file path
 * @param {string} imagePath - file path of the image
 * @return {object} - an object containing the EXIF data
 * @property {string} make - camera make
 * @property {string} model - camera model
 * @property {string} dateTaken - date and time when the photo was taken
 * @property {number} iso - camera ISO
 * @property {number} fNumber - camera f-number
 * @property {number} exposureTime - camera exposure time (in seconds)
 * @property {number} focalLength - camera focal length (in mm)
 * @property {object} gps - GPS coordinates (latitude and longitude) if available
 */
export async function getExifData(imagePath) {
  try {
    const buffer = fs.readFileSync(imagePath);
    const parser = ExifParser.create(buffer);
    const result = parser.parse();
    return {
      make: result.tags.Make,
      model: result.tags.Model,
      dateTaken: result.tags.DateTimeOriginal,
      iso: result.tags.ISO,
      fNumber: result.tags.FNumber,
      exposureTime: result.tags.ExposureTime,
      focalLength: result.tags.FocalLength,
      gps: result.tags.GPSLatitude
        ? {
            latitude: result.tags.GPSLatitude,
            longitude: result.tags.GPSLongitude,
          }
        : null,
    };
  } catch (error) {
    console.error("Error parsing EXIF data:", error);
    return null;
  }
}

/**
 * Processes an image according to the given transformations
 * @param {Buffer} buffer - the image buffer
 * @param {Object} transformations - the transformations to apply
 * @param {Object} [transformations.resize] - resize options
 * @param {number} [transformations.resize.width] - the width to resize to
 * @param {number} [transformations.resize.height] - the height to resize to
 * @param {Object} [transformations.crop] - crop options
 * @param {number} [transformations.crop.x] - the x offset
 * @param {number} [transformations.crop.y] - the y offset
 * @param {number} [transformations.crop.width] - the width of the crop
 * @param {number} [transformations.crop.height] - the height of the crop
 * @param {number} [transformations.rotate] - the rotation angle (in degrees)
 * @param {Object} [transformations.filters] - filter options
 * @param {boolean} [transformations.filters.grayscale] - whether to apply a grayscale filter
 * @param {boolean} [transformations.filters.sepia] - whether to apply a sepia filter
 * @param {string} [transformations.format] - the output format
 * @return {Promise<Buffer>} - the processed image buffer
 */
export async function processImage(buffer, transformations, filename) {
  let image = sharp(buffer);

  if (transformations.resize) {
    image = image.resize(
      transformations.resize.width,
      transformations.resize.height
    );
  }

  if (transformations.crop) {
    image = image.extract(transformations.crop);
  }

  if (transformations.rotate) {
    image = image.rotate(transformations.rotate);
  }

  if (transformations.format) {
    image = image.toFormat(transformations.format);
  }

  if (transformations.filters) {
    if (transformations.filters.grayscale) {
      image = image.grayscale();
    }
    if (transformations.filters.sepia) {
      image = image.sepia();
    }
  }

  const outputPath = `./public/temp/${filename}`;

  // Save the processed image
  await image.toFile(outputPath);

  // Read the processed image
  // const base64Image = fs.readFileSync(outputPath, { encoding: "base64" });

  // const ImageBuffer = await image.toBuffer();

  // // Convert the buffer to base64
  // const base64Image = ImageBuffer.toString("base64");

  return outputPath;
}
