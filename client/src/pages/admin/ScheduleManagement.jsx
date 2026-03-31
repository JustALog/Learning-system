import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

const days = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'];

const periods = [
  { label: 'Tiết 1', start: '07:00', end: '07:50' },
  { label: 'Tiết 2', start: '07:50', end: '08:40' },
  { label: 'Tiết 3', start: '08:50', end: '09:40' },
  { label: 'Tiết 4', start: '09:40', end: '10:30' },
  { label: 'Tiết 5', start: '10:40', end: '11:30' },
  { label: 'Tiết 6', start: '13:00', end: '13:50' },
  { label: 'Tiết 7', start: '13:50', end: '14:40' },
  { label: 'Tiết 8', start: '14:50', end: '15:40' },
  { label: 'Tiết 9', start: '15:40', end: '16:30' },
  { label: 'Tiết 10', start: '16:30', end: '17:20' },
];

export default function ScheduleManagement() {
  const [week, setWeek] = useState(1);
  const [scheduleData, setScheduleData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGlobalSchedule = async () => {
      setLoading(true);
      try {
        const semData = await api.get('/semesters/current');
        if (semData.success) {
          const sectionsData = await api.get(`/sections?semester_id=${semData.data.semester.semester_id}`);
          if (sectionsData.success) {
            const blocks = [];
            const colors = ['blue', 'green', 'purple', 'orange', 'red', 'cyan'];
            
            sectionsData.data.sections.forEach((section, idx) => {
              const color = colors[idx % colors.length];
              if (section.schedules) {
                section.schedules.forEach(s => {
                  blocks.push({
                    code: section.section_code,
                    name: section.course?.course_name,
                    day: s.day_of_week - 2, // 2 (Mon) -> 0
                    startPeriod: s.start_period - 1,
                    span: s.end_period - s.start_period + 1,
                    room: section.room,
                    color: color
                  });
                });
              }
            });
            setScheduleData(blocks);
          }
        }
      } catch (err) {
        console.error('Failed to fetch global schedule:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchGlobalSchedule();
  }, []);

  const blockMap = {};
  scheduleData.forEach((block) => {
    const key = `${block.day}-${block.startPeriod}`;
    if (!blockMap[key]) blockMap[key] = [];
    blockMap[key].push(block);
  });

  const occupied = new Set();
  scheduleData.forEach((block) => {
    for (let p = block.startPeriod + 1; p < block.startPeriod + block.span; p++) {
      occupied.add(`${block.day}-${p}`);
    }
  });

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Quản lý lịch học</h1>
          <p>Phân bổ phòng và thời gian cho các lớp học phần</p>
        </div>
        <div className="schedule-navigation">
          <button className="schedule-nav-btn" onClick={() => setWeek(Math.max(1, week - 1))}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="schedule-week">
            <span className="schedule-week-dot" />
            Tuần {week}
          </div>
          <button className="schedule-nav-btn" onClick={() => setWeek(week + 1)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>

      <div className="schedule-grid">
        <table className="schedule-table">
          <thead>
            <tr>
              <th>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="16" height="16" style={{ display: 'inline' }}>
                  <circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" />
                </svg>
              </th>
              {days.map((d) => (
                <th key={d}>{d}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {periods.map((period, pIdx) => (
              <tr key={pIdx}>
                <td className="time-cell">
                  <div className="time-label">{period.label}</div>
                  <div className="time-range">{period.start}</div>
                  <div className="time-range">{period.end}</div>
                </td>
                {days.map((_, dIdx) => {
                  const key = `${dIdx}-${pIdx}`;
                  if (occupied.has(key)) return null; // Skip, cell merged above

                  const blocks = blockMap[key];
                  if (blocks && blocks.length > 0) {
                    const blocksInSlot = blockMap[key] || [];
                    const block = blocksInSlot[0];
                    return (
                      <td key={dIdx} rowSpan={block.span}>
                        <div className={`schedule-block ${block.color}`}>
                          <div>
                            {blocksInSlot.map((b, i) => (
                              <div key={i} style={i > 0 ? { marginTop: 8, borderTop: '1px dashed rgba(255,255,255,0.3)', paddingTop: 4 } : {}}>
                                <div className="schedule-block-code">{b.code}</div>
                                <div className="schedule-block-name">{b.name}</div>
                              </div>
                            ))}
                          </div>
                          <div className="schedule-block-room">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                            </svg>
                            {block.room}
                          </div>
                        </div>
                      </td>
                    );
                  }

                  return <td key={dIdx} />;
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
