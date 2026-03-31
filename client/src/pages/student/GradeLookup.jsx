import { useState, useEffect } from 'react';
import { api } from '../../utils/api';

export default function GradeLookup() {
  const [results, setResults] = useState([]);
  const [stats, setStats] = useState({ gpa: 0, accumulatedCredits: 0, totalCourses: 0 });
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [resData, statsData] = await Promise.all([
          api.get('/results/my'),
          api.get('/results/stats')
        ]);
        
        if (resData.success) setResults(resData.data.results);
        if (statsData.success) setStats(statsData.data);
      } catch (err) {
        console.error('Failed to fetch grades:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = results.filter(
    (g) =>
      g.course?.course_id.toLowerCase().includes(search.toLowerCase()) ||
      g.course?.course_name.toLowerCase().includes(search.toLowerCase())
  );

  const getLetterClass = (letter) => {
    if (!letter) return '';
    if (letter.startsWith('A')) return 'a';
    if (letter.startsWith('B')) return 'b';
    if (letter.startsWith('C')) return 'c';
    return 'd';
  };

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Kết quả học tập</h1>
          <p>Tra cứu điểm thi và kết quả các môn học</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grade-summary-grid">
        <div className="grade-summary-card">
          <div className="grade-icon blue">
            <span style={{ fontSize: 22 }}>-</span>
          </div>
          <div>
            <div className="grade-info-label">Tín chỉ tích lũy</div>
            <div className="grade-info-value">{stats.accumulatedCredits}</div>
          </div>
        </div>
        <div className="grade-summary-card">
          <div className="grade-icon orange">
            <span style={{ fontSize: 22 }}>🏆</span>
          </div>
          <div>
            <div className="grade-info-label">Điểm hệ 4 (GPA)</div>
            <div className="grade-info-value">{stats.gpa}</div>
          </div>
        </div>
        <div className="grade-summary-card">
          <div className="grade-icon purple">
            <span style={{ fontSize: 22 }}>💬</span>
          </div>
          <div>
            <div className="grade-info-label">Tổng môn học</div>
            <div className="grade-info-value">{stats.totalCourses}</div>
          </div>
        </div>
      </div>

      {/* Grade Table */}
      <div className="table-wrapper">
        <div className="search-bar" style={{ justifyContent: 'flex-start', paddingLeft: 24 }}>
          <div className="search-input" style={{ width: 300 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Tìm mã hoặc tên môn học..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              id="search-grades"
            />
          </div>
        </div>

        <table className="data-table">
          <thead>
            <tr>
              <th className="center">STT</th>
              <th>MÃ MH</th>
              <th>TÊN MÔN HỌC</th>
              <th className="center">TÍN CHỈ</th>
              <th className="center">GIỮA KỲ</th>
              <th className="center">CUỐI KỲ</th>
              <th className="center">TỔNG KẾT</th>
              <th className="center">ĐIỂM CHỮ</th>
              <th className="center">TRẠNG THÁI</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="9" className="center">Đang tải...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan="9" className="center">Không tìm thấy kết quả nào</td></tr>
            ) : filtered.map((grade, idx) => (
              <tr key={grade.result_id}>
                <td className="center">{idx + 1}</td>
                <td style={{ fontWeight: 600 }}>{grade.course?.course_id}</td>
                <td>
                  <div>{grade.course?.course_name}</div>
                  <div className="sub-text">{grade.semester?.semester_name}</div>
                </td>
                <td className="center">{grade.course?.credits}</td>
                <td className="center">{grade.midterm_score ?? '-'}</td>
                <td className="center">{grade.final_score ?? '-'}</td>
                <td className="center" style={{ fontWeight: 600 }}>{grade.total_score ?? '-'}</td>
                <td className="center">
                  {grade.grade_letter ? (
                    <span className={`grade-letter ${getLetterClass(grade.grade_letter)}`}>
                      {grade.grade_letter}
                    </span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)' }}>-</span>
                  )}
                </td>
                <td className="center">
                  {grade.status === 'pass' ? (
                    <span className="grade-status pass">Đạt</span>
                  ) : grade.status === 'fail' ? (
                    <span className="grade-status fail">Không đạt</span>
                  ) : (
                    <span className="grade-status studying">Đang học</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
