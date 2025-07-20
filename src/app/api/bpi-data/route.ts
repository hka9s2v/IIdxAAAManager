import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import zlib from 'zlib';
import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), 'bpi_cache.json');
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface BpiData {
  timestamp: number;
  songs: any[];
  count: number;
}

function loadCache(): any[] | null {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cacheData: BpiData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      const now = new Date().getTime();
      
      if (cacheData.timestamp && (now - cacheData.timestamp) < CACHE_DURATION) {
        console.log('Loading songs from cache...');
        return cacheData.songs || [];
      } else {
        console.log('Cache expired, will fetch new data');
      }
    }
  } catch (error) {
    console.error('Error loading cache:', error);
  }
  return null;
}

function saveCache(songs: any[]) {
  try {
    const cacheData: BpiData = {
      timestamp: new Date().getTime(),
      songs: songs,
      count: songs.length
    };
    fs.writeFileSync(CACHE_FILE, JSON.stringify(cacheData, null, 2));
    console.log(`Saved ${songs.length} songs to cache`);
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

function loadCacheIgnoreExpiry(): any[] | null {
  try {
    if (fs.existsSync(CACHE_FILE)) {
      const cacheData: BpiData = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
      let songs = cacheData.songs || [];
      
      // Add bpiData if missing
      songs = songs.map(song => {
        if (!song.bpiData && song.wr && song.avg) {
          song.bpiData = calculateBaseBpiValues(song.wr, song.avg, song.notes || 0);
        }
        return song;
      });
      
      return songs;
    }
  } catch (error) {
    console.error('Error loading cache (ignore expiry):', error);
  }
  return null;
}

function calculateBaseBpiValues(wr: number, avg: number, notes: number) {
  const maxScore = notes * 2;
  
  const ranges = {
    excellent: Math.round(((wr - avg) / (wr - avg)) * 100),
    score17_18: Math.round(((maxScore * (17/18) - avg) / (wr - avg)) * 100),
    score8_9: Math.round(((maxScore * (8/9) - avg) / (wr - avg)) * 100),
    score15_18: Math.round(((maxScore * (15/18) - avg) / (wr - avg)) * 100),
    average: 0
  };
  
  return ranges;
}

async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  return new Promise((resolve, reject) => {
    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/json, text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
      },
      timeout: 30000
    }, (response) => {
      const chunks: Buffer[] = [];
      
      response.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      response.on('end', () => {
        if (response.statusCode === 200) {
          try {
            let buffer = Buffer.concat(chunks);
            
            if (response.headers['content-encoding'] === 'gzip') {
              buffer = Buffer.from(zlib.gunzipSync(buffer));
            } else if (response.headers['content-encoding'] === 'deflate') {
              buffer = Buffer.from(zlib.inflateSync(buffer));
            } else if (response.headers['content-encoding'] === 'br') {
              buffer = Buffer.from(zlib.brotliDecompressSync(buffer));
            }
            
            const data = buffer.toString('utf8');
            resolve(data);
          } catch (decompressError) {
            reject(decompressError);
          }
        } else if (retries > 0) {
          setTimeout(() => {
            fetchWithRetry(url, retries - 1)
              .then(resolve)
              .catch(reject);
          }, 2000);
        } else {
          reject(new Error(`HTTP ${response.statusCode}: ${response.statusMessage}`));
        }
      });
    });
    
    request.on('error', (error) => {
      if (retries > 0) {
        setTimeout(() => {
          fetchWithRetry(url, retries - 1)
            .then(resolve)
            .catch(reject);
        }, 2000);
      } else {
        reject(error);
      }
    });
    
    request.on('timeout', () => {
      request.destroy();
      if (retries > 0) {
        setTimeout(() => {
          fetchWithRetry(url, retries - 1)
            .then(resolve)
            .catch(reject);
        }, 2000);
      } else {
        reject(new Error('Request timeout'));
      }
    });
  });
}

