-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Effects table
CREATE TABLE effects (
                         id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                         user_id UUID NOT NULL,
                         name VARCHAR(100) NOT NULL,
                         width_mm INTEGER NOT NULL,
                         height_mm INTEGER NOT NULL,
                         memo TEXT,
                         created_at TIMESTAMP DEFAULT NOW()
);

-- Boards table
CREATE TABLE boards (
                        id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                        user_id UUID NOT NULL,
                        name VARCHAR(100) NOT NULL,
                        width_mm INTEGER NOT NULL,
                        height_mm INTEGER NOT NULL,
                        memo TEXT,
                        created_at TIMESTAMP DEFAULT NOW()
);

-- Layouts table
CREATE TABLE layouts (
                         id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
                         user_id UUID NOT NULL,
                         board_id UUID REFERENCES boards(id),
                         name VARCHAR(100) NOT NULL,
                         layout_data JSONB NOT NULL,
                         signal_chain_memo TEXT,
                         general_memo TEXT,
                         share_code VARCHAR(50) UNIQUE,
                         created_at TIMESTAMP DEFAULT NOW(),
                         updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_effects_user_id ON effects(user_id);
CREATE INDEX idx_boards_user_id ON boards(user_id);
CREATE INDEX idx_layouts_user_id ON layouts(user_id);
CREATE INDEX idx_layouts_board_id ON layouts(board_id);
CREATE INDEX idx_layouts_share_code ON layouts(share_code);