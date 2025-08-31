import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

interface Song {
  title: string;
  difficulty: string;
  level: number;
  notes?: number;
  bpm?: string;
  worldRecord?: number;
  wr?: number;
  avg?: number;
}

// API レスポンス用の型定義
interface ApiResponse {
  body?: unknown[];
  songs?: unknown[];
  data?: unknown[];
}

async function fetchWithRetry(url: string, retries = 3): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await axios.get(url, {
        timeout: 30000,
        responseType: 'text'
      });
      
      return response.data;
    } catch (error) {
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        continue;
      }
      throw error;
    }
  }
  
  throw new Error('All retry attempts failed');
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
          "9": "ANOTHER", // lv12のANOTHER
          "10": "LEGGENDARIA",
          "11": "LEGGENDARIA" // lv12☆のLEGGENDARIA
        };
        const difficulty = difficultyMap[difficultyCode];
        
        if (level >= 11 && level <= 12 && difficultyCode && difficulty) {
          songs.push({
            title: title.trim(),
            level: level,
            difficulty: difficulty,
            wr: wr,
            avg: avg,
            notes: notes,
            bpm: (songItem.bpm as string) || '',
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
      const data = JSON.parse(response);
      
      // 新しいデータ形式に対応: { version: ..., requireVersion: ..., body: [...] }
      const songs = formatBpiApiData(data.body || data);
      
      if (songs.length > 0) {
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
    
    return NextResponse.json({
      success: false,
      data: [],
      count: 0,
      source: 'api-failed',
      error: 'API request failed',
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('API Error:', error);
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      data: [],
      count: 0,
      source: 'error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}