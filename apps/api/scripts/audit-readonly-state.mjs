// Read-only inspection. No model save, update, migration or external writes.
import '../config/env.js';
import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import dns from 'node:dns';
import { API_ROOT, getMissingProductionEnv } from '../config/env.js';
import WebDetails from '../models/webDetails.model.js';
import Project from '../models/project.model.js';
import Gallery from '../models/gallery.model.js';
import Post from '../models/post.model.js';
import Vacancy from '../models/vacancy.model.js';
import Banner from '../models/banner.model.js';
import Popup from '../models/popup.model.js';
import Account from '../models/account.model.js';
import { mergeWebsiteContent, publicWebsiteContent } from '../../../shared/siteContent.js';
import { sanitizeBlogHtml, blogTextContent } from '../utils/sanitizeBlogHtml.js';

const repoRoot = path.resolve(API_ROOT, '../..');
const output = path.join(API_ROOT, 'migration-output');
const generatedAt = new Date().toISOString();
try {
  dns.setServers(['8.8.8.8','1.1.1.1']);
  await mongoose.connect(process.env.MONGO_URI, {serverSelectionTimeoutMS:15000,connectTimeoutMS:10000});
  const [webDetails, projects, gallery, posts, vacancies, banners, popups, legacyAccounts] = await Promise.all([
    WebDetails.findOne().lean(), Project.find({}).lean(), Gallery.find({}).lean(), Post.find({}).lean(),
    Vacancy.find({}).lean(), Banner.find({}).lean(), Popup.find({}).lean(), Account.countDocuments({isVerified:{$exists:false}}),
  ]);
  const publicContent = publicWebsiteContent(mergeWebsiteContent(webDetails));
  const snapshot = {generatedAt,webDetails:publicContent,projects,posts:posts.filter(post=>post.status===true),gallery,vacancies,banners,popups};
  await fs.mkdir(output,{recursive:true});
  await fs.writeFile(path.join(output,'cms-readonly-snapshot.json'),JSON.stringify(snapshot,null,2));
  const cmsText = JSON.stringify({webDetails,projects,gallery,posts,vacancies,banners,popups});
  const assets = await fs.readdir(path.join(repoRoot,'apps/web/public/static'));
  const report = {
    generatedAt, connected:true, missingProductionEnv:getMissingProductionEnv(),
    counts:{projects:projects.length,gallery:gallery.length,posts:posts.length,vacancies:vacancies.length,banners:banners.length,popups:popups.length,legacyAccounts},
    postsNeedingSanitization:posts.filter(post=>sanitizeBlogHtml(post.content)!==String(post.content||'')).length,
    publishedUnreadablePosts:posts.filter(post=>post.status===true&&!blogTextContent(sanitizeBlogHtml(post.content))).length,
    cmsStaticReferences:assets.filter(name=>cmsText.includes(`/static/${name}`)),
    snapshot:'apps/api/migration-output/cms-readonly-snapshot.json',
  };
  await fs.writeFile(path.join(repoRoot,'audit/cms-readonly-status-2026-11-17.json'),JSON.stringify(report,null,2));
  console.log(JSON.stringify(report));
} catch(error) {
  // Error messages may contain connection credentials.
  console.error(JSON.stringify({connected:false,type:error.name,code:error.code||null}));
  process.exitCode=1;
} finally {await mongoose.disconnect();}
