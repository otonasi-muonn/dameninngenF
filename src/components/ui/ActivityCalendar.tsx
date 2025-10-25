'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';

type ActivityData = {
  date: string;
  count: number;
};

type ActivityCalendarProps = {
  userId?: string;
};

// 定数定義
const DAYS_TO_SHOW = 365;
const DAYS_IN_WEEK = 7;
const MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'] as const;

// カウントに応じた色を返す
const getColorClass = (count: number): string => {
  if (count === 0) return 'bg-gray-100';
  if (count <= 2) return 'bg-green-200';
  if (count <= 5) return 'bg-green-400';
  if (count <= 10) return 'bg-green-600';
  return 'bg-green-800';
};

// 日付を正規化（時刻を0:00:00にリセット）
const normalizeDate = (date: Date): Date => {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
};

export default function ActivityCalendar({ userId }: ActivityCalendarProps) {
  const [activities, setActivities] = useState<ActivityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number } | null>(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const fetchActivityData = async () => {
      try {
        const endpoint = userId ? `/api/user/${userId}/activity` : '/api/activity';
        const res = await fetch(endpoint);
        if (!res.ok) throw new Error('Failed to fetch activity data');
        const data = await res.json();
        setActivities(data.activities || []);
      } catch (error) {
        console.error('Activity fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivityData();
  }, [userId]);

  // アクティビティデータをMapに変換（useMemoで最適化）
  const activityMap = useMemo(() => {
    const map = new Map<string, number>();
    activities.forEach(({ date, count }) => {
      map.set(date, count);
    });
    return map;
  }, [activities]);

  // カレンダーデータ生成（useMemoで最適化）
  const weeks = useMemo(() => {
    const weeksArray: Date[][] = [];
    const today = normalizeDate(new Date());

    // 365日前から開始
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (DAYS_TO_SHOW - 1));

    // 日曜日から始まるように調整
    const dayOfWeek = startDate.getDay();
    startDate.setDate(startDate.getDate() - dayOfWeek);

    const currentDate = new Date(startDate);

    // 週単位で生成
    while (currentDate <= today) {
      const week: Date[] = [];
      for (let j = 0; j < DAYS_IN_WEEK; j++) {
        week.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);

        if (currentDate > today) {
          if (week.length > 0) {
            weeksArray.push(week);
          }
          return weeksArray;
        }
      }
      weeksArray.push(week);
    }

    return weeksArray;
  }, []);

  // 月ラベルの位置を計算（useMemoで最適化）
  const monthLabels = useMemo(() => {
    const labels: { month: string; offset: number }[] = [];
    let lastMonth = -1;
    const currentYear = new Date().getFullYear();

    weeks.forEach((week, weekIndex) => {
      if (week.length === 0) return;

      const firstDayOfWeek = week[0];
      const month = firstDayOfWeek.getMonth();
      const year = firstDayOfWeek.getFullYear();

      // 月が変わった時
      if (month !== lastMonth) {
        // 今年のデータ、または前年の11月・12月の場合はラベルを追加
        if (year === currentYear || (year === currentYear - 1 && month >= 10)) {
          labels.push({
            month: MONTHS[month],
            offset: weekIndex
          });
        }
        lastMonth = month;
      }
    });

    return labels;
  }, [weeks]);

  // マウス移動ハンドラー（useCallbackで最適化）
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY });
  }, []);

  // セルホバーハンドラー（useCallbackで最適化）
  const handleCellEnter = useCallback((dateKey: string, count: number, e: React.MouseEvent) => {
    setHoveredCell({ date: dateKey, count });
    handleMouseMove(e);
  }, [handleMouseMove]);

  const handleCellLeave = useCallback(() => {
    setHoveredCell(null);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-lg font-bold mb-4">アクティビティ</h2>
      
      <div className="w-full">
        {/* 月ラベル */}
        <div className="flex mb-2 relative h-5" style={{ marginLeft: '32px' }}>
          {monthLabels.map((label, idx) => (
            <div
              key={idx}
              className="text-xs text-gray-600 absolute whitespace-nowrap"
              style={{ left: `${(label.offset / weeks.length) * 100}%` }}
            >
              {label.month}
            </div>
          ))}
        </div>

        {/* カレンダーグリッド */}
        <div className="flex gap-1">
          {/* 曜日ラベル */}
          <div className="flex flex-col gap-1 text-xs text-gray-600 justify-between" style={{ width: '28px' }}>
            <div className="h-3"></div>
            <div className="h-3 flex items-center">月</div>
            <div className="h-3"></div>
            <div className="h-3 flex items-center">水</div>
            <div className="h-3"></div>
            <div className="h-3 flex items-center">金</div>
            <div className="h-3"></div>
          </div>

          {/* 週ごとのセル */}
          <div className="flex-1 flex justify-between">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-1">
                {week.map((day, dayIndex) => {
                  const dateKey = day.toISOString().split('T')[0];
                  const count = activityMap.get(dateKey) || 0;
                  const today = normalizeDate(new Date());
                  const compareDay = normalizeDate(day);
                  const isToday = compareDay.getTime() === today.getTime();

                  return (
                    <div
                      key={dayIndex}
                      className={`w-3 h-3 rounded-sm ${getColorClass(count)} ${
                        isToday ? 'ring-2 ring-blue-500' : ''
                      } transition-all hover:ring-2 hover:ring-gray-400 cursor-pointer`}
                      title={`${dateKey}: ${count}件`}
                      onMouseEnter={(e) => handleCellEnter(dateKey, count, e)}
                      onMouseMove={handleMouseMove}
                      onMouseLeave={handleCellLeave}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* 凡例 */}
        <div className="flex items-center gap-2 mt-4 text-xs text-gray-600">
          <span>少ない</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-gray-100 rounded-sm" />
            <div className="w-3 h-3 bg-green-200 rounded-sm" />
            <div className="w-3 h-3 bg-green-400 rounded-sm" />
            <div className="w-3 h-3 bg-green-600 rounded-sm" />
            <div className="w-3 h-3 bg-green-800 rounded-sm" />
          </div>
          <span>多い</span>
        </div>
      </div>

      {/* ツールチップ */}
      {hoveredCell && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-xs rounded px-2 py-1 pointer-events-none"
          style={{
            left: `${mousePosition.x + 10}px`,
            top: `${mousePosition.y + 10}px`,
          }}
        >
          <div>{hoveredCell.date}</div>
          <div>{hoveredCell.count}件のアクティビティ</div>
        </div>
      )}
    </div>
  );
}
