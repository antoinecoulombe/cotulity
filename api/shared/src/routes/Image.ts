import { rejects } from 'assert';
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

export const remove = async (
  id: number,
  force?: boolean
): Promise<{ success: boolean; title: string; msg?: string }> => {
  try {
    const img = await db.Image.findOne({ where: { id: id } });
    if (!img)
      return {
        success: false,
        title: 'picture.couldNotDelete',
        msg: 'picture.notFound',
      };

    return await new Promise<any>((resolve, reject) => {
      fs.unlink(img.filePath, async (err: any) => {
        if (err) reject(genericError);

        await img.destroy({ force: force ?? false });
        resolve({ success: true, title: 'request.success' });
      });
    });
  } catch (error) {
    return genericError;
  }
};

export const save = async (
  req: any,
  destination: string
): Promise<{ success: boolean; title: string; msg?: string; image?: any }> => {
  try {
    if (!fs.existsSync(destination))
      return {
        success: false,
        title: 'picture.couldNotUpload',
        msg: 'path.invalid',
      };

    var filename = await Global.createTokenAsync(4);

    var form = new formidable.IncomingForm();
    await new Promise<void>((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        const file = files.file;
        const ext = path.extname(file.name);
        filename += ext;

        const authorizedExtension = ['.jpg', '.jpeg', '.png', '.gif'];
        if (!authorizedExtension.includes(ext))
          return reject({
            success: false,
            title: 'picture.couldNotUpload',
            msg: 'picture.unsupportedExtension',
          });

        var newpath = path.join(destination, filename);
        fs.rename(file.path, newpath, (err: any) => {
          if (err) throw genericError;
        });
        resolve();
      });
    });

    const img = await db.Image.create({
      filePath: path.join(destination, filename),
      url: Global.createToken(4),
    });

    return { success: true, title: 'request.success', image: img };
  } catch (error) {
    return (error as any).title ? (error as any) : genericError;
  }
};
