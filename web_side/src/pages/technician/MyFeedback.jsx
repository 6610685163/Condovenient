import { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';

const API = 'http://localhost:3000';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user_token') || 'null'); } catch { return null; }
};

const Stars = ({ score }) => (
  <div className="flex">
    {[1, 2, 3, 4, 5].map(n => (
      <Star key={n} size={16}
        className={n <= score ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} />
    ))}
  </div>
);

const MyFeedback = () => {
  const user = getUser();
  const [ratings, setRatings] = useState([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    fetch(`${API}/api/ratings/technician/${user.id}`)
      .then(r => r.json())
      .then(d => {
        setRatings(d.ratings || []);
        setAverage(d.averageScore || 0);
        setCount(d.count || 0);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [user?.id]);

  const distribution = [5, 4, 3, 2, 1].map(score => ({
    score,
    count: ratings.filter(r => r.score === score).length,
  }));
  const max = Math.max(1, ...distribution.map(d => d.count));

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-1">Feedback ของฉัน</h1>
      <p className="text-gray-500 text-sm mb-6">คะแนนและความคิดเห็นจากลูกบ้าน</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-5xl font-bold text-yellow-500">{average || '-'}</div>
          <div className="flex justify-center mt-2"><Stars score={Math.round(average)} /></div>
          <div className="text-sm text-gray-500 mt-2">คะแนนเฉลี่ย</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center flex flex-col justify-center">
          <div className="text-5xl font-bold text-gray-800">{count}</div>
          <div className="text-sm text-gray-500 mt-2">รีวิวทั้งหมด</div>
        </div>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="text-sm text-gray-500 mb-2">การกระจายคะแนน</div>
          {distribution.map(d => (
            <div key={d.score} className="flex items-center gap-2 mb-1">
              <span className="text-xs w-3">{d.score}</span>
              <Star size={12} className="text-yellow-400 fill-yellow-400" />
              <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="bg-yellow-400 h-full" style={{ width: `${(d.count / max) * 100}%` }} />
              </div>
              <span className="text-xs text-gray-500 w-6 text-right">{d.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">รีวิวจากลูกบ้าน</h2>
        {loading ? (
          <div className="text-gray-400 text-sm py-6 text-center">กำลังโหลด...</div>
        ) : ratings.length === 0 ? (
          <div className="text-gray-400 text-sm py-6 text-center">ยังไม่มีรีวิว</div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {ratings.map(r => (
              <li key={r.id} className="py-4">
                <div className="flex items-center gap-2 mb-1">
                  <Stars score={r.score} />
                  <span className="text-xs text-gray-500">
                    {r.createdAt ? new Date(r.createdAt).toLocaleString('th-TH') : ''}
                  </span>
                </div>
                {r.comment ? (
                  <div className="flex items-start gap-2 text-gray-700">
                    <MessageSquare size={14} className="text-gray-400 mt-1" />
                    <span className="text-sm">{r.comment}</span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-400">— ไม่มีคอมเมนต์ —</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default MyFeedback;