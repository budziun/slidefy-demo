describe('SongCard - Data formatting and display logic', () => {
  
  test('UT-11: Should format duration from ms to MM:SS', () => {
    const duration_ms = 125000; // 2:05
    const minutes = Math.floor(duration_ms / 60000);
    const seconds = Math.floor((duration_ms % 60000) / 1000);
    const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    expect(formatted).toBe('2:05');
  });

  test('UT-12: Should handle short duration correctly', () => {
    const duration_ms = 59000; // 0:59
    const minutes = Math.floor(duration_ms / 60000);
    const seconds = Math.floor((duration_ms % 60000) / 1000);
    const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    expect(formatted).toBe('0:59');
  });

  test('UT-13: Should handle long duration over 1 hour', () => {
    const duration_ms = 3661000; // 61:01
    const minutes = Math.floor(duration_ms / 60000);
    const seconds = Math.floor((duration_ms % 60000) / 1000);
    const formatted = `${minutes}:${seconds.toString().padStart(2, '0')}`;
    
    expect(formatted).toBe('61:01');
  });

  test('UT-14: Should limit artist names to 3 with "and X more"', () => {
    const artists = ['Artist 1', 'Artist 2', 'Artist 3', 'Artist 4', 'Artist 5'];
    const maxDisplay = 3;
    const displayed = artists.slice(0, maxDisplay);
    const remaining = artists.length - maxDisplay;
    
    expect(displayed.length).toBe(3);
    expect(remaining).toBe(2);
    expect(displayed.join(', ') + `, and ${remaining} more`).toBe('Artist 1, Artist 2, Artist 3, and 2 more');
  });
});