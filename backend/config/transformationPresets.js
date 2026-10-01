const transformationPresets = {
  instagram: {
    name: "Instagram Post",
    width: 1080,
    height: 1080,
    crop: "fill",
    gravity: "auto"
  },
  story: {
    name: "Instagram Story",
    width: 1080,
    height: 1920,
    crop: "fill",
    gravity: "auto"
  },
  website: {
    name: "Website Banner",
    width: 1920,
    height: 1080,
    crop: "fill",
    gravity: "auto"
  },
  advertisement: {
    name: "Advertisement",
    width: 1200,
    height: 628,
    crop: "fill",
    gravity: "auto"
  },
  productCard: {
    name: "Product Card",
    width: 800,
    height: 800,
    crop: "fill",
    gravity: "auto"
  }
};

module.exports = transformationPresets;
