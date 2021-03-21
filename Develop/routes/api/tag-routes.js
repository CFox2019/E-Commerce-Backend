const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findAll();
    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag, as: 'tag_products' }],
    });

    if (!tagData) {
      res.status(400).json({ message: 'No tag found with that id!' });
      return;
    }

    res.status(200).json(tagData);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  try {
    const tag = await Tag.create(req.body)

    // if there's tag products, we need to create pairings to bulk create in the ProductTag model
    if (req.body.productIds?.length) {
      const tagProductIdArr = req.body.productIds.map((product_id) => {
        return {
          product_id,
          tag_id: tag.id,
        };
      });
      await ProductTag.bulkCreate(tagProductIdArr);

      // re-fetch tag to get updated attributes
      const tagData = await Tag.findByPk(tag.id, {
        include: [{ model: Product, through: ProductTag, as: 'tag_products' }],
      });

      res.status(200).json(tagData)
    } else {
      // if no product tags, just respond
      res.status(200).json(tag);
    }
  } catch (err) {
    console.log(err);
    res.status(400).json(err);
  }
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  try {
    const tag = await Tag.update(req.body, { where: { id: req.params.id } });

    if (req.body.productIds?.length) {
      // find all associated tags from ProductTag
      const productTags = await ProductTag.findAll({ where: { tag_id: req.params.id } });

      // get list of current product_id
      const currentTagProductIds = productTags.map(({ product_id }) => product_id);

      // create filtered list of new product_ids
      const newProductTags = req.body.productIds
        .filter((product_id) => !currentTagProductIds.includes(product_id))
        .map((product_id) => {
          return {
            product_id,
            tag_id: req.params.id,
          };
        });

      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ product_id }) => !req.body.productIds.includes(product_id))
        .map(({ id }) => id);

      // run both actions
      await Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    }

    // re-fetch tag to get updated attributes
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product, through: ProductTag, as: 'tag_products' }],
    });

    res.json(tagData)
  } catch (err) {
    // console.log(err);
    res.status(400).json(err);
  }
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  try {
    const  tagData = await Tag.destroy({ where: { id: req.params.id } });
    if (!tagData) {
      res.status(400).json({ message: 'No tag found with that id!' });
      return;
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
