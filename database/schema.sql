-- IIDX BPI Manager Database Schema for MySQL
-- 将来的なユーザー登録機能を考慮した設計

-- ユーザーテーブル
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE
);

-- 楽曲マスターテーブル
CREATE TABLE songs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    difficulty VARCHAR(20) NOT NULL, -- HYPER, ANOTHER, LEGGENDARIA
    level INT NOT NULL,
    notes INT,
    bpm VARCHAR(50), -- "120-180" のような範囲も考慮
    world_record INT, -- WR score
    average_score INT, -- Average score
    coef DECIMAL(6, 4), -- 譜面係数p
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_title_difficulty (title, difficulty) -- 同じ曲の同じ難易度は1つのみ
);

-- BPIデータテーブル（楽曲の基準スコア情報）
CREATE TABLE bpi_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    song_id INT,
    score8_9 INT, -- 89%目標スコア（鳥難度）
    score9_0 INT, -- 90%目標スコア
    score9_5 INT, -- 95%目標スコア
    score10_0 INT, -- 100%目標スコア
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_song_id (song_id),
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- ユーザースコアテーブル
CREATE TABLE user_scores (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    song_id INT,
    grade VARCHAR(10) NOT NULL, -- AAA, AA, A, B, C, D, E, F
    score INT,
    bpi DECIMAL(7,3), -- BPI値（小数点以下3桁）
    clear_lamp VARCHAR(20), -- EASY, NORMAL, HARD, EX-HARD, FULL-COMBO, PERFECT
    play_count INT DEFAULT 1,
    best_score INT, -- ベストスコア
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_user_song (user_id, song_id), -- 1ユーザー1楽曲につき1レコード
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- AAA BPI計算値テーブル
CREATE TABLE aaa_bpi (
    id INT AUTO_INCREMENT PRIMARY KEY,
    song_id INT,
    aaa_bpi DECIMAL(7,3), -- AAA時BPI（小数点以下3桁）
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_aaa_bpi_song_id (song_id),
    FOREIGN KEY (song_id) REFERENCES songs(id) ON DELETE CASCADE
);

-- セッションテーブル（認証用）
CREATE TABLE user_sessions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- インデックスの作成
CREATE INDEX idx_songs_level ON songs(level);
CREATE INDEX idx_songs_difficulty ON songs(difficulty);
CREATE INDEX idx_user_scores_user_id ON user_scores(user_id);
CREATE INDEX idx_user_scores_song_id ON user_scores(song_id);
CREATE INDEX idx_user_scores_grade ON user_scores(grade);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);