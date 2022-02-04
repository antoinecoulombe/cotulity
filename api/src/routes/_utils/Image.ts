import path from 'path';
import * as Global from '../_utils/Global';

const fs = require('fs');
const db = require('../../../db/models');
const formidable = require('formidable');

const genericError = {
  success: false,
  title: 'request.error',
  msg: 'request.error',
};

export async function remove(
  id: number,
  force?: boolean
): Promise<{ success: boolean; title: string; msg?: string }> {
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
    console.log(error);
    return genericError;
  }
}

export async function save(
  req: any,
  pathFromImage?: string
): Promise<{ success: boolean; title: string; msg?: string; image?: any }> {
  try {
    let destination = path.join(__dirname, '../../../images/');
    if (pathFromImage) destination = path.join(destination, pathFromImage);

    var filename = await Global.createTokenAsync(4);

    var form = new formidable.IncomingForm();
    await new Promise<void>((resolve, reject) => {
      form.parse(req, (err: any, fields: any, files: any) => {
        const file = files.file;
        const ext = path.extname(file.name);
        filename += ext;

        const authorizedExtension = ['.jpg', '.jpeg', '.png', '.gif'];
        if (!authorizedExtension.includes(ext))
          reject({
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
    console.log(error);
    return (error as any).title ? (error as any) : genericError;
  }
}
