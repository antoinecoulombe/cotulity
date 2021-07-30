import express from 'express';

const Images = express.Router();
const db = require('../db/models');

// ########################################################
// ##################### Middlewares ######################
// ########################################################

// ########################################################
// ################### Getters / Globals ##################
// ########################################################

// ########################################################
// ######################### GET ##########################
// ########################################################

Images.get('/profile', async (req: any, res: any) => {
  try {
    const img = await req.user.getImage();
    if (!img)
      res
        .status(404)
        .json({ title: 'image.notFound', msg: 'picture.notFound' });

    res.json({ url: img.url });
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
});

// Get all notifications linked to the connected user.
Images.get('/public/:url', async (req: any, res: any) => {
  try {
    const img = await db.Image.findOne({ where: { url: req.params.url } });
    if (!img)
      res
        .status(404)
        .json({ title: 'image.notFound', msg: 'picture.notFound' });

    res.sendFile(img.filePath);
  } catch (error) {
    console.log(error);
    res.status(500).json({ title: 'request.error', msg: 'request.error' });
  }
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
