import path from 'path';
import * as Global from './Global';

const fs = require('fs');
const db = require('../../db/models');
const formidable = require('formidable');

const genericError = {
  success: false,
  title: 'request.error',
  msg: 'request.error',
};

/**
 * Removes the image with the specified id.
 * @param imageId The image id.
 * @param forceDelete A boolean indicating if the image should be soft or hard deleted.
 * If not specified, the image is soft deleted.
 * @returns A promise to return an object indicating whether the picture was deleted or not.
 */
export const remove = async (
  imageId: number,
  forceDelete?: boolean
): Promise<{ success: boolean; title: string; msg?: string }> => {
  try {
    const img = await db.Image.findOne({ where: { id: imageId } });
    if (!img)
      return {
        success: false,
        title: 'picture.couldNotDelete',
        msg: 'picture.notFound',
      };

    return await new Promise<any>((resolve, reject) => {
      fs.unlink(img.filePath, async (err: any) => {
        if (err) reject(genericError);

        await img.destroy({ force: forceDelete ?? false });
        resolve({ success: true, title: 'request.success' });
      });
    });
  } catch (error) {
    return genericError;
  }
};

/**
 * Saves an image received from an HTTP request and save it in the database.
 * @param req The HTTP request.
 * @param destPath The destination path.
 * @returns A promise to return an object indicating whether the picture was saved or not.
 * If it was saved, the sequelize image object is also returned.
 */
export const save = async (
  req: any,
  destPath: string
): Promise<{ success: boolean; title: string; msg?: string; image?: any }> => {
  try {
    // Check if the path exists
    if (!fs.existsSync(destPath))
      return {
        success: false,
        title: 'picture.couldNotUpload',
        msg: 'path.invalid',
      };

    // Create a random file name.
    var filename = Global.createToken();

    var form = new formidable.IncomingForm();
    await new Promise<void>((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        const file = files.file; // Get the image from form files
        const ext = path.extname(file.name); // Get the file extension
        filename += ext; // Add the extension to the random file name

        // Check if the extension is supported.
        const authorizedExtension = ['.jpg', '.jpeg', '.png', '.gif'];
        if (!authorizedExtension.includes(ext))
          return reject({
            success: false,
            title: 'picture.couldNotUpload',
            msg: 'picture.unsupportedExtension',
          });

        // Write the image
        var newpath = path.join(destPath, filename);
        fs.rename(file.path, newpath, (err: any) => {
          if (err) throw genericError;
        });
        resolve();
      });
    });

    // Insert image in the database
    const img = await db.Image.create({
      filePath: path.join(destPath, filename),
      url: Global.createToken(),
    });

    return { success: true, title: 'request.success', image: img };
  } catch (error) {
    return (error as any).title ? (error as any) : genericError;
  }
};
