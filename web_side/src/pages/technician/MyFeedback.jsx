import { useEffect, useState } from 'react';
import { Star, MessageSquare } from 'lucide-react';

const API = 'http://localhost:3000';

const getUser = () => {
  try { return JSON.parse(localStorage.getItem('user_token') || 'null'); } catch { return null; }
};

const Stars = ({ score }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map(n => (
      <Star key={n} size={16}
        className={n <= score ? 'text-amber-400 fill-amber-400' : 'text-slate-200'} />
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
    <div className="space-y-6 pb-8 font-sans">
      <div>
        <h1 className="text-3xl font-serif font-bold text-slate-800 mb-1">My Feedback</h1>
        <p className="text-sm text-slate-500 mb-6">คะแนนและความคิดเห็นจากลูกบ้าน</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* กล่องคะแนนเฉลี่ย */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center flex flex-col items-center justify-center">
          <div className="text-5xl font-serif font-bold text-amber-500">{average || '-'}</div>
          <div className="flex justify-center mt-3 mb-2"><Stars score={Math.round(average)} /></div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Average Rating</div>
        </div>
        
        {/* กล่องจำนวนรีวิว */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center flex flex-col justify-center">
          <div className="text-5xl font-serif font-bold text-slate-800">{count}</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mt-3">Total Reviews</div>
        </div>

        {/* กล่องการกระจายคะแนน */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">Rating Distribution</div>
          <div className="space-y-2.5">
            {distribution.map(d => (
              <div key={d.score} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-8">
                  <span className="text-sm font-bold text-slate-600">{d.score}</span>
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                </div>
                <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-amber-400 h-full rounded-full" style={{ width: `${(d.count / max) * 100}%` }} />
                </div>
                <span className="text-sm font-medium text-slate-500 w-6 text-right">{d.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* รายการรีวิว */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">รีวิวล่าสุด</h2>
        {loading ? (
          <div className="text-slate-400 text-sm py-8 text-center">กำลังโหลดข้อมูล...</div>
        ) : ratings.length === 0 ? (
          <div className="text-slate-400 text-sm py-8 text-center bg-slate-50 rounded-xl">ยังไม่มีรีวิวจากลูกบ้าน</div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {ratings.map(r => (
              <li key={r.id} className="py-5 first:pt-2 last:pb-2">
                <div className="flex items-center gap-3 mb-2">
                  <Stars score={r.score} />
                  <span className="text-xs font-medium text-slate-400">
                    {r.createdAt ? new Date(r.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
                  </span>
                </div>
                {r.comment ? (
                  <div className="flex items-start gap-2.5 text-slate-700 bg-slate-50 p-4 rounded-xl">
                    <MessageSquare size={16} className="text-slate-400 mt-0.5 shrink-0" />
                    <span className="text-sm leading-relaxed">{r.comment}</span>
                  </div>
                ) : (
                  <span className="text-sm text-slate-400 italic px-2">— ไม่มีคอมเมนต์ —</span>
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