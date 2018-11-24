
// exmaple item from youtube json response
const item = {
  etag: '"S8kisgyDEblalhHF9ooXPiFFrkc/yCnxLgctsaTM5SNB_sTBwblsABo"',
  id: {
    kind: 'youtube#video', 
    videoId: 'oWeJ9p42ufg'
  },
  snippet: {
    publishedAt: '2012-03-18T01:06:53.000Z',
    channelId: 'UCSrzUjistgTOFdkCWBJ_CLA',
    title: 'Olivia Newton John: Xanadu (HQ Version!)',
    description: 'Deuxième extrait de la bande sonore du film "Xanadu". Un hit qui frappa le Top 10 dans le Hot 100 Américain et un #1 aux UK. Dans ce vidéo on peux voir la talentueuse Olivia nous montrer...',
    thumbnails: { 
      default: {
          url: 'https://i.ytimg.com/vi/oWeJ9p42ufg/default.jpg',
          width: 120,
          height: 90 
        },
       medium: {
          url: 'https://i.ytimg.com/vi/oWeJ9p42ufg/mqdefault.jpg',
          width: 320,
          height: 180 
        },
       high: { 
          url: 'https://i.ytimg.com/vi/oWeJ9p42ufg/hqdefault.jpg',
          width: 480,
          height: 360
        }
    },
    channelTitle: 'QueenOfRockChannel',
    liveBroadcastContent: 'none' 
  },
  contentDetails: {
    "duration": "PT21M3S",
    "dimension": "2d",
    "definition": "hd",
    "caption": "true",
    "licensedContent": true,
    "projection": "rectangular"
  },
  statistics: {
    "viewCount": "13645430",
    "likeCount": "175867",
    "dislikeCount": "3306",
    "favoriteCount": "0",
    "commentCount": "6776"
  }
};
