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
    <loc>${baseURL}/diseases/${record.EncodedName}</loc>
    <lastmod>${MySqlDate}</lastmod>
  </url>`;
}

createOtherNamesSitemapRecord = (record) => {
  return `
  <url>
    <loc>${baseURL}/diseases/${record.EncodedName}/OtherNames</loc>
    <lastmod>${MySqlDate}</lastmod>
  </url>`;
}

createAliasSitemapRecord = (record) => {
  return `
  <url>
    <loc>${baseURL}/diseases/${record.EncodedName}/OtherNames/${record.EncodedAlias}</loc>
    <lastmod>${MySqlDate}</lastmod>
  </url>`;
}

// setup for modern SSL
https.globalAgent.options.secureProtocol = 'TLSv1_2_method';

const SitemapFile = path.join('../', 'src', 'sitemap.xml');
let SiteMapData = '';

SiteMapData += '<?xml version="1.0" encoding="UTF-8"?>';
SiteMapData += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">';

{ // Main Records
  const MainDiseaseJsonFile = path.join('../', 'src/assets/', 'diseases.legacy.json');
  const data = fs.readFileSync(MainDiseaseJsonFile, 'utf8');
  const json = JSON.parse(data);

  json.records.forEach(record => {
    SiteMapData += createSitemapRecord(record);
    if(false) {
      SiteMapData += createOtherNamesSitemapRecord(record);
    }
  });
}

if (false) { // Alias Records
  const aliasDiseaseJsonFile = path.join('../', 'src/assets/', 'diseases.legacy.alias.json');
  const data = fs.readFileSync(aliasDiseaseJsonFile, 'utf8');
  const json = JSON.parse(data);

  json.alias.forEach(record => {
    SiteMapData += createAliasSitemapRecord(record);
  });
}

SiteMapData += '</urlset>';

fs.writeFileSync(SitemapFile, SiteMapData);
