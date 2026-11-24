import { describe, it } from "node:test";
import assert from "node:assert/strict";
import mongoose from "mongoose";
import { protect, adminOnly } from "../middlewares/auth.js";
import quoteRouter from "../routes/quote.routes.js";
import enquiryRouter from "../routes/enquiry.routes.js";
import QuoteModel from "../models/quotes.model.js";
import EnquiryModel from "../models/enquiry.model.js";
import { updateQuoteStage } from "../controllers/quote.controller.js";
import { updateEnquiryStage } from "../controllers/enquiry.controller.js";

const CRM_STAGES = ["leads", "feasibility", "proposal", "construction", "completed"];

const createResponse = () => ({
  statusCode: 200,
  body: null,
  status(value) {
    this.statusCode = value;
    return this;
  },
  json(value) {
    this.body = value;
    return this;
  },
});

const findRoute = (router, path, method) =>
  router.stack.find((layer) => layer.route?.path === path && layer.route.methods[method])?.route;

describe("CRM stage persistence", () => {
  it("defaults quote and enquiry records to the same validated stage set", () => {
    for (const model of [QuoteModel, EnquiryModel]) {
      const stagePath = model.schema.path("crmStage");
      assert.equal(stagePath.defaultValue, "leads");
      assert.deepEqual(stagePath.enumValues, CRM_STAGES);
    }
  });

  it("protects both stage mutation routes with admin authentication", () => {
    for (const [router, path] of [
      [quoteRouter, "/stage/:id"],
      [enquiryRouter, "/stage/:id"],
    ]) {
      const route = findRoute(router, path, "patch");
      assert.ok(route, `Expected PATCH ${path} to exist`);
      assert.deepEqual(route.stack.slice(0, 2).map((layer) => layer.handle), [protect, adminOnly]);
    }
  });

  it("rejects malformed IDs and unsupported stages before querying MongoDB", async () => {
    const invalidIdResponse = createResponse();
    await updateQuoteStage(
      { params: { id: "not-an-object-id" }, body: { stage: "proposal" } },
      invalidIdResponse,
    );
    assert.equal(invalidIdResponse.statusCode, 400);

    const invalidStageResponse = createResponse();
    await updateEnquiryStage(
      {
        params: { id: new mongoose.Types.ObjectId().toString() },
        body: { stage: "won" },
      },
      invalidStageResponse,
    );
    assert.equal(invalidStageResponse.statusCode, 400);
  });

  it("persists valid quote and enquiry stages and returns the updated record", async () => {
    const fixtures = [
      [QuoteModel, updateQuoteStage],
      [EnquiryModel, updateEnquiryStage],
    ];

    for (const [model, controller] of fixtures) {
      const id = new mongoose.Types.ObjectId().toString();
      const original = model.findByIdAndUpdate;
      let call;
      model.findByIdAndUpdate = (...args) => {
        call = args;
        return {
          lean: async () => ({ _id: id, crmStage: args[1].$set.crmStage }),
        };
      };

      try {
        const response = createResponse();
        await controller(
          { params: { id }, body: { stage: "proposal" } },
          response,
        );
        assert.equal(response.statusCode, 200);
        assert.equal(response.body.data.crmStage, "proposal");
        assert.equal(call[0], id);
        assert.deepEqual(call[1], { $set: { crmStage: "proposal" } });
        assert.equal(call[2].runValidators, true);
        assert.equal(call[2].returnDocument, "after");
      } finally {
        model.findByIdAndUpdate = original;
      }
    }
  });
});
