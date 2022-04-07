import express from 'express';

const Images = express.Router();
const db = require('../../../shared/db/models');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

/**
 * Sends the image with the specified URL via the HTTP response.
 * @param res The HTTP response.
 * @param url The image url.
 */
const respondImage = async (res: any, url: string): Promise<void> => {
  try {
    const img = await db.Image.findOne({ where: { url: url } });
    if (!img)
      return res
        .status(404)
        .json({ title: 'image.notFound', msg: 'picture.notFound' });

    res.sendFile(img.filePath);
  } catch (error) {
    /* istanbul ignore next */
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
};

// ########################################################
// ######################### GET ##########################
// ########################################################

/**
 * Sends an image without authenticating user.
 */
Images.get('/public/:url', async (req: any, res: any) => {
  respondImage(res, req.params.url);
});

/**
 * Sends an image.
 */
Images.get('/:url', async (req: any, res: any) => {
  respondImage(res, req.params.url);
});

// ########################################################
// ######################### PUT ##########################
// ########################################################

// ########################################################
// ######################### POST #########################
// ########################################################

// ########################################################
// ######################## DELETE ########################
// ########################################################

export default Images;