function formatBpiApiData(apiData: any) {
  const songs: any[] = [];
  
  try {
    let songsArray: any[] = [];
    
    if (apiData.body && Array.isArray(apiData.body)) {
      songsArray = apiData.body;
    } else if (Array.isArray(apiData)) {
      songsArray = apiData;
    } else if (apiData.songs && Array.isArray(apiData.songs)) {
      songsArray = apiData.songs;
    } else if (apiData.data && Array.isArray(apiData.data)) {
      songsArray = apiData.data;
    }
    
    console.log(`Found ${songsArray.length} items in API response`);
    
    songsArray.forEach((item: any) => {
      const title = item.title;
      const levelText = item.difficultyLevel;
      const difficultyCode = item.difficulty;
      const wr = item.wr;
      const avg = item.avg;
      
      if (title && levelText) {
        const level = parseInt(levelText);
        
        const difficultyMap: Record<string, string> = {
          "3": "HYPER",
          "4": "ANOTHER", 
          "10": "LEGGENDARIA"
        };
        const difficulty = difficultyMap[difficultyCode];
        
        if (level >= 11 && level <= 12 && difficultyCode && difficultyMap[difficultyCode]) {
          const baseBpiData = calculateBaseBpiValues(wr, avg, item.notes || 0);
          
          songs.push({
            id: songs.length + 1,
            title: title.trim(),
            level: level,
            difficulty: difficulty,
            difficultyCode: difficultyCode,
            bpi: 0,
            wr: wr,
            avg: avg,
            notes: item.notes || 0,
            bpm: item.bpm || '',
            bpiData: baseBpiData
          });
        }
      }
    });
    
    console.log(`Formatted ${songs.length} valid songs (level 11-12) from API data`);
    return songs;
    
  } catch (error) {
    console.error('Error formatting API data:', error);
    return [];
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const forceRefresh = searchParams.get('refresh') === 'true';
  
  try {
    console.log(`Starting BPI data fetching... (force refresh: ${forceRefresh})`);
    
    // Check cache first (unless force refresh is requested)
    if (!forceRefresh) {
      const cachedSongs = loadCache();
      if (cachedSongs && cachedSongs.length > 0) {
        console.log(`Loaded ${cachedSongs.length} songs from cache`);
        return NextResponse.json({
          success: true,
          data: cachedSongs,
          count: cachedSongs.length,
          source: 'cache',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    console.log('Fetching fresh data from BPI Manager API...');
    
    // Try the direct API endpoint
    const apiUrl = 'https://bpim.msqkn310.workers.dev/release';
    const response = await fetchWithRetry(apiUrl);
    
    if (response) {
      console.log('Successfully fetched data from API');
      const data = JSON.parse(response);
      const songs = formatBpiApiData(data);
      
      if (songs.length > 0) {
        console.log(`Successfully extracted ${songs.length} songs from BPI API`);
        saveCache(songs);
        return NextResponse.json({
          success: true,
          data: songs,
          count: songs.length,
          source: 'api',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    console.log('API request failed, checking cache for any data...');
    const anyCachedSongs = loadCacheIgnoreExpiry();
    if (anyCachedSongs && anyCachedSongs.length > 0) {
      console.log(`Using expired cache data: ${anyCachedSongs.length} songs`);
      return NextResponse.json({
        success: true,
        data: anyCachedSongs,
        count: anyCachedSongs.length,
        source: 'cache-expired',
        timestamp: new Date().toISOString()
      });
    }
    
    // Return fallback data
    console.log('No cached data available, using sample data');
    const fallbackData = [
      {
        id: 1,
        title: "Abraxas",
        level: 11,
        difficulty: "ANOTHER",
        difficultyCode: "4",
        bpi: 0,
        wr: 2472,
        avg: 2178,
        notes: 1241,
        bpm: "165",
        bpiData: {
          excellent: 100,
          score17_18: 57,
          score8_9: 10,
          score15_18: -37,
          average: 0
        }
      }
    ];
    
    return NextResponse.json({
      success: true,
      data: fallbackData,
      count: fallbackData.length,
      source: 'fallback',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    const fallbackData = loadCacheIgnoreExpiry();
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: fallbackData || [],
      count: fallbackData?.length || 0,
      source: 'error-fallback',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}