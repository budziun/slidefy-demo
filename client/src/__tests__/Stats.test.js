describe('Stats - Artist display logic', () => {
  
  test('UT-05: Should limit artist list to 3', () => {
    const artists = [
      { id: '1', name: 'Artist 1' },
      { id: '2', name: 'Artist 2' },
      { id: '3', name: 'Artist 3' },
      { id: '4', name: 'Artist 4' },
      { id: '5', name: 'Artist 5' }
    ];
    
    const maxArtistsToShow = 3;
    const artistsToShow = artists.slice(0, maxArtistsToShow);
    const remainingArtists = artists.length - maxArtistsToShow;
    
    expect(artistsToShow.length).toBe(3);
    expect(remainingArtists).toBe(2);
  });

  test('UT-06: Should not display "and X more" when <= 3', () => {
    const artists = [
      { id: '1', name: 'Artist 1' },
      { id: '2', name: 'Artist 2' }
    ];
    
    const maxArtistsToShow = 3;
    const remainingArtists = Math.max(0, artists.length - maxArtistsToShow);
    
    expect(remainingArtists).toBe(0);
  });

  test('UT-07: Should correctly join artist names', () => {
    const artists = [
      { id: '1', name: 'PRO8L3M' },
      { id: '2', name: 'Kaz Bałagane' }
    ];
    
    const artistNames = artists.map(a => a.name).join(', ');
    
    expect(artistNames).toBe('PRO8L3M, Kaz Bałagane');
  });
});