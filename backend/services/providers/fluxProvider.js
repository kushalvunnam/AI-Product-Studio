const submitFluxJob = async ({ prompt, referenceAsset, count }) => {
  throw new Error('PROVIDER_UNSUPPORTED_WORKFLOW: FLUX API lacks a robust product-preservation (inpainting) endpoint natively compatible with the flexible uploads required by this application.');
};

const checkFluxJob = async (jobId) => {
  throw new Error('PROVIDER_UNSUPPORTED_WORKFLOW');
};

module.exports = { submitFluxJob, checkFluxJob };
