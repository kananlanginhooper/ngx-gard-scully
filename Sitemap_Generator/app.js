#!/usr/bin/env node

const fs = require('fs');
const https = require('https');
const path = require('path');

function Encode(str) {
  if (str === undefined) {
    return '';
  } else {
    const Encode1 = encodeURI(str.replace(/ /g, '_').replace(/:/g, '_').replace(/\//g, '_'));

    if (Encode1 === undefined) {
      console.error('!!! Encode - Undefined');
      return '';
    } else if (!Encode1) {
      console.error('!!! Encode - == false');
      return '';
    } else {
      return Encode1.replace('%E2%80%93', '');
    }
  }
}

async function wait(DelayInMs) {
  return new Promise((resolve) => {
    setTimeout(() => resolve(), DelayInMs)
  })
}

const baseURL = 'https://gard.ci.ncats.io';

const MySqlDate = new Date().toISOString().split('T')[0];

createSitemapRecord = (record) => {
  return `
  <url>
    <loc>${baseURL}/diseases/${record.diseaseId}</loc>
    <lastmod>${MySqlDate}</lastmod>
  </url>`;
}

// setup for modern SSL
https.globalAgent.options.secureProtocol = 'TLSv1_2_method';

const MainDiseaseJsonFile = path.join('../', 'src/assets/', 'diseases.legacy.json');
const data = fs.readFileSync(MainDiseaseJsonFile, 'utf8');
const json = JSON.parse(data);
const SitemapFile = path.join('../', 'src/assets/', 'sitemap.xml');
let SiteMapData = '';

SiteMapData += '<?xml version="1.0" encoding="UTF-8"?>';
SiteMapData += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

json.records.forEach(record => {
  SiteMapData += createSitemapRecord(record);
})

SiteMapData += '</urlset>';

fs.writeFileSync(SitemapFile, SiteMapData);
