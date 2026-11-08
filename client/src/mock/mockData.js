import polishTracks from './polishTracks.json';

export const MOCK_USER = {
  displayName: "Jakub Budzich",
  photo: process.env.PUBLIC_URL + "/img/avatar.jpg",
  isPremium: true
};

const allTracksAsItems = polishTracks.map(t => ({ track: t }));

export const MOCK_PLAYLISTS = [
  {
    id: "pl-polish-rap-essentials",
    name: "Polish Rap Essentials",
    description: "The ultimate collection of modern Polish hip-hop anthems and heavy hitters.",
    collaborative: false,
    owner: { id: "jakub-budzich", display_name: "Jakub Budzich" },
    images: [
      { url: polishTracks[0].album.images[0].url }
    ],
    tracks: {
      total: Math.min(100, allTracksAsItems.length),
      items: allTracksAsItems.slice(0, 100)
    }
  },
  {
    id: "pl-late-night-drives",
    name: "Late Night Drives",
    description: "Moody melodies, deep basslines, and atmospheric storytelling for nocturnal cruising.",
    collaborative: false,
    owner: { id: "jakub-budzich", display_name: "Jakub Budzich" },
    images: [
      { url: polishTracks[1].album.images[0].url }
    ],
    tracks: {
      total: 20,
      items: [allTracksAsItems[1], ...allTracksAsItems.filter((_, idx) => idx !== 1).slice(0, 19)]
    }
  },
  {
    id: "pl-festival-anthems",
    name: "Festival Anthems",
    description: "High-octane crowd pleasers, infectious hooks, and summer stage energy.",
    collaborative: false,
    owner: { id: "jakub-budzich", display_name: "Jakub Budzich" },
    images: [
      { url: polishTracks[2].album.images[0].url }
    ],
    tracks: {
      total: 25,
      items: [allTracksAsItems[2], ...allTracksAsItems.filter((_, idx) => idx !== 2).slice(0, 24)]
    }
  },
  {
    id: "pl-golden-rhythms",
    name: "Golden Rhythms",
    description: "Sample-heavy production, lyrical precision, and classic East Coast and Warsaw vibes.",
    collaborative: false,
    owner: { id: "jakub-budzich", display_name: "Jakub Budzich" },
    images: [
      { url: polishTracks[3].album.images[0].url }
    ],
    tracks: {
      total: 20,
      items: [allTracksAsItems[3], ...allTracksAsItems.filter((_, idx) => idx !== 3).slice(0, 19)]
    }
  },
  {
    id: "pl-melodic-moods",
    name: "Melodic Moods",
    description: "Melodic trap, R&B-infused flows, and emotive choruses that stick with you.",
    collaborative: false,
    owner: { id: "jakub-budzich", display_name: "Jakub Budzich" },
    images: [
      { url: polishTracks[4].album.images[0].url }
    ],
    tracks: {
      total: 20,
      items: [allTracksAsItems[4], ...allTracksAsItems.filter((_, idx) => idx !== 4).slice(0, 19)]
    }
  },
  {
    id: "pl-heavy-trap-session",
    name: "Heavy Trap Session",
    description: "Distorted 808s, rapid-fire hi-hats, and raw workout intensity.",
    collaborative: false,
    owner: { id: "jakub-budzich", display_name: "Jakub Budzich" },
    images: [
      { url: polishTracks[5].album.images[0].url }
    ],
    tracks: {
      total: 20,
      items: [allTracksAsItems[5], ...allTracksAsItems.filter((_, idx) => idx !== 5).slice(0, 19)]
    }
  },
  {
    id: "pl-daily-discovery-mix",
    name: "Daily Discovery Mix",
    description: "Handcrafted rotation of fresh cuts, collaborations, and standout verses.",
    collaborative: false,
    owner: { id: "jakub-budzich", display_name: "Jakub Budzich" },
    images: [
      { url: polishTracks[6].album.images[0].url }
    ],
    tracks: {
      total: 20,
      items: [allTracksAsItems[6], ...allTracksAsItems.filter((_, idx) => idx !== 6).slice(0, 19)]
    }
  }
];

// 100 top tracks for Spoti Stats
export const MOCK_TOP_TRACKS = polishTracks.slice(0, 100);

