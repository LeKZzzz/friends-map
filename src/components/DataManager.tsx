import React, { useRef, useCallback } from 'react';
import { Friend } from '../types';

interface DataManagerProps {
  friends: Friend[];
  onImport: (friends: Friend[]) => void;
}

const validateFriends = (data: unknown): { valid: boolean; friends?: Friend[]; error?: string } => {
  if (!Array.isArray(data)) {
    return { valid: false, error: '数据必须是数组格式' };
  }
  if (data.length === 0) {
    return { valid: false, error: '数据不能为空' };
  }
  for (let i = 0; i < data.length; i++) {
    const item = data[i];
    if (typeof item.id !== 'string' || !item.id) {
      return { valid: false, error: `第 ${i + 1} 项缺少有效的 id` };
    }
    if (typeof item.name !== 'string' || !item.name) {
      return { valid: false, error: `第 ${i + 1} 项缺少有效的 name` };
    }
    if (typeof item.latitude !== 'number' || typeof item.longitude !== 'number') {
      return { valid: false, error: `第 ${i + 1} 项缺少有效的经纬度` };
    }
  }
  return { valid: true, friends: data as Friend[] };
};

const DataManager: React.FC<DataManagerProps> = ({ friends, onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = useCallback(() => {
    try {
      const blob = new Blob([JSON.stringify(friends, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `friends-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      alert('导出失败: ' + (err instanceof Error ? err.message : '未知错误'));
    }
  }, [friends]);

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        const result = validateFriends(data);
        if (result.valid && result.friends) {
          if (window.confirm(`检测到 ${result.friends.length} 个好友数据，确认导入？`)) {
            onImport(result.friends);
          }
        } else {
          alert('导入失败: ' + result.error);
        }
      } catch {
        alert('导入失败: 文件格式不正确，请确保是有效的 JSON 文件');
      }
    };
    reader.readAsText(file);
    // 重置 input 以便再次选择同一文件
    e.target.value = '';
  }, [onImport]);

  return (
    <div className="data-manager">
      <button className="data-btn export-btn" onClick={handleExport}>
        📤 导出 JSON
      </button>
      <button className="data-btn import-btn" onClick={() => fileInputRef.current?.click()}>
        📥 导入 JSON
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleImport}
        style={{ display: 'none' }}
        aria-label="选择 JSON 文件导入"
      />
    </div>
  );
};

export default DataManager;
