const express = require('express');
const axios = require('axios');
const parseString = require('xml2js').parseString;
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Rss feeds 
let customFeeds = [];

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors());

// Fetch RSS feed
app.get('/', async (req, res) => {
  try {
    const rssURL = 'https://flipboard.com/@raimoseero/feed-nii8kd0sz.rss';
    const xmlContent = await fetchRSSFeed(rssURL);
    const parsedXML = await parseXML(xmlContent);

    // Process parsed XML data
    const response = await combineData(parsedXML);
    res.json(response);

  } catch (error) {
    res.status(500).send('Error fetching or parsing RSS feed.');
  }
});


// Mercury API parsing
async function mercury(articleURL) {
  const mercuryAPIURL = 'https://uptime-mercury-api.azurewebsites.net/webparser';

  try {
    const response = await fetch(mercuryAPIURL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: articleURL })
    });
    const data = await response.json();
    return data;
  } catch (error) {
    throw new Error('Error fetching data from Mercury API.');
  }
}

// fetch feed by 

// Add custom RSS feed
app.post('/addFeed', (req, res) => {
  const { feedURL } = req.body;
  if (feedURL) {
    customFeeds.push(feedURL);
    res.status(201).send('Custom feed added successfully.');
  } else {
    res.status(400).send('Please provide a valid feed URL.');
  }
});

// Remove custom RSS feed
app.delete('/removeFeed', (req, res) => {
  const { feedURL } = req.body;
  if (feedURL) {
    customFeeds = customFeeds.filter(feed => feed !== feedURL);
    res.status(200).send('Custom feed removed successfully.');
  } else {
    res.status(400).send('Please provide a valid feed URL.');
  }
});

// Fetch content from the custom RSS feeds
app.get('/customFeeds', async (req, res) => {
  try {
    const processedCustomFeeds = await processCustomFeeds(customFeeds);
    res.json(processedCustomFeeds);
  } catch (error) {
    res.status(500).send('Error fetching or parsing custom RSS feed.');
  }
});

// Parse the provided XML content
async function parseXML(xmlContent) {
  return new Promise((resolve, reject) => {
    parseString(xmlContent, (err, result) => {
      if (err) {
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// Fetch the provided RSS feed
async function fetchRSSFeed(url) {
  const response = await fetch(url);
  return await response.text();
}

// Process custom feeds
async function processCustomFeeds(customFeeds) {
  const processedCustomFeeds = [];
  for (let feedURL of customFeeds) {
    try {
      const xmlContent = await fetchRSSFeed(feedURL);
      const parsedXML = await parseXML(xmlContent);
      const urls = extractURLs(parsedXML);
      const processedURLs = await processURLs(urls);
      const response = await combineData(parsedXML, processedURLs);
      processedCustomFeeds.push({ feedURL, articles: response });
    } catch (error) {
      console.error(`Error processing custom feed: ${feedURL}`, error);
    }
  }
  return processedCustomFeeds;
}

// Combine data from parsed XML 
async function combineData(parsedXML) {
  const combinedData = [];
  const items = parsedXML.rss.channel[0].item;
  for (let i = 0; i < items.length; i++) {
    const media = items[i]['media:content'] ? items[i]['media:content'][0].$.url : null;
    combinedData.push({
      title: items[i].title[0],
      link: items[i].link[0],
      guid: items[i].guid[0]._,
      pubDate: items[i].pubDate[0],
      description: items[i].description[0],
      source: items[i].source[0].$.url,
      categories: items[i].category.map(cat => cat._),
      author: items[i].author[0],
      media: media
    });
  }
  return combinedData;
}



app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});



