export interface Effect {
  id: string;
  user_id: string;
  name: string;
  width_mm: number;
  height_mm: number;
  memo?: string;
  created_at: string;
}

export interface Board {
  id: string;
  user_id: string;
  name: string;
  width_mm: number;
  height_mm: number;
  memo?: string;
  created_at: string;
}

export interface Layout {
  id: string;
  user_id: string;
  board_id: string;
  name: string;
  layout_data: LayoutData;
  signal_chain_memo?: string;
  general_memo?: string;
  share_code?: string;
  created_at: string;
  updated_at: string;
}

export interface LayoutData {
  effects: EffectPosition[];
}

export interface EffectPosition {
  effect_id: string;
  x: number;
  y: number;
  rotation?: number;
}