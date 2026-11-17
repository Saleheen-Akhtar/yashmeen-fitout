import { test } from 'node:test';
import assert from 'node:assert/strict';
import WebDetailsModel from '../models/webDetails.model.js';
import { getWebDetails, getAdminWebDetails, updateWebDetails } from '../controllers/webDetails.controller.js';
import { DEFAULT_WEBSITE_CONTENT } from '../../../shared/siteContent.js';
import { logError } from '../utils/logger.js';
import webDetailsRouter from '../routes/webDetails.routes.js';
import { protect, adminOnly } from '../middlewares/auth.js';

const response = () => ({ code: 200, body: null, status(code) {this.code=code;return this;}, json(body) {this.body=body;return this;} });
test('private website details require authentication and administrator access', () => {
  const route=webDetailsRouter.stack.find(layer=>layer.route?.path==='/admin-details').route;
  assert.equal(route.methods.get,true);
  assert.deepEqual(route.stack.slice(0,2).map(layer=>layer.handle),[protect,adminOnly]);
});
test('website reads do not mutate the database; removals survive a fresh read', async () => {
  const findOne = WebDetailsModel.findOne, update = WebDetailsModel.findOneAndUpdate;
  let stored = null, writes = 0;
  try {
    WebDetailsModel.findOne = () => ({lean: async () => stored});
    WebDetailsModel.findOneAndUpdate = (_filter, mutation) => ({lean: async () => {
      writes++; stored ||= {};
      for(const [key,value] of Object.entries(mutation.$set)) {const parts=key.split('.');let target=stored;for(const part of parts.slice(0,-1))target=target[part] ||= {};target[parts.at(-1)]=value;}
      return stored;
    }});
    const first=response(); await getWebDetails({},first);
    assert.equal(writes,0); assert.equal(first.body.data.email,DEFAULT_WEBSITE_CONTENT.email);
    assert.equal(first.body.data.crmTasks, undefined);
    assert.equal(first.body.data.calendarEvents, undefined);
    const admin = response(); await getAdminWebDetails({}, admin);
    assert.deepEqual(admin.body.data.crmTasks, DEFAULT_WEBSITE_CONTENT.crmTasks);
    const saved=response();await updateWebDetails({body:{hero:{title:'Saved headline'},testimonials:[],processSteps:[],socialLinks:[]}},saved);
    assert.equal(saved.code,200);assert.equal(writes,1);
    const reread=response(); await getWebDetails({},reread);
    assert.deepEqual(reread.body.data.testimonials,[]);assert.deepEqual(reread.body.data.processSteps,[]);assert.deepEqual(reread.body.data.socialLinks,[]);
    assert.equal(reread.body.data.hero.title,'Saved headline');assert.equal(reread.body.data.hero.intro,DEFAULT_WEBSITE_CONTENT.hero.intro);
    const bad=response();await updateWebDetails({body:{socialLinks:[{platform:3,url:'https://example.com'}]}},bad);assert.equal(bad.code,400);assert.equal(writes,1);
  } finally {WebDetailsModel.findOne=findOne;WebDetailsModel.findOneAndUpdate=update;}
});
test('typed schema retains proof, FAQs, page content and an empty list', async () => {
  const document = new WebDetailsModel({...DEFAULT_WEBSITE_CONTENT,testimonials:[]});
  await document.validate(); const value=document.toObject();
  assert.deepEqual(value.testimonials,[]);
  assert.equal(value.services[0].disciplines[0].title,DEFAULT_WEBSITE_CONTENT.services[0].disciplines[0].title);
  assert.equal(value.pageCopy.About.interiors_built_around_how_you,DEFAULT_WEBSITE_CONTENT.pageCopy.About.interiors_built_around_how_you);
});
test('Mongoose update casting keeps dotted edits and empty lists without conflicting defaults', async () => {
  const original = WebDetailsModel.collection.findOneAndUpdate;
  let mutation;
  try {
    // Exercise the real query casting/defaults, without connecting to any database.
    WebDetailsModel.collection.findOneAndUpdate = async (_filter, update) => {
      mutation = update;
      return {hero:{title:'Saved'}, testimonials:[]};
    };
    const result = await WebDetailsModel.findOneAndUpdate({}, {$set:{'hero.title':'Saved',testimonials:[]}}, {returnDocument:'after',upsert:true,runValidators:true,setDefaultsOnInsert:true}).lean();
    assert.equal(result.hero.title,'Saved'); assert.deepEqual(result.testimonials,[]);
    assert.equal(mutation.$set['hero.title'],'Saved'); assert.deepEqual(mutation.$set.testimonials,[]);
    assert.equal(mutation.$setOnInsert?.hero,undefined); assert.equal(mutation.$setOnInsert?.testimonials,undefined);
    assert.ok(mutation.$setOnInsert?.services[0].disciplines[0].title);
  } finally {WebDetailsModel.collection.findOneAndUpdate=original;}
});
test('API logs exclude sensitive error messages and nested objects', () => {
  const original=console.error;const logs=[];console.error=line=>logs.push(line);
  try {logError('Fixture operation',Object.assign(new Error('mongodb://user:secret@host/customer'),{code:'ECONNREFUSED',data:{email:'customer@example.com'}}));}
  finally {console.error=original;}
  assert.deepEqual(JSON.parse(logs[0]),{level:'error',operation:'Fixture operation',type:'Error',code:'ECONNREFUSED'});
  assert.ok(!logs[0].includes('secret'));assert.ok(!logs[0].includes('customer'));
});