// Exactly 36 top artists (mix of Polish rap icons and global hip-hop titans)
export const MOCK_BASE_ARTISTS = [
  {
    id: "art-asap-rocky",
    name: "A$AP Rocky",
    genres: ["east coast hip hop", "psychedelic hip hop", "harlem"],
    popularity: 97,
    images: [{ url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/13ubrt8QOOCPljQ2FL1Kca" }
  },
  {
    id: "art-taco",
    name: "Taco Hemingway",
    genres: ["polish hip hop", "hip hop", "warszawa"],
    popularity: 96,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('Taco'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ" }
  },
  {
    id: "art-travis-scott",
    name: "Travis Scott",
    genres: ["hip hop", "rap", "trap", "houston"],
    popularity: 98,
    images: [{ url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/0Y5tJX1MQlPlqiwlOH1tJY" }
  },
  {
    id: "art-mata",
    name: "Mata",
    genres: ["polish hip hop", "trap", "mlody matczak"],
    popularity: 94,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('Mata'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/6M2wZ9GZgrQXHCFfjv46we" }
  },
  {
    id: "art-kendrick",
    name: "Kendrick Lamar",
    genres: ["conscious hip hop", "west coast rap", "compton"],
    popularity: 99,
    images: [{ url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/2YZyLoL8N0Wb9xBt1NhZWg" }
  },
  {
    id: "art-oki",
    name: "OKI",
    genres: ["polish hip hop", "trap", "47"],
    popularity: 92,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('OKI'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/6KImCVD70vtRIJWnq6xn93" }
  },
  {
    id: "art-drake",
    name: "Drake",
    genres: ["canadian hip hop", "rap", "toronto"],
    popularity: 98,
    images: [{ url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/3TVXtAsR1Inumwj472S9r4" }
  },
  {
    id: "art-pro8l3m",
    name: "PRO8L3M",
    genres: ["polish hip hop", "dark rap", "warszawa"],
    popularity: 93,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('PRO8L3M'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/0UF75IPT2BsVAvn8ETyrwz" }
  },
  {
    id: "art-carti",
    name: "Playboi Carti",
    genres: ["atlanta trap", "rage rap", "opium"],
    popularity: 95,
    images: [{ url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/699OT2rVaPtKu1dwysB8fg" }
  },
  {
    id: "art-quebo",
    name: "Quebonafide",
    genres: ["polish hip hop", "quequality", "romantic psycho"],
    popularity: 93,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('Quebonafide'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/2NFrAuh8RQdQISdgmZ2u00" }
  },
  {
    id: "art-kanye",
    name: "Kanye West",
    genres: ["chicago rap", "hip hop", "yeezy"],
    popularity: 97,
    images: [{ url: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/5K4W6rqBFWDnAN6FQUkS6x" }
  },
  {
    id: "art-bedoes",
    name: "Bedoes 2115",
    genres: ["polish hip hop", "2115", "bydgoszcz"],
    popularity: 90,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('Bedoes'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/1dfeR4HaWDbWqFsssgavss" }
  },
  {
    id: "art-tyler",
    name: "Tyler, The Creator",
    genres: ["hip hop", "odd future", "neo-soul"],
    popularity: 95,
    images: [{ url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/4V8LLVI7PbaPR0K2TGSFFo" }
  },
  {
    id: "art-sobel",
    name: "Sobel",
    genres: ["polish pop", "r&b", "trap"],
    popularity: 89,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('Sobel'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/6M2wZ9GZgrQXHCFfjv46we" }
  },
  {
    id: "art-metro",
    name: "Metro Boomin",
    genres: ["trap", "hip hop", "atlanta producer"],
    popularity: 96,
    images: [{ url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/0iEtIxbK0KxaSlF7G42ZOp" }
  },
  {
    id: "art-gibbs",
    name: "Gibbs",
    genres: ["polish hip hop", "melodic rap", "dopamine"],
    popularity: 89,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('Gibbs'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/1dfeR4HaWDbWqFsssgavss" }
  },
  {
    id: "art-future",
    name: "Future",
    genres: ["atlanta trap", "southern hip hop"],
    popularity: 96,
    images: [{ url: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/1RyvyyTE3KVwmbtSYd5Z8v" }
  },
  {
    id: "art-pezet",
    name: "Pezet",
    genres: ["classic polish hip hop", "muzyka wspolczesna"],
    popularity: 88,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('Pezet'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/0UF75IPT2BsVAvn8ETyrwz" }
  },
  {
    id: "art-21savage",
    name: "21 Savage",
    genres: ["atlanta rap", "trap", "dark trap"],
    popularity: 95,
    images: [{ url: "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/1URnnhqYAYcrqrcwql10ft" }
  },
  {
    id: "art-white2115",
    name: "White 2115",
    genres: ["polish hip hop", "rock rap", "milan"],
    popularity: 88,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('White'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/1dfeR4HaWDbWqFsssgavss" }
  },
  {
    id: "art-postmalone",
    name: "Post Malone",
    genres: ["pop rap", "melodic rap", "dfw"],
    popularity: 96,
    images: [{ url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/246dkjvS1zLTtiykYqq8DT" }
  },
  {
    id: "art-kukon",
    name: "Kukon",
    genres: ["polish alternative rap", "ogrody", "biłgoraj"],
    popularity: 87,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('Kukon'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1498038432885-c6f3f1b912ee?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/1dfeR4HaWDbWqFsssgavss" }
  },
  {
    id: "art-weeknd",
    name: "The Weeknd",
    genres: ["canadian pop", "r&b", "after hours"],
    popularity: 99,
    images: [{ url: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/1Xyo4u8uXC1ZmMpatF05PJ" }
  },
  {
    id: "art-szpaku",
    name: "Szpaku",
    genres: ["polish hip hop", "bor", "gugu"],
    popularity: 86,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('Szpaku'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/6M2wZ9GZgrQXHCFfjv46we" }
  },
  {
    id: "art-eminem",
    name: "Eminem",
    genres: ["detroit hip hop", "hardcore rap", "slim shady"],
    popularity: 97,
    images: [{ url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/7dGJo4pcD2V6ioOQBEWqd7" }
  },
  {
    id: "art-guzior",
    name: "Guzior",
    genres: ["polish hip hop", "pleśń", "wrocław"],
    popularity: 86,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('Guzior'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/0UF75IPT2BsVAvn8ETyrwz" }
  },
  {
    id: "art-jcole",
    name: "J. Cole",
    genres: ["conscious hip hop", "north carolina", "dreamville"],
    popularity: 95,
    images: [{ url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/6l3HvQ5sa6mXTsMTB19rO5" }
  },
  {
    id: "art-malik",
    name: "Malik Montana",
    genres: ["polish drill", "gm2l", "trap"],
    popularity: 87,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('Malik'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/1dfeR4HaWDbWqFsssgavss" }
  },
  {
    id: "art-uzi",
    name: "Lil Uzi Vert",
    genres: ["philly trap", "melodic rap", "rage"],
    popularity: 94,
    images: [{ url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/4O15NlyKENmzxsRgQYHG9T" }
  },
  {
    id: "art-kizo",
    name: "Kizo",
    genres: ["polish hip hop", "banger", "gdansk"],
    popularity: 86,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('Kizo'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/6KImCVD70vtRIJWnq6xn93" }
  },
  {
    id: "art-macmiller",
    name: "Mac Miller",
    genres: ["pittsburgh rap", "conscious hip hop", "swimming"],
    popularity: 94,
    images: [{ url: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/4LLpKhyESsy2NVpc3VIVYn" }
  },
  {
    id: "art-paluch",
    name: "Paluch",
    genres: ["polish hip hop", "bor", "poznan"],
    popularity: 86,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('Paluch'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/0UF75IPT2BsVAvn8ETyrwz" }
  },
  {
    id: "art-frankocean",
    name: "Frank Ocean",
    genres: ["neo soul", "r&b", "blonde"],
    popularity: 96,
    images: [{ url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/2h93pZao292yDXxQIUTUMG" }
  },
  {
    id: "art-otsochodzi",
    name: "Otsochodzi",
    genres: ["polish hip hop", "tarchomin", "oio"],
    popularity: 86,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('Otsochodzi'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/6M2wZ9GZgrQXHCFfjv46we" }
  },
  {
    id: "art-kidcudi",
    name: "Kid Cudi",
    genres: ["cleveland rap", "man on the moon", "alternative"],
    popularity: 93,
    images: [{ url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/0fA0VVWs9v9x0eaoejFn9c" }
  },
  {
    id: "art-sokol",
    name: "Sokół",
    genres: ["legendary polish hip hop", "zip skład", "warszawa"],
    popularity: 86,
    images: [{ url: polishTracks.find(t => t.artists[0]?.name?.includes('Sokół'))?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1464375117522-1311d6a5b81f?w=500" }],
    external_urls: { spotify: "https://open.spotify.com/artist/0UF75IPT2BsVAvn8ETyrwz" }
  }
];

// Helper to deterministically shuffle array based on seed
function getVariant(list, offset, reverse = false) {
  const copy = [...list];
  const rotated = copy.slice(offset).concat(copy.slice(0, offset));
  return reverse ? rotated.reverse() : rotated;
}

export const MOCK_ARTISTS_BY_TIME_RANGE = {
  short_term: MOCK_BASE_ARTISTS,
  medium_term: getVariant(MOCK_BASE_ARTISTS, 4),
  long_term: getVariant(MOCK_BASE_ARTISTS, 9, true)
};

export const MOCK_TRACKS_BY_TIME_RANGE = {
  short_term: MOCK_TOP_TRACKS,
  medium_term: getVariant(MOCK_TOP_TRACKS, 15),
  long_term: getVariant(MOCK_TOP_TRACKS, 35, true)
};
