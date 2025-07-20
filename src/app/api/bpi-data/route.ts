import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import zlib from 'zlib';

interface Song {
  title: string;
  difficulty: string;
  level: number;
  notes?: number;
  bpm?: string;
  worldRecord?: number;
  wr?: number;
  avg?: number;
  bpiData?: Record<string, unknown>;
}

// API レスポンス用の型定義
interface ApiResponse {
  body?: unknown[];
  songs?: unknown[];
  data?: unknown[];
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

function formatBpiApiData(apiData: unknown) {
  const songs: Song[] = [];
  
  try {
    let songsArray: unknown[] = [];
    
    // プロキシAPIの場合は直接配列が渡される
    if (Array.isArray(apiData)) {
      songsArray = apiData;
    } else {
      const data = apiData as ApiResponse;
      if (data.body && Array.isArray(data.body)) {
        songsArray = data.body;
      } else if (data.songs && Array.isArray(data.songs)) {
        songsArray = data.songs;
      } else if (data.data && Array.isArray(data.data)) {
        songsArray = data.data;
      }
    }
    
    console.log(`Found ${songsArray.length} items in API response`);
    
    songsArray.forEach((item: unknown) => {
      const songItem = item as Record<string, unknown>;
      const title = songItem.title as string;
      const levelText = songItem.difficultyLevel as string;
      const difficultyCode = songItem.difficulty as string;
      const dpLevel = songItem.dpLevel as string;
      
      // dpLevel が "0" のデータのみを対象とする
      if (dpLevel !== "0") {
        return;
      }
      
      // 数値変換を確実に行う
      const wr = typeof songItem.wr === 'string' ? parseInt(songItem.wr) : (songItem.wr as number) || 0;
      const avg = typeof songItem.avg === 'string' ? parseInt(songItem.avg) : (songItem.avg as number) || 0;
      const notes = typeof songItem.notes === 'string' ? parseInt(songItem.notes) : (songItem.notes as number) || 0;
      
      if (title && levelText) {
        const level = parseInt(levelText);
        
        const difficultyMap: Record<string, string> = {
          "3": "HYPER",
          "4": "ANOTHER", 
          "9": "ANOTHER", // 12☆のANOTHER
          "10": "LEGGENDARIA",
          "11": "LEGGENDARIA" // 12☆のLEGGENDARIA
        };
        const difficulty = difficultyMap[difficultyCode];
        
        if (level >= 11 && level <= 12 && difficultyCode && difficulty) {
          const baseBpiData = calculateBaseBpiValues(wr, avg, notes);
          
          songs.push({
            title: title.trim(),
            level: level,
            difficulty: difficulty,
            wr: wr,
            avg: avg,
            notes: notes,
            bpm: (songItem.bpm as string) || '',
            bpiData: baseBpiData
          });
        }
      }
    });
    
    console.log(`Formatted ${songs.length} valid songs (level 11-12, dpLevel="0") from API data`);
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
    
    // BPI Manager プロキシAPIから取得
    const apiUrl = 'https://proxy.poyashi.me/?type=bpi';
    const response = await fetchWithRetry(apiUrl);
    
    if (response) {
      console.log('Successfully fetched data from BPI Manager proxy API');
      const data = JSON.parse(response);
      
      // デバッグ用：データ構造をログ出力
      console.log('API Response structure:', {
        hasVersion: !!data.version,
        hasRequireVersion: !!data.requireVersion,
        hasBody: !!data.body,
        bodyType: Array.isArray(data.body) ? 'array' : typeof data.body,
        bodyLength: Array.isArray(data.body) ? data.body.length : 'N/A',
        firstItemKeys: Array.isArray(data.body) && data.body.length > 0 ? Object.keys(data.body[0]) : 'N/A'
      });
      
      // 新しいデータ形式に対応: { version: ..., requireVersion: ..., body: [...] }
      const songs = formatBpiApiData(data.body || data);
      
      if (songs.length > 0) {
        console.log(`Successfully extracted ${songs.length} songs from BPI Manager API`);
        return NextResponse.json({
          success: true,
          data: songs,
          count: songs.length,
          source: 'bpi-manager-proxy',
          version: data.version || 'unknown',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    console.log('API request failed, using sample data');
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
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: fallbackData,
      count: fallbackData.length,
      source: 'error-fallback',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}