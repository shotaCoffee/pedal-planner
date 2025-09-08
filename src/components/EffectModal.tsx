'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Effect } from '../types';
import { getUserId } from '../lib/auth';
import { useToast } from './Toast';

interface EffectModalProps {
  effect?: Effect | null;
  onClose: () => void;
  onSave: () => void;
}

export default function EffectModal({ effect, onClose, onSave }: EffectModalProps) {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    widthMm: '',
    heightMm: '',
    memo: ''
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const isEdit = !!effect;

  useEffect(() => {
    if (effect) {
      setFormData({
        name: effect.name,
        widthMm: effect.width_mm.toString(),
        heightMm: effect.height_mm.toString(),
        memo: effect.memo || ''
      });
    }
  }, [effect]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '名前は必須です';
    } else if (formData.name.length > 100) {
      newErrors.name = '名前は100文字以内で入力してください';
    }

    const widthNum = parseInt(formData.widthMm);
    if (!formData.widthMm || isNaN(widthNum) || widthNum <= 0) {
      newErrors.widthMm = '正の数値を入力してください';
    } else if (widthNum > 1000) {
      newErrors.widthMm = '1000mm以下で入力してください';
    }

    const heightNum = parseInt(formData.heightMm);
    if (!formData.heightMm || isNaN(heightNum) || heightNum <= 0) {
      newErrors.heightMm = '正の数値を入力してください';
    } else if (heightNum > 1000) {
      newErrors.heightMm = '1000mm以下で入力してください';
    }

    if (formData.memo && formData.memo.length > 1000) {
      newErrors.memo = 'メモは1000文字以内で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const userId = getUserId();
      const widthMm = parseInt(formData.widthMm);
      const heightMm = parseInt(formData.heightMm);
      const memo = formData.memo.trim() || undefined;

      if (isEdit && effect) {
        // 編集の場合
        const response = await fetch('/api/effects', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: effect.id,
            userId,
            name: formData.name.trim(),
            widthMm,
            heightMm,
            memo
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to update effect');
        }
      } else {
        // 新規作成の場合
        const response = await fetch('/api/effects', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            name: formData.name.trim(),
            widthMm,
            heightMm,
            memo
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to create effect');
        }
      }

      onSave();
    } catch (error) {
      addToast('保存に失敗しました。もう一度お試しください。', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            {isEdit ? 'エフェクター編集' : 'エフェクター追加'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              名前 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="例: Boss DS-1"
              disabled={loading}
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                幅 (mm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.widthMm}
                onChange={(e) => handleChange('widthMm', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.widthMm ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="73"
                min="1"
                max="1000"
                disabled={loading}
              />
              {errors.widthMm && (
                <p className="mt-1 text-sm text-red-600">{errors.widthMm}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                高さ (mm) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.heightMm}
                onChange={(e) => handleChange('heightMm', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.heightMm ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="129"
                min="1"
                max="1000"
                disabled={loading}
              />
              {errors.heightMm && (
                <p className="mt-1 text-sm text-red-600">{errors.heightMm}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メモ
            </label>
            <textarea
              value={formData.memo}
              onChange={(e) => handleChange('memo', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                errors.memo ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="設定値やコメントなど"
              rows={3}
              maxLength={1000}
              disabled={loading}
            />
            {errors.memo && (
              <p className="mt-1 text-sm text-red-600">{errors.memo}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {formData.memo.length}/1000文字
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? '保存中...' : (isEdit ? '更新' : '追加')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}