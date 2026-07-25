const { z } = require('zod');
const AppError = require('../utils/AppError');
const catchAsync = require('../utils/catchAsync');
const { sendSuccess } = require('../utils/response');
const disputeService = require('../services/disputeService');

function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new AppError(result.error.issues[0]?.message || 'Invalid request', 400, 'VALIDATION_ERROR');
  }
  return result.data;
}

const raiseDisputeSchema = z.object({
  reason: z.enum([
    'item_not_as_described',
    'item_arrived_damaged',
    'wrong_item_received',
    'item_not_received',
    'significantly_different',
  ]),
  description:     z.string().trim().min(20, 'Please provide at least 20 characters').max(500),
  evidence_photos: z.array(z.string().url()).max(5).optional(),
});

const sellerResponseSchema = z.object({
  response:               z.string().trim().min(10, 'Please provide at least 10 characters').max(2000),
  seller_evidence_photos: z.array(z.string().url()).max(5).optional(),
});

// POST /api/orders/:id/dispute
const raiseDispute = catchAsync(async (req, res) => {
  const { reason, description, evidence_photos } = validate(raiseDisputeSchema, req.body);
  const dispute = await disputeService.raiseDispute(req.params.id, req.user.id, {
    reason,
    description,
    evidencePhotos: evidence_photos ?? [],
  });
  sendSuccess(res, 201, { dispute });
});

// GET /api/disputes/:id
const getDisputeDetail = catchAsync(async (req, res) => {
  const dispute = await disputeService.getDisputeDetail(req.params.id, req.user.id);
  sendSuccess(res, 200, { dispute });
});

// POST /api/disputes/:id/respond
const submitSellerResponse = catchAsync(async (req, res) => {
  const { response, seller_evidence_photos } = validate(sellerResponseSchema, req.body);
  const dispute = await disputeService.submitSellerResponse(req.params.id, req.user.id, {
    response,
    sellerEvidencePhotos: seller_evidence_photos ?? [],
  });
  sendSuccess(res, 200, { dispute });
});

module.exports = { raiseDispute, getDisputeDetail, submitSellerResponse };
