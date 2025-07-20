-- IIDX BPI Manager Database Schema
-- 将来的なユーザー登録機能を考慮した設計

-- ユーザーテーブル
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE
);

-- 楽曲マスターテーブル
CREATE TABLE songs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(20) NOT NULL, -- HYPER, ANOTHER, LEGGENDARIA
    level INTEGER NOT NULL,
    notes INTEGER,
    bpm VARCHAR(50), -- "120-180" のような範囲も考慮
    world_record INTEGER, -- WR score
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(title, difficulty) -- 同じ曲の同じ難易度は1つのみ
);

-- BPIデータテーブル（楽曲の基準スコア情報）
CREATE TABLE bpi_data (
    id SERIAL PRIMARY KEY,
    song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
    score8_9 INTEGER, -- 89%目標スコア（鳥難度）
    score9_0 INTEGER, -- 90%目標スコア
    score9_5 INTEGER, -- 95%目標スコア
    score10_0 INTEGER, -- 100%目標スコア
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(song_id)
);

-- ユーザースコアテーブル
CREATE TABLE user_scores (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    song_id INTEGER REFERENCES songs(id) ON DELETE CASCADE,
    grade VARCHAR(10) NOT NULL, -- AAA, AA, A, B, C, D, E, F
    score INTEGER,
    bpi DECIMAL(5,2), -- BPI値（小数点以下2桁）
    clear_lamp VARCHAR(20), -- EASY, NORMAL, HARD, EX-HARD, FULL-COMBO, PERFECT
    play_count INTEGER DEFAULT 1,
    best_score INTEGER, -- ベストスコア
    achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, song_id) -- 1ユーザー1楽曲につき1レコード
);

-- セッションテーブル（認証用）
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX idx_songs_level ON songs(level);
CREATE INDEX idx_songs_difficulty ON songs(difficulty);
CREATE INDEX idx_user_scores_user_id ON user_scores(user_id);
CREATE INDEX idx_user_scores_song_id ON user_scores(song_id);
CREATE INDEX idx_user_scores_grade ON user_scores(grade);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);

-- 更新日時の自動更新トリガー
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_songs_updated_at BEFORE UPDATE ON songs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bpi_data_updated_at BEFORE UPDATE ON bpi_data FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_user_scores_updated_at BEFORE UPDATE ON user_scores FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();